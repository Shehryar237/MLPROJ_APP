import React, { useState } from "react";
import styled from "styled-components";
import pyIcon from'./icons/pyicon.png';
import reacticon from './icons/reacticon.png'
import jsicon from './icons/jsicon.png'

const Footer = () => {
    return(
        <Wrapper>
            <div className="groupMembers">
                <p>Group members:<br></br> 
                Muhmmad Shehryar Nasir  241605237<br></br>
                Muhammad Hamza Haroon  251706435<br></br>
                CSCS 460<br></br>
                Presented to Sir Faizad
                </p> 
            </div>
            <div className="iconTray">
                <img className="icon" src={jsicon}></img>
                <img className="icon" src={reacticon}></img>
                <img className="icon" src={pyIcon}></img>
            </div>
        </Wrapper>
    )
}

const Wrapper = styled.div`
      background: linear-gradient(to bottom, rgba(9, 0, 12, 0.226) 0%, black 100%);
    color: white;
    font-size: 0.9rem;
    min-height: 250px;
    min-width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    //border: 1px solid white;
    
    .groupMembers{
        display: flex;
        text-align: center;
        padding-top: 80px;
    }
    .icon{
        height: 50px;
    }
    .iconTray{
        display: flex;
        gap: 10px;
        padding: 6px 0px 50px 0px;
    }
`

export default Footer;
