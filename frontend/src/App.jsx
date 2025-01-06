import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import styled from 'styled-components';
import './App.css';
import PredictorApp from './components/PredictorApp.jsx';
import NavBar from './components/NavBar.jsx';
import InfoBlock from './components/InfoBlock.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [prediction, setPrediction] = useState(null); // Shared state

  return (
    <Wrapper>
      <NavBar>CSCS-460</NavBar>
      <S_AppWrapper>
        <PredictorApp setPrediction={setPrediction} />
        <InfoBlock prediction={prediction}/>
      </S_AppWrapper>
    
      <Footer/>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* Layer multiple radial-gradients (blotches) on top of your linear gradient */
  background:
    radial-gradient(circle at 20% 50%, rgba(86, 21, 112, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(40, 3, 53, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(105, 22, 138, 0.2) 0%, transparent 60%),
    radial-gradient(circle at 30% 80%, rgba(38, 6, 59, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 70% 20%, rgba(33, 1, 214, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #0b0424, #020014);
    min-height: 100vh;

  justify-content: space-between; //to align footer with bottom
   
`

const S_AppWrapper = styled.div`
  //border: 1px solid red;
  margin-top: 50px;
  width: 100%;
  padding: 10px 0;
  align-items: center;
  display: flex; 
  flex-direction: column;
  gap: 50px;
`



export default App
