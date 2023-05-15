import './App.css';
import { setConfiguration } from "react-grid-system";
import MainPage from './components/MainPage';
import React from 'react';

setConfiguration({ maxScreenClass: 'xl' });

function App() {
  
  return (
  
    <React.Fragment>
      <MainPage/>
    </React.Fragment>

  );
}


export default App;
