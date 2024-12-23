import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import tatasteellogo from '../../assets/images/tsl-slogan-blue-logo.png';
import tatalogo from '../../assets/images/tata-blue-logo.png';
import Usericon from '../../assets/images/user.png';
import Mailicon from '../../assets/images/mail.png';
import mwslogo from '../../assets/images/max-logo.png';

import axios from 'axios';
import Environment from "../../environment";
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState, setValue, trigger } = useForm({
    mode: 'onBlur',
  });
  const { errors, isSubmitting } = formState;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/forgetpassword?userid=${username}&emailid=${email}`);

      if (response.data.responseStatus == "Success") {
        toast.success(response.data.responseMessage);
        navigate('/');
      } else {
        toast.error(response.data.responseMessage);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again later.');
      } else {
        toast.error('Failed to send password reset email');
        console.error('Error:', error.message);
      }
    }
  };

  const onSubmit = () => {
    trigger();
    handleResetPassword();
  };

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
              <form className="LoginPageForm" onSubmit={handleSubmit(onSubmit)}>
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
                    <img src={Mailicon} alt="" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      {...register('email', {
                        required: 'Email Address is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValue('email', e.target.value);
                        trigger('email');
                      }}
                      className={`${errors.email && errors.email.type === 'required' ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </div>
                </div>

                <div className="form-group">
                  <button type="submit" className="btn-primary LoginSubmitbtn" disabled={isSubmitting}>
                    {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                    Send mail to reset password
                  </button>
                </div>
                <div className="BackToLogin">
                  <Link to="/" className="btn-secondary"> <i className='fa fa-angle-left' style={{ marginRight: '4px' }}></i> Back to Login</Link>
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
    </section>
  );
};

export default ForgotPassword;