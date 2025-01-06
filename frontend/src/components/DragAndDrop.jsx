import React, { useState } from "react";
import styled from "styled-components";

const DragAndDrop = ({onFileUpload}) => {

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault(); 
    };

    const handleDragEnter = () => {
        setIsDragging(true); //for hiighlight the area
    };

    const handleDragLeave = () => {
        setIsDragging(false); //remove the highlight
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files; 
        setIsDragging(false); // remove the glow after drop

        if (files && files[0]) 
            {
                const file = files[0];
                console.log("File dropped:", file);

                onFileUpload(file)

                try {
                    const response = await fetch("https://your-backend-endpoint.com/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (response.ok)
                         {
                        console.log("File uploaded successfully!");
                    } else 
                    {
                        console.error("Upload failed:", response.statusText);
                    }
                } 
                catch (error) {
                    console.error("Error during upload:", error);
                }
        }
    };

    return (
        <DragDropArea isDragging={isDragging} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter}
         onDragLeave={handleDragLeave}> 
            Drop image here 
        </DragDropArea>
    );
};

const DragDropArea = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #b6b6b6;
    height: 150px;
    font-size: 0.8rem;
    color: #b6b6b6;
    z-index: 10; 
    border-color: ${({ isDragging }) => (isDragging ? "#1890ff" : "#b6b6b6")};
    box-shadow: ${({ isDragging }) =>
        isDragging ? "0 0 10px rgba(24, 144, 255, 0.8)" : "none"};
    transition: all 0.3s ease-in-out;
`;

export default DragAndDrop;
