/**
 * StandardElevator
 * Standard speed elevator - inherits all default timing constants from base Elevator class
 */

import { Elevator } from '../elevator';

export class StandardElevator extends Elevator {
  // Inherits all static variables from Elevator (no need to redefine)
  
  constructor(startFloor: number, destinationFloors: number[]) {
    super(startFloor, destinationFloors);
  }
}

