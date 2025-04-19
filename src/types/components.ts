// Connection types between components
export enum ConnectionType {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  DATABASE = 'database',
  CACHE = 'cache',
  INTERNAL = 'internal'
}

// Base interface for all components
export interface IComponent {
  id: string;
  type: ComponentType;
  name: string;
  position: Position;
  connections: Connection[];
  capacity?: number;  // Maximum number of users this component can handle
  currentUsers?: number;  // Current number of users being handled
}

// Position in the game grid
export interface Position {
  x: number;
  y: number;
}

// Connection between components
export interface Connection {
  from: string;  // Component ID
  to: string;    // Component ID
  users: number; // Number of users using this connection
}

// Base properties for all components
export interface ComponentProperties {
  health: number;        // Component health/status (0-100)
  cost: number;         // Resource cost
  maxConnections: number; // Maximum number of connections allowed
}

// Connection properties
export interface ConnectionProperties {
  latency: number;      // Connection latency in ms
  bandwidth: number;    // Bandwidth in MB/s
  isSecure: boolean;    // Whether the connection is encrypted
}

// Component types
export enum ComponentType {
  SERVER = 'SERVER',
  DATABASE = 'DATABASE',
  CACHE = 'CACHE',
  API_GATEWAY = 'API_GATEWAY',
  LOAD_BALANCER = 'LOAD_BALANCER',
  USERS = 'USERS'
}

// Specific component interfaces
export interface ServerComponent extends IComponent {
  type: ComponentType.SERVER;
}

export interface DatabaseComponent extends IComponent {
  type: ComponentType.DATABASE;
}

export interface CacheComponent extends IComponent {
  type: ComponentType.CACHE;
}

export interface ApiGatewayComponent extends IComponent {
  type: ComponentType.API_GATEWAY;
}

export interface LoadBalancerComponent extends IComponent {
  type: ComponentType.LOAD_BALANCER;
}

// Specific properties for each component type
export interface ServerProperties extends ComponentProperties {
  cpu: number;          // CPU usage percentage
  memory: number;       // Memory usage percentage
  requestsPerSecond: number;
}

export interface DatabaseProperties extends ComponentProperties {
  storage: number;      // Storage in GB
  queryCapacity: number; // Queries per second
  replicationFactor: number;
}

export interface CacheProperties extends ComponentProperties {
  memorySize: number;   // Cache size in MB
  hitRate: number;      // Cache hit rate percentage
  ttl: number;         // Time to live in seconds
}

export interface ApiGatewayProperties extends ComponentProperties {
  routes: number;       // Number of routes
  rateLimit: number;    // Requests per minute
  authEnabled: boolean;
}

export interface LoadBalancerProperties extends ComponentProperties {
  algorithm: 'round-robin' | 'least-connections' | 'weighted';
  activeConnections: number;
  healthCheckInterval: number;
} 