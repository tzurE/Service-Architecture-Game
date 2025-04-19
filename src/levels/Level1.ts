import { ComponentType, IComponent, Position } from '../types/components';

export class Level1 {
    private usersComponent: IComponent;
    private totalUsers: number = 10;
    private connectedUsers: number = 0;
    private isComplete: boolean = false;
    private serverCapacity: number = 5; // Base capacity is 5
    private requiredDatabaseConnections: number = 0;

    constructor() {
        // Create the Users component at a fixed position
        this.usersComponent = {
            id: 'users-1',
            type: ComponentType.USERS,
            name: 'Users',
            position: { x: -8, y: 3 }, // Updated position
            connections: [],
            currentUsers: this.totalUsers
        };
    }

    public getLevelDescription(): string {
        return `Level 1: First Users
- You have ${this.totalUsers} users trying to connect
- Each server can handle ${this.serverCapacity} users by default.
Double click on a component to create a new connection from it.`;
    }

    public getServerCapacity(): number {
        return this.serverCapacity;
    }

    public getUsersComponent(): IComponent {
        return this.usersComponent;
    }

    public getTotalUsers(): number {
        return this.totalUsers;
    }

    public getConnectedUsers(): number {
        return this.connectedUsers;
    }

    public updateConnections(components: IComponent[]): void {
        // Reset connected users count
        this.connectedUsers = 0;
        this.requiredDatabaseConnections = 0;

        // Find the users component
        const usersComponent = components.find(comp => comp.type === ComponentType.USERS);
        if (!usersComponent) return;

        // Find all servers that are connected to the users component
        const connectedServers = components.filter(comp => 
            comp.type === ComponentType.SERVER && 
            usersComponent.connections.some(conn => conn.to === comp.id)
        );

        // Count how many servers need database connections
        this.requiredDatabaseConnections = connectedServers.length;
        
        // Find all databases that are connected to servers
        const connectedDatabases = components.filter(comp => 
            comp.type === ComponentType.DATABASE && 
            connectedServers.some(server => 
                server.connections.some(conn => conn.to === comp.id)
            )
        );

        // Calculate total capacity
        let totalCapacity = 0;
        connectedServers.forEach(server => {
            if (server.capacity) {
                // If server has a database connection, use full capacity
                const hasDatabase = server.connections.some(conn => {
                    const targetComp = components.find(c => c.id === conn.to);
                    return targetComp && targetComp.type === ComponentType.DATABASE;
                });
                
                // Use full capacity if has database, base capacity if not
                const serverCapacity = hasDatabase ? this.serverCapacity * 2 : this.serverCapacity;
                totalCapacity += serverCapacity;
            }
        });

        // Update connected users based on total capacity
        this.connectedUsers = Math.min(this.totalUsers, totalCapacity);

        // Check if each server has exactly one database connection
        const allServersHaveOneDB = connectedServers.every(server => {
            const dbConnections = server.connections.filter(conn => {
                const targetComp = components.find(c => c.id === conn.to);
                return targetComp && targetComp.type === ComponentType.DATABASE;
            });
            return dbConnections.length === 1;
        });

        // Check win condition
        this.isComplete = this.connectedUsers >= this.totalUsers;
    }

    public isLevelComplete(): boolean {
        return this.isComplete;
    }
} 