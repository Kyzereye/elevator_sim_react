import React from 'react';
import { StandardElevator } from '../elevators/StandardElevator';
import '../css/InfoBox.css';

function InfoBox(): React.JSX.Element {
  return (
    <div className="info-box">
      <p><strong>Assumptions:</strong></p>
      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
        <li>Standard elevator: {StandardElevator.FLOOR_TRAVEL_TIME} sec/floor</li>
        <li>Express elevator: 5 sec/floor</li>
        <li>Door opening and closing time: {StandardElevator.DOOR_OPEN_TIME} sec</li>
        <li>Passenger transfer time: {StandardElevator.PASSENGER_TRANSFER_TIME} sec</li>
        <li>Floors visited in order provided</li>
        <li>Doors start opened, so they must close first</li>
      </ul>
    </div>
  );
}

export default InfoBox;

