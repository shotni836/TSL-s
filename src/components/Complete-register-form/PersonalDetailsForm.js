import React, { useState } from "react";
import gendermaleimg from "../../assets/images/gendermale.png";
import genderfemaleimg from "../../assets/images/genderfemale.png";
import PasswordStrengthTracker from "./PasswordStrengthTracker";

const PersonalDetailsForm = ({ personalDetails, handleInputChange, handlePasswordChange, handleConfirmPasswordChange, userData, invalidFileType }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAltMobNoWarning, setShowAltMobNoWarning] = useState(false);

  const validateMobileNumber = (number) => /^\d{10}$/.test(number);

  const handleAltMobNoBlur = () => {
    if (personalDetails.altMobNo.trim() !== "") {
      setShowAltMobNoWarning(!validateMobileNumber(personalDetails.altMobNo));
    } else {
      setShowAltMobNoWarning(false);
    }
  };

  const renderPasswordField = (name, value, onChange, show, setShow) => (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={`Enter ${name}`}
        value={value}
        onChange={onChange}
        maxLength={10}
        required
      />
      {value && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            top: "30%",
            right: "10px",
            transform: "translateY(-50%)",
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: "0",
          }}
        >
          <i className={`fas fa-eye${show ? "-slash" : ""}`} style={{ width: "12px", color: "#999" }} />
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="formheadingline">
        <h2 style={{ color: "#3D7EDB" }}> Personal Details <hr style={{ borderTop: "2px solid #3D7EDB" }} /> </h2>
      </div>
      <div className="fixedGroudBox row m-0">
        {[
          { label: "TATA User ID", value: userData.emp_user_id },
          { label: "First Name", value: userData.emp_fname },
          { label: "Middle Name", value: userData.emp_mname },
          { label: "Last Name", value: userData.emp_lname },
          { label: "Mobile Number", value: userData.MobNo },
          { label: "TATA Email Address", value: userData.TataEmailId },
          { label: "Department", value: userData.department },
          { label: "Designation", value: userData.designation },
        ].map((field, idx) => (
          <div key={idx} className="form-group col-md-3 col-sm-3 col-xs-12">
            <label>{field.label}</label>
            <input type="text" value={field.value} readOnly />
          </div>
        ))}
      </div>
      <div className="col-md-12 col-sm-12 col-xs-12">
        <span style={{ color: "#ED2939", fontSize: "12px", display: "block", textAlign: "right", marginBottom: "20px" }}>
          *all fields are mandatory
        </span>
      </div>
      <div className="form-group col-md-6 col-sm-6 col-xs-12">
        <label> Gender <b>*</b> </label>
        <div className="FormGenderFlexBox">
          {[
            { label: "Male", value: "M", img: gendermaleimg },
            { label: "Female", value: "F", img: genderfemaleimg },
            { label: "Others", value: "O" },
          ].map((gender, idx) => (
            <div key={idx} className="FormGenderBox">
              <label htmlFor={gender.value}>
                <span>{gender.img && <img src={gender.img} alt="" />} {gender.label}</span>
                <input type="radio" id={gender.value} name="gender" checked={personalDetails.gender === gender.value}
                  value={gender.value} onChange={handleInputChange} required />
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group-warn col-md-3 col-sm-3 col-xs-12">
        <label style={{ display: 'flex', justifyContent: 'space-between' }}>Alternate Mobile Number <b style={{ color: 'grey' }}>(optional)</b></label>
        <input
          style={{ marginBottom: '10px' }}
          type="tel"
          name="altMobNo"
          value={personalDetails.altMobNo}
          onChange={handleInputChange}
          onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ''))}
          maxLength={10}
          onBlur={handleAltMobNoBlur}
          placeholder="Enter alternate mobile number"
        />
        {showAltMobNoWarning && <p style={{ color: "#ED2939" }}>Mobile number must be 10 digits</p>}
      </div>
      <div className="form-group col-md-3 col-sm-3 col-xs-12">
        <label htmlFor="signature"> Upload Signature <b>*</b> </label>
        <input
          type="file"
          name="signature"
          style={{ marginBottom: "5px" }}
          accept=".png"
          onChange={handleInputChange}
          required
        />
        {invalidFileType ? (
          <p style={{ color: "#ED2939" }}>Only (.png) files are allowed</p>
        ) : (
          <p style={{ color: personalDetails.signature ? "#34B233" : "#ED2939" }}>
            {personalDetails.signature ? "" : "Upload transparent background signature file, preferably (.png)"}
          </p>
        )}
      </div>
      <div className="PasswordmustInstructionFlexBox">
        <div className="PasswordInputsBox">
          <div className="form-group">
            <label>Password <b>*</b></label>
            {renderPasswordField("password", personalDetails.password, handlePasswordChange, showPassword, setShowPassword)}
            <PasswordStrengthTracker password={personalDetails.password} />
          </div>
          <div className="form-group">
            <label>Confirm Password <b>*</b></label>
            {renderPasswordField("confirm password", personalDetails.confirmPassword, handleConfirmPasswordChange, showConfirmPassword, setShowConfirmPassword)}
            {personalDetails.showConfirmPasswordAlert && !personalDetails.passwordsMatch && (
              <p style={{ color: "#ED2939" }}>Passwords do not match</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalDetailsForm;