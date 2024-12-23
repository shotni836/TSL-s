import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import axios from 'axios';
import Environment from "../../environment";

const ExperienceDetailsForm = ({ data, handleInputChange, exremoveRow, exaddRow }) => {
  const [selectedStartYears, setSelectedStartYears] = useState({});
  const [selectedEndYears, setSelectedEndYears] = useState({});
  const [currentlyWorking, setCurrentlyWorking] = useState({});
  const [showCompanyDropdown, setShowCompanyDropdown] = useState({});
  const [totalExperience, setTotalExperience] = useState({ Y: 0, M: 0 });
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [optionsFetched, setOptionsFetched] = useState(false);

  useEffect(() => {
    const initializeState = () => {
      const startYears = {};
      const endYears = {};
      const workingStatus = {};
      const companyDropdown = {};

      data.forEach(row => {
        if (row.emp_start_yr && row.emp_start_mon) {
          startYears[row.emp_exp_id] = new Date(row.emp_start_yr, row.emp_start_mon - 1);
        }
        if (row.emp_end_yr && row.emp_end_mon) {
          endYears[row.emp_exp_id] = new Date(row.emp_end_yr, row.emp_end_mon - 1);
        }
        workingStatus[row.emp_exp_id] = row.isCurrentCompany;
        companyDropdown[row.emp_exp_id] = row.isCurrentCompany;
      });

      setSelectedStartYears(startYears);
      setSelectedEndYears(endYears);
      setCurrentlyWorking(workingStatus);
      setShowCompanyDropdown(companyDropdown);
    };

    initializeState();
  }, [data]);

  useEffect(() => {
    if (Object.keys(currentlyWorking).length > 0) {
      fetchCompanyOptions();
    }
    calculateTotalExperience();
  }, [selectedStartYears, selectedEndYears, currentlyWorking]);

  const fetchCompanyOptions = async () => {
    if (!optionsFetched) {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=External`);
        const data = response.data;
        const clientNames = data.TestGridClientDDl.map(item => ({ label: item.ClientName, value: item.ClientID }));
        setCompanyOptions(clientNames);
        setOptionsFetched(true);
      } catch (error) {
        console.error("Error fetching company options:", error);
      }
    }
  };

  const calculateExperience = (start, end, isCurrentlyWorking) => {
    if (!start) return { Y: 0, M: 0 };
    const currentDate = new Date();
    const endYear = isCurrentlyWorking ? currentDate.getFullYear() : end?.getFullYear() ?? start.getFullYear();
    const endMonth = isCurrentlyWorking ? currentDate.getMonth() : end?.getMonth() ?? start.getMonth();
    const totalMonths = (endYear - start.getFullYear()) * 12 + (endMonth - start.getMonth());
    return { Y: Math.floor(totalMonths / 12), M: totalMonths % 12 };
  };

  const calculateTotalExperience = () => {
    let totalYrs = 0, totalMonths = 0;
    data.forEach(row => {
      const { Y, M } = calculateExperience(selectedStartYears[row.emp_exp_id], selectedEndYears[row.emp_exp_id], currentlyWorking[row.emp_exp_id]);
      totalYrs += Y;
      totalMonths += M;
    });
    totalYrs += Math.floor(totalMonths / 12);
    setTotalExperience({ Y: totalYrs, M: totalMonths % 12 });
  };

  const handleStartYearChange = (date, rowId) => {
    if (date <= selectedEndYears[rowId] || !selectedEndYears[rowId]) {
      setSelectedStartYears(prev => ({ ...prev, [rowId]: date }));
      updateExperience(date, selectedEndYears[rowId], rowId);
    }
  };

  const handleEndYearChange = (date, rowId) => {
    if (date >= selectedStartYears[rowId]) {
      setSelectedEndYears(prev => ({ ...prev, [rowId]: date }));
      updateExperience(selectedStartYears[rowId], date, rowId);
      const nextRowId = rowId + 1;
      if (nextRowId < data.length) {
        setSelectedStartYears(prev => ({ ...prev, [nextRowId]: date }));
        updateExperience(date, selectedEndYears[nextRowId], nextRowId);
      }
    }
  };

  const updateExperience = (start, end, rowId) => {
    const endDate = currentlyWorking[rowId] ? new Date() : end;
    handleInputChange({ target: { name: "emp_start_mon", value: start?.getMonth() + 1 || "" } }, rowId);
    handleInputChange({ target: { name: "emp_start_yr", value: start?.getFullYear() || "" } }, rowId);
    handleInputChange({ target: { name: "emp_end_mon", value: endDate?.getMonth() + 1 || "" } }, rowId);
    handleInputChange({ target: { name: "emp_end_yr", value: endDate?.getFullYear() || "" } }, rowId);
  };

  const handleCurrentlyWorkingChange = async (isChecked, rowId) => {
    if (!currentlyWorking[rowId]) {
      await fetchCompanyOptions();
    }

    setCurrentlyWorking(prev => ({ ...prev, [rowId]: isChecked }));
    setShowCompanyDropdown(prev => ({ ...prev, [rowId]: isChecked }));
    setDisableAddButton(isChecked);
    const endDate = isChecked ? new Date() : null;
    setSelectedEndYears(prev => ({ ...prev, [rowId]: endDate }));
    updateExperience(selectedStartYears[rowId], endDate, rowId);
    handleInputChange({ target: { name: "isCurrentCompany", value: isChecked } }, rowId);
  };

  const handleCompanyChange = (selectedOption, rowId) => {
    handleInputChange({ target: { name: "emp_exp_company", value: selectedOption.label } }, rowId);
    handleInputChange({ target: { name: "currentCompanyId", value: selectedOption.value } }, rowId);
  };

  return (
    <>
      <div className="formheadingline">
        <h2 style={{ color: "#3D7EDB" }}> Experience Details <hr style={{ borderTop: "2px solid #3D7EDB" }} /> </h2>
      </div>
      <div className='ExperienceFlexBox'>
        <p className='oldNewestEducation'>Start From Oldest to Recent Experience</p>
        <p className='TotalExperienceTxt'>Total Experience: {totalExperience.Y} Years {totalExperience.M} Months</p>
      </div>
      <div style={{ overflowX: 'auto' }} id="custom-scroll">
        <table>
          <thead>
            <tr style={{ background: "#5A245A" }}>
              <th style={{ width: "210px" }}> Company Name <b>*</b> </th>
              <th style={{ width: "210px" }}> Department Name <b>*</b> </th>
              <th style={{ width: "210px" }}> Designation Name <b>*</b> </th>
              <th style={{ width: "170px" }}> Start Month / Year <b>*</b> </th>
              <th style={{ width: "170px" }}> End Month / Year <b>*</b> </th>
              <th >Experience</th>
              <th >Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.emp_exp_id}>
                <td>
                  {showCompanyDropdown[row.emp_exp_id] ? (
                    <Select
                      menuPortalTarget={document.body}
                      options={companyOptions}
                      value={companyOptions.find(option => option.label === row.emp_exp_company)}
                      onChange={selectedOption => handleCompanyChange(selectedOption, row.emp_exp_id)}
                    />
                  ) : (
                    <input
                      type="text"
                      name="emp_exp_company"
                      placeholder="Enter company name"
                      value={row.emp_exp_company}
                      onChange={e => handleInputChange(e, row.emp_exp_id)}
                      required
                    />
                  )}
                  {index === data.length - 1 && (
                    <div className='handleCheckboxChangeFlex'>
                      <input
                        type="checkbox"
                        name="currentlyWorking"
                        checked={currentlyWorking[row.emp_exp_id] || false}
                        onChange={e => handleCurrentlyWorkingChange(e.target.checked, row.emp_exp_id)}
                      />
                      <label htmlFor="Currentlywork">Currently working here</label>
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    name="emp_exp_dept"
                    placeholder="Enter department name"
                    value={row.emp_exp_dept}
                    onChange={e => handleInputChange(e, row.emp_exp_id)}
                    onInput={e => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '').charAt(0).toUpperCase() + e.target.value.slice(1);
                    }}
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="emp_exp_designation"
                    placeholder="Enter designation name"
                    value={row.emp_exp_designation}
                    onChange={e => handleInputChange(e, row.emp_exp_id)}
                    onInput={e => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '').charAt(0).toUpperCase() + e.target.value.slice(1);
                    }}
                    required
                  />
                </td>
                <td>
                  <DatePicker
                    selected={selectedStartYears[row.emp_exp_id]}
                    onChange={date => handleStartYearChange(date, row.emp_exp_id)}
                    showMonthYearPicker
                    dateFormat="MMM/yyyy"
                    placeholderText="Select month/year"
                    maxDate={Date.now()}
                    minDate={selectedEndYears[row.emp_exp_id - 1]}
                    required
                  />
                </td>
                <td>
                  <DatePicker
                    selected={selectedEndYears[row.emp_exp_id]}
                    onChange={date => handleEndYearChange(date, row.emp_exp_id)}
                    showMonthYearPicker
                    dateFormat="MMM/yyyy"
                    placeholderText="Select month/year"
                    minDate={selectedStartYears[row.emp_exp_id]}
                    maxDate={Date.now()}
                    disabled={currentlyWorking[row.emp_exp_id]}
                    required
                  />
                </td>
                <td>
                  <div className="calculateExperienceFlex">
                    <span><b>{calculateExperience(selectedStartYears[row.emp_exp_id], selectedEndYears[row.emp_exp_id], currentlyWorking[row.emp_exp_id]).Y}</b> Yr.</span> -
                    <span><b>{calculateExperience(selectedStartYears[row.emp_exp_id], selectedEndYears[row.emp_exp_id], currentlyWorking[row.emp_exp_id]).M}</b> Mo.</span>
                  </div>
                </td>
                <td>
                  {index > 0 && (
                    <button onClick={() => exremoveRow(row.emp_exp_id)} disabled={data.length === 1}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ width: "100%", textAlign: "right", marginTop: "20px" }}>
        <button type="button" className="AddnewBtn" onClick={exaddRow} disabled={disableAddButton}>
          <i className="fas fa-plus"></i> Add
        </button>
      </div>
    </>
  );
};

export default ExperienceDetailsForm;