import { IComponent, Position, ComponentType } from '../types/components';
import { Level1 } from '../levels/Level1';
import { Level2 } from '../levels/Level2';
import { Level3 } from '../levels/Level3';
import { Level4 } from '../levels/Level4';

export class GameBoard {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private components: IComponent[] = [];
  private gridSize: number = 50; // Size of each grid cell in pixels
  private selectedComponent: IComponent | null = null;
  private dragOffset: Position = { x: 0, y: 0 };
  private isConnecting: boolean = false;
  private connectionStart: IComponent | null = null;
  private updateCallback: (() => void) | null = null;
  
  // Isometric settings
  private tileWidth: number = 96;  // Increased width for better perspective
  private tileHeight: number = 48; // Increased height for better perspective
  private componentScale: number = 1.5; // Increased scale factor for components
  private offsetX: number = 800;   // Center offset X
  private offsetY: number = 300;   // Adjusted Y offset for better perspective
  private gridRange: number = 35;  // Increased grid range to extend beyond canvas

  private previewComponent: IComponent | null = null;
  private currentLevel: number = 1;
  private level1: Level1;
  private level2: Level2;
  private level3: Level3;
  private level4: Level4;
  private currentLevelInstance: Level1 | Level2 | Level3 | Level4;

  private mousePosition: Position = { x: 0, y: 0 };
  private activeConnection: { from: IComponent, to: Position } | null = null;
  private componentImages: Map<ComponentType, HTMLImageElement> = new Map();

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = 1600;
    this.canvas.height = 1200;

    // Initialize levels
    this.level1 = new Level1();
    this.level2 = new Level2();
    this.level3 = new Level3();
    this.level4 = new Level4();
    this.currentLevelInstance = this.level1;

    // Initialize with first level
    this.components.push(this.currentLevelInstance.getUsersComponent());

    // Load component images
    this.loadComponentImages();

    this.setupEventListeners();
    this.draw();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleDoubleClick(e: MouseEvent): void {
    const pos = this.getMousePosition(e);
    const clickedComponent = this.getComponentAtPosition(pos);
    
    if (clickedComponent) {
      this.activeConnection = {
        from: clickedComponent,
        to: pos
      };
      this.draw();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.activeConnection) {
      this.activeConnection = null;
      this.draw();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    this.mousePosition = this.getMousePosition(e);
    
    if (this.selectedComponent && this.selectedComponent.type !== ComponentType.USERS) {
      const isoPos = this.screenToIso(this.mousePosition.x, this.mousePosition.y);
      this.selectedComponent.position = {
        x: Math.round(isoPos.x),
        y: Math.round(isoPos.y)
      };
    }

    if (this.activeConnection) {
      this.activeConnection.to = this.mousePosition;
    }

    this.draw();
  }

  private handleMouseDown(e: MouseEvent): void {
    const pos = this.getMousePosition(e);
    const clickedComponent = this.getComponentAtPosition(pos);
    
    if (clickedComponent) {
      // If we clicked on a component, handle component interaction
      if (this.activeConnection && clickedComponent) {
        // Complete the connection
        this.createConnection(this.activeConnection.from, clickedComponent);
        this.activeConnection = null;
      } else if (clickedComponent && clickedComponent.type !== ComponentType.USERS) {
        // Start dragging
        this.selectedComponent = clickedComponent;
        this.dragOffset = {
          x: pos.x - clickedComponent.position.x,
          y: pos.y - clickedComponent.position.y
        };
      }
    } else {
      // Only check for connection removal if we didn't click on a component
      const connection = this.getConnectionAtPosition(e);
      if (connection) {
        this.removeConnection(connection.from, connection.to);
      }
    }
  }

  private handleMouseUp(): void {
    this.selectedComponent = null;
  }

  private getMousePosition(e: MouseEvent): Position {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private getComponentAtPosition(pos: Position): IComponent | null {
    return this.components.find(comp => {
      const screenPos = this.isoToScreen(comp.position.x, comp.position.y);
      const scaledWidth = this.tileWidth * this.componentScale;
      const scaledHeight = this.tileHeight * this.componentScale;
      const dx = pos.x - screenPos.x;
      const dy = pos.y - screenPos.y;
      return Math.abs(dx) < scaledWidth/2 && Math.abs(dy) < scaledHeight/2;
    }) || null;
  }

  public addComponent(component: IComponent): void {
    // Set default capacity for servers
    if (component.type === ComponentType.SERVER) {
      component.capacity = this.currentLevelInstance.getServerCapacity();
    }
    
    this.components.push(component);
    this.currentLevelInstance.updateConnections(this.components);
    this.draw();
  }

  // Convert isometric coordinates to screen coordinates
  private isoToScreen(x: number, y: number): Position {
    return {
      x: (x - y) * this.tileWidth/2 + this.offsetX,
      y: (x + y) * this.tileHeight/2 + this.offsetY
    };
  }

  // Convert screen coordinates to isometric coordinates
  public screenToIso(screenX: number, screenY: number): Position {
    // First convert to canvas-relative coordinates
    const canvasX = screenX - this.offsetX;
    const canvasY = screenY - this.offsetY;
    
    // Then convert to isometric coordinates
    const isoX = (canvasX / (this.tileWidth/2) + canvasY / (this.tileHeight/2)) / 2;
    const isoY = (canvasY / (this.tileHeight/2) - canvasX / (this.tileWidth/2)) / 2;
    
    return { x: isoX, y: isoY };
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;

    // Draw isometric grid with extended range
    for (let x = -this.gridRange; x <= this.gridRange; x++) {
      for (let y = -this.gridRange; y <= this.gridRange; y++) {
        const screenPos = this.isoToScreen(x, y);
        
        // Only draw if the cell is partially visible on screen
        if (this.isCellVisible(screenPos)) {
          // Draw diamond shape for each grid cell
          this.ctx.beginPath();
          this.ctx.moveTo(screenPos.x, screenPos.y - this.tileHeight/2);
          this.ctx.lineTo(screenPos.x + this.tileWidth/2, screenPos.y);
          this.ctx.lineTo(screenPos.x, screenPos.y + this.tileHeight/2);
          this.ctx.lineTo(screenPos.x - this.tileWidth/2, screenPos.y);
          this.ctx.closePath();
          this.ctx.stroke();

          // Draw spawn point marker
          // if (x === 7 && y === 7) {
          //   this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          //   this.ctx.fill();
          //   this.ctx.strokeStyle = '#ff0000';
          //   this.ctx.lineWidth = 2;
          //   this.ctx.stroke();
          //   this.ctx.lineWidth = 1;
          //   this.ctx.strokeStyle = '#ddd';

          //   // Add text label
          //   // this.ctx.fillStyle = '#000';
          //   // this.ctx.font = 'bold 14px Arial';
          //   // this.ctx.textAlign = 'center';
          //   //this.ctx.fillText('Component Spawner', screenPos.x, screenPos.y + this.tileHeight);
          // }
        }
      }
    }
  }

  private isCellVisible(pos: Position): boolean {
    const margin = this.tileWidth; // Add margin to ensure smooth transition
    return pos.x >= -margin && 
           pos.x <= this.canvas.width + margin && 
           pos.y >= -margin && 
           pos.y <= this.canvas.height + margin;
  }

  private drawComponent(component: IComponent): void {
    const pos = this.isoToScreen(component.position.x, component.position.y);
    
    // Draw component base
    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);
    this.ctx.scale(this.componentScale, this.componentScale);
    
    // Get component image
    const img = this.componentImages.get(component.type);
    
    if (img) {
      // Use a fixed maximum size for all components
      const maxSize = 70; // Fixed size for all components
      
      // Calculate the aspect ratio of the image
      const imgAspectRatio = img.width / img.height;
      
      // Calculate dimensions that maintain aspect ratio
      let imgWidth, imgHeight;
      
      if (imgAspectRatio > 1) {
        // Image is wider than tall
        imgWidth = maxSize;
        imgHeight = maxSize / imgAspectRatio;
      } else {
        // Image is taller than wide or square
        imgHeight = maxSize;
        imgWidth = maxSize * imgAspectRatio;
      }
      
      // Center the image
      const offsetX = -imgWidth / 2;
      const offsetY = -imgHeight / 2;
      
      // Draw component image
      this.ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);
    } else {
      // Fallback to drawing shape if image is not loaded
      // Get component color
      const color = this.getComponentColor(component.type);
      
      // Draw component shape
      this.ctx.beginPath();
      this.ctx.moveTo(0, -this.tileHeight/2);
      this.ctx.lineTo(this.tileWidth/2, 0);
      this.ctx.lineTo(0, this.tileHeight/2);
      this.ctx.lineTo(-this.tileWidth/2, 0);
      this.ctx.closePath();
      
      // Fill with component color
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      // Add border
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Check if this is a server with a database connection
    if (component.type === ComponentType.SERVER) {
        const hasDatabase = component.connections.some(conn => {
            const targetComp = this.components.find(c => c.id === conn.to);
            return targetComp && targetComp.type === ComponentType.DATABASE;
        }) || this.components.some(comp => 
            comp.type === ComponentType.DATABASE && 
            comp.connections.some(conn => conn.to === component.id)
        );

        // Remove the glowing effect
        // if (hasDatabase) {
        //     // Draw a glowing effect for servers with database connections
        //     this.ctx.beginPath();
        //     this.ctx.moveTo(0, -this.tileHeight/2);
        //     this.ctx.lineTo(this.tileWidth/2, 0);
        //     this.ctx.lineTo(0, this.tileHeight/2);
        //     this.ctx.lineTo(-this.tileWidth/2, 0);
        //     this.ctx.closePath();
            
        //     // Add glow effect
        //     this.ctx.shadowColor = '#4CAF50';
        //     this.ctx.shadowBlur = 15;
        //     this.ctx.strokeStyle = '#4CAF50';
        //     this.ctx.lineWidth = 3;
        //     this.ctx.stroke();
            
        //     // Reset shadow
        //     this.ctx.shadowBlur = 0;
        // }
    }
    
    // Draw component name
    this.ctx.fillStyle = '#000';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    //this.ctx.fillText(component.name, 0, 0);
    
    // Draw user count for Users component
    if (component.type === ComponentType.USERS) {
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(`${this.currentLevelInstance.getConnectedUsers()}/${this.currentLevelInstance.getTotalUsers()} Users`, 0, 35);
      
      // Draw database query rate for Level 4
      if (this.currentLevel === 4) {
        const level4 = this.currentLevelInstance as any;
        if (level4.getDatabaseQueryRate && level4.getMaxDatabaseQueries) {
          this.ctx.font = 'bold 12px Arial';
          this.ctx.fillText(`DB Queries: ${Math.round(level4.getDatabaseQueryRate())}/${level4.getMaxDatabaseQueries()}`, 0, 50);
        }
      }
    }
    
    // Draw capacity for Server components
    if (component.type === ComponentType.SERVER) {
        const hasDatabase = component.connections.some(conn => {
            const targetComp = this.components.find(c => c.id === conn.to);
            return targetComp && targetComp.type === ComponentType.DATABASE;
        }) || this.components.some(comp => 
            comp.type === ComponentType.CACHE && 
            comp.connections.some(conn => conn.to === component.id)
        );
        
        const capacity = hasDatabase ? 
            this.currentLevelInstance.getServerCapacity() * 2 : 
            Math.floor(this.currentLevelInstance.getServerCapacity());
            
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`Capacity: ${capacity}`, 0, 30);
    }
    
    this.ctx.restore();
  }

  private getComponentColor(type: ComponentType): string {
    const colors = {
      [ComponentType.SERVER]: '#ff9999',
      [ComponentType.DATABASE]: '#99ff99',
      [ComponentType.CACHE]: '#9999ff',
      [ComponentType.API_GATEWAY]: '#ffff99',
      [ComponentType.LOAD_BALANCER]: '#ff99ff',
      [ComponentType.USERS]: '#ffa500'  // Orange color for Users
    };
    return colors[type];
  }

  private createConnection(from: IComponent, to: IComponent): void {
    // Check if connection already exists in either direction
    const existingConnection = from.connections.find(
      conn => conn.from === from.id && conn.to === to.id
    ) || to.connections.find(
      conn => conn.from === to.id && conn.to === from.id
    );

    if (!existingConnection) {
      // Create connection in both directions
      from.connections.push({
        from: from.id,
        to: to.id,
        users: 0
      });
      to.connections.push({
        from: to.id,
        to: from.id,
        users: 0
      });
      this.currentLevelInstance.updateConnections(this.components);
      this.draw();
      if (this.updateCallback) {
        this.updateCallback();
      }
    }
  }

  private drawConnections(): void {
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;

    this.components.forEach(component => {
      component.connections.forEach(conn => {
        const fromComp = this.components.find(c => c.id === conn.from);
        const toComp = this.components.find(c => c.id === conn.to);
        
        if (fromComp && toComp) {
          const fromPos = this.isoToScreen(fromComp.position.x, fromComp.position.y);
          const toPos = this.isoToScreen(toComp.position.x, toComp.position.y);
          
          // Calculate control points for the curve
          const dx = toPos.x - fromPos.x;
          const dy = toPos.y - fromPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Create a curved path
          this.ctx.beginPath();
          this.ctx.moveTo(fromPos.x, fromPos.y);
          
          // Use quadratic curve for shorter distances, cubic for longer ones
          if (distance < 200) {
            const cpX = (fromPos.x + toPos.x) / 2;
            const cpY = (fromPos.y + toPos.y) / 2 - 30;
            this.ctx.quadraticCurveTo(cpX, cpY, toPos.x, toPos.y);
          } else {
            const cp1X = fromPos.x + dx * 0.25;
            const cp1Y = fromPos.y + dy * 0.25 - 30;
            const cp2X = fromPos.x + dx * 0.75;
            const cp2Y = fromPos.y + dy * 0.75 - 30;
            this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toPos.x, toPos.y);
          }
          
          this.ctx.stroke();
        }
      });
    });

    // Reset line width for grid
    this.ctx.lineWidth = 1;
  }

  private draw(): void {
    // Clear canvas with white background
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw level description
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(this.currentLevelInstance.getLevelDescription(), 20, 30);
    
    // Draw connections
    this.drawConnections();
    
    // Draw active connection if exists
    if (this.activeConnection) {
      const fromPos = this.isoToScreen(
        this.activeConnection.from.position.x,
        this.activeConnection.from.position.y
      );
      
      // Calculate control points for the curve
      const dx = this.activeConnection.to.x - fromPos.x;
      const dy = this.activeConnection.to.y - fromPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(fromPos.x, fromPos.y);
      
      // Use quadratic curve for shorter distances, cubic for longer ones
      if (distance < 200) {
        const cpX = (fromPos.x + this.activeConnection.to.x) / 2;
        const cpY = (fromPos.y + this.activeConnection.to.y) / 2 - 30;
        this.ctx.quadraticCurveTo(cpX, cpY, this.activeConnection.to.x, this.activeConnection.to.y);
      } else {
        const cp1X = fromPos.x + dx * 0.25;
        const cp1Y = fromPos.y + dy * 0.25 - 30;
        const cp2X = fromPos.x + dx * 0.75;
        const cp2Y = fromPos.y + dy * 0.75 - 30;
        this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, this.activeConnection.to.x, this.activeConnection.to.y);
      }
      
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
    }
    
    // Draw components
    this.components.forEach(comp => this.drawComponent(comp));

    // Draw preview component with transparency
    if (this.previewComponent) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.drawComponent(this.previewComponent);
      this.ctx.restore();
    }

    // Call update callback after drawing
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  public screenToGrid(screenX: number, screenY: number): Position {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((screenX - rect.left) / this.gridSize);
    const y = Math.floor((screenY - rect.top) / this.gridSize);
    return { x, y };
  }

  public getCanvasRect(): DOMRect {
    return this.canvas.getBoundingClientRect();
  }

  public convertScreenToGrid(screenX: number, screenY: number): Position {
    const rect = this.getCanvasRect();
    const localX = screenX - rect.left;
    const localY = screenY - rect.top;
    const isoPos = this.screenToIso(localX, localY);
    return {
      x: Math.round(isoPos.x),
      y: Math.round(isoPos.y)
    };
  }

  public isPositionTaken(position: Position): boolean {
    return this.components.some(comp => 
      comp.position.x === position.x && 
      comp.position.y === position.y
    );
  }

  private isPointNearLine(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < 10; // 10 pixels threshold
  }

  private getConnectionAtPosition(e: MouseEvent): { from: IComponent, to: IComponent } | null {
    const screenPos = this.getMousePosition(e);
    
    for (const component of this.components) {
      for (const conn of component.connections) {
        const fromComp = this.components.find(c => c.id === conn.from);
        const toComp = this.components.find(c => c.id === conn.to);
        
        if (fromComp && toComp) {
          const fromPos = this.isoToScreen(fromComp.position.x, fromComp.position.y);
          const toPos = this.isoToScreen(toComp.position.x, toComp.position.y);
          
          // Calculate control points for the curve
          const totalDx = toPos.x - fromPos.x;
          const totalDy = toPos.y - fromPos.y;
          const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
          
          // Check multiple points along the curve
          const steps = Math.max(10, Math.floor(totalDistance / 20)); // At least 10 points, or one every 20 pixels
          for (let t = 0; t <= 1; t += 1/steps) {
            let pointX, pointY;
            
            if (totalDistance < 200) {
              // Quadratic curve
              const cpX = (fromPos.x + toPos.x) / 2;
              const cpY = (fromPos.y + toPos.y) / 2 - 30;
              pointX = Math.pow(1-t, 2) * fromPos.x + 2 * (1-t) * t * cpX + Math.pow(t, 2) * toPos.x;
              pointY = Math.pow(1-t, 2) * fromPos.y + 2 * (1-t) * t * cpY + Math.pow(t, 2) * toPos.y;
            } else {
              // Cubic curve
              const cp1X = fromPos.x + totalDx * 0.25;
              const cp1Y = fromPos.y + totalDy * 0.25 - 30;
              const cp2X = fromPos.x + totalDx * 0.75;
              const cp2Y = fromPos.y + totalDy * 0.75 - 30;
              pointX = Math.pow(1-t, 3) * fromPos.x + 
                       3 * Math.pow(1-t, 2) * t * cp1X + 
                       3 * (1-t) * Math.pow(t, 2) * cp2X + 
                       Math.pow(t, 3) * toPos.x;
              pointY = Math.pow(1-t, 3) * fromPos.y + 
                       3 * Math.pow(1-t, 2) * t * cp1Y + 
                       3 * (1-t) * Math.pow(t, 2) * cp2Y + 
                       Math.pow(t, 3) * toPos.y;
            }
            
            const pointDx = screenPos.x - pointX;
            const pointDy = screenPos.y - pointY;
            const pointDistance = Math.sqrt(pointDx * pointDx + pointDy * pointDy);
            
            if (pointDistance < 10) { // 10 pixels threshold
              return { from: fromComp, to: toComp };
            }
          }
        }
      }
    }
    return null;
  }

  private removeConnection(from: IComponent, to: IComponent): void {
    // Remove connection in both directions
    from.connections = from.connections.filter(
      conn => !(conn.from === from.id && conn.to === to.id)
    );
    to.connections = to.connections.filter(
      conn => !(conn.from === to.id && conn.to === from.id)
    );
    this.currentLevelInstance.updateConnections(this.components);
    this.draw();
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  public resetLevel(): void {
    // Clear all components except the Users component
    this.components = this.components.filter(comp => comp.type === ComponentType.USERS);
    this.currentLevelInstance.updateConnections(this.components);
    this.draw();
  }

  public nextLevel(): void {
    if (this.currentLevel === 1) {
      this.currentLevel = 2;
      this.level2 = new Level2(); // Create fresh instance
      this.currentLevelInstance = this.level2;
    } else if (this.currentLevel === 2) {
      this.currentLevel = 3;
      this.level3 = new Level3(); // Create fresh instance
      this.currentLevelInstance = this.level3;
    } else if (this.currentLevel === 3) {
      this.currentLevel = 4;
      this.level4 = new Level4(); // Create fresh instance
      this.currentLevelInstance = this.level4;
    } else {
      // For now, just reset to level 1 if we're at the end
      this.currentLevel = 1;
      this.level1 = new Level1(); // Create fresh instance
      this.currentLevelInstance = this.level1;
    }
    
    // Reset components and add the new level's users component
    this.components = [this.currentLevelInstance.getUsersComponent()];
    this.draw();
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public setLevel(level: number): void {
    if (level === this.currentLevel) return;
    
    // Create fresh instances of levels
    this.level1 = new Level1();
    this.level2 = new Level2();
    this.level3 = new Level3();
    this.level4 = new Level4();
    
    // Set the current level and instance
    this.currentLevel = level;
    if (level === 1) {
      this.currentLevelInstance = this.level1;
    } else if (level === 2) {
      this.currentLevelInstance = this.level2;
    } else if (level === 3) {
      this.currentLevelInstance = this.level3;
    } else if (level === 4) {
      this.currentLevelInstance = this.level4;
    }
    
    // Reset components and add the new level's users component
    this.components = [this.currentLevelInstance.getUsersComponent()];
    this.draw();
  }

  public getLevelDescription(): string {
    return this.currentLevelInstance.getLevelDescription();
  }

  public isLevelComplete(): boolean {
    return this.currentLevelInstance.isLevelComplete();
  }

  public onUpdate(callback: () => void): void {
    this.updateCallback = callback;
  }

  private loadComponentImages(): void {
    // Load images for each component type
    const componentTypes = [
      ComponentType.SERVER,
      ComponentType.DATABASE,
      ComponentType.CACHE,
      ComponentType.API_GATEWAY,
      ComponentType.LOAD_BALANCER,
      ComponentType.USERS
    ];

    componentTypes.forEach(type => {
      const img = new Image();
      img.src = `/src/images/${type}.png`;
      img.onload = () => {
        this.componentImages.set(type, img);
        this.draw(); // Redraw when image is loaded
      };
      img.onerror = () => {
        console.error(`Failed to load image for component type: ${type}`);
      };
    });
  }
} 