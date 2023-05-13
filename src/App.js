import './App.css';
import { setConfiguration } from "react-grid-system";
import { Container, Row, Col } from 'react-grid-system';
import {
  NewForm1 
 } from './ui-components';
import MainPage from './components/MainPage';
import React from 'react';

setConfiguration({ maxScreenClass: 'xl' });


// function App() {
  
  // return (
    
  //   <div>
  //     <div>
  //       <h1>hello world</h1>
  //     </div>
  //     <NewForm1
  //       onSubmit={fields => { /* Handle form submission */}}
  //     />
  //   </div>

  // );
// }


function App() {
  
  return (
  
    <React.Fragment>
      <MainPage/>
    </React.Fragment>

  );

  // return (
  
  //   <Container fluid>
  //     <Row debug>
  //       <Col xl={9} debug>xs=9</Col>
  //       <Col xl={4} debug><NewForm1
  //           onSubmit={fields => { /* Handle form submission */}}
  //         />
  //       </Col>
  //       <Col xl={5} debug></Col>
  //     </Row>
  //   </Container>

  // );
}


export default App;
