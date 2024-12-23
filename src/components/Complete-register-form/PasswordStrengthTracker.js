import React, { useState } from "react";

const PasswordStrengthTracker = ({ password }) => {
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isValidLength, setIsValidLength] = useState(false);

  // Function to check if password contains uppercase letters
  const checkUppercase = (password) => {
    setHasUppercase(/[A-Z]/.test(password));
  };

  // Function to check if password contains lowercase letters
  const checkLowercase = (password) => {
    setHasLowercase(/[a-z]/.test(password));
  };

  // Function to check if password contains numbers
  const checkNumber = (password) => {
    setHasNumber(/\d/.test(password));
  };

  // Function to check if password contains special characters
  const checkSpecialChar = (password) => {
    setHasSpecialChar(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password));
  };

  // Function to check if password length is between 8 to 10 characters
  const checkLength = (password) => {
    setIsValidLength(password.length >= 8 && password.length <= 10);
  };

  // Update character checks when password changes
  React.useEffect(() => {
    checkUppercase(password);
    checkLowercase(password);
    checkNumber(password);
    checkSpecialChar(password);
    checkLength(password);
  }, [password]);

  return (
    <div className="PasswordMustBox">
      <i className="fa fa-caret-left"></i>
      <ul>
        <li style={{fontSize: '12px', paddingLeft: '20px'}}>Password must:</li>
        <li style={{ color: hasUppercase ? "#34B233" : "#ED2939" }}><i className="far fa-circle"></i> Have at least one capital letter</li>
        <li style={{ color: hasLowercase ? "#34B233" : "#ED2939" }}><i className="far fa-circle"></i> Have at least one lower case character</li>
        <li style={{ color: hasNumber ? "#34B233" : "#ED2939" }}><i className="far fa-circle"></i> Have at least one number</li>
        <li style={{ color: hasSpecialChar ? "#34B233" : "#ED2939" }}><i className="far fa-circle"></i> Have at least one special character</li>
        <li style={{ color: isValidLength ? "#34B233" : "#ED2939" }}><i className="far fa-circle"></i> Length between 8 to 10 characters</li>
      </ul>
    </div>
  );
};

export default PasswordStrengthTracker;