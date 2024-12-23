import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Loading from "../Loading";
import "./Registeremployee.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";

import InnerHeaderPageSection from "../../components/Common/Header-content/Header-content";
import RegisterEmployeeformimg from "../../assets/images/RegisterEmployeeformimg.jpg";

import { toast } from 'react-toastify';
import axios from 'axios';
import Environment from "../../environment";
import { encryptData, decryptData } from '../Encrypt-decrypt';
import secureLocalStorage from "react-secure-storage";

function Registeremployee() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const menuId = searchParams.get('menuId');
  const moduleId = searchParams.get('moduleId');
  const token = secureLocalStorage.getItem('token');

  const [state, setState] = useState({
    selectedOption: "",
    employeeTypes: [],
    departmentsType: [],
    designationsType: [],
    loading: true,
    formData: {
      euserId: "",
      efName: "",
      eMname: "",
      elname: "",
      eMobNo: "",
      eTypeId: "",
      eEmailId: "",
      eDepartment: "",
      eDesignation: ""
    },
    formDisabled: false,
    userIdExists: false,
    isValidUserId: true,
    isValidEmail: true
  });

  const { selectedOption, employeeTypes, departmentsType, formDisabled, designationsType, loading, formData, userIdExists, isValidUserId, isValidEmail } = state;

  useEffect(() => {
    const fetchDropdownValues = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + "/api/User/GetEmployeeTypeReg", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        // Sort arrays alphabetically
        const sortedEmployeeTypes = data["EmpType"].sort((a, b) => a.co_param_val_name.localeCompare(b.co_param_val_name));
        const sortedDepartments = data["Department"].sort((a, b) => a.co_param_val_name.localeCompare(b.co_param_val_name));
        const sortedDesignations = data["Designation"].sort((a, b) => a.co_param_val_name.localeCompare(b.co_param_val_name));
        setState((prevState) => ({
          ...prevState,
          employeeTypes: sortedEmployeeTypes,
          departmentsType: sortedDepartments,
          designationsType: sortedDesignations,
        }));
      } catch (error) {
        console.error("Error fetching drop-down values:", error);
      }
    };

    fetchDropdownValues();

    setTimeout(() => {
      setState((prevState) => ({ ...prevState, loading: false }));
    }, 2000);
  }, []);

  // --------------------------------------------------------------------

  const [error, setError] = useState({ eMobNo: "" });

  const handleMobileNumberBlur = () => {
    const { eMobNo } = formData;
    if (eMobNo.length !== 10) {
      setError({ eMobNo: "Mobile number must be 10 digits" });
    }
  };

  const handleInputChange = async ({ target }) => {
    const { name, value } = target;

    // to capitalize first character
    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    let updatedValue = value;

    // Validate for alphabetic characters
    if (name === "efName" || name === "eMname" || name === "elname") {
      updatedValue = value.replace(/[^A-Za-z]/gi, '');
      updatedValue = capitalizeFirstLetter(updatedValue); // Capitalize first letter
    }

    if (name === "eTypeId") {
      setState((prevState) => ({
        ...prevState,
        selectedOption: value,
        formDisabled: true,
        // Clear user ID when employee type changes
        formData: {
          ...prevState.formData,
          euserId: "" // Clear user ID
        }
      }));
    }

    setState((prevState) => ({
      ...prevState,
      formData: {
        ...prevState.formData,
        [name]: updatedValue,
      },
    }));

    // Check if user ID exists after the user has finished entering it
    if (name === "euserId" && value.length === 6) {
      const userIdExists = await checkUserIdExists(value);
      setState((prevState) => ({ ...prevState, userIdExists }));
    }

    // Check if user ID follows the defined rule whenever it changes
    if (name === "euserId") {
      const isValidUserId = validateUserId(updatedValue, selectedOption);
      setState((prevState) => ({ ...prevState, isValidUserId }));
    }

    // Check input contains "@" symbol
    if (name === "eEmailId" && selectedOption === "519" && value.includes("@")) {
      // Split input value at "@" symbol
      const [username] = value.split("@");
      // Update state with username and append "tatasteel.com" domain
      setState((prevState) => ({
        ...prevState,
        formData: {
          ...prevState.formData,
          [name]: `${username}@tatasteel.com`,
        },
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        formData: {
          ...prevState.formData,
          [name]: updatedValue,
        },
      }));
    }

    // Clear error message
    if (name === "eMobNo" && value.length === 10) {
      setError({ eMobNo: "" });
    }
  };

  // --------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isValidUserId || userIdExists) return;
      const finalData = {
        ...formData, eTypeId: parseInt(formData.eTypeId, 10),
        eDepartment: parseInt(formData.eDepartment, 10),
        eDesignation: parseInt(formData.eDesignation, 10)
      }

      const response = await axios.post(Environment.BaseAPIURL + "/api/User/RegisterEmployee",
        finalData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const registrationSuccess = response.data.responseMessage === 'Registered Successfully';

      if (registrationSuccess) {
        navigate(`/employeelist?moduleId=${moduleId}&menuId=${menuId}`);
        toast.success("Registration successful");
      } else {
        toast.error(response.data.responseMessage);
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  // --------------------------------------------------------------------

  const checkUserIdExists = async (userId) => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + "/api/User/getallemp?EMProle=A", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const users = response.data;
      return users.some((user) => user.UserId === userId);
    } catch (error) {
      console.error("Error checking if user ID exists:", error);
      return false;
    }
  };

  const validateUserId = (userId, selectedOption) => {
    let isValid = false;

    if (selectedOption === "519" || selectedOption === "520") { // Tata & Subsidiary employees : 6-digit numeric value
      isValid = /^\d{6}$/.test(userId);
    } else if (selectedOption === "521") { // Contractual: 10-digit alphanumeric value
      isValid = /^\w{10}$/.test(userId);
    } else if (selectedOption === "522") { // TPI employees: PAN card number
      isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(userId);
    }
    return isValid;
  };

  // --------------------------------------------------------------------

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          <InnerHeaderPageSection
            linkTo={`/hrdashboard?moduleId=${moduleId}`}
            linkText="UM Module"
            linkText2="Employee Registration"
          />
          <section className="RegisterEmployeePageSection">
            <div className="container">
              <div className="row">
                <div className="col-md-5 col-sm-5 col-xs-12">
                  <img className="RegisterEmployeeformimg" src={RegisterEmployeeformimg} alt="RegisterEmployeeformimg" />
                </div>
                <div className="col-md-7 col-sm-7 col-xs-12">
                  <form className="RegisterEmployeeForm row m-0" onSubmit={handleSubmit} >
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <label htmlFor="">Employee Type <b>*</b></label>
                      <select
                        name="eTypeId"
                        id="eTypeId"
                        value={formData.eTypeId}
                        onChange={handleInputChange}
                        required >
                        <option value="" disabled selected >-- Select employee type --</option>
                        {employeeTypes.map((type) => (
                          <option
                            key={type.co_param_val_id}
                            value={type.co_param_val_id}
                          >
                            {type.co_param_val_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group-warn col-md-6 col-sm-6 col-xs-12">
                      <label htmlFor="">
                        {selectedOption === "519" ? "TATA User ID" : selectedOption === "TPI" ? "PAN Card Number" : "User Id"}
                        <b>*</b>
                      </label>
                      <input
                        type="text"
                        name="euserId"
                        value={formData.euserId}
                        onChange={handleInputChange}
                        placeholder="Enter ID"
                        disabled={!formDisabled}
                        required
                        maxLength={selectedOption === "519" ? 6 : selectedOption === "520" ? 6 : selectedOption === "522" ? 10 : 10}
                        onInput={(e) => {
                          let allowedCharacters = /[\s\S]/;
                          if (selectedOption === "519" || selectedOption === "520") {
                            allowedCharacters = /[0-9]/;
                          } else if (selectedOption === "521") {
                            allowedCharacters = /[a-zA-Z0-9]/;
                          } else if (selectedOption === "522") {
                            allowedCharacters = /[a-zA-Z0-9]/;
                          }
                          e.target.value = e.target.value.split('').filter(char => allowedCharacters.test(char)).join('');
                        }}
                      />
                      {!isValidUserId && (
                        <span style={{ color: "#FD6868", fontSize: "11px" }}>
                          {selectedOption === "520"
                            ? "User ID must be a 6-digit numeric value."
                            : selectedOption === "519"
                              ? "User ID must be a 6-digit numeric value. "
                              : selectedOption === "522"
                                ? "User ID must be a valid PAN card number. "
                                : "User ID must be a 10-digit alphanumeric value. "}
                        </span>
                      )}
                      {userIdExists && <span style={{ color: "#FD6868", fontSize: "11px" }}>User already exists</span>}
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">First Name <b>*</b></label>
                      <input
                        type="text"
                        name="efName"
                        placeholder="Enter first name"
                        value={formData.efName}
                        onChange={handleInputChange}
                        disabled={!formDisabled}
                        required />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Middle Name </label>
                      <input
                        type="text"
                        name="eMname"
                        placeholder="Enter middle name"
                        value={formData.eMname}
                        onChange={handleInputChange}
                        disabled={!formDisabled} />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Last Name <b>*</b></label>
                      <input
                        type="text"
                        name="elname"
                        placeholder="Enter last name"
                        value={formData.elname}
                        onChange={handleInputChange}
                        disabled={!formDisabled}
                        required />
                    </div>
                    <div className="form-group-warn col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Mobile Number <b>*</b></label>
                      <input
                        type="text"
                        name="eMobNo"
                        placeholder="Enter mobile number"
                        value={formData.eMobNo}
                        onChange={handleInputChange}
                        onBlur={handleMobileNumberBlur}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, '');
                        }}
                        maxLength={10}
                        disabled={!formDisabled}
                        required
                      />
                      {error.eMobNo && <span style={{ color: "#FD6868", fontSize: "11px" }}>{error.eMobNo}</span>}
                    </div>
                    <div className="form-group col-md-8 col-sm-4 col-xs-12">
                      <label htmlFor="">
                        {selectedOption === "519" ? "TATA Email Address" : selectedOption === "TPI" ? "TPI Agency" : "Email Address"}
                        <b>*</b>
                      </label>
                      <input
                        type="email"
                        name="eEmailId"
                        placeholder="Enter email address"
                        value={formData.eEmailId}
                        onChange={handleInputChange}
                        disabled={!formDisabled}
                        required />
                    </div>
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <label htmlFor="">Department <b>*</b></label>
                      <select
                        name="eDepartment"
                        id="eDepartment"
                        value={formData.eDepartment}
                        onChange={handleInputChange}
                        disabled={!formDisabled}
                        required >
                        <option value="" disabled selected >-- Select department --</option>
                        {departmentsType.map((type) => (
                          <option
                            key={type.co_param_val_id}
                            value={type.co_param_val_id}
                          >
                            {type.co_param_val_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <label htmlFor="">Designation <b>*</b></label>
                      <select
                        name="eDesignation"
                        id="eDesignation"
                        value={formData.eDesignation}
                        onChange={handleInputChange}
                        disabled={!formDisabled}
                        required >
                        <option value="" disabled selected >-- Select designation --</option>
                        {designationsType.map((type) => (
                          <option
                            key={type.co_param_val_id}
                            value={type.co_param_val_id}
                          >
                            {type.co_param_val_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="RegisterEmployeeFooter">
                        <span style={{ color: "#ED2939", fontSize: "12px" }}>
                          *All fields are mandatory
                        </span>
                        <button type="submit" className="SubmitNextbtn">
                          Register
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </>
  );
}

export default Registeremployee;