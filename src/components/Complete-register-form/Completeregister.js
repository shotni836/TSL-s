import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Completeregister.css';
import Footer from '../Common/Footer/Footer';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import Loading from '../Loading';
import PersonalDetailsForm from './PersonalDetailsForm';
import EducationDetailsForm from './EducationDetailsForm';
import ExperienceDetailsForm from './ExperienceDetailsForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Environment from '../../environment';
import secureLocalStorage from "react-secure-storage";
import { decryptData } from '../Encrypt-decrypt';

function Completeregister() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('UserId');
  const token = secureLocalStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const [decryptedUserId, setDecryptedUserId] = useState('');

  useEffect(() => {
    if (userId) {
      const decryptedId = decryptData(userId);
      setDecryptedUserId(decryptedId);
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmpByID?UserId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const user = response.data.Table?.[0];

      if (!user) return handleError("User doesn't exist");
      if (user.gender) return handleError("User already registered");

      setUserData(user);
      setVisible(true);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  const handleError = (message) => {
    toast.error(message);
    navigate("/");
  };

  useEffect(() => {
    fetchData();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [userId]);

  // Personal Details 
  const [personalDetails, setPersonalDetails] = useState({
    emp_user_id: userId,
    emp_fname: '',
    emp_mname: '',
    emp_lname: '',
    MobNo: '',
    TataEmailId: '',
    department: '',
    designation: '',
    gender: '',
    altMobNo: '',
    password: '',
    confirmPassword: '',
    passwordsMatch: true,
    signature: null,
    signatureFileName: '',
  });

  const [invalidFileType, setInvalidFileType] = useState(false);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = async (e) => {
    const { name, type, files, value } = e.target;
    if (type === 'file' && files.length > 0) {
      const file = files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'png') {
        setInvalidFileType(true);
        e.target.value = '';
        return;
      }

      if (file.size > 2048 ** 2) {
        toast.error("Upload file less than 2 MB");
        e.target.value = '';
        return;
      }

      setInvalidFileType(false);
      const base64Signature = await fileToBase64(file);
      setPersonalDetails((prevDetails) => ({
        ...prevDetails,
        signature: base64Signature,
        signatureFileName: file.name,
      }));
    } else {
      setPersonalDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPersonalDetails((prevDetails) => ({
      ...prevDetails,
      password: value,
      passwordsMatch: value === prevDetails.confirmPassword,
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    const isFocused = document.activeElement === e.target;
    setPersonalDetails((prevDetails) => ({
      ...prevDetails,
      confirmPassword: value,
      passwordsMatch: prevDetails.password === value,
      showConfirmPasswordAlert: isFocused && prevDetails.password !== value,
    }));
  };

  // Education Details 
  const [educationCounter, setEducationCounter] = useState(1);
  const [educationData, setEducationData] = useState([
    {
      emp_user_id: userId,
      emp_edu_id: 1,
      emp_degree_id: '',
      emp_start_yr: '',
      emp_end_yr: '',
      emp_edu_grade: '',
      emp_degree_marks: '',
    },
  ]);

  const handleEducationInputChange = (e, emp_edu_id) => {
    const { name, value } = e.target;
    setEducationData((prevData) =>
      prevData.map((row) => (row.emp_edu_id === emp_edu_id ? { ...row, [name]: value } : row))
    );
  };

  const addEducationRow = () => {
    setEducationData((prevData) => [
      ...prevData,
      {
        emp_user_id: userId,
        emp_edu_id: educationCounter + 1,
        emp_degree_id: '',
        emp_start_yr: '',
        emp_end_yr: '',
        emp_edu_grade: '',
        emp_degree_marks: '',
      },
    ]);
    setEducationCounter((prevCounter) => prevCounter + 1);
  };

  const removeEducationRow = (emp_edu_id) => {
    setEducationData((prevData) =>
      prevData.length === 1
        ? [
          {
            emp_user_id: userId,
            emp_edu_id: educationCounter,
            emp_degree_id: '',
            emp_start_yr: '',
            emp_end_yr: '',
            emp_edu_grade: '',
            emp_degree_marks: '',
          },
        ]
        : prevData.filter((row) => row.emp_edu_id !== emp_edu_id)
    );
  };

  // Experience Details 
  const [experienceCounter, setExperienceCounter] = useState(1);
  const [experienceData, setExperienceData] = useState([
    {
      emp_user_id: userId,
      emp_exp_id: 1,
      emp_exp_company: '',
      emp_exp_dept: '',
      emp_exp_designation: '',
      emp_start_mon: '',
      emp_start_yr: '',
      emp_end_mon: '',
      emp_end_yr: '',
      isCurrentCompany: false,
    },
  ]);

  const handleExperienceInputChange = (e, emp_exp_id) => {
    const { name, value } = e.target;
    setExperienceData((prevData) =>
      prevData.map((row) =>
        row.emp_exp_id === emp_exp_id ? { ...row, [name]: value } : row
      )
    );
  };

  const addExperienceRow = () => {
    setExperienceData((prevData) => [
      ...prevData,
      {
        emp_user_id: userId,
        emp_exp_id: experienceCounter + 1,
        emp_exp_company: '',
        emp_exp_dept: '',
        emp_exp_designation: '',
        emp_start_mon: '',
        emp_start_yr: '',
        emp_end_mon: '',
        emp_end_yr: '',
        isCurrentCompany: false,
      },
    ]);
    setExperienceCounter((prevCounter) => prevCounter + 1);
  };

  const removeExperienceRow = (emp_exp_id) => {
    if (experienceData.length === 1) {
      setExperienceData([
        {
          emp_user_id: userId,
          emp_exp_id: experienceCounter,
          emp_exp_company: '',
          emp_exp_dept: '',
          emp_exp_designation: '',
          emp_start_mon: '',
          emp_start_yr: '',
          emp_end_mon: '',
          emp_end_yr: '',
          isCurrentCompany: false,
        },
      ]);
    } else {
      setExperienceData((prevData) =>
        prevData.filter((row) => row.emp_exp_id !== emp_exp_id)
      );
    }
  };

  // Submission 
  const submitPersonalDetails = async () => {
    try {
      let personalDetailsPayload = {
        userid: decryptedUserId,
        gender: personalDetails.gender,
        altMobNo: personalDetails.altMobNo || '',
        usPass: personalDetails.password,
        userSign: personalDetails.signature,
        userSignName: personalDetails.signatureFileName,
      };

      const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/UpdateEmpRegInfo`, personalDetailsPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response1.status === 200 && response1.data.responseMessage === 'Updated Succesfully') {
        toast.success("Registration successful");
        navigate("/");
      } else {
        toast.error("Failed while submitting...");
      }
      console.log('Personal details API response:', response1.data);
    } catch (error) {
      console.error('Error submitting personal details:', error);
      toast.error("Registration failed");
    }
  };

  const submitEducation = async () => {
    try {
      const educationPayload = educationData.map((edu) => ({
        ...edu,
        emp_user_id: decryptedUserId,
      }));

      const educationResponse = await axios.post(`${Environment.BaseAPIURL}/api/User/RegEmployeeEducation`, educationPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Education details API response:', educationResponse.data);
    } catch (error) {
      console.error('Error submitting education details:', error);
    }
  };

  const submitExperience = async () => {
    try {
      const experiencePayload = experienceData.map((exp) => ({
        ...exp,
        emp_user_id: decryptedUserId,
      }));

      const experienceResponse = await axios.post(`${Environment.BaseAPIURL}/api/User/RegEmployeeExperience`, experiencePayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Experience details API response:', experienceResponse.data);
    } catch (error) {
      console.error('Error submitting experience details:', error);
    }
  };

  const [isPasswordValid, setIsPasswordValid] = useState(false);

  useEffect(() => {
    const validatePassword = () => {
      const hasUppercase = /[A-Z]/.test(personalDetails.password);
      const hasLowercase = /[a-z]/.test(personalDetails.password);
      const hasNumber = /\d/.test(personalDetails.password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(personalDetails.password);
      const isValidLength = personalDetails.password.length >= 8 && personalDetails.password.length <= 10;

      return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isValidLength;
    };

    setIsPasswordValid(validatePassword());
  }, [personalDetails.password]);

  const handleSubmission = async (e) => {
    e.preventDefault();

    // Check password
    if (!personalDetails.passwordsMatch) {
      toast.error('Password and Confirm Password do not match');
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password doesn't meets all requirements");
      return;
    }

    // Validate mobile number length (only if not empty)
    if (personalDetails.altMobNo.length > 0 && personalDetails.altMobNo.length !== 10) {
      toast.error('Invalid Mobile number');
      return;
    }

    // Validate education data
    for (const edu of educationData) {
      if (!edu.emp_degree_id || !edu.emp_start_yr || !edu.emp_end_yr || !edu.emp_edu_grade || !edu.emp_degree_marks) {
        toast.error('Please fill out all fields in the education details.');
        return;
      }
    }

    // Check for duplicate education entries
    const educationSet = new Set();
    for (const edu of educationData) {
      const key = `${edu.emp_degree_id}-${edu.emp_start_yr}-${edu.emp_end_yr}-${edu.emp_edu_grade}-${edu.emp_degree_marks}`;
      if (educationSet.has(key)) {
        toast.error('Duplicate entries found in education details.');
        return;
      }
      educationSet.add(key);
    }

    // Validate experience data
    for (const exp of experienceData) {
      if (!exp.emp_exp_company || !exp.emp_exp_dept || !exp.emp_exp_designation || !exp.emp_start_mon || !exp.emp_start_yr || !exp.emp_end_mon || !exp.emp_end_yr) {
        toast.error('Please fill out all fields in the experience details.');
        return;
      }
    }

    // Check for duplicate experience entries
    const experienceSet = new Set();
    for (const exp of experienceData) {
      const key = `${exp.emp_exp_company}-${exp.emp_exp_dept}-${exp.emp_exp_designation}-${exp.emp_start_mon}-${exp.emp_start_yr}-${exp.emp_end_mon}-${exp.emp_end_yr}`;
      if (experienceSet.has(key)) {
        toast.error('Duplicate entries found in experience details.');
        return;
      }
      experienceSet.add(key);
    }

    try {
      await submitPersonalDetails();
      await submitEducation();
      await submitExperience();
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  // Save and Load 
  const [showSaveModal, setShowSaveModal] = useState(false);

  const savePageData = () => {
    const pageData = {
      userData,
      personalDetails,
      educationData,
      experienceData,
    };
    localStorage.setItem(`completeregister_data_${userId}`, JSON.stringify(pageData));
    setShowSaveModal(true);
  };

  const loadPageData = () => {
    const savedData = localStorage.getItem(`completeregister_data_${userId}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData(parsedData.userData);
      setPersonalDetails(parsedData.personalDetails);
      setEducationData(parsedData.educationData);
      setExperienceData(parsedData.experienceData);
      toast.success('Data loaded successfully');
    }
  };

  return (
    <>
      {loading ? (<Loading />
      ) : (
        <>
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul><li><h1>Complete Registration Form</h1></li></ul>
                </div>
              </div>
            </div>
          </section>
          {visible && <section className="CompleteRegistrationPageSection">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <form className="CompleteregisterForm row m-0" onSubmit={handleSubmission}>
                    <PersonalDetailsForm
                      personalDetails={personalDetails}
                      handleInputChange={handleInputChange}
                      handlePasswordChange={handlePasswordChange}
                      handleConfirmPasswordChange={handleConfirmPasswordChange}
                      userData={userData}
                      invalidFileType={invalidFileType}
                    />
                    <EducationDetailsForm
                      eddata={educationData}
                      handleInputChange={handleEducationInputChange}
                      edremoveRow={removeEducationRow}
                      edaddRow={addEducationRow}
                    />
                    <ExperienceDetailsForm
                      data={experienceData}
                      handleInputChange={handleExperienceInputChange}
                      exremoveRow={removeExperienceRow}
                      exaddRow={addExperienceRow}
                    />
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="CompleteRegistrationFooter">
                        <div className="SaveButtonBox">
                          <span onClick={loadPageData}>Load</span>
                          <span data-bs-toggle="modal" data-bs-target="#completesaveModal" onClick={savePageData} style={{ background: '#FFA100' }}>Draft Save</span>
                          <div className="modal fade SaveModalBox" id="completesaveModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" show={showSaveModal}>
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="saveiconBox">
                                  <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="modal-body">
                                  <h4>Great!</h4>
                                  <p>All Input Saved Successfully</p>
                                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal">OK</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="SubmitNextbtn" type="submit">Submit</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>}
          <Footer />
        </>
      )}
    </>
  );
}

export default Completeregister;