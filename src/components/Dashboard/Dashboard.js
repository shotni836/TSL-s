import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TATASteelLogoWhite from '../../assets/images/TATA-SteelLogoWhite.png';
import './Dashboard.css';
import HeaderProfile from '../../components/Common/Header-profile/HeaderProfile';
import Logout from '../Login/Logout';
import axios from 'axios';
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";
import Skeleton from 'react-loading-skeleton';
import { encryptData } from '../Encrypt-decrypt';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(() => JSON.parse(secureLocalStorage.getItem('sidebarOpen')) || false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [openMenus, setOpenMenus] = useState(() => JSON.parse(secureLocalStorage.getItem('openMenus')) || { level1: null, level2: null });
  const userId = secureLocalStorage.getItem('userId');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const token = secureLocalStorage.getItem('token');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/Get_MenuBindByRoleWiseNew?UserId=${encryptData(userId)}&ModuleId=${moduleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setPermissions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, moduleId]);

  useEffect(() => {
    secureLocalStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    secureLocalStorage.setItem('openMenus', JSON.stringify(openMenus));
  }, [openMenus]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = (menuId, level) => {
    setOpenMenus(prevState => {
      const newState = { ...prevState };
      if (level === 1) {
        // Close other level 1 menus
        newState.level1 = newState.level1 === menuId ? null : menuId;
        // Close level 2 menus if level 1 menu is closed
        if (newState.level1 === null) {
          newState.level2 = null;
        }
      } else if (level === 2) {
        // Close the specific level 2 menu or toggle it
        newState.level2 = newState.level2 === menuId ? null : menuId;
      }
      return newState;
    });
  };

  const renderMenu = (menu, level = 1) => {
    const hasSubmenus = menu.menuSubetails && menu.menuSubetails.length > 0;
    const isActive = level === 1 ? openMenus.level1 === menu.menuId : openMenus.level2 === menu.menuId;
    const isModuleLink = menu.menuName === "Module";

    return (
      <li key={menu.menuId}>
        {menu.link ? (
          <Link to={isModuleLink ? `${menu.link}` : `${menu.link}?moduleId=${(moduleId)}&menuId=${(encryptData(menu.menuId))}`} className="RegisterEmployeeBtn">
            <span>{menu.icon && <i className={menu.icon}></i>} {menu.menuName} </span>
          </Link>
        ) : (
          <div onClick={() => toggleMenu(menu.menuId, level)} className="collapsible-menu RegisterEmployeeBtn" style={{ marginBottom: '0' }}>
            <span>{menu.icon && <i className={menu.icon}></i>}{menu.menuName}</span>
            {hasSubmenus && <i className={`fas fa-chevron-${isActive ? 'up' : 'down'}`}></i>}
          </div>
        )}
        {hasSubmenus && isActive && (
          <ul className="submenu">
            {menu.menuSubetails.map(subMenu => renderMenu(subMenu, level + 1))}
          </ul>
        )}
      </li>
    );
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
              <ul className='SIdebarsubmenuUl'>
                <Skeleton count={3} height={40} style={{ marginBottom: '10px' }} />
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
              <ul id='custom-scroll' className='SIdebarsubmenuUl'>
                {permissions.map(menu => renderMenu(menu))}
                <li style={{ marginTop: '20px' }}>
                  <Logout />
                </li>
              </ul>
            </aside>

            <div id="content" className={sidebarOpen ? 'content-open' : 'DashboardDetails'}>
              <div className='DashboardDetailsContent'>
                <h1>Welcome to Quality Module</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;