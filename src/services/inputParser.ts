/**
 * Input Parser Service
 * 
 * Handles parsing and validation of user input for the elevator simulation
 */

/**
 * Parse a comma-separated string of floor numbers into an array of integers
 * @param floorsString - Comma-separated floor numbers (e.g., "1,2,3")
 * @returns Array of floor numbers
 * @throws Error if input is invalid or empty
 */
export function parseFloors(floorsString: string): number[] {
  if (!floorsString || typeof floorsString !== 'string') {
    throw new Error('Floors string is required');
  }
  
  // Split by comma and parse each floor number
  const floorArray: string[] = floorsString.split(',');
  const floors: number[] = [];
  
  for (let i = 0; i < floorArray.length; i++) {
    const floor: string = floorArray[i].trim();
    if (floor !== '') {
      const num: number = parseInt(floor, 10);
      if (isNaN(num)) {
        throw new Error(`Invalid floor number: ${floor}`);
      }
      floors.push(num);
    }
  }
  
  if (floors.length === 0) {
    throw new Error('At least one destination floor is required');
  }
  
  return floors;
}

