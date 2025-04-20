import { ComponentType, IComponent } from '../types/components';

export class Level2 {
    private usersComponent: IComponent;
    private totalUsers: number = 15;
    private connectedUsers: number = 0;
    private isComplete: boolean = false;
    private serverCapacity: number = 5;
    private requiredDatabaseConnections: number = 0;

    constructor() {
        // Create the Users component at a fixed position
        this.usersComponent = {
            id: 'users-1',
            type: ComponentType.USERS,
            name: 'Users',
            position: { x: -8, y: 3 },
            connections: [],
            currentUsers: this.totalUsers
        };
    }

    public getLevelDescription(): string {
        return `Level 2: Database Integration
- You have ${this.totalUsers} users trying to connect
- Each server can handle ${this.serverCapacity * 2} users when connected to a database
- Without a database, servers only handle ${Math.floor(this.serverCapacity)} users
- Connect each server to exactly one database to maximize capacity`;
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
            (connectedServers.some(server => 
                server.connections.some(conn => conn.to === comp.id)
            ) || comp.connections.some(conn => 
                connectedServers.some(server => server.id === conn.to)
            ))
        );

        // Log database connections for debugging
        console.log('Database connections:', {
            totalDatabases: components.filter(comp => comp.type === ComponentType.DATABASE).length,
            connectedDatabases: connectedDatabases.length,
            requiredDatabases: this.requiredDatabaseConnections
        });

        // Calculate total capacity
        let totalCapacity = 0;
        connectedServers.forEach(server => {
            // Check for database connections in both directions
            const hasDatabase = server.connections.some(conn => {
                const targetComp = components.find(c => c.id === conn.to);
                return targetComp && targetComp.type === ComponentType.DATABASE;
            }) || components.some(comp => 
                comp.type === ComponentType.DATABASE && 
                comp.connections.some(conn => conn.to === server.id)
            );
            
            // Use double capacity if has database, half if not
            const serverCapacity = hasDatabase ? this.serverCapacity * 2 : Math.floor(this.serverCapacity);
            totalCapacity += serverCapacity;
            
            // Log server capacity for debugging
            console.log(`Server ${server.id} capacity: ${serverCapacity} (has database: ${hasDatabase})`);
        });

        // Update connected users based on total capacity
        this.connectedUsers = Math.min(this.totalUsers, totalCapacity);

        // Check if each server has exactly one database connection
        const allServersHaveOneDB = connectedServers.every(server => {
            // Count outgoing database connections
            const outgoingDBConnections = server.connections.filter(conn => {
                const targetComp = components.find(c => c.id === conn.to);
                return targetComp && targetComp.type === ComponentType.DATABASE;
            });
            
            // Count incoming database connections
            const incomingDBConnections = components.filter(comp => 
                comp.type === ComponentType.DATABASE && 
                comp.connections.some(conn => conn.to === server.id)
            );
            
            // A server should have exactly one database connection (either outgoing or incoming)
            const totalDBConnections = outgoingDBConnections.length + incomingDBConnections.length;
            
            // Log server-database connections for debugging
            console.log(`Server ${server.id} database connections:`, {
                outgoing: outgoingDBConnections.length,
                incoming: incomingDBConnections.length,
                total: totalDBConnections,
                isValid: totalDBConnections === 1
            });
            
            return totalDBConnections === 1;
        });

        // Check win condition
        this.isComplete = this.connectedUsers >= this.totalUsers;

        
        // Additional check to ensure all servers have exactly one database
        if (this.connectedUsers >= this.totalUsers && 
            connectedDatabases.length >= this.requiredDatabaseConnections && 
            !allServersHaveOneDB) {
            console.warn('Win condition failed: Not all servers have exactly one database connection');
        }
    }

    public isLevelComplete(): boolean {
        return this.isComplete;
    }
} 