import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import axios from "axios";
import Environment from "../../environment";
import { toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage";

const EducationDetailsForm = ({ eddata, handleInputChange, edremoveRow, edaddRow }) => {
  const token = secureLocalStorage.getItem('token');
  const [selectedStartYears, setSelectedStartYears] = useState({});
  const [selectedEndYears, setSelectedEndYears] = useState({});
  const [degreeOptions, setDegreeOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeYears = () => {
      const startYears = {};
      const endYears = {};
      eddata.forEach(row => {
        if (row.emp_start_yr) startYears[row.emp_edu_id] = new Date(row.emp_start_yr, 0, 1);
        if (row.emp_end_yr) endYears[row.emp_edu_id] = new Date(row.emp_end_yr, 0, 1);
      });
      setSelectedStartYears(startYears);
      setSelectedEndYears(endYears);
    };
    initializeYears();
  }, [eddata]);

  useEffect(() => {
    const fetchDropdownValues = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + "/api/User/GetEmployeeTypeReg", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        setDegreeOptions(data.DegreeCategory);
        setGradeOptions(data.MarksCategory);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchDropdownValues();
  }, []);

  const validateYearSelection = (startYear, endYear) => !startYear || !endYear || startYear <= endYear;

  const handleStartYearChange = (date, rowId) => {
    if (validateYearSelection(date, selectedEndYears[rowId])) {
      setSelectedStartYears(prev => ({ ...prev, [rowId]: date }));
      handleInputChange({ target: { name: "emp_start_yr", value: date ? date.getFullYear() : '' } }, rowId);
    }
  };

  const handleEndYearChange = (date, rowId) => {
    if (validateYearSelection(selectedStartYears[rowId], date)) {
      setSelectedEndYears(prev => ({ ...prev, [rowId]: date }));
      handleInputChange({ target: { name: "emp_end_yr", value: date ? date.getFullYear() : '' } }, rowId);
    }
  };

  const handleDegreeChange = (e, rowId) => {
    handleInputChange({ target: { name: "emp_degree_id", value: parseInt(e.target.value, 10) } }, rowId);
  };

  const handleMarksChange = (e, rowId) => {
    const value = e.target.value;
    const grade = eddata.find(row => row.emp_edu_id === rowId).emp_edu_grade;

    if (grade === '683' && (value < 0 || value > 10)) {
      toast.error('Marks should be between 0 to 10.');
      return;
    }
    if (grade === '685' && (value < 0 || value > 100)) {
      toast.error('Marks should be between 0 to 100.');
      return;
    }

    handleInputChange({ target: { name: "emp_degree_marks", value } }, rowId);
  };

  const handleGradeChange = (e, rowId) => {
    handleInputChange({ target: { name: "emp_edu_grade", value: e.target.value } }, rowId);
  };

  if (error) return <div>Error loading dropdown values</div>;

  return (
    <>
      <div className="formheadingline">
        <h2 style={{ color: "#3D7EDB" }}> Education Details <hr style={{ borderTop: "2px solid #3D7EDB" }} /> </h2>
        <p className='oldNewestEducation'>Start From Oldest to Newest Education</p>
      </div>
      <div style={{ overflowX: 'auto' }} id="custom-scroll">
        <table>
          <thead>
            <tr style={{ background: "#5A245A" }}>
              <th style={{ minWidth: '220px' }}>Education <b>*</b></th>
              <th style={{ minWidth: '60px' }}>Course Duration <b>*</b></th>
              <th style={{ minWidth: '220px' }}>Grade System <b>*</b></th>
              <th style={{ minWidth: '100px' }}>Marks <b>*</b></th>
              <th style={{ minWidth: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {eddata.map((row, index) => (
              <tr key={row.emp_edu_id}>
                <td>
                  <select name="emp_degree_id" value={row.emp_degree_id} onChange={(e) => handleDegreeChange(e, row.emp_edu_id)} required>
                    <option value="" style={{ color: '#999' }}>-- Select education --</option>
                    {degreeOptions.map(degree => (
                      <option key={degree.EducationCategoryId} value={degree.EducationCategoryId}>{degree.EducationCategoryName}</option>
                    ))}
                  </select>
                </td>
                <td style={{ display: "flex", alignItems: "center" }}>
                  <DatePicker
                    selected={selectedStartYears[row.emp_edu_id]}
                    onChange={(date) => handleStartYearChange(date, row.emp_edu_id)}
                    showYearPicker
                    dateFormat="yyyy"
                    placeholderText="Select Start Year"
                    maxDate={Date.now()}
                    minDate={selectedEndYears[row.emp_edu_id - 1]}
                    required
                  />
                  <span style={{ width: "10%", textAlign: "center" }}>To</span>
                  <DatePicker
                    selected={selectedEndYears[row.emp_edu_id]}
                    onChange={(date) => handleEndYearChange(date, row.emp_edu_id)}
                    showYearPicker
                    dateFormat="yyyy"
                    placeholderText="Select End Year"
                    maxDate={Date.now()}
                    minDate={selectedStartYears[row.emp_edu_id]}
                    required
                  />
                </td>
                <td>
                  <select name="emp_edu_grade" value={row.emp_edu_grade} onChange={(e) => handleGradeChange(e, row.emp_edu_id)} required>
                    <option value="" style={{ color: '#999' }}>-- Select grade --</option>
                    {gradeOptions.map(grade => (
                      <option key={grade.MarksCategoryId} value={grade.MarksCategoryId}>{grade.MarksCategoryName}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="text" placeholder="Enter marks" name="emp_degree_marks"
                    value={row.emp_degree_marks} onChange={(e) => handleMarksChange(e, row.emp_edu_id)}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                    }}
                    required />
                </td>
                <td>
                  {index > 0 && (
                    <button onClick={() => edremoveRow(row.emp_edu_id)} disabled={eddata.length === 1}>
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
        <button type="button" className="AddnewBtn" onClick={edaddRow}>
          <i className="fas fa-plus"></i> Add
        </button>
      </div>
    </>
  );
};

export default EducationDetailsForm;