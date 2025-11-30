/**
 * ExpressElevator
 * High-speed elevator with faster floor travel time
 * Demonstrates inheritance and polymorphism
 */

import { Elevator } from '../elevator';

export class ExpressElevator extends Elevator {
  // Override only what's different - faster travel time
  static FLOOR_TRAVEL_TIME: number = 5;  // 2x faster than standard (base class has 10)
  
  constructor(startFloor: number, destinationFloors: number[]) {
    super(startFloor, destinationFloors);
  }
  
  /**
   * Override travelToFloor to demonstrate polymorphism
   * Adds "Express" indicator to the status
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
      this.status = 'Traveling (Express)';  // Polymorphism: Different behavior
      
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
}

