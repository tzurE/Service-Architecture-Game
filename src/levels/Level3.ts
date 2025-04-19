import { IComponent, ComponentType } from '../types/components';

export class Level3 {
    private usersComponent: IComponent;
    private totalUsers: number = 1000;
    private connectedUsers: number = 0;
    private serverCapacity: number = 300;
    private hasLoadBalancer: boolean = false;
    private serverCount: number = 0;

    constructor() {
        this.usersComponent = {
            id: 'users-1',
            type: ComponentType.USERS,
            name: 'Users',
            position: { x: -8, y: 3 },
            connections: []
        };
    }

    public getUsersComponent(): IComponent {
        return this.usersComponent;
    }

    public getLevelDescription(): string {
        return "Level 3: Load Balancing Challenge - Create a system that can handle 1000 users by distributing traffic across multiple servers using a load balancer.";
    }

    public getTotalUsers(): number {
        return this.totalUsers;
    }

    public getConnectedUsers(): number {
        return this.connectedUsers;
    }

    public getServerCapacity(): number {
        return this.serverCapacity;
    }

    public updateConnections(components: IComponent[]): void {
        // Reset counters
        this.connectedUsers = 0;
        this.hasLoadBalancer = false;
        this.serverCount = 0;

        // Find load balancer
        const loadBalancer = components.find(comp => comp.type === ComponentType.LOAD_BALANCER);
        if (loadBalancer) {
            this.hasLoadBalancer = true;
        }

        // Count servers and calculate capacity
        let totalCapacity = 0;
        let connectedServers = 0;
        
        components.forEach(comp => {
            if (comp.type === ComponentType.SERVER) {
                this.serverCount++;
                
                // Check if server has database connection
                const hasDatabase = comp.connections.some(conn => {
                    const targetComp = components.find(c => c.id === conn.to);
                    return targetComp && targetComp.type === ComponentType.DATABASE;
                }) || components.some(comp => 
                    comp.type === ComponentType.DATABASE && 
                    comp.connections.some(conn => conn.to === comp.id)
                );
                
                // Check if server is connected to load balancer
                const isConnectedToLoadBalancer = loadBalancer && (
                    comp.connections.some(conn => conn.to === loadBalancer.id) ||
                    loadBalancer.connections.some(conn => conn.to === comp.id)
                );
                
                // Only count servers that are connected to the load balancer
                if (isConnectedToLoadBalancer) {
                    connectedServers++;
                    // Add server capacity
                    totalCapacity += hasDatabase ? this.serverCapacity * 2 : this.serverCapacity;
                }
            }
        });

        // Calculate connected users based on load balancer and server capacity
        if (this.hasLoadBalancer && connectedServers >= 2) {
            // If we have a load balancer and at least 2 connected servers, we can connect all users
            // up to the total capacity
            this.connectedUsers = Math.min(this.totalUsers, totalCapacity);
        } else {
            // Without a load balancer or enough connected servers, we can't connect any users
            this.connectedUsers = 0;
        }
    }

    public isLevelComplete(): boolean {
        return this.hasLoadBalancer && this.serverCount >= 2 && this.connectedUsers >= this.totalUsers;
    }
}
