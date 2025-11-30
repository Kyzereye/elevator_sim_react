/**
 * Elevator Simulation Logic
 */

// Type definitions
export type ElevatorStatus = 'idle' | 'running' | 'Doors Opening' | 'Doors Closing' | 'Passenger Transfer' | 'Traveling' | 'Traveling (Express)' | 'Complete' | 'error';

export type UpdateType = 'doors_opening' | 'doors_closing' | 'passenger_transfer' | 'traveling' | 'complete';

export interface ElevatorUpdate {
  type: UpdateType;
  floor: number;
  timestamp: number;
  duration?: number;
  from?: number;
  to?: number;
  totalTime?: number;
  route?: number[];
}

export interface ElevatorResults {
  totalTime: number;
  route: number[];
  history: ElevatorUpdate[];
}

/**
 * Elevator (Base Class)
 * Manages elevator state and operations
 */
export class Elevator {
  // Class variables (static)
  static FLOOR_TRAVEL_TIME: number = 10;
  static DOOR_OPEN_TIME: number = 2;
  static DOOR_CLOSE_TIME: number = 2;
  static PASSENGER_TRANSFER_TIME: number = 4;
  static OPERATION_TIMEOUT: number = 15; // Maximum time for any operation (in seconds)
  
  // Instance variables
  currentFloor: number;
  doorsOpen: boolean;
  isMoving: boolean;
  destinationQueue: number[];
  status: ElevatorStatus;
  route: number[];
  totalTime: number;
  history: ElevatorUpdate[];
  onUpdate: ((update: ElevatorUpdate) => void) | null;
  isRunning: boolean;
  
  constructor(startFloor: number, destinationFloors: number[]) {
    // Validate inputs
    if (!Number.isInteger(startFloor)) {
      throw new Error('Start floor must be an integer');
    }
    
    if (!Array.isArray(destinationFloors) || destinationFloors.length === 0) {
      throw new Error('Destination floors must be a non-empty array');
    }
    
    // Validate all destination floors are integers
    for (let i = 0; i < destinationFloors.length; i++) {
      if (!Number.isInteger(destinationFloors[i])) {
        throw new Error('All destination floors must be integers');
      }
    }
    
    // Elevator state
    this.currentFloor = startFloor;
    this.doorsOpen = false;
    this.isMoving = false;
    this.destinationQueue = [...destinationFloors];
    this.status = 'idle';
    
    // Tracking
    this.route = [startFloor];
    this.totalTime = 0;
    this.history = [];
    
    // Callback for updates (set by React component)
    this.onUpdate = null;
    
    // Control flag
    this.isRunning = false;
  }
  
  /**
   * Add update to history and notify callback
   */
  addUpdate(type: UpdateType, data: Partial<ElevatorUpdate>): void {
    const update: ElevatorUpdate = {
      type: type,
      floor: this.currentFloor,
      timestamp: this.totalTime,
      ...data
    };
    
    this.history.push(update);
    
    if (this.onUpdate) {
      this.onUpdate(update);
    }
  }
  
  /**
   * Open elevator doors
   */
  openDoors(): Promise<void> {
    if (this.isMoving) {
      throw new Error('Cannot open doors while moving');
    }
    
    const doorOperation = new Promise<void>((resolve) => {
      this.status = 'Doors Opening';
      this.addUpdate('doors_opening', { duration: (this.constructor as typeof Elevator).DOOR_OPEN_TIME });
      
      setTimeout(() => {
        this.doorsOpen = true;
        this.totalTime += (this.constructor as typeof Elevator).DOOR_OPEN_TIME;
        resolve();
      }, (this.constructor as typeof Elevator).DOOR_OPEN_TIME * 1000);
    });

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Door opening operation timed out - elevator malfunction!'));
      }, (this.constructor as typeof Elevator).OPERATION_TIMEOUT * 1000);
    });

    return Promise.race([doorOperation, timeout]);
  }
  
  /**
   * Close elevator doors
   */
  closeDoors(): Promise<void> {
    if (!this.doorsOpen) {
      throw new Error('Doors are already closed');
    }
    
    const doorOperation = new Promise<void>((resolve) => {
      this.status = 'Doors Closing';
      this.addUpdate('doors_closing', { duration: (this.constructor as typeof Elevator).DOOR_CLOSE_TIME });
      
      setTimeout(() => {
        this.doorsOpen = false;
        this.totalTime += (this.constructor as typeof Elevator).DOOR_CLOSE_TIME;
        resolve();
      }, (this.constructor as typeof Elevator).DOOR_CLOSE_TIME * 1000);
    });

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Door closing operation timed out - elevator malfunction!'));
      }, (this.constructor as typeof Elevator).OPERATION_TIMEOUT * 1000);
    });

    return Promise.race([doorOperation, timeout]);
  }
  
  /**
   * Load/unload passengers
   */
  loadPassengers(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.doorsOpen) {
        throw new Error('Doors must be open for passenger transfer');
      }
      
      this.status = 'Passenger Transfer';
      this.addUpdate('passenger_transfer', { duration: (this.constructor as typeof Elevator).PASSENGER_TRANSFER_TIME });
      
      setTimeout(() => {
        this.totalTime += (this.constructor as typeof Elevator).PASSENGER_TRANSFER_TIME;
        resolve();
      }, (this.constructor as typeof Elevator).PASSENGER_TRANSFER_TIME * 1000);
    });
  }
  
  /**
   * Travel to a specific floor
   */
  travelToFloor(targetFloor: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.doorsOpen) {
        throw new Error('Cannot move with doors open');
      }
      
      if (!Number.isInteger(targetFloor)) {
        throw new Error('Target floor must be an integer');
      }
      
      const distance = Math.abs(targetFloor - this.currentFloor);
      const travelTime = distance * (this.constructor as typeof Elevator).FLOOR_TRAVEL_TIME;
      
      this.isMoving = true;
      this.status = 'Traveling';
      
      this.addUpdate('traveling', {
        from: this.currentFloor,
        to: targetFloor,
        duration: travelTime
      });
      
      setTimeout(() => {
        this.currentFloor = targetFloor;
        this.route.push(targetFloor);
        this.isMoving = false;
        this.totalTime += travelTime;
        resolve();
      }, travelTime * 1000);
    });
  }
  
  /**
   * Main control loop - runs the simulation automatically
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Elevator is already running');
    }
    
    this.isRunning = true;
    this.status = 'running';
    
    try {
      // Starting floor: doors are open, close them before moving
      this.doorsOpen = true;  // Set initial state
      await this.closeDoors();
      
      // Process each destination floor
      for (let i = 0; i < this.destinationQueue.length; i++) {
        const targetFloor = this.destinationQueue[i];
        
        // Travel to floor
        await this.travelToFloor(targetFloor);
        
        // Open doors
        await this.openDoors();
        
        // Load/unload passengers
        await this.loadPassengers();
        
        // Close doors
        await this.closeDoors();
      }
      
      // Simulation complete
      this.status = 'Complete';
      this.isRunning = false;
      this.addUpdate('complete', { 
        totalTime: this.totalTime,
        route: this.route
      });
      
    } catch (error) {
      this.status = 'error';
      this.isRunning = false;
      throw error;
    }
  }
  
  /**
   * Get final results
   */
  getResults(): ElevatorResults {
    return {
      totalTime: this.totalTime,
      route: this.route,
      history: this.history
    };
  }
}

