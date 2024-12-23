import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import tatasteellogo from '../../assets/images/tsl-slogan-blue-logo.png';
import tatalogo from '../../assets/images/tata-blue-logo.png';
import Usericon from '../../assets/images/user.png';
import Passwordicon from '../../assets/images/password.png';
import mwslogo from '../../assets/images/max-logo.png';

import axios from 'axios';
import Environment from "../../environment";
import './Login.css';
import secureLocalStorage from "react-secure-storage";

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: "400px",
    height: "auto"
  },
};

const Login = () => {
  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [myUserId, setMyUserId] = useState('');

  const { register, handleSubmit, formState, setValue, trigger } = useForm({
    mode: 'onBlur', // Set mode to 'onBlur' to show errors onBlur instead of onSubmit
  });
  const { errors, isSubmitting } = formState;

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {

    // Validation for username and password length
    // if (username.length < 6 || username.length > 10) {
    //   toast.error('Invalid username');
    //   return;
    // }
    // if (password.length < 8 || password.length > 10) {
    //   toast.error('Invalid password');
    //   return;
    // }

    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/AuthLogin?username=${username}&password=${password}`);
      if (response.status === 200) {
        const responseData = await response.data;
        if (responseData.response === "1" && responseData.responseToken) {
          const token = responseData.responseToken;
          const loginTime = Date.now(); // Record login time
          secureLocalStorage.setItem('empId', responseData.empid);
          secureLocalStorage.setItem('userId', username);
          secureLocalStorage.setItem('token', token);
          secureLocalStorage.setItem('userFullName', responseData.userFullName);
          secureLocalStorage.setItem('userDesignation', responseData.userDesignation);
          secureLocalStorage.setItem('userDepartment', responseData.userDepartment);
          secureLocalStorage.setItem('userRole', responseData.userRole);
          secureLocalStorage.setItem('loginTime', loginTime);
          secureLocalStorage.setItem('departmentId', responseData.userDepartmentid)
          secureLocalStorage.setItem('currentcompany', responseData.currentcompany)
          secureLocalStorage.setItem('emp_current_comp_id', responseData.emp_current_comp_id)
          secureLocalStorage.setItem('roleId', responseData.roleId)
          navigate('/module');
        } else {
          toast.error(responseData.response);
        }
      } else {
        toast.error(`Login failed with status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('Network Error: Please check your internet connection');
      } else {
        toast.error('An unexpected error occurred');
      }
      console.error('Login failed', error.message);
    }
  };

  function completeRegister(e) {
    e.preventDefault()
    console.log(e)
    navigate(`/completeregister?UserId=${myUserId}`)
  }

  return (
    <section className="LoginPageSection">
      <div className="LoginPageBgSection"></div>
      <div className="col-md-12 col-sm-12 col-xs-12">
        <div className="LoginPageFlex">
          <div className="container">
            <div className="row">
              <div className='col-md-12 col-sm-12 col-xs-12'>
                <div className="LoginPageheader">
                  <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
                  <img className="tatalogoimg" src={tatalogo} alt="" />
                </div>
              </div>
            </div>
          </div>

          <div className="LoginPageBox">
            <div className="loginpageBoxDiv">
              <form className="LoginPageForm">
                <div className="form-group">
                  <div className='LoginInputBox'>
                    <img src={Usericon} alt="" />
                    <input
                      type="text"
                      placeholder="Username"
                      {...register('username', { required: 'Username is required' })}
                      value={username}
                      onChange={(e) => {
                        if (e.target.value.length <= 10) { // Check length before updating state
                          setUsername(e.target.value);
                          setValue('username', e.target.value);
                          trigger('username');
                        }
                      }}
                      className={`${errors.username && errors.username.type === 'required' ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.username?.message}</div>
                  </div>
                </div>
                <div className="form-group">
                  <div className='LoginInputBox'>
                    <img src={Passwordicon} alt="" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...register('password', { required: 'Password is required' })}
                      value={password}
                      onChange={(e) => {
                        if (e.target.value.length <= 10) {
                          setPassword(e.target.value);
                          setValue('password', e.target.value);
                          trigger('password');
                        }
                      }}
                      className={`${errors.password && errors.password.type === 'required' ? 'is-invalid' : ''}`}
                    />

                    {password && (
                      <div className="password-toggle" onClick={handleTogglePasswordVisibility}>
                        {showPassword ? (
                          <i className="fas fa-eye-slash" />
                        ) : (
                          <i className="fas fa-eye" />
                        )}
                      </div>
                    )}
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </div>
                </div>

                <div className="form-group">
                  <button className="btn-primary LoginSubmitbtn" type='submit' onClick={handleSubmit(handleLogin)}>
                    {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                    Login</button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Link to="/forgotPassword">Forgot password ?</Link>
                  <Link style={{ marginLeft: 'auto' }} onClick={openModal}>Complete Registration</Link>
                </div>
              </form>
            </div>
          </div>
          <div className="LoginPagefooter">
            <div className="container">
              <div className="row">
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <img className="mwslogoImg" src={mwslogo} alt="" />
                  <p>v1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* <button onClick={openModal}>Open Modal</button> */}
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello User</h2>
            <button style={{ background: 'transparent', border: 'none' }} onClick={closeModal}>X</button>
          </div>
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>Please enter your User ID</div>
          <form>
            <input type='text' className='form-control' value={myUserId} onChange={(e) => setMyUserId(e.target.value)} placeholder='Enter your User ID' style={{ marginBottom: "20px" }} />
            <div>
              <button className='btn btn-primary' onClick={(e) => completeRegister(e)}>Submit</button>
            </div>
          </form>
        </Modal>
      </div>
    </section>
  );
};

export default Login;