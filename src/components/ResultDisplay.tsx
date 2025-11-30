import React, { useState, useEffect, useCallback } from 'react';
import { Elevator, ElevatorUpdate, ElevatorResults, ElevatorStatus } from '../elevator';
import '../css/ResultDisplay.css';

type SimulationMode = 'realtime' | 'instant';

interface TimeBreakdown {
  travelTime: number;
  doorOpenTime: number;
  doorCloseTime: number;
  totalDoorTime: number;
  passengerTime: number;
  floorsCount: number;
}

interface ResultDisplayProps {
  controller: Elevator;
  simulationMode: SimulationMode;
  onComplete?: () => void;
  onError?: (err: Error) => void;
}

function ResultDisplay(props: ResultDisplayProps): React.JSX.Element {
  // Destructure props to avoid React Hook warnings
  const { controller, simulationMode, onComplete, onError } = props;
  
  // State for tracking updates
  const [updates, setUpdates] = useState<ElevatorUpdate[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [finalResults, setFinalResults] = useState<ElevatorResults | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ElevatorStatus>('idle');
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);

  // Run instant simulation (calculate results without delays)
  const runInstantSimulation = useCallback((): void => {
    const allUpdates: ElevatorUpdate[] = [];
    
    // Get original start floor from route[0] (set in constructor, always the original start)
    const originalStartFloor = controller.route[0];
    
    // Reset controller to initial state (useEffect may run twice, so we need to reset)
    controller.currentFloor = originalStartFloor;
    controller.route = [originalStartFloor];
    controller.totalTime = 0;
    controller.history = [];
    controller.doorsOpen = false;
    controller.isMoving = false;
    controller.status = 'idle';
    
    // Starting floor: doors are open, close them
    controller.doorsOpen = true;
    controller.status = 'Doors Closing';
    allUpdates.push({
      type: 'doors_closing',
      floor: controller.currentFloor,
      timestamp: controller.totalTime,
      duration: (controller.constructor as typeof Elevator).DOOR_CLOSE_TIME
    });
    controller.totalTime += (controller.constructor as typeof Elevator).DOOR_CLOSE_TIME;
    controller.doorsOpen = false;
    
    // Process each destination floor
    for (let i = 0; i < controller.destinationQueue.length; i++) {
      const targetFloor = controller.destinationQueue[i];
      
      // Travel to floor
      const distance = Math.abs(targetFloor - controller.currentFloor);
      const travelTime = distance * (controller.constructor as typeof Elevator).FLOOR_TRAVEL_TIME;
      allUpdates.push({
        type: 'traveling',
        floor: controller.currentFloor,
        timestamp: controller.totalTime,
        from: controller.currentFloor,
        to: targetFloor,
        duration: travelTime
      });
      controller.currentFloor = targetFloor;
      controller.route.push(targetFloor);
      controller.totalTime += travelTime;
      
      // Open doors
      allUpdates.push({
        type: 'doors_opening',
        floor: controller.currentFloor,
        timestamp: controller.totalTime,
        duration: (controller.constructor as typeof Elevator).DOOR_OPEN_TIME
      });
      controller.totalTime += (controller.constructor as typeof Elevator).DOOR_OPEN_TIME;
      controller.doorsOpen = true;
      
      // Passenger transfer
      allUpdates.push({
        type: 'passenger_transfer',
        floor: controller.currentFloor,
        timestamp: controller.totalTime,
        duration: (controller.constructor as typeof Elevator).PASSENGER_TRANSFER_TIME
      });
      controller.totalTime += (controller.constructor as typeof Elevator).PASSENGER_TRANSFER_TIME;
      
      // Close doors
      allUpdates.push({
        type: 'doors_closing',
        floor: controller.currentFloor,
        timestamp: controller.totalTime,
        duration: (controller.constructor as typeof Elevator).DOOR_CLOSE_TIME
      });
      controller.totalTime += (controller.constructor as typeof Elevator).DOOR_CLOSE_TIME;
      controller.doorsOpen = false;
    }
    
    // Complete
    controller.status = 'Complete';
    allUpdates.push({
      type: 'complete',
      floor: controller.currentFloor,
      timestamp: controller.totalTime,
      totalTime: controller.totalTime,
      route: controller.route
    });
    
    // Populate controller history (getResults() uses this)
    controller.history = [...allUpdates];
    
    // Update state with all results at once
    setUpdates(allUpdates);
    setIsComplete(true);
    setFinalResults(controller.getResults());
    setCurrentStatus(controller.status);
    setCurrentFloor(controller.currentFloor);
    
    if (onComplete) {
      onComplete();
    }
  }, [controller, onComplete]);

  // Subscribe to controller updates and start simulation
  useEffect(() => {
    // Reset when controller changes
    setUpdates([]);
    setIsComplete(false);
    setFinalResults(null);
    setCurrentStatus(controller.status);
    setCurrentFloor(controller.currentFloor);
    
    // Check if instant mode
    if (simulationMode === 'instant') {
      // Instant mode: Run simulation synchronously without delays
      runInstantSimulation();
    } else {
      // Real-time mode: Set up callback to receive updates (only once per controller)
      if (!controller.onUpdate) {
        controller.onUpdate = (update: ElevatorUpdate) => {
          setUpdates(prev => [...prev, update]);
          
          // Update current status and floor
          setCurrentStatus(controller.status);
          setCurrentFloor(controller.currentFloor);
          
          // Check if complete
          if (update.type === 'complete') {
            setIsComplete(true);
            setFinalResults(controller.getResults());
            if (onComplete) {
              onComplete();
            }
          }
        };
        
        // Start simulation after callback is set up
        controller.start().catch((err: Error) => {
          if (onError) {
            onError(err);
          }
        });
      }
    }
  }, [controller, onComplete, onError, simulationMode, runInstantSimulation]);

  // Function to render each update
  function renderUpdateText(update: ElevatorUpdate): string {
    if (update.type === 'traveling') {
      return `The elevator is heading from floor ${update.from} to floor ${update.to} (${update.duration} sec)`;
    }
    if (update.type === 'doors_opening') {
      return `Floor ${update.floor} doors are opening (${update.duration} sec)`;
    }
    if (update.type === 'passenger_transfer') {
      return `Floor ${update.floor} passenger transfer (${update.duration} sec)`;
    }
    if (update.type === 'doors_closing') {
      return `Floor ${update.floor} doors are closing (${update.duration} sec)`;
    }
    return '';
  }

  // Calculate time breakdown when complete
  function calculateTimeBreakdown(): TimeBreakdown | null {
    if (!isComplete || !finalResults) return null;

    let travelTime = 0;
    let doorOpenTime = 0;
    let doorCloseTime = 0;
    let passengerTime = 0;

    updates.forEach(update => {
      if (update.type === 'traveling' && update.duration) {
        travelTime += update.duration;
      } else if (update.type === 'doors_opening' && update.duration) {
        doorOpenTime += update.duration;
      } else if (update.type === 'doors_closing' && update.duration) {
        doorCloseTime += update.duration;
      } else if (update.type === 'passenger_transfer' && update.duration) {
        passengerTime += update.duration;
      }
    });

    const totalDoorTime = doorOpenTime + doorCloseTime;
    const floorsCount = finalResults.route.length - 1; // Exclude starting floor

    return {
      travelTime,
      doorOpenTime,
      doorCloseTime,
      totalDoorTime,
      passengerTime,
      floorsCount
    };
  }

  const breakdown = calculateTimeBreakdown();

  return (
    <div className="result-box">
      <h2>Results</h2>
      
      <div className="result-summary">
        <div className="result-item">
          <span className="label">Current Status:</span>
          <span className="value">{currentStatus}</span>
        </div>
        <div className="result-item">
          <span className="label">Current Floor:</span>
          <span className="value">{currentFloor}</span>
        </div>
        {finalResults && (
          <>
            <div className="result-item">
              <span className="label">Total Travel Time:</span>
              <span className="value">{finalResults.totalTime} sec</span>
            </div>
            <div className="result-item">
              <span className="label">Floors Visited:</span>
              <span className="value">{finalResults.route.join(',')}</span>
            </div>
          </>
        )}
      </div>

      <div className="steps-list">
        <h3>Step-by-Step:</h3>
        {/* create copy of updates array and reverse it */}
        {updates.slice().reverse().map((update, index) => {
          if (update.type === 'complete') {
            return null;
          }
          return (
            <div key={updates.length - 1 - index} className="step-item">
              <p>{renderUpdateText(update)}</p>
            </div>
          );
        })}
        {isComplete && (
          <>
            <div className="complete-message">
              <strong>Simulation Complete!</strong>
            </div>
            
            {breakdown && (
              <div className="summary-breakdown">
                <h4>Time Breakdown Summary:</h4>
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td className="breakdown-label">Floors Traveled:</td>
                      <td className="breakdown-value">{breakdown.floorsCount} floors</td>
                    </tr>
                    <tr>
                      <td className="breakdown-label">Travel Between Floors:</td>
                      <td className="breakdown-value">{breakdown.travelTime} sec</td>
                    </tr>
                    <tr>
                      <td className="breakdown-label">Doors Opening:</td>
                      <td className="breakdown-value">{breakdown.doorOpenTime} sec</td>
                    </tr>
                    <tr>
                      <td className="breakdown-label">Doors Closing:</td>
                      <td className="breakdown-value">{breakdown.doorCloseTime} sec</td>
                    </tr>
                    <tr>
                      <td className="breakdown-label">Passenger Transfer:</td>
                      <td className="breakdown-value">{breakdown.passengerTime} sec</td>
                    </tr>
                    <tr className="breakdown-total">
                      <td className="breakdown-label"><strong>Total Time:</strong></td>
                      <td className="breakdown-value"><strong>{finalResults!.totalTime} sec</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ResultDisplay;

