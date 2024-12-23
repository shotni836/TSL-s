import React, { useState, useEffect } from 'react';
import Header from '../../Common/Header/Header';
import Footer from '../../Common/Footer/Footer';
import Loading from '../../Loading';
import InnerHeaderPageSection from "../../../components/Common/Header-content/Header-content";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Environment from "../../../environment";
import axios from 'axios';
import secureLocalStorage from "react-secure-storage";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import Pagination from '../../Common/Pagination/Pagination';
import RegisterEmployeebg from '../../../assets/images/RegisterEmployeebg.jpg';
import { encryptData } from '../../Encrypt-decrypt';

function NcList() {
    const token = secureLocalStorage.getItem('token')
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = secureLocalStorage.getItem("userId");
    const empId = secureLocalStorage.getItem("empId");
    const moduleId = queryParams.get('moduleId');
    const menuId = queryParams.get('menuId');

    const [loading, setLoading] = useState(true);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [toDate, setToDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [clientFilter, setClientFilter] = useState('');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        getList();
    }, []);

    const getList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetNCDataList?userid=${encryptData(userId)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setRawMaterials(response.data);
            if (response.data) {
                fetchPermissions();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
                params: { UserId: encryptData(userId), PageId: menuId },
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setPermissions(response.data[0]);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleViewClick = (row) => {
        navigate(`/nc-report?moduleId=${moduleId}&menuId=${menuId}&action=edit&id=${encryptData(row.pm_nc_run_id)}&processSheetId=${encryptData(row.procsheet_id)}`, '_blank');
    };
    const handleEdit = (row) => {
        navigate(`/nc-add?moduleId=${moduleId}&menuId=${menuId}&action=edit&id=${encryptData(row.pm_nc_run_id)}&processSheetId=${encryptData(row.procsheet_id)}`, '_blank');
    };

    const onApproveClick = (row) => {
        navigate(`/nc-report?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(row.pm_nc_run_id)}&processSheetId=${encryptData(row.procsheet_id)}&project_id=${encryptData(row.project_id)}&ViewType=first`);
    }

    const onSecondApproveClick = (row) => {
        navigate(`/nc-report?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(row.pm_nc_run_id)}&processSheetId=${encryptData(row.procsheet_id)}&project_id=${encryptData(row.project_id)}&ViewType=second`);
    };

    // const handleEdit = (row) => {
    //     navigate(`/edittallytagmapping?tallySheetId=${row.tallySheetId}`);
    // };

    const getUniqueOptions = (data, key) => {
        return [...new Set(data.map(item => item[key]))];
    };

    const renderDropdownFilters = () => {
        const uniqueClients = getUniqueOptions(rawMaterials, 'clientname');

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

    const filteredRawMaterials = rawMaterials.filter(item => {
        const inspectionDate = new Date(item.test_date);
        return (!fromDate || inspectionDate >= fromDate) &&
            (!toDate || inspectionDate <= toDate) &&
            (!clientFilter || item.clientname === clientFilter) &&
            (!searchText || item.pm_procsheet_code.toLowerCase().includes(searchText.toLowerCase()))
    });

    const displayData = filteredRawMaterials.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const pageCount = Math.ceil(filteredRawMaterials.length / pageSize);

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
                                        <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                        <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                        <li><h1>Process Data Entry List</h1> <b style={{ color: '#fff' }}></b></li>
                                        {/* <li> <Link to={`/blastingsheetlist?moduleId=${moduleId}&menuId=${menuId}`}>Process Data Entry List</Link> <b style={{ color: '#fff' }}></b></li> */}
                                        <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                        <li><h1>NC Report List </h1></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className='TallytagmappinglistPageSection'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    <div className='TallytagmappinglistTables'>
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
                                            {/* <div className='tableheaderAddbutton'>
                                                {(
                                                    <Link to={`/nc-add`} target='_blank'>
                                                        <i className="fas fa-plus"></i> Add
                                                    </Link>
                                                )}
                                            </div> */}
                                        </div>
                                        <div className="fadedIcon">
                                            <div className='ProcessSheetNoBox'>
                                                <label htmlFor="">Search Process Sheet No.</label>
                                                <input
                                                    type="text"
                                                    placeholder="Search by Process Sheet No."
                                                    value={searchText}
                                                    onChange={(e) => setSearchText(e.target.value)}
                                                />
                                            </div>
                                            <ul className='Rawmaterialinspectionlistlegend'>
                                                <li><i className="fas fa-eye" style={{ color: "#4caf50" }}></i> View</li>
                                                <li><i className="fas fa-edit" style={{ color: "#ff9800" }}></i> Edit</li>
                                                <li><i className="fas fa-trash-alt" style={{ color: "#ff5252" }} ></i>Delete</li>
                                            </ul>
                                        </div>
                                        <div className='table-responsive' id='custom-scroll'>
                                            <table>
                                                <thead>
                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                        <th style={{ minWidth: '60px' }}>Sr. No.</th>
                                                        <th style={{ minWidth: '130px' }}>Process Sheet No.</th>
                                                        <th style={{ minWidth: '130px' }}>Client Name</th>
                                                        <th style={{ minWidth: '50px' }}>Project Name</th>
                                                        <th style={{ minWidth: '80px' }}>Date</th>
                                                        <th style={{ minWidth: '90px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayData.length === 0 ? (
                                                        <tr><td colSpan="6">Data not available.</td></tr>
                                                    ) : (
                                                        displayData.map((row, index) => (
                                                            <tr key={index}>
                                                                <td>{currentPage * pageSize + index + 1}</td>
                                                                <td>{row.pm_procsheet_code}</td>
                                                                <td>{row.clientname}</td>
                                                                <td>{row.project_name}</td>
                                                                <td>{new Date(row.reject_date).toLocaleDateString('en-GB')}</td>
                                                                <td>
                                                                    <div style={{ display: 'flex' }}>
                                                                        {permissions?.indexPerm === "1" && (
                                                                            <i className="fas fa-eye" onClick={() => handleViewClick(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.editPerm === "1" && row.pm_isfinalapproval != 1 && (
                                                                            <i className="fas fa-edit" onClick={() => handleEdit(row)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {(permissions?.firstLevelApprove === '1' && row.Approval_status == 1 && row.pm_isfinalapproval != 1) ? (
                                                                            <i
                                                                                className="fas fa-check"
                                                                                title="Approve"
                                                                                onClick={() => onApproveClick(row)}
                                                                                style={{ color: "#4CAF50", margin: "4px" }}
                                                                            ></i>) : null}
                                                                        {(permissions?.secondLevelApprove === '1' && row.Approval_status == 2 && row.pm_isfinalapproval != 1) ? (
                                                                            <i
                                                                                className="fas fa-check-double"
                                                                                title="Approve"
                                                                                onClick={() => onSecondApproveClick(row)}
                                                                                style={{ color: "#4CAF50", margin: "4px" }}
                                                                            ></i>
                                                                        ) : null}
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

export default NcList;