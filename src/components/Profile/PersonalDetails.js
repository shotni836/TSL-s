import React, { useState, useEffect } from 'react';
import Environment from "../../environment";

const InputField = ({ id, label, value, placeholder, type, onChange, maxLength, editing, onInput }) => {
    const [error, setError] = useState('');

    return (
        <div className="form-group-warn col-md-3 col-sm-3 col-xs-12">
            <label htmlFor={id}>{label}</label>
            {editing ? (
                <input
                    type={type}
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    onInput={onInput}
                    maxLength={maxLength}
                />
            ) : (
                <input type="text" value={value} placeholder={placeholder} readOnly />
            )}
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

const PersonalDetails = ({ profileData, editing, handleChange, departmentsType, designationsType }) => {
    const [formData, setFormData] = useState({ ...profileData });

    useEffect(() => {
        setFormData({ ...profileData });
    }, [profileData]);

    return (
        <>
            <InputField
                id="emp_user_id"
                label="User ID"
                value={formData.emp_user_id || ''}
            />
            <InputField
                id="emp_fname"
                label="First Name"
                value={formData.emp_fname || ''}
                placeholder="Enter first name"
                type="text"
                onChange={(e) => handleChange(e, 'emp_fname')}
                editing={editing}
            />
            <InputField
                id="emp_mname"
                label="Middle Name"
                value={formData.emp_mname || ''}
                placeholder="Enter middle name"
                type="text"
                onChange={(e) => handleChange(e, 'emp_mname')}
                editing={editing}
            />
            <InputField
                id="emp_lname"
                label="Last Name"
                value={formData.emp_lname || ''}
                placeholder="Enter last name"
                type="text"
                onChange={(e) => handleChange(e, 'emp_lname')}
                editing={editing}
            />
            <div className="form-group-warn col-md-3 col-sm-3 col-xs-12">
                <label htmlFor=''>Gender</label>
                <input value={formData.gender} readOnly placeholder="Gender" />
            </div>
            <InputField
                id="MobNo"
                label="Mobile Number"
                value={formData.MobNo || ''}
                placeholder="Enter mobile number"
                type="tel"
                onChange={(e) => handleChange(e, 'MobNo')}
                onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                }}
                maxLength={10}
                editing={editing}
            />
            <InputField
                id="Altmono"
                label="Alternate Mobile Number"
                value={formData.Altmono || ''}
                placeholder="Enter mobile number"
                type="tel"
                onChange={(e) => handleChange(e, 'Altmono')}
                onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                }}
                maxLength={10}
                editing={editing}
            />
            <InputField
                id="TataEmailId"
                label="Email Id"
                value={formData.TataEmailId || ''}
            // placeholder="Enter email id"
            // type="email"
            // onChange={(e) => handleChange(e, 'TataEmailId')}
            // editing={editing}
            />
            <div className="form-group-warn col-md-3 col-sm-3 col-xs-12">
                <label htmlFor="department">Department</label>
                {editing ? (
                    <select id="departmentId" value={formData.departmentId || ''} onChange={(e) => handleChange(e, 'departmentId')}>
                        <option value="" style={{ color: '#999' }}>---Select Department---</option>
                        {departmentsType.map(type => (
                            <option key={type.co_param_val_id} value={type.co_param_val_id}>{type.co_param_val_name}</option>
                        ))}
                    </select>
                ) : (
                    <input type="text" value={formData.department} placeholder="Select Department" readOnly />
                )}
            </div>
            <div className="form-group-warn col-md-3 col-sm-3 col-xs-12">
                <label htmlFor="designation">Designation</label>
                {editing ? (
                    <select id="designationId" value={formData.designationId || ''} onChange={(e) => handleChange(e, 'designationId')}>
                        <option value="" style={{ color: '#999' }}>---Select Designation---</option>
                        {designationsType.map(type => (
                            <option key={type.co_param_val_id} value={type.co_param_val_id}>{type.co_param_val_name}</option>
                        ))}
                    </select>
                ) : (
                    <input type="text" value={formData.designation} placeholder="Select Designation" readOnly />
                )}
            </div>
            <div className="form-group col-md-3 col-sm-3 col-xs-12">
                <label htmlFor=''>Signature</label>
                {editing ? (
                    <input type="file" name='Uploadsign' accept=".png" onChange={(e) => handleChange(e, 'Uploadsign')} />
                ) : (
                    <a
                        href={`${Environment.ImageURL}/${formData.Uploadsign}`}
                        alt="Signature" target="_blank"
                    >View</a>
                )}
            </div>
        </>
    );
};

export default PersonalDetails;