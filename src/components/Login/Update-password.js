import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import tatasteellogo from '../../assets/images/tsl-slogan-blue-logo.png';
import tatalogo from '../../assets/images/tata-blue-logo.png';
import Passwordicon from '../../assets/images/password.png';
import mwslogo from '../../assets/images/max-logo.png';

import axios from 'axios';
import Environment from '../../environment';
import './Login.css';
import PasswordStrengthTracker from "../Complete-register-form/PasswordStrengthTracker";

const UpdatePassword = ({ match }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState, setValue, trigger } = useForm({
        mode: 'onBlur',
    });

    const { errors, isSubmitting } = formState;

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('UserId');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    useEffect(() => {
        const validatePassword = () => {
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
            const isValidLength = password.length >= 8 && password.length <= 10;

            return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isValidLength;
        };

        setIsPasswordValid(validatePassword());
    }, [password]);

    const handleTogglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const handleResetPassword = async () => {
        if (!isPasswordValid || password !== confirmPassword) {
            toast.error("Password doesn't meets all requirements");
            return;
        }

        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/updatepassword?userid=${userId}&password=${password}`);

            if (response.status === 200) {
                toast.success('Password updated successfully');
                navigate('/');
            } else {
                toast.error('Failed to update password');
            }
        } catch (error) {
            toast.error('Failed to update password');
            console.error('Error:', error.message);
        }
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
                            <form className="LoginPageForm">
                                <div className="form-group">
                                    <div className='LoginInputBox'>
                                        <img src={Passwordicon} alt="" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="New Password"
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: { value: 8, },
                                                maxLength: { value: 10, },
                                            })}
                                            value={password}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length <= 10) { // Restricting to 10 characters
                                                    setPassword(value);
                                                    setValue('password', value);
                                                    trigger('password');
                                                    if (confirmPassword) {
                                                        trigger('confirmPassword');
                                                    }
                                                }
                                            }}
                                            className={`${errors.password && errors.password.type === 'required' ? 'is-invalid' : ''}`}
                                        />
                                        {password && (
                                            <div className="password-toggle" onClick={() => handleTogglePasswordVisibility('password')}>
                                                {showPassword ? (
                                                    <i className="fas fa-eye-slash" />
                                                ) : (
                                                    <i className="fas fa-eye" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.password && errors.password.type === 'minLength' && (
                                        <div className="password-warning">{errors.password.message}</div>
                                    )}
                                    <PasswordStrengthTracker password={password} />
                                </div>

                                <div className="form-group">
                                    <div className='LoginInputBox'>
                                        <img src={Passwordicon} alt="" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm Password"
                                            {...register('confirmPassword', {
                                                required: 'Please confirm your password',
                                                validate: (value) => value === password || 'The passwords do not match',
                                            })}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length <= 10) { // Restricting to 10 characters
                                                    setConfirmPassword(value);
                                                    setValue('confirmPassword', value);
                                                    trigger('confirmPassword');
                                                }
                                            }}
                                            className={`${errors.confirmPassword ? 'is-invalid' : ''}`}
                                        />

                                        {confirmPassword && (
                                            <div className="password-toggle" onClick={() => handleTogglePasswordVisibility('confirmPassword')}>
                                                {showConfirmPassword ? (
                                                    <i className="fas fa-eye-slash" />
                                                ) : (
                                                    <i className="fas fa-eye" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {errors.confirmPassword && <p style={{ color: "#FD686A" }}>Passwords do not match</p>}

                                <div className="form-group">
                                    <Link type="button" className="btn-primary LoginSubmitbtn" onClick={handleSubmit(handleResetPassword)}>
                                        {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                                        Update Password
                                    </Link>
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

export default UpdatePassword;