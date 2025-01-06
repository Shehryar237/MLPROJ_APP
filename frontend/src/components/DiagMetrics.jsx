// DiagMetrics.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const DiagMetrics = ({ predictionMetrics, image }) => {
    const [imgData, setImgData] = useState(null);

    useEffect(() => {
        const readFileAsDataURL = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });
        };

        const handleImgData = async (imgFile) => {
            if (imgFile) {
                try {
                    const imgDataURL = await readFileAsDataURL(imgFile);
                    setImgData(imgDataURL);
                } catch (error) {
                    console.error("Error reading image file:", error);
                }
            }
        };

        handleImgData(image);
    }, [image]);

    const primaryDiagnosis = predictionMetrics.length > 0 ? predictionMetrics.reduce((max, metric) => metric.probability > max.probability ? metric : max, predictionMetrics[0]) : null;

    return (
        <Wrapper>
            {primaryDiagnosis && (
                <S_MainDiag>
                    <strong>Diagnosis:</strong> {primaryDiagnosis.disease}
                </S_MainDiag>
            )}
            <S_LowerPanel>
                <S_DiagProbabilities>
                    <p>Probability of Each Class:</p>
                    <ProbImgWrapper>
                        <ul>
                            {predictionMetrics.map((metric, index) => (
                                <li key={index}>
                                    {metric.disease}: {metric.probability.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                        <S_ImgDisplay>
                            {imgData && <img src={imgData} alt="Uploaded" />}
                            <span><i>Upload Preview</i></span>
                        </S_ImgDisplay>
                    </ProbImgWrapper>
                </S_DiagProbabilities>
            </S_LowerPanel>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    height: 100%;
    color: lightgrey;
`;

const S_MainDiag = styled.div`
    display: flex;
    flex-grow: 2;
    font-size: 1.3rem;
`;

const S_LowerPanel = styled.div`
    display: flex;
    flex-grow: 2;
`;

const S_DiagProbabilities = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-width: 100%;

    ul {
        padding-left: 10px;
        list-style: none;
        margin: 0;
        width: 50%;
    }

    p{
        font-size: 1.1rem;
    }
`;

const S_ImgDisplay = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 50%;

    img {
        width: 65%;
    }
    span {
        font-size: 0.7rem;
        padding: 1px;
    }
`;

const ProbImgWrapper = styled.div`
    display: flex;
    ul{
        font-size: 1.1rem;

        li{
            margin-top: 8px;
        }
    }
`;

export default DiagMetrics;
