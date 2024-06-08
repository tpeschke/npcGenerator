import React, { useState } from 'react';
import './App.css';

export default function Characteristics(props) {
    return (
        <div>
            {props.array[props.objectKey].map((element, i) => 
                element ? 
                    <p key={props.objectKey + i}>- {element.isBold ? <strong>{element.value}</strong> : element.value}</p> 
                : 
                    <p key={props.objectKey + i}>-</p>)}
        </div>
    )
}