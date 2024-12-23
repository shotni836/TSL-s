import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const EducationDetails = ({ educationRows, editing, handleEducationChange, addEducationRow, deleteEducationRow, degreeOptions, gradeOptions }) => {
    const [showEndYear, setShowEndYear] = useState(educationRows.map(() => false));

    useEffect(() => {
        calculateShowEndYear();
    }, [educationRows]);

    const calculateShowEndYear = () => {
        const newShowEndYear = educationRows.map((row, index) => {
            return row.EduEndYear && index < educationRows.length - 1;
        });
        setShowEndYear(newShowEndYear);
    };

    const calculateMinStartYear = (index) => {
        if (index === 0 || !showEndYear[index - 1]) {
            return null;
        } else {
            const prevRowEndYear = new Date(educationRows[index - 1].EduEndYear);
            return new Date(prevRowEndYear.getFullYear(), 0, 1);
        }
    };

    const handleMarksChange = (e, emp_edu_id, fieldName, marksCategory) => {
        let updatedValue = e.target.value;
        let isValid = true;

        if (marksCategory === '683') {
            if (updatedValue < 0 || updatedValue > 10) {
                isValid = false;
                toast.error('Marks should be between 0 to 10.');
            }
        } else if (marksCategory === '685') {
            if (updatedValue < 0 || updatedValue > 100) {
                isValid = false;
                toast.error('Marks should be between 0 to 100.');
            }
        }

        if (isValid) {
            handleEducationChange({ target: { value: updatedValue } }, emp_edu_id, fieldName);
        }
    };

    return (
        <>
            <div className="formheadingline">
                <h2 style={{ color: "#3D7EDB" }}> Education Details <hr style={{ borderTop: "2px solid #3D7EDB" }} /> </h2>
                {editing && <p className='oldNewestEducation'>Start From Oldest to Newest Education</p>}
            </div>
            <div className="table-container" style={{ overflowX: 'auto' }} id="custom-scroll">
                <table>
                    <thead>
                        <tr className="table-header" style={{ background: "#5A245A" }}>
                            <th style={{ minWidth: '220px' }}> Education</th>
                            <th style={{ minWidth: '60px' }}> Start Year</th>
                            <th style={{ minWidth: '60px' }}> End Year</th>
                            <th style={{ minWidth: '80px' }}> Grade System</th>
                            <th style={{ minWidth: '100px' }}> Marks</th>
                            {editing && <th style={{ minWidth: '100px' }}> Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {educationRows.map((row, index) => (
                            <tr key={row.emp_edu_id}>
                                <td>
                                    <select
                                        name="emp_degree_id"
                                        value={row.emp_degree_id}
                                        onChange={(e) => handleEducationChange(e, row.emp_edu_id, 'emp_degree_id')}
                                        disabled={!editing}
                                        required
                                        className={row.isEdited ? 'edited' : ''}
                                    >
                                        <option value="" style={{ color: '#999' }}>-- Select education --</option>
                                        {degreeOptions.map(option => (
                                            <option key={option.EducationCategoryId} value={option.EducationCategoryId}>{option.EducationCategoryName}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <DatePicker
                                        selected={row.EduStartYear ? new Date(row.EduStartYear) : null}
                                        onChange={(date) => handleEducationChange(date, row.emp_edu_id, 'EduStartYear')}
                                        dateFormat="yyyy"
                                        showYearPicker
                                        disabled={!editing}
                                        maxDate={new Date()}
                                        minDate={calculateMinStartYear(index)}
                                        placeholderText='Select start year'
                                        className={row.isEdited ? 'edited' : ''}
                                    />
                                </td>
                                <td>
                                    <DatePicker
                                        selected={row.EduEndYear ? new Date(row.EduEndYear) : null}
                                        onChange={(date) => handleEducationChange(date, row.emp_edu_id, 'EduEndYear')}
                                        dateFormat="yyyy"
                                        showYearPicker
                                        disabled={!editing}
                                        minDate={row.EduStartYear ? new Date(row.EduStartYear) : null}
                                        maxDate={new Date()}
                                        placeholderText='Select end year'
                                        className={row.isEdited ? 'edited' : ''}
                                    />
                                </td>
                                <td>
                                    <select
                                        name="emp_grade_perc"
                                        value={row.emp_grade_perc}
                                        onChange={(e) => handleEducationChange(e, row.emp_edu_id, 'emp_grade_perc')}
                                        disabled={!editing}
                                        className={row.isEdited ? 'edited' : ''}
                                    >
                                        <option value="" style={{ color: '#999' }}> -- Select grade --</option>
                                        {gradeOptions.map(option => (
                                            <option key={option.MarksCategoryId} value={option.MarksCategoryId}>{option.MarksCategoryName}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.emp_degree_marks}
                                        onChange={(e) => handleMarksChange(e, row.emp_edu_id, 'emp_degree_marks', row.emp_grade_perc)}
                                        disabled={!editing}
                                        className={row.isEdited ? 'edited' : ''}
                                        onInput={(e) => {
                                            e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                        }}
                                    />
                                </td>
                                {editing && <td>
                                    {editing && index !== 0 && <button type="button" onClick={() => deleteEducationRow(row.emp_edu_id)}><i className="fas fa-trash-alt"></i></button>}
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="add-button-container" style={{ textAlign: "right" }}>
                {editing && <button type="button" className="AddnewBtn" onClick={addEducationRow}><i className="fas fa-plus"></i>Add</button>}
            </div>
        </>
    );
};

export default EducationDetails;