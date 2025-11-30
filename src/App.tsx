import React, { useState, useCallback } from 'react';
import { Elevator } from './elevator';
import { StandardElevator } from './elevators/StandardElevator';
import { ExpressElevator } from './elevators/ExpressElevator';
import { parseFloors } from './services/inputParser';
import InfoBox from './components/InfoBox';
import InputForm from './components/InputForm';
import ErrorDisplay from './components/ErrorDisplay';
import ResultDisplay from './components/ResultDisplay';
import './css/App.css';

type ElevatorType = 'standard' | 'express';
type SimulationMode = 'realtime' | 'instant';

function App(): React.JSX.Element {
  // State for form inputs
  const [startFloor, setStartFloor] = useState<string>('10');
  const [destinationFloors, setDestinationFloors] = useState<string>('9,11,13');
  const [elevatorType, setElevatorType] = useState<ElevatorType>('standard');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('realtime');
  const [error, setError] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [controller, setController] = useState<Elevator | null>(null);

  // Handle the simulation
  function handleSimulate(): void {
    try {
      setError('');
      
      // Parse inputs
      const start: number = parseInt(startFloor, 10);
      if (isNaN(start)) {
        throw new Error('Start floor must be a valid number');
      }
      
      const destinations: number[] = parseFloors(destinationFloors);
      
      // Create new elevator based on type (Polymorphism!)
      let newController: Elevator;
      if (elevatorType === 'express') {
        newController = new ExpressElevator(start, destinations);
      } else {
        newController = new StandardElevator(start, destinations);
      }
      
      setController(newController);
      setIsSimulating(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setController(null);
    }
  }
  
  // Handle simulation completion - use useCallback to prevent recreation
  const handleSimulationComplete = useCallback((): void => {
    setIsSimulating(false);
  }, []);
  
  // Handle simulation error - use useCallback to prevent recreation
  const handleSimulationError = useCallback((err: Error): void => {
    setError(err.message);
    setIsSimulating(false);
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>Elevator Simulation</h1>
        
        <InfoBox />

        <InputForm
          startFloor={startFloor}
          setStartFloor={setStartFloor}
          destinationFloors={destinationFloors}
          setDestinationFloors={setDestinationFloors}
          elevatorType={elevatorType}
          setElevatorType={setElevatorType}
          simulationMode={simulationMode}
          setSimulationMode={setSimulationMode}
          onSubmit={handleSimulate}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleSimulate();
            }
          }}
          disabled={isSimulating}
        />

        {error && <ErrorDisplay error={error} />}

        {controller && (
          <ResultDisplay 
            controller={controller}
            simulationMode={simulationMode}
            onComplete={handleSimulationComplete}
            onError={handleSimulationError}
          />
        )}
      </div>
    </div>
  );
}

export default App;

