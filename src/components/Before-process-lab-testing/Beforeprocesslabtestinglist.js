import React, { useState, useEffect, useCallback } from 'react';
import '../Raw-material-inspection/Rawmaterialinspection.css'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Pagination from '../Common/Pagination/Pagination';

// import axios from 'axios';
// import Environment from "../../environment";

function Beforeprocesslabtestinglist() {

    const [loading, setLoading] = useState(false);
    const [rawMaterialData, setRawMaterialData] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setRawMaterialData(initialData);
        }, 2000);
    }, []);

    const initialData = [
        { sno: 1, clientName: 'M/s Indian Oil Corporation Limited', projectName: 'IOCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-05', testDate: '2022-05-01', timing: '10:00 AM', testing: 'Test 1', status: 'R' },
        { sno: 2, clientName: 'M/s Gail India Limited', projectName: 'GAIL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-09', testDate: '2022-09-15', timing: '11:30 AM', testing: 'Test 2', status: 'A' },
        { sno: 3, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'HPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-07', testDate: '2023-07-20', timing: '09:00 AM', testing: 'Test 3', status: 'P', pending: 'QC' },
        { sno: 4, clientName: 'M/s Indian Oil Corporation Limited', projectName: 'BPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2024-01', testDate: '2024-01-01', timing: '02:00 PM', testing: 'Test 4', status: 'P', pending: 'QC' },
        { sno: 5, clientName: 'M/s Gail India Limited', projectName: 'IOCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-06', testDate: '2023-06-15', timing: '10:45 AM', testing: 'Test 5', status: 'A' },
        { sno: 6, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'GAIL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-07', testDate: '2022-07-20', timing: '01:15 PM', testing: 'Test 6', status: 'D' },
        { sno: 7, clientName: 'M/s Indian Oil Corporation Limited', projectName: 'HPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-11', testDate: '2022-11-01', timing: '09:30 AM', testing: 'Test 7', status: 'D', pending: 'QA' },
        { sno: 8, clientName: 'M/s Gail India Limited', projectName: 'BPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-02', testDate: '2023-02-15', timing: '12:00 PM', testing: 'Test 8', status: 'P', pending: 'TPI' },
        { sno: 9, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'IOCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-07', testDate: '2023-07-20', timing: '11:00 AM', testing: 'Test 9', status: 'R' },
        { sno: 10, clientName: 'M/s Gail India Limited', projectName: 'GAIL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-06', testDate: '04.11.2023', timing: '11:11 pm', testing: 'Test 10', status: 'R' },
        { sno: 11, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'HPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-07', testDate: '04.11.2023', timing: '01:25 pm', testing: 'Test 11', status: 'D' },
        { sno: 12, clientName: 'M/s Bharat Petroleum Corporation Limited', projectName: 'BPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-08', testDate: '05.11.2023', timing: '12:56 pm', testing: 'Test 12', status: 'A' },
    ];

    const filterData = useCallback(() => {
        let filteredData = rawMaterialData.filter(item => {
            const reportDate = new Date(item.testDate);
            const startDate = fromDate ? new Date(fromDate) : null;
            const endDate = toDate ? new Date(toDate) : null;

            return (
                (!startDate || reportDate >= startDate) &&
                (!endDate || reportDate <= endDate)
            );
        });

        if (statusFilter) {
            filteredData = filteredData.filter(item => item.status === statusFilter);
        }

        return filteredData;
    }, [rawMaterialData, fromDate, toDate, statusFilter]);

    const filteredData = filterData();
    const pageSize = 10;
    const pageCount = Math.ceil(filteredData.length / pageSize);
    const displayedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const setStartDate = date => {
        setFromDate(date);
    };

    const setEndDate = date => {
        setToDate(date);
    };

    const resetFilter = () => {
        setFromDate('');
        setToDate('');
        setStatusFilter('');
    };

    const handleStatusFilter = status => {
        setStatusFilter(status === statusFilter ? null : status);
    };

    const handlePageClick = data => {
        setCurrentPage(data.selected);
    };

    const getRowColorClass = status => {
        switch (status) {
            case 'P': return { backgroundColor: '#fff' };
            case 'A': return { backgroundColor: '#f0f2f5' };
            case 'R': return { backgroundColor: '#ffe9eb' };
            case 'D': return { backgroundColor: '#d9f3d8' };
            default: return {};
        }
    };

    // -----------------------------------------------------------

    return (
        <>
            {
                loading ?
                    <Loading />
                    :
                    <>
                        <Header />
                        <section className='InnerHeaderPageSection'>
                            <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <ul>
                                            <li> <Link to='/dashboard'>Quality Module</Link></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li> <Link to='/inspectiontesting'> Raw Material Test & Inspection </Link> <b style={{ color: '#fff' }}></b></li>
                                            <li><h1>/ &nbsp; Before Process Lab Testing </h1></li>
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
                                            <h4>Before Process Lab Testing <span>- List page</span></h4>
                                            <div className='tableheaderflex'>
                                                <div className='tableheaderfilter'>
                                                    <span><i className="fas fa-filter"></i> Filter Test Data</span>
                                                    <label> From Date:
                                                        <DatePicker
                                                            maxDate={Date.now()}
                                                            selected={fromDate}
                                                            onChange={setStartDate}
                                                            dateFormat="dd/MMM/yyyy"
                                                            placeholderText="DD/MMM/YYYY"
                                                        />
                                                    </label>
                                                    <label> To Date:
                                                        <DatePicker
                                                            maxDate={Date.now()}
                                                            selected={toDate}
                                                            onChange={setEndDate}
                                                            dateFormat="dd/MMM/yyyy"
                                                            placeholderText="DD/MMM/YYYY"
                                                            minDate={fromDate}
                                                        />
                                                    </label>
                                                    <i class="fa fa-refresh" onClick={resetFilter}></i>
                                                </div>
                                                <div className='tableheaderAddbutton'>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                                                        <Link to='/beforeprocesslabqcofficerlist' target='_blank' className='TableQcLink'>Table for QC</Link>
                                                        <Link style={{ marginLeft: '20px' }} to='/beforeprocesslabtestingtpilist' target='_blank' className='TableQcLink'>Table for TPI</Link>
                                                    </div>
                                                    <Link style={{ float: 'right' }} to='/beforeprocesslabtesting' target='_blank'><i className="fas fa-plus"></i> Add</Link>
                                                </div>
                                            </div>
                                            <ul className='Rawmaterialinspectionlistlegend'>
                                                <li style={{ color: '#FFA100' }} onClick={() => handleStatusFilter('P')}>
                                                    <i className='fas fa-hourglass-half' style={{ color: '#FFA100' }}></i>Pending
                                                </li>
                                                <li style={{ color: '#3D7EDB' }} onClick={() => handleStatusFilter('A')}>
                                                    <i className='fas fa-check' style={{ color: '#3D7EDB' }}></i> QC Approved
                                                </li>
                                                <li style={{ color: '#34B233' }} onClick={() => handleStatusFilter('D')}>
                                                    <i className='fas fa-check-double' style={{ color: '#34B233' }}></i> QC & TPI Approved
                                                </li>
                                                <li style={{ color: '#ED2939' }} onClick={() => handleStatusFilter('R')}>
                                                    <i className='fas fa-times' style={{ color: '#ED2939' }}></i> Returned
                                                </li>
                                            </ul>
                                            <div className='table-responsive' id='custom-scroll'>
                                                <table>
                                                    <thead>
                                                        <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                            <th style={{ minWidth: '60px' }}>S No.</th>
                                                            <th style={{ minWidth: '200px' }}>Client Name</th>
                                                            <th style={{ minWidth: '100px' }}>Project Name</th>
                                                            <th style={{ minWidth: '120px' }}>Process Sheet No.</th>
                                                            <th style={{ minWidth: '100px' }}>Test Date</th>
                                                            <th style={{ minWidth: '110px' }}>Timing</th>
                                                            <th style={{ minWidth: '100px' }}>Testing</th>
                                                            <th style={{ minWidth: '90px' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {displayedData.length === 0 ? (
                                                            <tr> <td colSpan="7">No data found for the selected date range.</td> </tr>
                                                        ) : (
                                                            displayedData.map((row) => (
                                                                <tr key={row.sno} style={getRowColorClass(row.status)}>
                                                                    <td>{row.sno}</td>
                                                                    <td>{row.clientName}</td>
                                                                    <td>{row.projectName}</td>
                                                                    <td>{row.processSheet}</td>
                                                                    <td>{new Date(row.testDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '/')}</td>
                                                                    <td>{row.timing}</td>
                                                                    <td>{row.testing}</td>
                                                                    <td>
                                                                        <Link to='/rawmaterialtestreport' target='_blank'><i className="fas fa-eye"></i></Link>
                                                                        {/* <Link to='/qcofficer'> QC </Link>
                                    <Link to='/'> TPI </Link> */}

                                                                        <span>
                                                                            {row.status === 'P' && <i className="fas fa-hourglass-half" style={{ color: '#FFA100' }}></i>}
                                                                            {row.status === 'A' && <i className="fas fa-check" style={{ color: '#3D7EDB' }}></i>}
                                                                            {row.status === 'R' && <i className="fas fa-times" style={{ color: '#ED2939' }}></i>}
                                                                            {row.status === 'D' && <i className="fas fa-check-double" style={{ color: '#34B233' }}></i>}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>

                                                <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <Footer />
                    </>
            }
        </>
    )
}

export default Beforeprocesslabtestinglist;