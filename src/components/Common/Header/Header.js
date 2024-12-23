import React, { useState, useEffect } from 'react'
import './Header.css'
import TATASteelLogoWhite from '../../../assets/images/TATA-SteelLogoWhite.png'
import HeaderProfile from '../Header-profile/HeaderProfile'
import HeaderSkeleton from './HeaderSkeleton';

const Header = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return <HeaderSkeleton />;
    }

    return (
        <header className='Headerpage'>
            <div className='container'>
                <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12'>
                        <div className="Headerpageheader">
                            <img className="tatasteellogoimg" src={TATASteelLogoWhite} alt="" />
                            <HeaderProfile />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header

// import React, { useState, useEffect } from 'react';
// import './Header.css';
// import { Link } from 'react-router-dom';
// import TATASteelLogoWhite from '../../../assets/images/TATA-SteelLogoWhite.png';
// import HeaderSkeleton from './HeaderSkeleton';
// import Profileuser from '../../../assets/images/profileuser.png';
// import Timer from '../Timer';
// import Logout from '../../Login/Logout';

// const Header = () => {
//     const [loading, setLoading] = useState(true);
//     const [userFullName, setUserFullName] = useState('');
//     const [userDesignation, setUserDesignation] = useState('');
//     const [userDepartment, setUserDepartment] = useState('');
//     const [userId, setUserId] = useState('');

//     useEffect(() => {
//         const loadUserData = () => {
//             const userFullName = localStorage.getItem('userFullName') || 'User';
//             const userDesignation = localStorage.getItem('userDesignation') || 'Designation N/A';
//             const userDepartment = localStorage.getItem('userDepartment') || 'Department N/A';
//             const userId = localStorage.getItem('userId') || 'ID N/A';

//             setUserFullName(userFullName);
//             setUserDesignation(userDesignation);
//             setUserDepartment(userDepartment);
//             setUserId(userId);
//         };

//         setTimeout(() => {
//             loadUserData();
//             setLoading(false);
//         }, 2000);
//     }, []);

//     const firstName = userFullName.split(' ')[0];

//     if (loading) {
//         return <HeaderSkeleton />;
//     }

//     return (
//         <header className='Headerpage'>
//             <div className='container'>
//                 <div className='row'>
//                     <div className='col-md-12 col-sm-12 col-xs-12'>
//                         <div className="Headerpageheader">
//                             <img className="tatasteellogoimg" src={TATASteelLogoWhite} alt="TATA Steel Logo" />
//                             <div className='HeadersectionProfile'>
//                                 <div className='dropdown'>
//                                     <h4>
//                                         {firstName}
//                                         <img src={Profileuser} alt="Profile User" />
//                                     </h4>
//                                     <div className="dropdown-content" aria-labelledby="dropdownMenuButton">
//                                         <div className='DropdownProfile'>
//                                             <img src={Profileuser} alt="Profile" />
//                                             <div>
//                                                 <h5>{userFullName} <br /> <b>( {userId} )</b></h5>
//                                                 <p>{userDesignation} / {userDepartment}</p>
//                                                 <Timer />
//                                             </div>
//                                         </div>
//                                         <Link to={`/profile?view&UserId=${userId}`}>
//                                             <i className='fa fa-angle-double-right mr-2'></i> Profile
//                                         </Link>
//                                         <Logout />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default Header;