import { IComponent, ComponentType } from '../types/components';

export class Level4 {
    private usersComponent: IComponent;
    private totalUsers: number = 2000;
    private connectedUsers: number = 0;
    private serverCapacity: number = 300;
    private hasLoadBalancer: boolean = false;
    private serverCount: number = 0;
    private connectedServers: number = 0;
    private hasCache: boolean = false;
    private databaseQueryRate: number = 0;
    private maxDatabaseQueries: number = 500;

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
        return "Level 4: Caching Challenge - Create a system that can handle 2000 users with minimal database load by implementing a caching layer.";
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

    public getDatabaseQueryRate(): number {
        return this.databaseQueryRate;
    }

    public getMaxDatabaseQueries(): number {
        return this.maxDatabaseQueries;
    }

    public updateConnections(components: IComponent[]): void {
        // Reset counters
        this.connectedUsers = 0;
        this.hasLoadBalancer = false;
        this.serverCount = 0;
        this.connectedServers = 0;
        this.hasCache = false;
        this.databaseQueryRate = 0;

        // Find load balancer
        const loadBalancer = components.find(comp => comp.type === ComponentType.LOAD_BALANCER);
        if (loadBalancer) {
            this.hasLoadBalancer = true;
        }

        // Find cache
        const cache = components.find(comp => comp.type === ComponentType.CACHE);
        if (cache) {
            this.hasCache = true;
        }

        // Find users component
        const usersComponent = components.find(comp => comp.type === ComponentType.USERS);
        
        // Check if load balancer is connected to users
        const loadBalancerConnectedToUsers = loadBalancer && usersComponent && (
            loadBalancer.connections.some(conn => conn.to === usersComponent.id) ||
            usersComponent.connections.some(conn => conn.to === loadBalancer.id)
        );

        // Count servers and calculate capacity
        let totalCapacity = 0;
        let serversWithCache = 0;
        let serversWithDatabase = 0;
        
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
                
                // Check if server is connected to cache
                const isConnectedToCache = cache && (
                    comp.connections.some(conn => conn.to === cache.id) ||
                    cache.connections.some(conn => conn.to === comp.id)
                );
                
                // Only count servers that are connected to the load balancer
                if (isConnectedToLoadBalancer) {
                    this.connectedServers++;
                    
                    // Track servers with cache and database
                    if (isConnectedToCache) {
                        serversWithCache++;
                    }
                    
                    if (hasDatabase) {
                        serversWithDatabase++;
                    }
                    
                    // Add server capacity
                    // Double capacity if connected to database or cache
                    if (hasDatabase || isConnectedToCache) {
                        totalCapacity += this.serverCapacity * 2;
                    } else {
                        totalCapacity += this.serverCapacity;
                    }
                }
            }
        });

        // Calculate connected users based on load balancer and server capacity
        if (this.hasLoadBalancer && this.connectedServers > 0 && loadBalancerConnectedToUsers) {
            // If we have a load balancer connected to users and at least 1 connected server, we can connect users
            // up to the total capacity
            this.connectedUsers = Math.min(this.totalUsers, totalCapacity);
        } else {
            // Without a load balancer connected to users or connected servers, we can't connect any users
            this.connectedUsers = 0;
        }

        // Calculate database query rate
        // Only calculate query rate if we have connected users
        if (this.connectedUsers > 0) {
            // Base query rate is 1 query per user per second
            let baseQueryRate = this.connectedUsers;
            
            // If we have a cache, reduce query rate by 50% for servers with cache
            if (this.hasCache && serversWithCache > 0) {
                // Calculate how many users are served by servers with cache
                const usersPerServer = this.connectedUsers / this.connectedServers;
                const usersWithCache = usersPerServer * serversWithCache;
                
                // Reduce query rate for those users by 50%
                this.databaseQueryRate = baseQueryRate - (usersWithCache * 0.5);
            } else {
                this.databaseQueryRate = baseQueryRate;
            }
        } else {
            // If no users are connected, no database queries
            this.databaseQueryRate = 0;
        }
    }

    public isLevelComplete(): boolean {
        return this.hasLoadBalancer && 
               this.connectedServers >= 2 && 
               this.connectedUsers >= this.totalUsers && 
               this.hasCache && 
               this.databaseQueryRate <= this.maxDatabaseQueries;
    }
} 