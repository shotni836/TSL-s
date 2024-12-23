import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from "react-select";
import axios from 'axios';
import Environment from "../../environment";

const InputField = ({ value, onChange, editing, placeholder, className }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={!editing}
        className={className}
    />
);

const ExperienceDetails = ({ dropdownsFetched, experienceRows, editing, handleExperienceChange, addExperienceRow, deleteExperienceRow }) => {
    const [companyOptions, setCompanyOptions] = useState([]);
    const [totalExperience, setTotalExperience] = useState('');
    const [optionsFetched, setOptionsFetched] = useState(false);
    const [showEndMonthYear, setShowEndMonthYear] = useState(experienceRows.map(row => row.currentlyWorking === 1));
    const [currentlyWorking, setCurrentlyWorking] = useState(experienceRows.map(row => row.co_iscurrently_working === 1));

    useEffect(() => {
        calculateTotalExperience();
    }, [experienceRows, showEndMonthYear]);

    useEffect(() => {
        const fetchCompanyOptions = async () => {
            if (!optionsFetched) {
                try {
                    const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=External`);
                    const clientNames = response.data.TestGridClientDDl.map(item => ({ label: item.ClientName, value: item.ClientID }));
                    setCompanyOptions(clientNames);
                    setOptionsFetched(true);
                } catch (error) {
                    console.error("Error fetching company options:", error);
                }
            }
        }
        if (dropdownsFetched) {
            fetchCompanyOptions();
        }
    }, [dropdownsFetched]);

    const handleCurrentlyWorkingChange = async (index) => {

        setShowEndMonthYear(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            if (newState[index]) {
                handleExperienceChange(new Date(), experienceRows[index].emp_exp_id, 'ExpEndDate');
            }
            return newState;
        });

        setCurrentlyWorking(prevState => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            handleExperienceChange({ target: { checked: newState[index] } }, experienceRows[index].emp_exp_id, 'currentlyWorking');
            return newState;
        });
    };

    const calculateExperience = (startDate, endDate, isCurrentlyWorking) => {
        if (!startDate) return '';
        const start = new Date(startDate);
        const end = isCurrentlyWorking ? new Date() : new Date(endDate);
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const years = Math.floor(monthsDiff / 12);
        const months = monthsDiff % 12;
        return `${years} Yr. - ${months} Mo.`;
    };

    const calculateTotalExperience = () => {
        let totalMonths = 0;
        experienceRows.forEach((row, index) => {
            totalMonths += calculateMonthDifference(row.ExpStartDate, showEndMonthYear[index] ? null : row.ExpEndDate, showEndMonthYear[index]);
        });
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        setTotalExperience(`${years} Years ${months} Months`);
    };

    const calculateMonthDifference = (startDate, endDate, isCurrentlyWorking) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const end = isCurrentlyWorking ? new Date() : new Date(endDate);
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    };

    const calculateMinDate = (index) => {
        if (index === 0) {
            return null;
        } else {
            const prevRowEndDate = new Date(experienceRows[index - 1].ExpEndDate);
            return new Date(prevRowEndDate.getFullYear(), prevRowEndDate.getMonth(), 1);
        }
    };

    return (
        <>
            <div className="formheadingline">
                <h2 style={{ color: "#3D7EDB" }}> Experience Details <hr style={{ borderTop: "2px solid #3D7EDB" }} /> </h2>
            </div>
            <div className='ExperienceFlexBox'>
                {editing && <p className='oldNewestEducation'>Start From Oldest to Recent Experience</p>}
                <p className='TotalExperienceTxt'>Total Experience: {totalExperience}</p>
            </div>
            <div className="table-container" style={{ overflowX: 'auto' }} id="custom-scroll">
                <table>
                    <thead>
                        <tr className="table-header" style={{ background: "#5A245A" }}>
                            <th style={{ width: "210px" }}>Company Name</th>
                            <th style={{ width: "210px" }}>Department Name</th>
                            <th style={{ width: "210px" }}>Designation Name</th>
                            <th style={{ width: "170px" }}>Start Month/Year</th>
                            <th style={{ width: "170px" }}>End Month/Year</th>
                            <th style={{ width: "50px" }}>Experience</th>
                            {editing && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {experienceRows.map((row, index) => (
                            <tr key={row.emp_exp_id}>
                                <td>
                                    {currentlyWorking[index] ? (
                                        <Select
                                            menuPortalTarget={document.querySelector("body")}
                                            options={companyOptions}
                                            value={companyOptions.find(option => option.label === row.emp_exp_company)}
                                            onChange={(selectedOption) => handleExperienceChange(selectedOption, row.emp_exp_id, 'emp_exp_company', 0)}
                                            isDisabled={!editing}
                                        />
                                    ) : (
                                        <InputField
                                            value={row.emp_exp_company}
                                            onChange={(e) => handleExperienceChange(e, row.emp_exp_id, 'emp_exp_company', 1)}
                                            editing={editing}
                                            placeholder="Enter company name"
                                            className={row.isEdited ? 'edited' : ''}
                                        />
                                    )}
                                    {index === experienceRows.length - 1 && (
                                        <div className='handleCheckboxChangeFlex'>
                                            <input
                                                type="checkbox"
                                                checked={currentlyWorking[index]}
                                                onChange={() => handleCurrentlyWorkingChange(index)}
                                                disabled={!editing}
                                            />
                                            <label htmlFor="Currentlywork">Currently working here</label>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <InputField
                                        value={row.emp_exp_dept || ''}
                                        onChange={(e) => handleExperienceChange(e, row.emp_exp_id, 'emp_exp_dept')}
                                        editing={editing}
                                        placeholder="Enter department"
                                        className={row.isEdited ? 'edited' : ''}
                                    />
                                </td>
                                <td>
                                    <InputField
                                        value={row.emp_exp_designation || ''}
                                        onChange={(e) => handleExperienceChange(e, row.emp_exp_id, 'emp_exp_designation')}
                                        editing={editing}
                                        placeholder="Enter designation"
                                        className={row.isEdited ? 'edited' : ''}
                                    />
                                </td>
                                <td>
                                    <DatePicker
                                        selected={row.ExpStartDate ? new Date(row.ExpStartDate) : null}
                                        onChange={(date) => handleExperienceChange(date, row.emp_exp_id, 'ExpStartDate')}
                                        dateFormat="MM/yyyy"
                                        showMonthYearPicker
                                        disabled={!editing}
                                        maxDate={new Date()}
                                        minDate={calculateMinDate(index)}
                                        placeholderText='Select start month/year'
                                        className={row.isEdited ? 'edited' : ''}
                                    />
                                </td>
                                <td>
                                    <DatePicker
                                        selected={currentlyWorking[index] ? new Date() : (row.ExpEndDate ? new Date(row.ExpEndDate) : null)}
                                        onChange={(date) => handleExperienceChange(date, row.emp_exp_id, 'ExpEndDate')}
                                        dateFormat="MM/yyyy"
                                        showMonthYearPicker
                                        disabled={currentlyWorking[index] || !editing}
                                        maxDate={new Date()}
                                        minDate={row.ExpStartDate ? new Date(row.ExpStartDate) : null}
                                        placeholderText='Select end month/year'
                                        className={row.isEdited ? 'edited' : ''}
                                    />
                                </td>
                                <td>
                                    {calculateExperience(row.ExpStartDate, currentlyWorking[index] ? null : row.ExpEndDate, currentlyWorking[index])}
                                </td>
                                {editing && <td>
                                    {editing && index !== 0 && <button type="button" onClick={() => deleteExperienceRow(row.emp_exp_id)}><i className="fas fa-trash-alt"></i></button>}
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="add-button-container" style={{ marginTop: "10px", textAlign: "right" }}>
                {editing && !currentlyWorking.some(work => work) && <button type="button" className="AddnewBtn" onClick={addExperienceRow}><i className="fas fa-plus"></i>Add</button>}
            </div>
        </>
    );
};

export default ExperienceDetails;