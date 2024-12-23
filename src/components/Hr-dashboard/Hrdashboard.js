import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import TATASteelLogoWhite from '../../assets/images/TATA-SteelLogoWhite.png';
import HeaderProfile from '../../components/Common/Header-profile/HeaderProfile';
import './Hrdashboard.css';
import Logout from '../Login/Logout';
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const userId = secureLocalStorage.getItem('userId');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get('moduleId');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/Get_MenuBindByRoleWise?UserId=${userId}&ModuleId=${moduleId}`);
        const sortedPermissions = response.data.sort((a, b) => a.menuId - b.menuId);
        setPermissions(sortedPermissions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, moduleId]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {loading ? (
        <div className='DashboardPageSection'>
          <div className='DashboardHeaderSection'>
            <div className="container-fluid">
              <div className="row">
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <div className="ModulePageheader">
                    <Skeleton width={200} height={75} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='DashboardDetailsSection'>
            <aside id="sidebar" className={sidebarOpen ? 'sidebar-open' : 'SideBarSection'}>
              <div className='sidebartoggleRound'>
                <Skeleton width={30} height={30} />
              </div>
              <ul>
                <Skeleton count={5} height={50} style={{ marginBottom: '10px' }} />
              </ul>
            </aside>

            <div id="content" className={sidebarOpen ? 'content-open' : 'DashboardDetails'}>
              <div className='DashboardDetailsContent'>
                <Skeleton height={40} width={200} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='DashboardPageSection'>
          <div className='DashboardHeaderSection'>
            <div className="container-fluid">
              <div className="row">
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <div className="ModulePageheader">
                    <img className="tatasteellogoimg" src={TATASteelLogoWhite} alt="TATA Steel Logo" />
                    <HeaderProfile />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='DashboardDetailsSection'>
            <aside id="sidebar" className={sidebarOpen ? 'sidebar-open' : 'SideBarSection'}>
              <div className='sidebartoggleRound'>
                <input type="checkbox" id="sidebar-toggle" checked={sidebarOpen} onChange={toggleSidebar} />
                {/* <label htmlFor="sidebar-toggle" id="sidebar-icon"><i className="fas fa-bars"></i></label> */}

              </div>
              <ul>
                {permissions.map((module, index) => (
                  <li key={index}>
                    <Link to={`${module.link}?menuId=${module.menuId}`} className="RegisterEmployeeBtn">
                      <span><i className={module.icon}></i> {module.menuName}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Logout />
                </li>
              </ul>
            </aside>

            <div id="content" className={sidebarOpen ? 'content-open' : 'DashboardDetails'}>
              <div className='DashboardDetailsContent'>
                <h1>Welcome to UM Module</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;