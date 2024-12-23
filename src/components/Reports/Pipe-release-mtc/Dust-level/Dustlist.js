import React, { useState, useEffect, useRef } from "react";
import Header from "../../../Common/Header/Header";
import Footer from "../../../Common/Footer/Footer";
import Loading from "../../../Loading";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from 'react-datepicker';
import Environment from "../../../../environment";
import InnerHeaderPageSection from "../../../Common/Header-content/Header-content";
import Pagination from '../../../Common/Pagination/Pagination';
import secureLocalStorage from "react-secure-storage";
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import ImageCropper from "../../../ImageCropper";

function Dustlist() {
    const [tableData, setTableData] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dustlevelList, setDustlevelList] = useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const menuId = queryParams.get('menuId');
    const navigate = useNavigate();
    const userId = secureLocalStorage.getItem("empId")


    const handleViewClick = (data) => {
        navigate();
    };

    const fetchProcessSheetDetails = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetDustlevelTestList`, {
                params: { ProcessType: '524', UserId: userId, testid: '237' }
            });
            setDustlevelList(response?.data[0]);
            const processTypes = response.data[1].reduce((acc, item) => {
                acc[item.co_param_val_id] = item.co_param_val_name;
                return acc;
            }, {});

            const dataWithSerialNumbers = response.data[0].map((item, index) => ({
                ...item,
                sno: index + 1,
                ProcSheetDate: new Date(item.ProcSheetDate).toLocaleDateString('en-GB'),
            }));

            setTableData(dataWithSerialNumbers);

        } catch (error) {
            console.error('Error fetching process sheet details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcessSheetDetails();
        setTimeout(() => {
            setLoading(false)
        }, 5000);
    }, [location.pathname, location.search]);

    const filterData = () => {
        if (!fromDate && !toDate) return tableData;
        return tableData.filter(item => {
            const testDate = new Date(item.test_date);
            return (!fromDate || testDate >= fromDate) && (!toDate || testDate <= toDate);
        });
    };

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const filteredData = filterData();
    const pageCount = Math.ceil(filteredData.length / pageSize);
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    const resetFilter = () => {
        setFromDate(null);
        setToDate(null);
    };

    const acceptedFileTypes = ['application/pdf', 'image/jpeg'];

    const [filesSelected, setFilesSelected] = useState(false);
    const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
        accept: acceptedFileTypes,
        onDrop: (acceptedFiles) => {
            setFilesSelected(acceptedFiles.length > 0);
            console.log('Files accepted:', acceptedFiles);
        }
    });
    const [reportName, setReportName] = useState()
    const [reportPath, setReportPath] = useState()
    const [data, setData] = useState([])

    const [formData, setFormData] = useState({
        psYear: '',
        psSeqNo: '',
        clientname: '',
        projectname: '',
        pipesize: '',
        coating_type: '',
        testdate: '',
        shift: '',
        ispqt: false,
        project_id: '',
        procsheet_id: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(data);

        const dataToSend = {
            project_id: 0,
            procsheet_id: 0,
            pipe_count: data.pm_pipe_count,
            shift: 0,
            ispqt: "false",
            userid: 0,
            dust_test_id: data.pm_dust_id,
            co_comp_id: 0,
            co_location_id: 0,
            testrunid: 0,
            process_type: 0,
            procedure_type: "0",
            testid: 0,
            report_name: reportName,
            report_file: reportPath,
        };

        try {
            const response = await axios.post(Environment.BaseAPIURL + "/api/User/InsertDustLevelData", dataToSend);
            console.log('Data submitted successfully', response);
            if (response.status === 200) {
                toast.success("Data submitted successfully");
                // Close the modal
                if (modalRef.current) {
                    const modal = window.bootstrap.Modal.getInstance(modalRef.current);
                    if (modal) {
                        modal.hide();
                    }
                }
                // Optionally, reset the form or handle further logic
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

    const modalRef = useRef(null);

    useEffect(setFormData);

    const renderFileRejections = () => {
        return fileRejections.map(({ file, errors }) => (
            <div key={file.path}>
                <p>{file.path} - {file.size} bytes</p>
                {errors.map(e => (
                    <div key={e.code}>{e.message}</div>
                ))}
            </div>
        ));
    };

    const handleFileChange = async (e, fieldName) => {
        let name = e.target.value;
        let value;

        if ((fieldName === 'fieldName') && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are allowed");
                e.target.value = '';
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                toast.error("Upload file less than 50 MB");
                e.target.value = '';
                return;
            }

            value = await fileToBase64(file);
            setReportPath(value);
            setReportName(file.name);
            setIsFileUploaded(true); // Update state to indicate file has been uploaded
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const [isFileUploaded, setIsFileUploaded] = useState(false);

    // const handleDownload = async () => {
    //     const dataToSend = {
    //         project_id: 0,
    //         procsheet_id: 0,
    //         pipe_count: data.pm_pipe_count,
    //         shift: 0,
    //         ispqt: "false",
    //         userid: 0,
    //         dust_test_id: data.pm_dust_id,
    //         co_comp_id: 0,
    //         co_location_id: 0,
    //         testrunid: 0,
    //         process_type: 0,
    //         procedure_type: "0",
    //         testid: 0,
    //         report_name: reportName,
    //         report_file: reportPath,
    //     };
    //     try {
    //         const response = await axios.post(Environment.BaseAPIURL + "/api/User/InsertDustLevelData", dataToSend, {
    //             responseType: 'blob',
    //         });

    //         if (response.status === 200) {
    //             const url = window.URL.createObjectURL(new Blob([response.data]));

    //             const link = document.createElement('a');
    //             link.href = url;

    //             const contentDisposition = response.headers['content-disposition'];
    //             let fileName = 'pm_attachment';
    //             if (contentDisposition && contentDisposition.includes('attachment')) {
    //                 const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
    //                 if (fileNameMatch.length === 2) {
    //                     fileName = fileNameMatch[1];
    //                 }
    //             }

    //             link.setAttribute('download', fileName);
    //             document.body.appendChild(link);
    //             link.click();
    //             link.remove();

    //             toast.success("File downloaded successfully");
    //         }
    //     } catch (error) {
    //         console.error("Error downloading the file:", error);
    //         toast.error("Failed to download file");
    //     }
    // };

    const handleDownload = (file) => {
        window.open(file, '_blank');
    };
    return (
        <>
            {loading ? (<Loading />) : (
                <>
                    <Header />
                    <InnerHeaderPageSection
                        linkTo="/dashboard?moduleId=618"
                        linkText="Quality Module"
                        linkText2="Dust Report List"
                    />
                    <section className="ProcessSheetdataentrySectionPage">
                        <div className="container">
                            {/* <div className="page-header">
                                <h4>Dust Level List</h4>
                            </div> */}
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <div className="ProcessSheetlistTable">
                                        <div className="tableheaderflex">
                                            <div className="tableheaderfilter">
                                                <span> <i className="fas fa-filter"></i> Filter Test Date </span>
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
                                                <i className="fa fa-refresh" onClick={resetFilter}></i>
                                            </div>
                                            <div className="tableheaderAddbutton">
                                                <Link style={{ float: 'right' }} to={'/dustlevel'} target="_blank">
                                                    <i className="fas fa-plus"></i> Add
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="fadedIcon">
                                            <h4></h4>
                                            <ul>
                                                <li><i className="fa-solid fa-eye" style={{ color: "#4caf50" }} ></i>View</li>
                                                <li><i className="fa-solid fa-upload" style={{ color: "#ED2939" }}></i>Upload</li>
                                                <li><i className="fa-solid fa-download" style={{ color: "#4caf50" }}></i>Download</li>
                                            </ul>
                                        </div>
                                        <div className='table-responsive' id='custom-scroll'>
                                            <table>
                                                <thead>
                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                        <th style={{ minWidth: '70px' }}>S No.</th>
                                                        <th style={{ minWidth: '200px' }}>Process Sheet No.</th>
                                                        <th style={{ minWidth: '100px' }}>Coating Type</th>
                                                        <th style={{ minWidth: '200px' }}>Project Name</th>
                                                        <th style={{ minWidth: '270px' }}>Client</th>
                                                        <th style={{ minWidth: '200px' }}>Pipe Size</th>
                                                        <th style={{ minWidth: '100px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dustlevelList.length === 0 ? (
                                                        <tr><td colSpan="8">No data available.</td></tr>
                                                    ) : (
                                                        dustlevelList.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{currentPage * pageSize + index + 1}</td>
                                                                <td>{item.pm_procsheet_code}</td>
                                                                <td>{item.coating_type}</td>
                                                                <td>{item.project_name}</td>
                                                                <td>{item.clientname}</td>
                                                                <td>{item.pipesize}</td><td>
                                                                    <div className="action-icons">
                                                                        <Link title="View" to={`/Dustlevelview?dustId=${item.pm_dust_id}&processSheet=${item.pm_procsheet_seq}`} target="_blank">
                                                                            <i className="fas fa-eye" style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        </Link>
                                                                        {item.pm_isattach_submitted == 0 ? <i title="Upload" className="fa-solid fa-upload" style={{ color: "#ED2939", margin: '4px', cursor: "pointer", marginLeft: '10px' }} data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setData(item)}></i> : ''}
                                                                        {item.pm_isattach_submitted == 1 ? <a
                                                                            href={`${Environment.ImageURL}/${item.pm_attachment}`}
                                                                            alt="Signature" target="_blank"
                                                                        ><i title="Download" className="fa-solid fa-download" style={{ color: "#4CAF50", margin: '4px', cursor: "pointer", marginLeft: '10px' }}></i></a> : ''}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>

                                            <div className="modal fade DustlevelReportUploadModal" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" ref={modalRef}>
                                                <div className="modal-dialog">
                                                    <div className="modal-content">
                                                        <div className="modal-body">
                                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                                                <i className="fa-solid fa-times"></i>
                                                            </button>
                                                            <div className="DustlevelReportUploadBox">
                                                                <div className="AttachmentsFlexBox">
                                                                    <input
                                                                        name="fieldName"
                                                                        type="file"
                                                                        onChange={(e) => handleFileChange(e, 'fieldName')}
                                                                        accept="application/pdf"
                                                                    />
                                                                    <p>(Each file less than 50 MB)</p>
                                                                </div>
                                                                {fileRejections.length > 0 && (
                                                                    <div>
                                                                        <h4>Rejected Files:</h4>
                                                                        {renderFileRejections()}
                                                                    </div>
                                                                )}
                                                                {isFileUploaded && (
                                                                    <button type="submit" onClick={handleSubmit} className="submit-button">
                                                                        Submit
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
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

export default Dustlist;