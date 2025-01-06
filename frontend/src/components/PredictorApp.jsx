import React from 'react';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import UploadButton from './UploadButton';
import DragAndDrop from './DragAndDrop';
import * as modelService from '../services/modelService';
import DiagMetrics from './DiagMetrics';

console.log("PredictorApp component rendering...");
function PredictorApp({setPrediction} ) {
    {/*setPredicitonMetrics is used to pass up prediction to App.jsx */}
   
    {/* implement usestates for diagnostic status
        1.Logo
        2.Diagnosing
        3.results{+disclaimer and about}
        */
    }

    const [inputImg, setInputImg] = useState(null);
    const handleImg = (Img) =>{
        setInputImg(Img);
    }
    
    const [inputPanelState, setInputPanelState] = useState(1)
    {/* Input panel States :
        0: error state
        1: default
        2: loading state
        3: loaded state
    */}
    const handleInputPanelChange = (state) => {
        setInputPanelState(state);
      };

    const [diagPanelState, setDiagPanelState] = useState(1)
    {/* Input panel States :
        0: error state
        1: default
        2: processing state
        3: results state
    */}
    const handleDiagPanelState = (state) =>{
        setDiagPanelState(state);
    }

  const [predictionMetrics, setMetrics] = useState(null);
  const diseases = ["AK", "Acne", "BCC", "DF", "MEL", "NV", "SCC", "SEK", "VASC"];

  
  const handleFileUpload = async (file) => {
    console.log("Uploading file:", file);
    try {
        setInputPanelState(2); 
        handleImg(file);
        const response = await modelService.getPrediction(file); 
        console.log("Response received from backend:", response);
        const formattedMetrics = response.predictionMetrics;
        formattedMetrics.sort((a, b) => b.probability - a.probability);
        setMetrics(formattedMetrics); 
        setPrediction(formattedMetrics[0].disease); 

        setInputPanelState(3); 
        setDiagPanelState(3); 
    } 
    catch (error) {
        console.error("Error processing the file:", error);
        setInputPanelState(0); 
        setDiagPanelState(0);
    }
};

    return (
      <Wrapper>     
        <S_FilePanel>
            <S_FP_Header>
                <h2> Random Forest </h2>
            </S_FP_Header>
            <S_FP_Overview>
                <p>Knee arthritis classifier</p>
            </S_FP_Overview>
            <S_FP_InputPanel>
                {inputPanelState === 1 &&(<p>Please input file</p>)}
                {inputPanelState === 2 &&(<p>Uploading image...</p>)}
                {inputPanelState === 3 &&(<p>Image uplaoded</p>)}
                <DragAndDrop onFileUpload={handleFileUpload}/>
                <UploadButton  onFileUpload={handleFileUpload} >Choose file</UploadButton>
            </S_FP_InputPanel>
        </S_FilePanel>

        <S_DiagPanel>
            <S_DP_Header>
                <h2>Diagnostics</h2>
            </S_DP_Header>
            <S_DP_Main>
                {diagPanelState === 1 &&( //Default init state
                <>
                    <p>Diagnosis will be displayed after upload</p>
                    <S_DP_DiagBox>
                        <S_DP_Logo>
                         <img src='..\src\assets\FCCULOGO.svg'/>         
                    
                        </S_DP_Logo>
                    </S_DP_DiagBox>
                </>
                )}
                {diagPanelState === 2 &&(  //Processing state
                <>
                    <p>Diagnosis is underway please wait</p>
                    <S_DP_DiagBox>
                        <S_DP_Logo>
                            <img src='..\src\assets\FCCULOGO.svg'/>                        
                        </S_DP_Logo>
                    </S_DP_DiagBox>
                </>
                )}
                {diagPanelState === 3 &&(
                <>
                    <p>Your image has been identified...</p>
                    <S_DP_DiagBox>
                        <DiagMetrics predictionMetrics={predictionMetrics} image={inputImg}/>
                    </S_DP_DiagBox>
                </>
                )}
            </S_DP_Main>
        </S_DiagPanel>
      </Wrapper>
    )
}


const Wrapper = styled.div`
--app-border-color: #3a3a61;
  display: grid;
  grid-template-columns: 300px 600px; /* sidebar width +main content */
  grid-template-areas: 
    "file diag"; 
  background-color: #0c01336e;  
  backdrop-filter: blur(80px);

  max-width:900px;
  border-radius: 10px;
`


{/*-----------------------------FILE INPUT PANEL----------------------------*/}
const S_FilePanel = styled.div`
    grid-area: file; 
    display: flex;
    flex-direction: column;
    border: 1px solid var(--app-border-color);
    border-radius: 10px 0px 0px 10px;
`
const S_FP_Header = styled.div`
    border-bottom: 1px solid var(--app-border-color);;
    border-radius: 10px 0px 0px 0px;
    padding: 10px;
    h2{margin:0}
    
    span{
        font-size: 1rem;
        font-weight: 100;
        color: lightgray;
    }

`
const S_FP_Overview = styled.div`
    padding: 20px;
    border-bottom: 1px solid var(--app-border-color);
    p{
        font-size: 1.1rem;
    }
`
const S_FP_InputPanel = styled.div`
    display: flex; /* SO we can arrange the button */
    flex-direction: column;
    padding: 20px;
    height: 100%;
    gap: 5px;

    p{
        margin: 0;
        padding: 10px 0px;
    }
`
{/* Shifted as seprate components
    const S_FP_DragDrop = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #b6b6b6;
    height: 100px;

    font-size: 0.8rem;
    color: #b6b6b6;
`
const S_FP_InputButton = styled.button`
    width: fit-content;
    background-color: #23174e;
    border: 1px solid var(--app-border-color);
    color: white;
    font-family: Raleway;
    border-radius: 4px;
    padding: 4px 6px;
`
*/}

{/*-----------------------------DIAGNOSIS PANEL----------------------------*/}
const S_DiagPanel = styled.div`
    grid-area: diag; 
    display: flex;
    flex-direction: column;
    border: 1px solid var(--app-border-color);;
    border-left: none;
    border-radius: 0px 10px 10px 0px;
`
const S_DP_Header = styled.div`
    padding: 10px;
    h2{margin:0}
`
const S_DP_Main = styled.div`
    padding: 10px 20px 20px 20px;
    display : flex;
    flex-direction: column;
    height: 100%;
`
const S_DP_Logo = styled.div`
    //border: 1px solid red;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 250px; //-------FIXED HEIGHT--------
    img {
        margin: 0;
        height: 100%; 
    }
`
{/*const S_DP_Metrics = styled.div`
    border: 1px solid red;
    height: 100%; 
`*/}

const S_DP_DiagBox = styled.div`
    border: 1px solid var(--app-border-color);;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px 14px;
    height: 260px;
`

export default PredictorApp
