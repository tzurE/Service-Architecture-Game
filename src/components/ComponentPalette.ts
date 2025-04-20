import { IComponent, ComponentType } from '../types/components';

export class ComponentPalette {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private components: IComponent[] = [];
    private margin: number = 20;
    private padding: number = 10;
    private componentWidth: number = 180;
    private componentHeight: number = 50;
    private currentLevel: number = 1;
    private componentImages: Map<ComponentType, HTMLImageElement> = new Map();

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Set canvas size
        this.canvas.width = 200;
        this.canvas.height = 600;

        // Load component images
        this.loadComponentImages();

        this.initializeComponents();
        this.setupEventListeners();
        this.draw();
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
            img.src = `${import.meta.env.BASE_URL}images/${type}.png`;
            img.onload = () => {
                this.componentImages.set(type, img);
                this.draw(); // Redraw when image is loaded
            };
            img.onerror = () => {
                console.error(`Failed to load image for component type: ${type}`);
            };
        });
    }

    public setLevel(level: number): void {
        this.currentLevel = level;
        this.initializeComponents();
        this.draw();
    }

    private initializeComponents(): void {
        // Create palette components based on current level
        this.components = [];
        
        // Level 1: Only show Server
        if (this.currentLevel >= 1) {
            this.components.push({
                id: 'palette-server',
                type: ComponentType.SERVER,
                name: 'Server',
                position: { x: this.margin, y: this.margin },
                connections: []
            });
        }
        
        // Level 2: Show Server and Database
        if (this.currentLevel >= 2) {
            this.components.push({
                id: 'palette-database',
                type: ComponentType.DATABASE,
                name: 'Database',
                position: { x: this.margin, y: this.margin + this.componentHeight + this.padding },
                connections: []
            });
        }
        
        // Level 3: Show Server, Database, and Load Balancer
        if (this.currentLevel >= 3) {
            this.components.push({
                id: 'palette-load-balancer',
                type: ComponentType.LOAD_BALANCER,
                name: 'Load Balancer',
                position: { x: this.margin, y: this.margin + 2 * (this.componentHeight + this.padding) },
                connections: []
            });
        }
        
        // Level 4: Show Server, Database, Load Balancer, and Cache
        if (this.currentLevel >= 4) {
            this.components.push({
                id: 'palette-cache',
                type: ComponentType.CACHE,
                name: 'Cache',
                position: { x: this.margin, y: this.margin + 3 * (this.componentHeight + this.padding) },
                connections: []
            });
        }
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.handleClick.bind(this));
    }

    private handleClick(e: MouseEvent): void {
        const pos = this.getMousePosition(e);
        const clickedComponent = this.getComponentAtPosition(pos);
        
        if (clickedComponent) {
            console.log('Clicked component:', clickedComponent);
            
            // Create a new component for the game board
            const newComponent: IComponent = {
                id: `${clickedComponent.type}-${Date.now()}`,
                type: clickedComponent.type,
                name: clickedComponent.name,
                position: { x: 0, y: 0 }, // Position will be set by game board
                connections: []
            };
            
            console.log('Creating new component:', newComponent);
            
            // Dispatch custom event with new component
            const event = new CustomEvent('componentCreated', { 
                detail: {
                    component: newComponent
                }
            });
            this.canvas.dispatchEvent(event);
        }
    }

    private getMousePosition(e: MouseEvent): { x: number, y: number } {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    private getComponentAtPosition(pos: { x: number, y: number }): IComponent | null {
        return this.components.find((comp, index) => {
            const compPos = comp.position;
            
            // Calculate the adjusted Y position using the same logic as in the draw method
            const adjustedY = this.margin + 50 + (index * (this.componentHeight + this.padding));
            
            return pos.x >= compPos.x && 
                   pos.x <= compPos.x + this.componentWidth &&
                   pos.y >= adjustedY && 
                   pos.y <= adjustedY + this.componentHeight;
        }) || null;
    }

    private draw(): void {
        // Clear canvas
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw title
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Components', this.canvas.width / 2, 15);
        
        // Draw subtitle with explanation
        this.ctx.fillStyle = '#666';
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click on a component to spawn it', this.canvas.width / 2, 35);
        
        // Draw components with adjusted starting position
        this.components.forEach((comp, index) => {
            const pos = comp.position;
            
            // Adjust the y position to start below the subtitle
            const adjustedY = this.margin + 50 + (index * (this.componentHeight + this.padding));
            
            // Draw component background
            this.ctx.fillStyle = this.getComponentColor(comp.type);
            this.ctx.fillRect(pos.x, adjustedY, this.componentWidth, this.componentHeight);
            
            // Draw component border
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(pos.x, adjustedY, this.componentWidth, this.componentHeight);
            
            // Draw component image if available
            const img = this.componentImages.get(comp.type);
            if (img) {
                const maxSize = 40;
                
                // Calculate dimensions to maintain aspect ratio
                const imgAspectRatio = img.width / img.height;
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
                const imgX = pos.x + 15;
                const imgY = adjustedY + (this.componentHeight - imgHeight) / 2;
                
                this.ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
            }
            
            // Draw component name
            this.ctx.fillStyle = '#000';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(comp.name, pos.x + 60, adjustedY + this.componentHeight / 2 + 5);
        });
    }

    private getComponentColor(type: ComponentType): string {
        const colors = {
            [ComponentType.SERVER]: '#ff9999',
            [ComponentType.DATABASE]: '#99ff99',
            [ComponentType.CACHE]: '#9999ff',
            [ComponentType.API_GATEWAY]: '#ffff99',
            [ComponentType.LOAD_BALANCER]: '#ff99ff',
            [ComponentType.USERS]: '#ffa500'
        };
        return colors[type];
    }
} 