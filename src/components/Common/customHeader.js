import React, { useState, useEffect } from 'react';
import axios from "axios";
import Environment from "../../environment";

export default (props) => {
    let dynamicevent = null;
    const [ddlClient, setddlClient] = useState([]);

    useEffect(() => {
        debugger
        if (localStorage.getItem("ClientDDL") !== "undefined") {
            setddlClient(JSON.parse(localStorage.getItem("ClientDDL")))
        }
    }, []);


    if (props.enableSorting) {
        dynamicevent = (
            <div style={{ display: 'inline-block' }}>
                <div style={{ margin: 7 }}>
                    <select name="testGridcheckbox" onChange={(event) => handleChange(event)} >
                        <option value="">Select Client </option>
                        {ddlClient.map((coatingTypeOption, i) => (
                            <option key={i} value={coatingTypeOption.ClientID}> {coatingTypeOption.ClientName} </option>
                        ))}
                    </select>
                    {/* <input type='checkbox' onChange={(event) => handleChange(event)} name='testGridcheckbox' /> */}
                </div>
            </div>
        );
    }

    const handleChange = (event) => {
        let displayName = props.displayName;
        let chkchecked = event.target.checked;
        let obj = JSON.parse(localStorage.getItem("testGridWitnessStatus"));
        if (displayName === 'TSL') {
            obj[0][displayName] = chkchecked;
        } else if (displayName === 'TPI') {
            obj[1][displayName] = chkchecked;
        }
        else if (displayName === 'PMC') {
            obj[2][displayName] = chkchecked;
        }
        else if (displayName === 'Surveillance') {
            obj[3][displayName] = chkchecked;
        }
        else {
            obj[4][displayName] = chkchecked;
        }
        localStorage.setItem("testGridWitnessStatus", JSON.stringify(obj));
    };




    return (
        <div>
            <div className="customHeaderLabel">{props.displayName}
                <br />{dynamicevent}</div>
        </div>
    );
};