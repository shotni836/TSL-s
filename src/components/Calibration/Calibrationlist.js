import React, { useState, useEffect } from 'react';
import './Calibration.css'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from "../../environment";
import Pagination from '../Common/Pagination/Pagination';
import secureLocalStorage from 'react-secure-storage';
import { encryptData } from '../Encrypt-decrypt';

function Calibrationlist() {
  const token = secureLocalStorage.getItem('token')
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const userId = secureLocalStorage.getItem("userId");
  const empId = secureLocalStorage.getItem("empId");
  const userRole = secureLocalStorage.getItem("userRole");

  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
        params: { UserId: encryptData(userId), PageId: menuId },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setPermissions(response1.data[0]);

      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCalibrationData`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setDataList(response?.data);

    } catch (error) {
      toast.error('Failed to load data: ' + error.message);
      console.error('Failed to load data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (row) => {
    navigate(`/calibrationview?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(row.calib_id)}&pm_Approve_level=view`, '_blank');
  };

  const handleEdit = (row) => {
    navigate(`/Calibration?moduleId=${moduleId}&menuId=${menuId}&action=edit&id=${encryptData(row.calib_id)}`, '_blank');
  };

  const handleFirstLevel = (row) => {
    navigate(`/calibrationview?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(row.calib_id)}&pm_Approve_level=first`, '_blank');
  };

  const handleSecondLevel = (row) => {
    navigate(`/calibrationview?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(row.calib_id)}&pm_Approve_level=second`, '_blank');
  };

  const getUniqueOptions = (data, key) => {
    return [...new Set(data.map(item => item[key]))];
  };

  const renderDropdownFilters = () => {
    // const uniqueManufacturer = getUniqueOptions(dataList, 'pm_manufacturer');
    const uniqueLocation = getUniqueOptions(dataList, 'pm_location');
    const uniqueType = getUniqueOptions(dataList, 'pm_type');

    return (
      <>
        {/* <div className="form-group">
          <label>Manufacturer</label>
          <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueManufacturer.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div> */}
        <div className="form-group">
          <label>Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueType.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueLocation.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <i className="fa fa-refresh" onClick={resetFilters}></i>
      </>
    );
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    // setManufacturerFilter('');
    setLocationFilter('');
    setTypeFilter('');
  };

  const filteredDataList = dataList.filter(item => {
    const assignDate = new Date(item.assign_date);
    return (!fromDate || assignDate >= fromDate) &&
      (!toDate || assignDate <= toDate) &&
      // (!manufacturerFilter || item.pm_manufacturer === manufacturerFilter) &&
      (!locationFilter || item.pm_location === locationFilter) &&
      (!typeFilter || item.pm_type === typeFilter);
  });

  const displayData = filteredDataList.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const pageCount = Math.ceil(filteredDataList.length / pageSize);

  const handlePageClick = data => {
    setCurrentPage(data.selected);
  };

  return (
    <>
      {loading ? <Loading /> :
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                    <li><h1>/&nbsp; Calibration List </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className='RawmateriallistPageSection'>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <div className='RawmateriallistTables'>
                    <span><i className="fas fa-filter"></i> Filter</span>
                    <div className='tableheaderflex'>
                      <div className="tableheaderfilter">
                        <form className="DateFilterBox">
                          <div className="form-group">
                            <label>From Date</label>
                            <DatePicker
                              maxDate={new Date()}
                              selected={fromDate}
                              onChange={(date) => setFromDate(date)}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="DD-MM-YYYY"
                            />
                          </div>
                          <div className="form-group">
                            <label>To Date</label>
                            <DatePicker
                              maxDate={new Date()}
                              selected={toDate}
                              onChange={(date) => setToDate(date)}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="DD-MM-YYYY"
                            />
                          </div>
                          {renderDropdownFilters()}
                        </form>
                      </div>
                      <div className='tableheaderAddbutton'>
                        <Link to={`/Calibration?moduleId=${moduleId}&menuId=${menuId}`} style={{ float: 'right' }}>
                          <i className="fas fa-plus"></i> Add
                        </Link>
                      </div>
                    </div>
                    <ul className='Rawmaterialinspectionlistlegend'>
                      <div className='DownloadExcelFlexBox'>
                        <li><i className="fas fa-eye" style={{ color: "#4caf50" }}></i> View</li>
                        <li><i className="fas fa-edit" style={{ color: "#ff9800" }}></i> Edit</li>
                        <li><i className="fas fa-dot-circle" style={{ color: "#4caf50" }}></i> Recalibration</li>
                        <li><i className="fas fa-check" style={{ color: "#4caf50" }} ></i>Single level Approval</li>
                        <li><i className="fas fa-check-double" style={{ color: "#4caf50" }} ></i>Double level Approval</li>
                        {/* <a href="/assets/excel-files/calibration-list.xlsx" download><button className='DownloadExcelBtn'>Download Excel</button></a> */}
                      </div>
                    </ul>
                    <div className='table-responsive' id='custom-scroll'>
                      <table>
                        <thead>
                          <tr style={{ background: 'rgb(90, 36, 90)' }}>
                            <th style={{ minWidth: '70px' }}>Sr. No.</th>
                            <th style={{ minWidth: '150px' }}>Manufacturer</th>
                            <th style={{ minWidth: '150px' }}>Type</th>
                            <th style={{ minWidth: '150px' }}>Serial No.</th>
                            <th style={{ minWidth: '150px' }}>Location</th>
                            <th style={{ minWidth: '110px' }}>Date</th>
                            <th style={{ minWidth: '110px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayData.length === 0 ? (
                            <tr><td colSpan="7">Data not available.</td></tr>
                          ) : (
                            displayData.map((row, index) => (
                              <tr key={index}>
                                <td>{currentPage * pageSize + index + 1}</td>
                                <td>{row.pm_manufacturer}</td>
                                <td>{row.pm_type}</td>
                                <td>{row.calib_ser_no}</td>
                                <td>{row.pm_location}</td>
                                <td>{new Date(row.created_on).toLocaleDateString('en-GB').replace(/\//g, "-")}</td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    {/* {permissions?.indexPerm === "1" && (
                                      <i className="fas fa-eye" onClick={() => handleViewClick(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )} */}
                                    {permissions?.editPerm === "1" && (
                                      <i className="fas fa-edit" onClick={() => handleEdit(row)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.firstLevelApprove === "1" && row.IsShowForFirstLevelApproval === 1 && (
                                      <i className="fas fa-check" onClick={() => handleFirstLevel(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.secondLevelApprove === "1" && row.IsShowForSecondLevelApproval === 1 && (
                                      <i className="fas fa-check-double" onClick={() => handleSecondLevel(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {/* <div className="form-check form-switch">
                                      <input className="form-check-input" type="checkbox" checked={row.pm_status === "Active"} />
                                    </div> */}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      }
    </>
  );
}

export default Calibrationlist;