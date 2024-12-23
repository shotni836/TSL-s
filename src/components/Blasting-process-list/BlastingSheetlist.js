import React, { useState, useEffect, useRef, useCallback } from "react";
import "./BlastingSheetlist.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from "../Loading";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from 'react-datepicker';
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";
import Pagination from '../Common/Pagination/Pagination';
import { toast } from 'react-toastify';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

function BlastingSheetlist() {
    const [tableData, setTableData] = useState([]);
    const [calibrationList, setCalibrationList] = useState([]);
    const [dustlevelList, setDustlevelList] = useState([]);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coatingType, setCoatingType] = useState([]);
    const [list, setList] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [processTypeMap, setProcessTypeMap] = useState({});
    const [processTypeName, setProcessTypeName] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = secureLocalStorage.getItem('userId');
    const userRole = secureLocalStorage.getItem('userRole');
    const menuId = queryParams.get('menuId');
    const [data, setData] = useState([])
    const [reportName, setReportName] = useState()
    const [reportPath, setReportPath] = useState()
    const [currentId, setCurrentId] = useState(null);
    const [coatingTypeFilter, setCoatingTypeFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');

    const typeWise = () => {
        const typeMap = { "21": 523, "15": 524, "16": 525, "22": 526, "33": 528, "24": 1398, "25": 1399, "26": 1400 };
        return typeMap[menuId] || 528888;
    };

    const redirectTo = menuId == 21 ? "Inlet" : menuId == 15 ? "Blasting" : ""

    const menuLinks = [
        { id: "21", label: "Inlet", name: "Inlet" },
        { id: "15", label: "Blasting", name: "Blasting" },
        { id: "16", label: "Application", name: "Application" },
        { id: "22", label: "Thickness", name: "Thickness" },
        { id: "33", label: "Ext. Final", name: "External Final" },
        { id: "24", label: "Calib. of Blasting", name: "Calibration of Blasting" },
        { id: "26", label: "Calib. of Thickness", name: "Calibration of Thickness" },
        { id: "25", label: "Dust Level", name: "Dust Level" },
    ];

    const urlMappings = {
        523: "/bare-pipe-inspection/222",
        524: "/phos-blast-insp/677",
        525: "/chromate-coat-insp/670",
        526: "/Thickness-insp/671",
        528: "/final-inspection/673",
    };

    const getProcessUrl = (action, data) => {
        const basePath = urlMappings[typeWise()] || "/default-path";
        return `${basePath}&${data.pm_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&pm_processSheet_id=${data?.procsheet_id}&pm_processtype_id=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    };

    // const handleApprovalDust = (data, action) => {
    //     return `/dustlevelview/${data.pm_blasting_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&pm_processSheet_id=${data?.procsheet_id}&pm_processtype_id=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    // };

    const addCalibration = (action, data) => {
        const basePath = '/calibration-blasting-report';
        return `${basePath}?year=${data.pm_procsheet_year}&TestRunId=${data.pm_test_run_id}&pm_blasting_test_run_id=${data.pm_blasting_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&ProcessSheetID=${data?.procsheet_id}&ProcessSheetTypeID=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    };

    const viewCalibration = (action, data) => {
        const basePath = '/calibration-blasting-report-view';
        return `${basePath}/${data.pm_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&pm_processSheet_id=${data?.procsheet_id}&pm_processtype_id=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    };
    const handleApprovalCalib = (data, action) => {
        return `/calibration-blasting-report-view/${data.pm_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&pm_processSheet_id=${data?.procsheet_id}&pm_processtype_id=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    };
    const addDust = (action, data) => {
        const basePath = '/dustlevel';
        return `${basePath}/${data.pm_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&pm_processSheet_id=${data?.procsheet_id}&pm_processtype_id=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    };

    const viewDust = (action, data) => {
        const basePath = '/dustlevelview';
        return `${basePath}/${data.pm_test_run_id}&pm_Approve_level=${action}&pm_project_id=${data?.project_id}&pm_processSheet_id=${data?.procsheet_id}&pm_processtype_id=${typeWise()}&pm_approved_by=${userId}&test_date=${data?.test_date}&menuId=${menuId}`;
    };


    const handleViewClick = (data) => {
        navigate(getProcessUrl('view', data));
    };
    const handleFirstLevel = (data) => {
        navigate(getProcessUrl("first", data));
    };
    const handleSecondLevel = (data) => {
        navigate(getProcessUrl("second", data));
    };
    const handleAddCalibration = (data) => {
        navigate(addCalibration("add", data));
    };
    const handleCalibViewClick = (data) => {
        navigate(viewCalibration("view", data));
    };
    const handleAddDust = (data) => {
        navigate(addDust("add", data));
    };
    const handleViewDust = (data) => {
        navigate(viewDust("view", data));
    };
    // const approvalDust = (data, action) => {
    //     navigate(handleApprovalDust(data, action));
    // };
    const approvalCalib = (data, action) => {
        navigate(handleApprovalCalib(data, action));
    };

    // const modalRef = useRef(null);

    const fetchPermissions = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
                params: { UserId: userId, PageId: menuId }
            });
            setPermissions(response?.data[0]);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    }

    const extractProcessTypeName = (processTypes, processTypeId) => {
        return processTypes[processTypeId] || "Unknown";
    };

    const fetchProcessSheetDetails = async () => {
        setLoading(true);
        try {
            let response, response1, response2;

            response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetProcessSheetDetailsList`, {
                params: { ProcessType: typeWise(), UserId: userId }
            });

            const processTypes = response?.data[1].reduce((acc, item) => {
                acc[item.co_param_val_id] = item.co_param_val_name;
                return acc;
            }, {});

            setProcessTypeMap(processTypes);

            const processTypeName = extractProcessTypeName(processTypes, typeWise());
            setProcessTypeName(processTypeName);

            const dataWithSerialNumbers = response?.data[0].map((item, index) => ({
                ...item,
                sno: index + 1,
                ProcSheetDate: new Date(item.ProcSheetDate).toLocaleDateString('en-GB'),
            }));

            setTableData(dataWithSerialNumbers);
            setCoatingType(response?.data[1]);

            if (['24', '26'].includes(menuId)) {
                response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCalibRoughnessList`, {
                    params: { ProcessType: menuId === '24' ? '1398' : menuId === '26' ? '1400' : typeWise(), UserId: userId }
                });
                setCalibrationList(response1?.data[0]);
            }

            if (menuId === '25') {
                response2 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetDustlevelTestList`, {
                    params: { ProcessType: menuId === '26' ? '1399' : typeWise(), testid: '237', UserId: userId }
                });
                setDustlevelList(response2?.data[0]);
            }

            if (response || response1 || response2) {
                fetchPermissions();
            }

            if (response && response1) {
                const result = response?.data[0].map(secondItem => {
                    const matchingItem = response1?.data[0].find(firstItem => firstItem.procsheet_id === secondItem.procsheet_id);
                    return {
                        ...secondItem,
                        pm_test_run_id1: matchingItem ? matchingItem.pm_test_run_id : null
                    };
                });
                setList(result);
            }
        } catch (error) {
            console.error('Error fetching process sheet details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentId(menuId);
        fetchProcessSheetDetails();
        setCurrentPage({
            tableData: 0,
            calibrationList: 0,
            dustlevelList: 0,
        });
    }, [location.pathname, location.search]);

    const getUniqueOptions = (data, key) => {
        return [...new Set(data.map(item => item[key]))];
    };

    const filterData = (data) => {
        return data.filter(item => {
            const testDate = new Date(item.test_date);
            return (
                (!fromDate || testDate >= fromDate) &&
                (!toDate || testDate <= toDate) &&
                (!coatingTypeFilter || item.coating_type === coatingTypeFilter) &&
                (!clientFilter || item.clientname === clientFilter)
            );
        });
    };

    const renderDropdownFilters = () => {
        const uniqueCoatingTypes = getUniqueOptions(menuId === '25' ? dustlevelList : menuId === '24' || menuId === '26' ? calibrationList : tableData, 'coating_type');
        const uniqueClients = getUniqueOptions(menuId === '25' ? dustlevelList : menuId === '24' || menuId === '26' ? calibrationList : tableData, 'clientname');

        return (
            <>
                <label>Coating Type:
                    <select value={coatingTypeFilter} onChange={(e) => setCoatingTypeFilter(e.target.value)}>
                        <option value="">All</option>
                        {uniqueCoatingTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </label>
                <label>Client:
                    <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                        <option value="">All</option>
                        {uniqueClients.map((client, index) => (
                            <option key={index} value={client}>{client}</option>
                        ))}
                    </select>
                </label>
                <i className="fa fa-refresh" onClick={resetFilter}></i>
            </>
        );
    };

    const [currentPage, setCurrentPage] = useState({
        tableData: 0,
        calibrationList: 0,
        dustlevelList: 0,
    });

    const pageSize = 10;

    const handlePageClick = (tableName, selectedPage) => {
        setCurrentPage(prev => ({ ...prev, [tableName]: selectedPage }));
    };

    const paginateData = (data, currentPage) => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    };

    const getFilteredAndPaginatedData = () => {
        const filteredTableData = paginateData(filterData(tableData), currentPage.tableData);
        const filteredCalibrationList = paginateData(filterData(calibrationList), currentPage.calibrationList);
        const filteredDustlevelList = paginateData(filterData(dustlevelList), currentPage.dustlevelList);

        return {
            filteredTableData,
            filteredCalibrationList,
            filteredDustlevelList,
        };
    };

    const { filteredTableData, filteredCalibrationList, filteredDustlevelList } = getFilteredAndPaginatedData();

    const resetFilter = () => {
        setFromDate(null);
        setToDate(null);
        setCoatingTypeFilter('');
        setClientFilter('');
    };

    // const acceptedFileTypes = ['application/pdf', 'image/jpeg'];
    // const [setFilesSelected] = useState(false);

    // const { fileRejections } = useDropzone({
    //     accept: acceptedFileTypes,
    //     onDrop: (acceptedFiles) => {
    //         setFilesSelected(acceptedFiles.length > 0);
    //     }
    // });

    // const renderFileRejections = () => {
    //     return fileRejections.map(({ file, errors }) => (
    //         <div key={file.path}>
    //             <p>{file.path} - {file.size} bytes</p>
    //             {errors.map(e => (
    //                 <div key={e.code}>{e.message}</div>
    //             ))}
    //         </div>
    //     ));
    // };

    // const fileToBase64 = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file);
    //         reader.onload = () => resolve(reader.result.split(',')[1]);
    //         reader.onerror = (error) => reject(error);
    //     });
    // };

    // const handleFileChange = async (e, fieldName) => {
    //     let value;

    //     if ((fieldName === 'fieldName') && e.target.files.length > 0) {
    //         const file = e.target.files[0];
    //         if (file.type !== "application/pdf") {
    //             toast.error("Only PDF files are allowed");
    //             e.target.value = '';
    //             return;
    //         }

    //         if (file.size > 50 * 1024 * 1024) {
    //             toast.error("Upload file less than 50 MB");
    //             e.target.value = '';
    //             return;
    //         }

    //         value = await fileToBase64(file);
    //         setReportPath(value);
    //         setReportName(file.name);
    //         setIsFileUploaded(true); // Update state to indicate file has been uploaded
    //     }
    // };
    // ---------------------------------------------------

    const [images, setImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const onDrop = useCallback((acceptedFiles) => {
        // Function to read a file and return its base64 representation
        const readFileAsBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 data part
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        // Process each file, read its base64 value, and then update the state
        const processFiles = async () => {
            const newImages = await Promise.all(
                acceptedFiles.map(async (file) => {
                    const base64 = await readFileAsBase64(file); // Wait for the base64 conversion
                    return {
                        id: Math.random(),
                        file,
                        preview: URL.createObjectURL(file),
                        base64, // Set the base64 value
                    };
                })
            );

            setImages((prevImages) => [...prevImages, ...newImages]); // Update state with new images
        };

        processFiles(); // Call the async function to process files
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fileData = images.map((item, index) => ({
            file_name: item.file.path,
            file_data: item.base64,
            seq_no: index + 1,
        }));

        const dataToSend = {
            comp_id: 1,
            loc_id: 1,
            test_run_id: selectedRow.pm_test_run_id,
            procsheet_id: selectedRow.procsheet_id,
            testfileid: 0,
            userid: userId,
            filedata: fileData
        }

        try {
            const response = await axios.post(Environment.BaseAPIURL + "/api/User/UploadReportAttachment", dataToSend);
            if (response.data == "1000") {
                toast.success("Data submitted successfully");
                setIsModalOpen(false);
                setIsFileUploaded(false);
                setReportPath('');
                setReportName('');
                fetchProcessSheetDetails();
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            toast.error("Failed to submit");
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
        multiple: true,
    });

    const removeImage = (id) => {
        setImages(images.filter((image) => image.id !== id));
    };

    const moveImageUp = (index) => {
        if (index === 0) return;
        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index - 1];
        newImages[index - 1] = temp;
        setImages(newImages);
    };

    const moveImageDown = (index) => {
        if (index === images.length - 1) return;
        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index + 1];
        newImages[index + 1] = temp;
        setImages(newImages);
    };

    return (
        <>
            {loading ? (<Loading />) : (
                <>
                    <Header />
                    <section className="InnerHeaderPageSection">
                        <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <ul>
                                        <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                                        <li><h1>/&nbsp; Process Data Entry List &nbsp;</h1></li>
                                        <li><h1>/&nbsp; {processTypeName}</h1></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="ProcessSheetdataentrySectionPage">
                        <div className="container">
                            <div className="ProcessDataEntryListBox">
                                {menuLinks.map(({ id, label, name }) => (
                                    <Link key={id} title={`${name}`} to={`/blastingsheetlist?menuId=${id}`} className={currentId === id ? 'current-process-selection' : ''} >{label}</Link>
                                ))}
                                <Link to={`/list/miseleaneous-test`} style={{
                                    display: 'block',
                                    background: '#484848',
                                    padding: '4px 16px',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    marginRight: '4px',
                                    fontFamily: 'Myriad Pro Regular',
                                    fontSize: '14px'
                                }}>Reject Station</Link>
                                <Link to={`/repair-list?menuId=${menuId}`} style={{
                                    display: 'block',
                                    background: '#484848',
                                    padding: '4px 16px',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    marginRight: '4px',
                                    fontFamily: 'Myriad Pro Regular',
                                    fontSize: '14px'
                                }}>Repair Station</Link>
                                {/* <Link to={`/nc-list`} style={{
                                    display: 'block',
                                    background: '#484848',
                                    padding: '4px 16px',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    marginRight: '4px',
                                    fontFamily: 'Myriad Pro Regular',
                                    fontSize: '14px'
                                }}>NC Report</Link> */}
                            </div>
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <div className="ProcessSheetlistTable">
                                        <div className="tableheaderflex">
                                            {permissions?.searchPerm === "1" &&
                                                <div className="tableheaderfilter">
                                                    <span> <i className="fas fa-filter"></i> Filter </span>
                                                    <label> From Date:
                                                        <DatePicker
                                                            maxDate={new Date()}
                                                            selected={fromDate}
                                                            onChange={(date) => setFromDate(date)}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="DD-MM-YYYY"
                                                        />
                                                    </label>
                                                    <label> To Date:
                                                        <DatePicker
                                                            maxDate={new Date()}
                                                            selected={toDate}
                                                            onChange={(date) => setToDate(date)}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="DD-MM-YYYY"
                                                        />
                                                    </label>
                                                    {renderDropdownFilters()}
                                                </div>
                                            }

                                            {permissions?.createPerm === "1" &&
                                                menuId !== '24' && menuId !== '25' && menuId !== '26' ? <div className="tableheaderAddbutton">
                                                <Link style={{ float: 'right' }} to={`/blastingprocesssheet?id=${typeWise()}&menuId=${menuId}`} target="_blank">
                                                    <i className="fas fa-plus"></i> Add
                                                </Link>
                                            </div> : menuId !== '25' ? <div className="tableheaderAddbutton">
                                                <Link style={{ float: 'right' }} to={`/calibration-blasting-report?action=add&id=${typeWise()}&menuId=${menuId}`} target="_blank">
                                                    <i className="fas fa-plus"></i> Add
                                                </Link>
                                            </div> : ""}
                                        </div>
                                        <div className="fadedIcon">
                                            <ul>
                                                <li><i className="fas fa-eye" style={{ color: "#4caf50" }} ></i>View</li>
                                                <li><i className="fas fa-edit" style={{ color: "#ff9800" }} ></i>Edit</li>
                                                <li><span style={{ border: '1px solid', borderRadius: '50%', padding: '1px 4px', fontSize: '8px', marginRight: '5px', cursor: 'pointer', color: 'red' }}>W</span>Witness</li>
                                                {(menuId === '24' || menuId === '25' || menuId === '26') && <li><i className="fas fa-add" style={{ color: "#60145a" }} ></i>Add</li>}
                                                {menuId === '25' && <li><i className="fas fa-upload" style={{ color: "#14aee1" }} ></i>Upload File</li>}
                                                {menuId === '25' && <li><i className="fas fa-download" style={{ color: "#4c84d9" }} ></i>Download File</li>}
                                                <li><i className="fas fa-check" style={{ color: "#4caf50" }} ></i>Single level Approval</li>
                                                <li><i className="fas fa-check-double" style={{ color: "#4caf50" }} ></i>Double level Approval</li>
                                            </ul>
                                        </div>

                                        {loading ? (<Loading />) : (
                                            <>
                                                {menuId !== '24' && menuId !== '25' && menuId !== '26' && (
                                                    <>
                                                        <div className='table-responsive' id='custom-scroll'>
                                                            <table>
                                                                <thead>
                                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                        <th style={{ minWidth: '70px' }}>S No.</th>
                                                                        <th style={{ minWidth: '140px' }}>Process Sheet No.</th>
                                                                        <th style={{ minWidth: '100px' }}>Test Date</th>
                                                                        <th style={{ minWidth: '100px' }}>Coating Type</th>
                                                                        <th style={{ minWidth: '200px' }}>Project Name</th>
                                                                        <th style={{ minWidth: '270px' }}>Client</th>
                                                                        <th style={{ minWidth: '200px' }}>Pipe Size</th>
                                                                        <th style={{ minWidth: '120px' }}>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredTableData.length === 0 ? (
                                                                        <tr><td colSpan="8">No data available.</td></tr>
                                                                    ) : (
                                                                        filteredTableData.map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td>{currentPage.tableData * pageSize + index + 1}</td>
                                                                                <td>{item.pm_procsheet_code.split('/').slice(-2).join('/')}</td>
                                                                                <td>{new Date(item.test_date).toLocaleDateString('en-GB').replace(/\//g, "-")}</td>
                                                                                <td>{item.coating_type}</td>
                                                                                <td>{item.project_name}</td>
                                                                                <td>{item.clientname}</td>
                                                                                <td>{item.pipesize}</td>
                                                                                <td>
                                                                                    <div className="action-icons d-flex align-items-center">
                                                                                        {permissions?.indexPerm === "1" && (
                                                                                            <i className="fas fa-eye" onClick={() => handleViewClick(item)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.firstLevelApprove === "1" && item.IsShowForFirstLevelApproval === 1 && item.pm_is_superincharge === 0 && (
                                                                                            <i className="fas fa-check" onClick={() => handleFirstLevel(item)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.secondLevelApprove === "1" && item.IsShowForSecondLevelApproval === 1 && item.pm_is_superincharge === 0 && (
                                                                                            <i className="fas fa-check-double" onClick={() => handleSecondLevel(item)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.editPerm === "1" &&
                                                                                            (item.pm_isfinalapproval === 0
                                                                                                ? (item.IsSubmitted === 1 || item.pm_is_superincharge === 1)
                                                                                                : userRole == 'Super Incharge' || (userRole == 'Incharge' && item.IsShowForFirstLevelApproval == 0) || userRole == 'HOD') && (
                                                                                                <i className="fas fa-edit" onClick={() => navigate(`/blastingprocesssheet?id=${typeWise()}&pm_test_run_id=${item.pm_test_run_id}&action=edit&processsheetId=${item.procsheet_id}&menuId=${menuId}`)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                                                                            )}
                                                                                        {((userRole == "Witness_PMC" || userRole == "Witness_Client" || userRole == "Witness_Surveillance" || userRole == "Witness_TPI")) && <span style={{ border: '1px solid', borderRadius: '50%', padding: '1px 4px', fontSize: '10px', marginLeft: '5px', cursor: 'pointer', color: 'red' }} onClick={() => navigate(`/blastingprocesssheet?id=${typeWise()}&pm_test_run_id=${item.pm_test_run_id}&action=edit&processsheetId=${item.procsheet_id}&menuId=${menuId}`)}>W</span>}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <Pagination
                                                            pageCount={Math.ceil(filterData(tableData).length / pageSize)}
                                                            onPageChange={(data) => handlePageClick('tableData', data.selected)}
                                                        />
                                                    </>
                                                )}

                                                {menuId !== '15' && menuId !== '16' && menuId !== '21' && menuId !== '22' && menuId !== '33' && menuId !== '25' && (
                                                    <>
                                                        <div className='table-responsive' id='custom-scroll'>
                                                            <table>
                                                                <thead>
                                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                        <th style={{ minWidth: '70px' }}>S No.</th>
                                                                        <th style={{ minWidth: '140px' }}>Process Sheet No.</th>
                                                                        <th style={{ minWidth: '100px' }}>Test Date</th>
                                                                        <th style={{ minWidth: '100px' }}>Coating Type</th>
                                                                        <th style={{ minWidth: '200px' }}>Project Name</th>
                                                                        <th style={{ minWidth: '270px' }}>Client</th>
                                                                        <th style={{ minWidth: '200px' }}>Pipe Size</th>
                                                                        <th style={{ minWidth: '120px' }}>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredCalibrationList.length === 0 ? (
                                                                        <tr><td colSpan="8">No data available.</td></tr>
                                                                    ) : (
                                                                        filteredCalibrationList.map((item, index) => (
                                                                            <tr key={index} style={{ background: item.pm_blasting_test_run_id !== 0 ? '#d4ffe5' : 'white' }}>
                                                                                <td>{currentPage.calibrationList * pageSize + index + 1}</td>
                                                                                <td>{item.pm_procsheet_code.split('/').slice(-2).join('/')}</td>
                                                                                <td>{item.test_date ? new Date(item.test_date).toLocaleDateString('en-GB').replace(/\//g, "-") : ''}</td>
                                                                                <td>{item.coating_type}</td>
                                                                                <td>{item.project_name}</td>
                                                                                <td>{item.clientname}</td>
                                                                                <td>{item.pipesize}</td>
                                                                                <td>
                                                                                    <div className="action-icons">
                                                                                        {permissions?.indexPerm === "1" && item.pm_blasting_test_run_id !== 0 && (
                                                                                            <i className="fas fa-eye" onClick={() => handleCalibViewClick(item)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.createPerm === "1" && item.pm_blasting_test_run_id === 0 && item.IsSubmitted === 0 && (
                                                                                            <i className="fas fa-add" onClick={() => handleAddCalibration(item)} style={{ color: "#60145a", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.firstLevelApprove === "1" && item.IsShowForFirstLevelApproval === 1 && (
                                                                                            <i className="fas fa-check" onClick={() => approvalCalib(item, "first")} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.secondLevelApprove === "1" && item.IsShowForSecondLevelApproval === 1 && (
                                                                                            <i className="fas fa-check-double" onClick={() => approvalCalib(item, "second")} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.editPerm === "1" && (item.IsSubmitted === 1 || item.pm_is_superincharge === 1) && (
                                                                                            <i className="fas fa-edit" onClick={() => navigate(`/calibration-blasting-report?action=edit&year=${item.pm_procsheet_year}&ProcessSheetID=${item.procsheet_id}&ProcessSheetTypeID=${typeWise()}&TestRunId=${item.pm_test_run_id}&pm_blasting_test_run_id=${item.pm_blasting_test_run_id}&menuId=${menuId}`)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <Pagination
                                                            pageCount={Math.ceil(filterData(calibrationList).length / pageSize)}
                                                            onPageChange={(data) => handlePageClick('calibrationList', data.selected)}
                                                        />
                                                    </>
                                                )}

                                                {menuId !== '15' && menuId !== '16' && menuId !== '21' && menuId !== '22' && menuId !== '33' && menuId !== '24' && menuId !== '26' && (
                                                    <>
                                                        <div className='table-responsive' id='custom-scroll'>
                                                            <table>
                                                                <thead>
                                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                        <th style={{ minWidth: '70px' }}>S No.</th>
                                                                        <th style={{ minWidth: '140px' }}>Process Sheet No.</th>
                                                                        <th style={{ minWidth: '100px' }}>Test Date</th>
                                                                        <th style={{ minWidth: '100px' }}>Coating Type</th>
                                                                        <th style={{ minWidth: '200px' }}>Project Name</th>
                                                                        <th style={{ minWidth: '270px' }}>Client</th>
                                                                        <th style={{ minWidth: '200px' }}>Pipe Size</th>
                                                                        <th style={{ minWidth: '160px' }}>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredDustlevelList.length === 0 ? (
                                                                        <tr><td colSpan="8">No data available.</td></tr>
                                                                    ) : (
                                                                        filteredDustlevelList.map((item, index) => (
                                                                            <tr key={index} style={{ background: item.pm_blasting_test_run_id !== 0 ? '#d4ffe5' : 'white' }}>
                                                                                <td>{currentPage.dustlevelList * pageSize + index + 1}</td>
                                                                                <td>{item.pm_procsheet_code.split('/').slice(-2).join('/')}</td>
                                                                                <td>{item.test_date ? new Date(item.test_date).toLocaleDateString('en-GB').replace(/\//g, "-") : ''}</td>
                                                                                <td>{item.coating_type}</td>
                                                                                <td>{item.project_name}</td>
                                                                                <td>{item.clientname}</td>
                                                                                <td>{item.pipesize}</td>
                                                                                <td>
                                                                                    <div className="action-icons">
                                                                                        {permissions?.indexPerm === "1" && item.pm_blasting_test_run_id !== 0 && item.pm_isattach_submitted === 1 && (
                                                                                            <i className="fas fa-eye" onClick={() => handleViewDust(item)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.createPerm === "1" && item.pm_blasting_test_run_id === 0 && (
                                                                                            <i className="fas fa-add" onClick={() => handleAddDust(item)} style={{ color: "#60145a", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {/* {permissions?.firstLevelApprove === "1" && item.IsShowForFirstLevelApproval === 1 && (
                                                                                            <i className="fas fa-check" onClick={() => approvalDust(item, "first")} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )}
                                                                                        {permissions?.secondLevelApprove === "1" && item.IsShowForSecondLevelApproval === 1 && (
                                                                                            <i className="fas fa-check-double" onClick={() => approvalDust(item, "second")} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                                        )} */}
                                                                                        {item.pm_blasting_test_run_id !== 0 ? <>
                                                                                            <i title="Upload" className="fa-solid fa-upload" style={{ color: "#14aee1", margin: '4px', cursor: "pointer", marginLeft: '10px' }} onClick={() => { setIsModalOpen(true); setSelectedRow(item); setImages([]) }} ></i>

                                                                                            <Modal
                                                                                                isOpen={isModalOpen}
                                                                                                onRequestClose={() => setIsModalOpen(false)}
                                                                                                contentLabel="Image Upload Modal"
                                                                                                style={{
                                                                                                    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                                                                                                    content: { width: '40%', margin: 'auto', padding: '20px', borderRadius: '10px' }
                                                                                                }}
                                                                                            >
                                                                                                <h2>
                                                                                                    Upload Images
                                                                                                    <i onClick={() => setIsModalOpen(false)} className='fas fa-times'></i>
                                                                                                </h2>
                                                                                                <div {...getRootProps({ className: 'dropzone' })}>
                                                                                                    <input {...getInputProps()} />
                                                                                                    <FontAwesomeIcon icon={faUpload} size="2x" />
                                                                                                    <p>Drag & drop or click to select images (JPEG/PNG only)</p>
                                                                                                </div>
                                                                                                <div className="image-preview-container" style={{ marginTop: '20px' }}>
                                                                                                    <div className='LegendUploadModalBox'>
                                                                                                        <span><FontAwesomeIcon icon={faTrash} /> Delete</span>
                                                                                                        <span><FontAwesomeIcon icon={faArrowUp} /> Drag Up</span>
                                                                                                        <span><FontAwesomeIcon icon={faArrowDown} /> Drag Down</span>
                                                                                                    </div>
                                                                                                    {images.map((image, index) => (
                                                                                                        <>
                                                                                                            <div key={image.id} className="image-preview" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                    <p style={{ marginRight: '10px' }}>{index + 1}</p>
                                                                                                                    <img src={image.preview} alt={`Preview ${index + 1}`} style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                                                                                                                </div>
                                                                                                                <div>
                                                                                                                    <FontAwesomeIcon title='Delete' onClick={() => removeImage(image.id)} icon={faTrash} />
                                                                                                                    <FontAwesomeIcon title='Drag Up' onClick={() => moveImageUp(index)} icon={faArrowUp} />
                                                                                                                    <FontAwesomeIcon title='Drag Down' onClick={() => moveImageDown(index)} icon={faArrowDown} />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </>

                                                                                                    ))}
                                                                                                </div>
                                                                                                <div style={{ display: 'flex', justifyContent: 'end' }}>
                                                                                                    {images.length ? <button type="submit" onClick={handleSubmit} className="submit-button">Submit</button> : ''}
                                                                                                </div>
                                                                                            </Modal>
                                                                                        </> : ""}
                                                                                        {item.pm_isattach_submitted === 1 ? <a
                                                                                            href={`${Environment.ImageURL}/sign_images/${item.pm_attachment}`}
                                                                                            alt="Signature" target="_blank" rel="noreferrer"
                                                                                        ><i title="Download" className="fa-solid fa-download" style={{ color: "#4c84d9", margin: '4px', cursor: "pointer", marginLeft: '10px' }}></i></a> : ''}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <Pagination
                                                            pageCount={Math.ceil(filterData(dustlevelList).length / pageSize)}
                                                            onPageChange={(data) => handlePageClick('dustlevelList', data.selected)}
                                                        />
                                                    </>
                                                )}
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

export default BlastingSheetlist;