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
import 'react-confirm-alert/src/react-confirm-alert.css';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';

function Packinglist() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const menuId = searchParams.get('menuId');
    const userId = secureLocalStorage.getItem("userId");
    const userRole = secureLocalStorage.getItem("userRole");

    const [loading, setLoading] = useState(true);
    const [dataList, setDataList] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [toDate, setToDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [clientFilter, setClientFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPackinglistdetails?userid=${userId}&rtype=1`);
            if (Array.isArray(response.data)) {
                setDataList(response?.data);
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
                params: { UserId: userId, PageId: menuId }
            });
            setPermissions(response.data[0]);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleViewClick = (row) => {
        navigate(`/packingreport?id=${row.pm_cprl_run_id}&pm_Approve_level=view&pm_processSheet_id=${row.procsheet_id}&menuId=${menuId}`, '_blank');
    };

    const handleEditOrder = (row) => {
        navigate(`/packingreport?id=${row.pm_cprl_run_id}&pm_Approve_level=editOrder&pm_processSheet_id=${row.procsheet_id}&menuId=${menuId}`, '_blank');
    }

    const handleEdit = (row) => {
        navigate(`/packing?action=edit&run_id=${row.pm_cprl_run_id}&pm_processSheet_id=${row.procsheet_id}&menuId=${menuId}`, '_blank');
    };

    const handleHod = (row) => {
        navigate(`/packingreport?id=${row.pm_cprl_run_id}&pm_Approve_level=hod&pm_processSheet_id=${row.procsheet_id}&menuId=${menuId}`, '_blank');
    };

    const handleFirstLevel = (row) => {
        navigate(`/packingreport?id=${row.pm_cprl_run_id}&pm_Approve_level=first&pm_processSheet_id=${row.procsheet_id}&menuId=${menuId}`, '_blank');
    };

    const handleSecondLevel = (row) => {
        navigate(`/packingreport?id=${row.pm_cprl_run_id}&pm_Approve_level=second&pm_processSheet_id=${row.procsheet_id}&menuId=${menuId}`, '_blank');
    };

    const getUniqueOptions = (data, key) => {
        return [...new Set(data.map(item => item[key]))];
    };

    const renderDropdownFilters = () => {
        const uniqueClients = getUniqueOptions(dataList, 'clientname');

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
    };

    const filteredDataList = dataList.filter(item => {
        const assignDate = new Date(item.release_date);
        return (!fromDate || assignDate >= fromDate) &&
            (!toDate || assignDate <= toDate) &&
            (!clientFilter || item.clientname === clientFilter);
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
                                        <li><Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                                        <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                        <li> <Link to={`/qa?menuId=${menuId}`}> QA </Link> <b style={{ color: '#fff' }}></b></li>
                                        <li><h1>/&nbsp; Packing List </h1></li>
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
                                                <Link to={`/packing?menuId=${menuId}`} style={{ float: 'right' }}>
                                                    <i className="fas fa-plus"></i> Add
                                                </Link>
                                            </div>
                                        </div>
                                        <ul className='Rawmaterialinspectionlistlegend'>
                                            <li><i className="fas fa-eye" style={{ color: "#4caf50" }}></i> View</li>
                                            <li><i className="fas fa-edit" style={{ color: "#ff9800" }}></i> Edit</li>
                                            <li><i className="fas fa-edit" style={{ color: "#d90f0f" }}></i> Edit Order</li>
                                            <li><i className="fas fa-check" style={{ color: "#4caf50" }}></i> Single Level Approval</li>
                                            <li><i className="fas fa-double" style={{ color: "#4caf50" }}></i> Second Level Approval</li>
                                        </ul>
                                        <div className='table-responsive' id='custom-scroll'>
                                            <table>
                                                <thead>
                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                        <th style={{ minWidth: '65px' }}>Sr. No.</th>
                                                        <th style={{ minWidth: '120px' }}>Process Sheet No.</th>
                                                        <th style={{ minWidth: '150px' }}>CPR No.</th>
                                                        <th style={{ minWidth: '110px' }}>Release Date</th>
                                                        <th style={{ minWidth: '250px' }}>Client Name</th>
                                                        <th style={{ minWidth: '250px' }}>Project Name</th>
                                                        <th style={{ minWidth: '60px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayData.length === 0 ? (
                                                        <tr><td colSpan="7">No data available.</td></tr>
                                                    ) : (
                                                        displayData.map((row, index) => (
                                                            <tr key={index}>
                                                                <td>{currentPage * pageSize + index + 1}</td>
                                                                <td>{row.pm_procsheet_code.split('/').slice(-2).join('/')}</td>
                                                                <td>{row.CPR_no}</td>
                                                                <td>{new Date(row.release_date).toLocaleDateString('en-GB').replace(/\//g, "-")}</td>
                                                                <td>{row.clientname}</td>
                                                                <td>{row.project_name}</td>
                                                                <td>
                                                                    <div style={{ display: 'flex' }}>
                                                                        {permissions?.indexPerm === "1" && (
                                                                            <i className="fas fa-eye" onClick={() => handleViewClick(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.editPerm === "1" && row.IsSubmitted === 1 && (
                                                                            <i className="fas fa-edit" onClick={() => handleEdit(row)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.editPerm === "1" && (
                                                                            <i className="fas fa-edit" onClick={() => handleEditOrder(row)} style={{ color: "#d90f0f", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.firstLevelApprove === "1" && row.IsapprovedByHOD === 0 && (
                                                                            <i className="fas fa-check" onClick={() => handleHod(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.firstLevelApprove === "1" && row.IsShowForFirstLevelApproval === 1 && row.IsapprovedByHOD === 1 && (
                                                                            <i className="fas fa-check-double" onClick={() => handleFirstLevel(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.secondLevelApprove === "1" && row.IsShowForSecondLevelApproval === 1 && row.IsapprovedByHOD === 1 && (
                                                                            <i className="fas fa-check-circle" onClick={() => handleSecondLevel(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
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

export default Packinglist;