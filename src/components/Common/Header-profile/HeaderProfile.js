import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Profileuser from '../../../assets/images/profileuser.png';
import './HeaderProfile.css';
import Timer from '../Timer';
import Logout from '../../Login/Logout';
import HeaderProfileSkeleton from './HeaderProfileSkeleton';
import secureLocalStorage from "react-secure-storage";

const HeaderProfile = () => {
    const [loading, setLoading] = useState(true);
    const [userFullName, setUserFullName] = useState('');
    const [userDesignation, setUserDesignation] = useState('');
    const [userDepartment, setUserDepartment] = useState('');
    const [userId, setUserId] = useState('');
    const [userRole, setUserRole] = useState('');
    const [currentcompany, setCurrentcompany] = useState('');

    useEffect(() => {
        const loadUserData = () => {
            const userFullName = secureLocalStorage.getItem('userFullName') || 'User';
            const userDesignation = secureLocalStorage.getItem('userDesignation') || 'Designation N/A';
            const userDepartment = secureLocalStorage.getItem('userDepartment') || 'Department N/A';
            const userId = secureLocalStorage.getItem('userId') || 'ID N/A';
            const userRole = secureLocalStorage.getItem('userRole') || 'ID N/A';
            const currentcompany = secureLocalStorage.getItem('currentcompany') || 'Company N/A';

            setUserFullName(userFullName);
            setUserDesignation(userDesignation);
            setUserDepartment(userDepartment);
            setUserId(userId);
            setUserRole(userRole);
            setCurrentcompany(currentcompany);
        };

        setTimeout(() => {
            loadUserData();
            setLoading(false);
        }, 1000);
    }, []);

    const firstName = userFullName.split(' ')[0];

    if (loading) {
        return <HeaderProfileSkeleton />;
    }

    return (
        <div className='HeadersectionProfile'>
            <div className='dropdown'>
                <h4>
                    {firstName}
                    <img src={Profileuser} alt="Profile User" />
                </h4>
                <div className="dropdown-content" aria-labelledby="dropdownMenuButton">
                    <div className='DropdownProfile'>
                        <img src={Profileuser} alt="Profile" />
                        <div>
                            <h5>{userFullName} <br /> <b>( {userId} )</b></h5>
                            <p>{userDesignation} / {userDepartment}</p>
                            <p>Role - {userRole}</p>
                            <p>{currentcompany}</p>
                            <Timer />
                        </div>
                    </div>
                    <Link to={`/profile?view&UserId=${userId}`}>
                        <i className='fa fa-angle-double-right mr-2'></i> Profile
                    </Link>
                    <Logout />
                </div>
            </div>
        </div>
    );
};

export default HeaderProfile;