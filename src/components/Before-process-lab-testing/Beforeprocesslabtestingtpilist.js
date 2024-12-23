import React, { useState, useEffect } from "react";
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg'
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import '../Raw-material/QCofficerlist.css';
import Loading from '../Loading';
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker';
import Pagination from '../Common/Pagination/Pagination';

function Beforeprocesslabtestingtpilist() {

    const [data, setData] = useState([
        { sno: 1, clientName: 'M/s Indian Oil Corporation Limited', projectName: 'IOCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-05', testDate: '2022-05-01', timing: '10:00 AM', testing: 'Test 1', status: 'R' },
        { sno: 2, clientName: 'M/s Gail India Limited', projectName: 'GAIL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-09', testDate: '2022-09-15', timing: '11:30 AM', testing: 'Test 2', status: 'A' },
        { sno: 3, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'HPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-07', testDate: '2023-07-20', timing: '09:00 AM', testing: 'Test 3', status: 'P', },
        { sno: 4, clientName: 'M/s Indian Oil Corporation Limited', projectName: 'BPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2024-01', testDate: '2024-01-01', timing: '02:00 PM', testing: 'Test 4', status: 'P', },
        { sno: 5, clientName: 'M/s Gail India Limited', projectName: 'IOCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-06', testDate: '2023-06-15', timing: '10:45 AM', testing: 'Test 5', status: 'A' },
        { sno: 6, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'GAIL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-07', testDate: '2022-07-20', timing: '01:15 PM', testing: 'Test 6', status: 'A' },
        { sno: 7, clientName: 'M/s Indian Oil Corporation Limited', projectName: 'HPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2022-11', testDate: '2022-11-01', timing: '09:30 AM', testing: 'Test 7', status: 'P', },
        { sno: 8, clientName: 'M/s Gail India Limited', projectName: 'BPCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-02', testDate: '2023-02-15', timing: '12:00 PM', testing: 'Test 8', status: 'P', },
        { sno: 9, clientName: 'M/s Hindusthan Petroleum Corporation Limited', projectName: 'IOCL', processSheet: 'TSL/PSC/EXT/3LPE/GAIL/MNJPL/2023-07', testDate: '2023-07-20', timing: '11:00 AM', testing: 'Test 9', status: 'R' }
    ]);

    // -----------------------------------------------------------

    const [year, setYear] = useState('');
    const [type, setType] = useState('');

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const handleTypeChange = (event) => {
        setType(event.target.value);
    };

    const shouldDisableFields = year && type;
    const ProcessSheetFields = year && type;

    // -----------------------------------------------------------
    const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);

    const handleStatusFilter = (status) => {
        setSelectedStatusFilter(status === selectedStatusFilter ? null : status);
    };

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const filterData = () => {

        const filteredData = data.filter(item => {
            const reportDate = new Date(item.testDate);
            const startDate = fromDate ? new Date(fromDate) : null;
            const endDate = toDate ? new Date(toDate) : null;

            const statusMatch = selectedStatusFilter ? item.status === selectedStatusFilter : true;
            const processSheetYear = year ? item.processSheet.includes(year) : true;
            const processSheetType = type ? item.processSheet.includes(type) : true;

            return (
                (!startDate || reportDate >= startDate) &&
                (!endDate || reportDate <= endDate) &&
                statusMatch &&
                processSheetYear &&
                processSheetType
            );
        });

        return filteredData;
    };

    const filteredData = filterData();

    const setStartDate = date => {
        setFromDate(date);
    };

    const setEndDate = date => {
        setToDate(date);
    };

    const resetFilter = () => {
        setFromDate('');
        setToDate('');
        setYear('');
        setType('');
        setSelectedStatusFilter('');
    };

    // -----------------------------------------------------------

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const pageCount = Math.ceil(filteredData.length / pageSize);

    const displayedData = filteredData.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    // -----------------------------------------------------------

    const getRowColorClass = (status) => {
        switch (status) {
            case 'P':
                return { backgroundColor: '#fff' };
            case 'A':
                return { backgroundColor: '#f0f2f5' };
            case 'R':
                return { backgroundColor: '#ffe9eb' };
            default:
                return {};
        }
    }

    // -----------------------------------------------------------

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

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
                                            <li><h1>/ &nbsp; Before Process Lab Testing </h1></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="RawMaterialReportSectionPage">
                            <div className="container">
                                <div className="row">
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <div className='RawmateriallistTables'>
                                            <h4>Before Process Lab Testing <span>- TPI List page</span></h4>
                                            <div className='tableheaderflex'>
                                                <div className='tableheaderfilter'><span><i class="fas fa-filter"></i> Filter Test Data</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', width: '80%' }}>
                                                        <div className='form-group'>
                                                            <label> From Date:
                                                                <DatePicker
                                                                    maxDate={Date.now() && toDate}
                                                                    selected={fromDate}
                                                                    onChange={setStartDate}
                                                                    dateFormat="dd/MMM/yyyy"
                                                                    placeholderText="DD/MMM/YYYY"
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className='form-group'>
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
                                                        </div>

                                                        <div className='form-group'>
                                                            <label htmlFor="">Process Sheet
                                                                <div className='ProcessSheetFlexBox'>
                                                                    <input style={{ width: '66%', cursor: 'not-allowed' }} value={ProcessSheetFields ? 'TSL/PSC/EXT/3LPE/TNGCL/' : ''} disabled={ProcessSheetFields} placeholder='Process sheet no.' readOnly />
                                                                    <select value={year} onChange={handleYearChange} >
                                                                        <option value=""> Year </option>
                                                                        <option value="2022"> 2022 </option>
                                                                        <option value="2023"> 2023 </option>
                                                                        <option value="2024"> 2024 </option>
                                                                    </select>
                                                                    <b>-</b>
                                                                    <input type="number" placeholder='No.' value={type} onChange={handleTypeChange} />
                                                                </div>
                                                            </label>

                                                        </div>
                                                        <i class="fa fa-refresh" onClick={resetFilter}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ColorPatternFlex">
                                                <span><i className="fas fa-eye"></i> View</span>
                                                <span className="Default" onClick={() => handleStatusFilter('P')} style={{ color: '#FFA100' }}><b></b> Pending</span>
                                                <span className="Approve" onClick={() => handleStatusFilter('A')} style={{ color: '#3D7EDB' }}><b></b> Approved</span>
                                                <span className="Reject" onClick={() => handleStatusFilter('R')} style={{ color: '#ED2939' }}><b></b> Returned</span>
                                            </div>
                                            <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                                <table className="QCofficerTable">
                                                    <thead>
                                                        <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                            <th style={{ minWidth: '60px' }}>S No.</th>
                                                            <th style={{ minWidth: '170px' }}>Client Name</th>
                                                            <th style={{ minWidth: '100px' }}>Project Name</th>
                                                            <th style={{ minWidth: '120px' }}>Process Sheet No.</th>
                                                            <th style={{ minWidth: '100px' }}>Test Date</th>
                                                            <th style={{ minWidth: '110px' }}>Timing</th>
                                                            <th style={{ minWidth: '100px' }}>Testing</th>
                                                            <th style={{ minWidth: '142px' }}>Action</th>
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
                                                                        <Link to={row.status === 'P' ? '/beforeprocesslabtestingtpiapproved' : '/beforeprocesslabtestingtpi'} target='_blank'>
                                                                            <i className="fas fa-eye"></i>
                                                                        </Link>
                                                                        {row.status === 'P' && (
                                                                            <Link to='/beforeprocesslabtestingtpiapproved' target='_blank' style={{ color: '#FFA100', paddingLeft: '0' }}>Pending</Link>
                                                                        )}
                                                                        {row.status === 'A' && (
                                                                            <span style={{ color: '#3D7EDB' }}>Approved</span>
                                                                        )}
                                                                        {row.status === 'R' && (
                                                                            <span style={{ color: '#ED2939' }}>Returned</span>
                                                                        )}
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
    );
}

export default Beforeprocesslabtestingtpilist;