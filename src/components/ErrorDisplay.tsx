import React from 'react';
import '../css/ErrorDisplay.css';

interface ErrorDisplayProps {
  error: string;
}

function ErrorDisplay(props: ErrorDisplayProps): React.JSX.Element {
  return (
    <div className="error-box">
      <strong>Error:</strong> {props.error}
    </div>
  );
}

export default ErrorDisplay;

