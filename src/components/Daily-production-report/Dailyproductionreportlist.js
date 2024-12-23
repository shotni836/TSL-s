import React, { useState, useEffect } from 'react';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../Common/Pagination/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';
import { encryptData, decryptData } from '../Encrypt-decrypt';

function Dailyproductionreportlist() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const token = secureLocalStorage.getItem('token');

  const userId = secureLocalStorage.getItem("userId");
  const empId = secureLocalStorage.getItem("empId");

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [clientFilter, setClientFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetDPRDataList`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (Array.isArray(response.data)) {
        setList(response.data);
        fetchPermissions();
      } else {
        toast.error('Unexpected data format received from the API.');
      }
    } catch (error) {
      toast.error('Failed to load data: ' + error.message);
      console.error('Failed to load data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
        params: { UserId: encryptData(userId), PageId: menuId },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPermissions(response.data[0]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleViewClick = (row) => {
    navigate(`/dailyproductionreportview?&moduleId=${moduleId}&menuId=${menuId}&action=view&id=${encryptData(row.p_dpr_id)}&procsheetID=${encryptData(row.ProcsheetId)}`);
  };

  const handleFirstLevelApproval = (row) => {
    navigate(`/dailyproductionreportview?moduleId=${moduleId}&menuId=${menuId}&pm_Approve_level=first&id=${encryptData(row.p_dpr_id)}&procsheetID=${encryptData(row.ProcsheetId)}`);
  };

  const handleSecondLevelApproval = (row) => {
    navigate(`/dailyproductionreportview?moduleId=${moduleId}&menuId=${menuId}&pm_Approve_level=second&id=${encryptData(row.p_dpr_id)}&procsheetID=${encryptData(row.ProcsheetId)}`);
  };

  const handleEdit = (row) => {
    navigate(`/dailyproductionreport?moduleId=${moduleId}&menuId=${menuId}&action=edit&id=${encryptData(row.p_dpr_id)}&procsheetID=${encryptData(row.ProcsheetId)}`);
  };

  const getUniqueOptions = (data, key) => {
    return [...new Set(data.map(item => item[key]))];
  };

  const renderDropdownFilters = () => {
    const uniqueClients = getUniqueOptions(list, 'ClientName');

    return (
      <>
        <div className="form-group">
          <label>Client</label>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueClients.map((client, index) => (
              <option key={index} value={client}>{client}</option>
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
    setClientFilter('');
    setSearchText('');
  };

  const filteredList = list.filter(item => {
    const date = new Date(item.ImportDate);
    const processSheetNo = item.ProcsheetNo.split('/').slice(-1).join('/')
    return (!fromDate || date >= fromDate) &&
      (!toDate || date <= toDate) &&
      (!clientFilter || item.ClientName === clientFilter) &&
      (!searchText || processSheetNo.includes(searchText))
  });

  const displayData = filteredList.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const pageCount = Math.ceil(filteredList.length / pageSize);

  const handlePageClick = data => {
    setCurrentPage(data.selected);
  };

  return (
    <>
      {loading ? <Loading /> :
        <>
          <Header />
          <section className='InnerHeaderPageSection'>
            <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <ul>
                    <li><Link to={`/ppcdashboard?moduleId=${moduleId}`}>PPC Module</Link></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li><h1>Daily Production Report List</h1></li>
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
                          <div className='tableheaderDate'>
                            <label htmlFor="">Search Process Sheet No.</label>
                            <input
                              type="text"
                              placeholder="Search by Process Sheet No."
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                            />
                          </div>
                          {renderDropdownFilters()}
                        </form>
                      </div>
                      {/* <div className='tableheaderAddbutton'>
                        {permissions?.createPerm === "1" && <Link to={`/dailyproductionreport?menuId=${menuId}`} style={{ float: 'right' }}>
                          <i className="fas fa-plus"></i> Add
                        </Link>}
                      </div> */}
                    </div>
                    <ul className='Rawmaterialinspectionlistlegend'>
                      <li><i className="fas fa-eye" style={{ color: "#4caf50" }}></i> View</li>
                      <li><i className="fas fa-edit" style={{ color: "#ff9800" }}></i> Edit</li>
                      <li><i className="fas fa-check" style={{ color: "#4caf50" }}></i> Single Level Approval</li>
                      <li><i className="fas fa-check-double" style={{ color: "#4caf50" }} ></i>Double level Approval</li>
                    </ul>
                    <div className='table-responsive' id='custom-scroll'>
                      <table>
                        <thead>
                          <tr style={{ background: 'rgb(90, 36, 90)' }}>
                            <th style={{ minWidth: '70px' }}>Sr. No.</th>
                            <th style={{ minWidth: '140px' }}>Process Sheet No</th>
                            <th style={{ minWidth: '130px' }}>Client Name</th>
                            <th style={{ minWidth: '130px' }}>Project Name</th>
                            <th style={{ minWidth: '100px' }}>Date</th>
                            <th style={{ minWidth: '60px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayData.length === 0 ? (
                            <tr><td colSpan="6">Data not available.</td></tr>
                          ) : (
                            displayData.map((row, index) => (
                              <tr key={index}>
                                <td>{currentPage * pageSize + index + 1}</td>
                                <td>{row.ProcsheetNo.split('/').slice(-2).join('/')}</td>
                                <td>{row.ClientName}</td>
                                <td>{row.ProjectName}</td>
                                <td>{new Date(row.ImportDate).toLocaleDateString('en-GB').replace(/\//g, "-")}</td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    {permissions?.indexPerm === "1" && (
                                      <i className="fas fa-eye" onClick={() => handleViewClick(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.firstLevelApprove === "1" && row.IsShowForFirstLevelApproval === 1 && (
                                      <i className="fas fa-check" onClick={() => handleFirstLevelApproval(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.secondLevelApprove === "1" && row.IsShowForSecondLevelApproval === 1 && (
                                      <i className="fas fa-check" onClick={() => handleSecondLevelApproval(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.editPerm === "1" && (
                                      <i className="fas fa-edit" onClick={() => handleEdit(row)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                    )}
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

export default Dailyproductionreportlist;