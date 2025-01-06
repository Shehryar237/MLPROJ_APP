import React from 'react';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import * as modelService from '../services/modelService';
import { use } from 'react';
import { keyframes } from 'styled-components';


const InfoBlock = ({ prediction }) => {
    const [infoBuffer, setInfoBuffer] = useState(null);  // Holds the newly fetched disease info
    const [diseaseInfo, setDiseaseInfo] = useState(null);  // Holds the last successfully fetched disease info (previous prediction)

    useEffect(() => {
        if (prediction && prediction !== diseaseInfo) {
            const fetchDiseaseInfo = async () => {
                try {
                    const data = await modelService.getDiseaseInfo(prediction);
                    console.log(data);  
                    setInfoBuffer(data); 
                    setDiseaseInfo(prediction); 
                } 
                catch (error) {
                    console.error("Error fetching disease info:", error);
                }
            };

            fetchDiseaseInfo();
        }
    }, [prediction, diseaseInfo]); // this effect will run every time the prediction or prevpred changes
    
if (!diseaseInfo) {
    return null;
}
const diseaseDetails = infoBuffer?.[diseaseInfo]; //if info buffer is null, return undefined instead of error

if (!diseaseDetails) {
    return <div>Could not find details for this disease.</div>;
}

    return (
                <Wrapper>         
                    <DetailBlock>
                        Details
                    </DetailBlock>
                    <AnimatedContent key={diseaseInfo} >                    <div className="title">
                        <h1>{diseaseDetails.full_name}</h1>
                    </div>
                    {/*
                    <div className='contagious'>
                        <p>Contagious: {diseaseDetails.contagious}</p>
                    </div>
                    */}
                    <div className='severity'>
                        <p>Severity: {diseaseDetails.severity}</p>
                    </div>
                    <div className='Data'>
                        <p>
                            {diseaseDetails.description}.
                        </p>
                    </div>
                    </AnimatedContent>

                </Wrapper>
            
            
       
    );
};
 
export default InfoBlock;

const Wrapper = styled.div`
    width: 830px;
    min-height: 100px; /* Ensure it always has some height */
    background-color: #05055c94;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(8px);
    color: white;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0px; /* Add space between elements */
    margin: 0;
    margin-bottom: 100px;
`;

const DetailBlock = styled.div`
    background-color: #1f1fa3b5;
    
    border-bottom: 2px solid darkblue;
    padding: 10px;
    color: white;
    width: fit-content;
    padding: 10px 20px;
    border-radius:5px;
    font-size: 1.5rem;
    margin-left: -35px;
    margin-top: -30px;
`;
//----------Animation effcts-------------
const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const AnimatedContent = styled.div`
  animation: ${fadeInRight} 0.5s ease-in-out;
`;