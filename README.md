# Elevator Simulation

A simple React-based elevator simulation that calculates travel time and route based on input floors.

## Project Overview

This project simulates an elevator moving between floors. Given a starting floor and a list of destination floors, it calculates the total travel time and displays the route taken.

## Requirements

- **Node.js** (v14 or higher)
- **npm** or **yarn**

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Usage

### Command Line Format (as per requirements)

**Input Format:** `elevator start=12 floor=2,9,1,32`

**Output Format:** `594 12,2,9,1,32`

### Web Interface

1. Enter the starting floor (e.g., `12`)
2. Enter destination floors as comma-separated values (e.g., `2,9,1,32`)
3. Click "Run Elevator" button
4. View the results:
   - Total Travel Time (in seconds)
   - Floors Visited (in order)
   - Step-by-step breakdown showing:
     - "The elevator is heading to floor X"
     - "The doors are opening"
     - "Passenger transfer"
     - "The doors are closing"

## Algorithm

**FCFS (First-Come-First-Served)**

The elevator visits floors in the exact order they are provided in the input. This is the simplest scheduling algorithm.

## Constants

- **Single Floor Travel Time:** 10 seconds
- **Door Opening Time:** 2 seconds
- **Door Closing Time:** 2 seconds
- **Passenger Transfer Time:** 4 seconds

## Calculation Example

**Input:** start=12, floors=2,9,1,32

**Operations:**
- Floor 12 (starting): Close doors = 2 sec
- Travel 12 → 2: |12-2| = 10 floors × 10 sec = 100 sec
- Floor 2: Open (2s) + Transfer (4s) + Close (2s) = 8 sec
- Travel 2 → 9: |2-9| = 7 floors × 10 sec = 70 sec  
- Floor 9: Open (2s) + Transfer (4s) + Close (2s) = 8 sec
- Travel 9 → 1: |9-1| = 8 floors × 10 sec = 80 sec
- Floor 1: Open (2s) + Transfer (4s) + Close (2s) = 8 sec
- Travel 1 → 32: |1-32| = 31 floors × 10 sec = 310 sec
- Floor 32: Open (2s) + Transfer (4s) + Close (2s) = 8 sec

**Total: 2 + 100 + 8 + 70 + 8 + 80 + 8 + 310 + 8 = 594 seconds**

**Output:** `594 12,2,9,1,32`

## Assumptions

1. **Floors visited in order provided:** The elevator follows a FCFS (First-Come-First-Served) approach, visiting floors in the exact sequence specified in the input.

2. **Fixed operation times:** 
   - Door opening: 2 seconds
   - Passenger transfer: 4 seconds
   - Door closing: 2 seconds
   - These operations occur at every destination floor (not at the starting floor)

3. **Constant travel speed:** The elevator takes exactly 10 seconds to travel between any two adjacent floors.

4. **No floor restrictions:** Floors can be any integer (positive, negative, or zero). There are no minimum or maximum floor constraints.

5. **Linear travel:** The elevator travels directly between floors without intermediate stops unless specified in the input.

6. **Instant direction changes:** The elevator can change direction instantly without any delay or acceleration/deceleration time.

7. **All floors are valid:** Input validation ensures all floor numbers are integers, but any integer value is accepted as a valid floor.

8. **Step-by-step display:** The simulation shows a list of all elevator operations in sequence.

## Features NOT Implemented

1. **Optimization Algorithms:** 
   - SCAN (elevator algorithm)
   - LOOK 
   - SSTF (Shortest Seek Time First)
   - These could optimize the route to minimize travel time

2. **Multiple Elevator Support:** Only simulates a single elevator

3. **Priority Requests:** All floor requests are treated equally

4. **Capacity Limits:** No maximum passenger or weight capacity simulation

5. **Emergency Stops:** No simulation of emergency or maintenance scenarios

6. **Direction Preference:** No preference for continuing in the current direction before reversing

7. **Command-line Script:** The project runs as a web application. A CLI version could be added using Node.js

8. **Acceleration/Deceleration:** Elevator travels at constant speed, no gradual speed changes

9. **Visual Elevator Shaft:** No graphical representation of the elevator moving up and down a building

## Project Structure

```
react/
├── package.json           # Project dependencies
├── public/
│   └── index.html        # HTML template
├── src/
│   ├── index.js          # React entry point
│   ├── App.js            # Main app component (logic only)
│   ├── elevator.js       # Core elevator logic
│   ├── css/              # Styles
│   │   ├── index.css         # Global styles
│   │   └── App.css           # Component styles
│   └── components/       # UI Components
│       ├── InfoBox.js         # Displays constants/algorithm
│       ├── InputForm.js       # Input fields and submit button
│       ├── ErrorDisplay.js    # Error message display
│       ├── ResultDisplay.js   # Results and step-by-step display
│       └── ExampleBox.js      # Example calculation display
└── README.md             # This file
```

## Core Logic (`elevator.js`)

- `simulateElevator(startFloor, destinationFloors)` - Main simulation function
- `parseFloors(floorsString)` - Parses comma-separated floor input
- Returns: `{ totalTime, route }`

## Testing

You can test with the default example:
- Start: 12
- Floors: 2,9,1,32
- Expected Output: 594 12,2,9,1,32
  - Starting floor door close: 2 seconds
  - Travel time: 560 seconds
  - Door/passenger operations: 32 seconds (4 stops × 8 sec)

Or try your own combinations!

## Future Enhancements

- Add CLI script for command-line execution
- Implement optimization algorithms (SCAN, LOOK, etc.)
- Add visual elevator shaft with graphical representation
- Support multiple elevators
- Add comprehensive unit tests
- Add real-time animation of elevator progress

## License

MIT

## Author

Created for elevator simulation project interview

# elevator_sim_react
