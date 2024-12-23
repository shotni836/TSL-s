import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import Environment from '../../environment';
import Footer from '../Common/Footer/Footer';
import Header from '../Common/Header/Header';
import Pagination from '../Common/Pagination/Pagination';
import Loading from '../Loading';
import './List.css';

function List() {
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [tableData1, setTableData1] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [ddlYear, setDdlYear] = useState([]);

    const [formData, setFormData] = useState({
        psSeqNo: '',
        psYear: '',
        testId: useParams().tstmaterialid
    });

    const location = useLocation();
    const navigate = useNavigate();
    const routePrefix = useParams();
    const itemName = location.state?.itemName || '';
    const category = location.state?.category || '';
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const MATERIAL_IDS = ["138", "141", "145", "146", "184", "192", "199", "614"];

    useEffect(() => {
        const fetchInitialData = async () => {
            if (MATERIAL_IDS.includes(routePrefix.tstmaterialid)) await getLowerData();
            else await getYear();

            setLoading(false);
        };

        fetchInitialData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFormData = () => {
        setFormData((prev) => ({
            psSeqNo: prev.psSeqNo,
            psYear: prev.psYear,
            testId: prev.testId,
            pscode: '',
            clientName: '',
            projectName: '',
            pipeSize: '',
            specification: '',
            poNo: ''
        }));
    };

    const handlePsSeqNoBlur = () => {
        if (formData.psSeqNo) {
            getUpperData();
            resetFormData();
        }
    };

    const getYear = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/getprocsheetyear`);
            const sortedYears = response.data.sort((a, b) => b.year - a.year);
            setDdlYear(sortedYears);
        } catch (error) {
            console.error('Error fetching years:', error);
        }
    };

    const getUpperData = async () => {
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/GetUpperReportist`, formData);
            setFormData((prev) => ({ ...prev, ...response.data[0] }));
        } catch (error) {
            console.error('Error fetching upper data:', error);
        }
    };

    const getLowerData = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetLowerRawMaterialReportist`, {
                params: { MaterialId: routePrefix.tstmaterialid }
            });
            setTableData1(response.data);
            setShowTable(false);
        } catch (error) {
            console.error('Error fetching lower data:', error);
        }
    };

    const handleViewButtonClick = async () => {
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/GetLowerReportist`, {
                projectId: formData.projectId,
                testId: routePrefix.tstmaterialid
            });
            setTableData(response.data);
            setShowTable(true);
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    const handleEyeIconClick = (_reportNo, index) => {
        navigate(`/${routePrefix.routePrefix}/${routePrefix.tstmaterialid}&${index}`);
    };

    const pageCount = Math.ceil(tableData.length / pageSize);

    const displayedData = tableData.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const pageCount1 = Math.ceil(tableData1.length / pageSize);

    const displayedData1 = tableData1.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    const InnerHeader = () => (
        <section className='InnerHeaderPageSection'>
            <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className='container'>
                <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12'>
                        <ul>
                            <li> <Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                            <li> <Link to={`/reportlist?menuId=25`}> Reports List </Link> <b style={{ color: '#fff' }}></b></li>
                            <li><h1>/ &nbsp; {category}</h1></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );

    if (!["138", "141", "145", "146", "184", "192", "199", "614"].includes(routePrefix.tstmaterialid)) {
        return (
            <>
                {loading ? <Loading /> : (
                    <>
                        <Header />
                        {InnerHeader()}
                        <section className='ReportsPageSection'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <div className='ReportsTableDetails'>
                                            <h4>{itemName}</h4>
                                            <form className='row m-0'>
                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor="">Process Sheet</label>
                                                        <div className='ProcessSheetFlexBox'>
                                                            <input
                                                                name="processSheet"
                                                                placeholder='Process sheet'
                                                                value={formData.pscode || ''}
                                                                onChange={handleInputChange}
                                                                style={{ width: '66%', cursor: 'not-allowed' }}
                                                            />
                                                            <select name="psYear" value={formData.psYear} onChange={handleInputChange} >
                                                                <option value=""> Year </option>
                                                                {ddlYear.map((yearOption, i) => (
                                                                    <option key={i} value={yearOption.year}> {yearOption.year} </option>
                                                                ))}
                                                            </select>
                                                            <b>-</b>
                                                            <input
                                                                type="number"
                                                                name="psSeqNo"
                                                                value={formData.psSeqNo}
                                                                onChange={handleInputChange}
                                                                placeholder='No.'
                                                                onBlur={handlePsSeqNoBlur}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {['clientName', 'projectName', 'pipeSize', 'specification', 'poNo'].map((field, index) => (
                                                    <div key={index} className='col-md-4 col-sm-4 col-xs-12'>
                                                        <div className='form-group'>
                                                            <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                                                            <input
                                                                name={field}
                                                                placeholder={field}
                                                                value={formData[field] || ''}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                    <div className='ShowtableBox'>
                                                        <button type='button' onClick={handleViewButtonClick}>View</button>
                                                    </div>
                                                </div>
                                            </form>
                                            {showTable && (
                                                <>
                                                    <div style={{ overflowX: 'auto' }} id="custom-scroll">
                                                        <table>
                                                            <thead>
                                                                <tr style={{ background: "#5A245A" }}>
                                                                    <th style={{ minWidth: '20px' }}>S No.</th>
                                                                    <th style={{ minWidth: '220px' }}>Project Name</th>
                                                                    <th style={{ minWidth: '120px' }}>Test Type</th>
                                                                    <th style={{ minWidth: '120px' }}>Report No.</th>
                                                                    <th style={{ minWidth: '120px' }}>Test Date</th>
                                                                    <th style={{ minWidth: '20px' }}>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {displayedData.length === 0 ? (
                                                                    <tr> <td colSpan="6">No record found.</td></tr>
                                                                ) : (
                                                                    displayedData.map((item, index) => (
                                                                        <tr key={index}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{item.projectName || '-'}</td>
                                                                            <td>{item.testType || '-'}</td>
                                                                            <td>{item.testReportNo || '-'}</td>
                                                                            <td>{new Date(item.testDate).toLocaleDateString('en-GB') || '-'}</td>
                                                                            <td>
                                                                                <i className='fa fa-eye' style={{ color: '#34B233', cursor: 'pointer' }}
                                                                                    onClick={() => handleEyeIconClick(item.reportNo, item.projecttestidno)}></i>
                                                                            </td>
                                                                        </tr>
                                                                    )))}
                                                            </tbody>
                                                        </table>

                                                    </div>
                                                    <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <Footer />
                    </>
                )}
            </>
        );
    }

    return (
        <>
            {loading ? <Loading /> : (
                <>
                    <Header />
                    {InnerHeader()}
                    <section className='ReportsPageSection'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    <div className='ReportsTableDetails'>
                                        <h4>{itemName}</h4>
                                        <div style={{ overflowX: 'auto' }} id="custom-scroll">
                                            <table>
                                                <thead>
                                                    <tr style={{ background: "#5A245A" }}>
                                                        <th style={{ minWidth: '20px' }}>S No.</th>
                                                        <th style={{ minWidth: '220px' }}>Client Name</th>
                                                        <th style={{ minWidth: '120px' }}>Material Description</th>
                                                        <th style={{ minWidth: '120px' }}>Report No.</th>
                                                        <th style={{ minWidth: '120px' }}>Test Date</th>
                                                        <th style={{ minWidth: '20px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayedData1.length === 0 ? (
                                                        <tr> <td colSpan="6">No record found.</td></tr>
                                                    ) : (
                                                        displayedData1.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.clientName || '-'}</td>
                                                                <td>{item.materialDescription || '-'}</td>
                                                                <td>{item.reportNo || '-'}</td>
                                                                <td>{new Date(item.inspectionDate).toLocaleDateString('en-GB') || '-'}</td>
                                                                <td>
                                                                    <i className='fa fa-eye' style={{ color: '#34B233', cursor: 'pointer' }}
                                                                        onClick={() => handleEyeIconClick(item.reportNo, item.srNo)}></i>
                                                                </td>
                                                            </tr>
                                                        )))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Pagination pageCount={pageCount1} onPageChange={handlePageClick} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </>
            )}
        </>
    );
}

export default List;