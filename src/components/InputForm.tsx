import React from 'react';
import '../css/InputForm.css';

type ElevatorType = 'standard' | 'express';
type SimulationMode = 'realtime' | 'instant';

interface InputFormProps {
  startFloor: string;
  setStartFloor: (value: string) => void;
  destinationFloors: string;
  setDestinationFloors: (value: string) => void;
  elevatorType: ElevatorType;
  setElevatorType: (value: ElevatorType) => void;
  simulationMode: SimulationMode;
  setSimulationMode: (value: SimulationMode) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

function InputForm(props: InputFormProps): React.JSX.Element {
  return (
    <div className="input-section">
      <div className="input-group">
        <label htmlFor="startFloor">Start Floor:</label>
        <input
          id="startFloor"
          type="number"
          value={props.startFloor}
          onChange={(e) => props.setStartFloor(e.target.value)}
          onKeyPress={props.onKeyPress}
          placeholder="e.g., 12"
          disabled={props.disabled}
        />
      </div>

      <div className="input-group">
        <label htmlFor="destinationFloors">Destination Floors (comma-separated):</label>
        <input
          id="destinationFloors"
          type="text"
          value={props.destinationFloors}
          onChange={(e) => props.setDestinationFloors(e.target.value)}
          onKeyPress={props.onKeyPress}
          placeholder="e.g., 2,9,1,32"
          disabled={props.disabled}
        />
      </div>

      <div className="input-group">
        <label>Elevator Type:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="elevatorType"
              value="standard"
              checked={props.elevatorType === 'standard'}
              onChange={(e) => props.setElevatorType(e.target.value as ElevatorType)}
              disabled={props.disabled}
            />
            Standard (10 sec/floor)
          </label>
          <label>
            <input
              type="radio"
              name="elevatorType"
              value="express"
              checked={props.elevatorType === 'express'}
              onChange={(e) => props.setElevatorType(e.target.value as ElevatorType)}
              disabled={props.disabled}
            />
            Express (5 sec/floor)
          </label>
        </div>
      </div>

      <div className="input-group">
        <label>Simulation Mode:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="simulationMode"
              value="realtime"
              checked={props.simulationMode === 'realtime'}
              onChange={(e) => props.setSimulationMode(e.target.value as SimulationMode)}
              disabled={props.disabled}
            />
            Real-Time (animated)
          </label>
          <label>
            <input
              type="radio"
              name="simulationMode"
              value="instant"
              checked={props.simulationMode === 'instant'}
              onChange={(e) => props.setSimulationMode(e.target.value as SimulationMode)}
              disabled={props.disabled}
            />
            Instant (immediate results)
          </label>
        </div>
      </div>

      <button onClick={props.onSubmit} className="simulate-btn" disabled={props.disabled}>
        {props.disabled ? 'Running...' : 'Run Elevator'}
      </button>
    </div>
  );
}

export default InputForm;

