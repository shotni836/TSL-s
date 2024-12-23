import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../environment";
import '../Allreports.css';
import HeaderDataSection from "../Headerdata";
import Footerdata from '../Footerdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from 'react-secure-storage';
import html2pdf from 'html2pdf.js';
import './Field.css';
import Loading from "../../Loading";
import Loader from "../../Loader";
import { decryptData } from '../../Encrypt-decrypt';

function TrialTestReport() {
    const token = secureLocalStorage.getItem('token');
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const [headerDetails, setHeaderDetails] = useState({});
    const [testDetails, setTestDetails] = useState([]);
    const [instrumentDetails, setInstrumentDetails] = useState([]);
    const [rawMaterialDetails, setRawMaterialDetails] = useState([]);
    const [reportTestDate, setReportTestDate] = useState()
    const [signatureReport, setSignatureReport] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [witnessValue, setWitnessValue] = useState('');
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const location = useLocation();
    const [isClicked, setIsClicked] = useState(false)
    const navigate = useNavigate()
    const pathSegments = location.pathname.split(/[\/&]/);
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")
    const [regPerc, setRegPerc] = useState();
    const [attachedFiles, setAttachedFiles] = useState([])
    const [pageData, setPageData] = useState([]); // To hold paginated data
    const itemsPerPage = 1; // 1 pipe per page
    const testsPerPage = 3; // 3 tests per page

    const parseKeyValuePair = (str) => {
        const parts = str.split(':-');
        const key = parts[0].trim(); // Key before ':-'
        const value = parts[1]?.trim(); // Value after ':-', using optional chaining
        return { key, value };
    };

    let pm_project_id1 = null;
    let pm_processSheet_id1 = null;
    let pm_processtype_id1 = null;
    let pm_approved_by1 = null;
    let pm_Approve_level1 = null;
    let menuId1 = null;

    let pm_project_id = null;
    let pm_processSheet_id = null;
    let pm_processtype_id = null;
    let pm_approved_by = null;

    for (let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i].startsWith('pm_project_id=')) {
            pm_project_id1 = pathSegments[i].substring('pm_project_id='.length);
            pm_project_id = decryptData(pm_project_id1)
        }
        if (pathSegments[i].startsWith('pm_processSheet_id=')) {
            pm_processSheet_id1 = pathSegments[i].substring('pm_processSheet_id='.length);
            pm_processSheet_id = decryptData(pm_processSheet_id1)
        }
        if (pathSegments[i].startsWith('pm_processtype_id=')) {
            pm_processtype_id1 = pathSegments[i].substring('pm_processtype_id='.length);
            pm_processtype_id = decryptData(pm_processtype_id1)
        }
        if (pathSegments[i].startsWith('pm_approved_by=')) {
            pm_approved_by1 = pathSegments[i].substring('pm_approved_by='.length);
            pm_approved_by = decryptData(pm_approved_by1)
        }
        if (pathSegments[i].startsWith('pm_Approve_level=')) {
            pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
        }
        if (pathSegments[i].startsWith('menuId=')) {
            menuId1 = pathSegments[i].substring('menuId='.length);
        }
    }
    const [id1, id2, id3, id4] = tstmaterialid.split('&');
    let ID2 = decryptData(id2)
    const [formData, setFormData] = useState({
        pm_comp_id: 1,
        pm_location_id: 1,
        pm_project_id: parseInt(pm_project_id),
        pm_processSheet_id: parseInt(pm_processSheet_id),
        pm_processtype_id: parseInt(pm_processtype_id),
        pm_remarks: "",
        pm_approver_status: true,
        pm_approved_by: pm_approved_by,
        pm_approved_on: new Date().toISOString().split('T')[0],
        pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
        pm_approvedRoleId_by: '0',
        p_test_run_id: parseInt(ID2),
        pm_isfinalapproval: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [id1, id2, id3, id4] = tstmaterialid.split('&');
                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/GetTrialTestReport?pm_procsheet_id=${id1}&testRunId=${id2}&rtype=${id3}&testid=${id4}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const data = response?.data[0];
                const { key, value } = parseKeyValuePair(data._CdTesHeaderDetails[0].poNo);
                setKey(key);
                setKeyValue(value)
                setAttachedFiles(data._attachfiles)
                const date = data._CdTesHeaderDetails[0]?.reportTestDateNew || {}
                const formattedDate = date?.split('T')[0]
                const newDateStr = formattedDate.replace(/-/g, '');
                setReportTestDate(newDateStr);
                setHeaderDetails(data._CdTesHeaderDetails[0] || {});
                setTestDetails(data._CdTestDetails || [])
                setRawMaterialDetails(data._CdTestRawMaterial || []);

                const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetails?TestRunId=${id2}&ProcessSheetId=${pm_processSheet_id1}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const data1 = response1?.data;
                setInstrumentDetails(data1);

                try {
                    const [id1, id2, id3, id4] = tstmaterialid.split('&');
                    const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=${id3}&testId=${id2}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    const data = response?.data
                    setSignatureReport(data)
                    callWitness()

                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching report data:', error);
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
        };
        fetchData();
    }, [tstmaterialid]);

    async function callWitness() {
        try {
            const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${2}&p_type_id=${pm_processtype_id1}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response1 || !response1.data) {
                toast.error('Witness not found.');
            }

            setWitnessData(response1?.data)
            const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
            if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 == 'second') {
                setShowRemarks(true)
            } else {
                setShowRemarks(false)
            }
            setWitnessValue(response1?.data[0]?.roleId)
            setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
            setWitnessSelected(true);
            const matchingData = response1?.data.find(item => item.roleId == companyId);
            const regPerc = matchingData ? matchingData.reg_perc : null;
            setRegPerc(regPerc)
        } catch (error) {
            console.error('Error in callWitness:', error.message);
            setWitnessSelected(false);
            setShowRemarks(false);
            setRegPerc(null);
            setWitnessData([]);
        }
    }

    function handleSelect(e) {
        setWitnessValue(e.target.value)
        setFormData({ ...formData, pm_approvedRoleId_by: e.target.value })
        setWitnessSelected(true);
        if (!showRemarks) {
            handleStatusChange("A")
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStatusChange = (value) => {
        setIsClicked(true)
        if (value === "A") {
            setFormData({ ...formData, pm_approver_status: true, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? witnessValue.toString() : companyId.toString() });
            setWitnessSelected(true);
            setShowWitness(true);
        }
        if (value === "R") {
            setFormData({ ...formData, pm_approver_status: false, pm_approvedRoleId_by: "0" });
            setShowWitness(false);
            setWitnessSelected(false)
        }
    };

    const renderApprovalSection = () => {
        return (
            showRemarks ?
                <div className='RemarksFlexBox'>
                    <label htmlFor="">Remarks</label>
                    <input name="pm_remarks" value={formData.pm_remarks} onChange={handleChange} type="text" placeholder="Enter Approval/Rejection Remarks...." autoComplete="off" />
                    <div className='ApproveRejectUIFlex'>
                        <label className="custom-radio">
                            <input type="radio" className="Approveinput" name="pm_approver_status" id="btnaprv" onChange={() => handleStatusChange("A")} />
                            <span className="radio-btn"><i className="fas fa-check"></i>Approve</span>
                        </label>
                        <label className="custom-radio">
                            <input type="radio" className="Rejectinput" name="pm_approver_status" id="btnreject" onChange={() => handleStatusChange("R")} />
                            <span className="radio-btn"><i className="fas fa-times"></i>Reject</span>
                        </label>
                    </div>
                </div> : ''
        );
    };

    const renderFirstApprovalStatus = () => {
        if (pm_Approve_level1 == "first") {
            return (
                <div className="bare-pipe-inspection">
                    {renderApprovalSection()}
                    {showWitness && (<div className="SelectWitnessFlexBox">
                        <label htmlFor="" >Select Witness <b>*</b></label>
                        <select name="" value={witnessValue} onChange={handleSelect}>
                            <option disabled selected>Select Witness</option>
                            {witnessData && witnessData?.map((data) => {
                                return (
                                    <option value={data?.roleId}>{data?.Name}</option>
                                )
                            })}
                        </select>
                    </div>)}
                    <div className='SubmitBtnFlexBox'>
                        {<button type="button" className="SubmitBtn" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    const renderSecondApprovalStatus = () => {
        if (pm_Approve_level1 == "second") {
            return (
                <div className='BarePipeInspForm row m-0'>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <div className='renderApprovalFlexBox'>
                            {renderApprovalSection()}
                            {<button type="button" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>}
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        if (showRemarks) {
            if (formData?.pm_remarks == '' || isClicked == false) {
                toast.error("Please enter remarks and status")
                return
            }
        }

        if (showWitness && !witnessSelected && pm_Approve_level1 != "second") {
            toast.error('Please select a witness before submitting the form.');
            return;
        }
        try {
            const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionSheetApproval", {
                method: "POST",
                headers: {
                    'Content-Type': `application/json`,
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ formData, 'checkedPipes': [''] }),
            });

            const responseBody = await response.text();

            if (responseBody === '100' || responseBody === '200') {
                toast.success('Status Updated Successfully!');
                navigate(`/rawmateriallist?menuId=${menuId1}&testingtype=${pm_processtype_id1}`)
                console.log("Form data sent successfully!");
            } else {
                toast.error('Failed to update status.');
                console.error("Failed to send form data to the server. Status code:", response.status);
                console.error("Server response:", responseBody);
            }
        } catch (error) {
            toast.error('Error in updating status.');
            console.error("An error occurred while sending form data:", error);
        } finally {
            setLoader(false)
        }
    };

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${headerDetails?.reportAlias}/${reportTestDate}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handlePrint = () => {
        window.print();
    };

    function condenseData(input) {
        // Split the input string into an array
        let dataArray = input?.split(',');

        // Extract the common prefix
        let commonPrefix = dataArray[0]?.slice(0, -2);

        // Extract the unique numbers
        let uniqueNumbers = dataArray?.map(item => item.split('-').pop());

        // Join the unique numbers into a single string
        let result = commonPrefix + '-' + uniqueNumbers.join(', ');

        return result;
    }

    function convertDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        return formattedDate
    }

    // Chunk the test data based on itemsPerPage and testsPerPage
    const chunkedData = [];
    const testsPerPipe = 3; // Show 3 tests per pipe on each page

    for (let i = 0; i < testDetails.length; i += testsPerPipe) {
        chunkedData.push(testDetails.slice(i, i + testsPerPipe));
    }

    // Update the page data whenever chunkedData changes
    useEffect(() => {
        setPageData(chunkedData);
    }, [testDetails]);

    return (
        <>
            {
                loading ? (
                    <Loading />
                ) : loader ? (
                    <Loader />
                ) : (
                    <div>
                        <div style={{ textAlign: 'right', paddingRight: '14px', paddingTop: '10px' }}>
                            <div className="DownloadPrintFlexSection">
                                <h4 className='DownloadPDFBtn' onClick={handleDownloadPDF}>
                                    <i className="fas fa-download"> </i> Download PDF
                                </h4>
                                <h4 className='PrintBtn' onClick={handlePrint}>
                                    <i className="fas fa-print"></i> Print
                                </h4>
                            </div>
                        </div>
                        <div ref={contentRef}>
                            {pageData.length > 0 && pageData.map((page, index) => (
                                <div className="InspReportSection" key={index}>
                                    <div className='container-fluid'>
                                        <div className='row'>
                                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                                <div className='InspReportBox'>

                                                    <HeaderDataSection reportData={headerDetails} />

                                                    <section className='Reportmasterdatasection'>
                                                        <div className='container-fluid'>
                                                            <form className='row'>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Client</label>
                                                                        <h4>: &nbsp;&nbsp; {headerDetails?.clientName || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Report No.</label>
                                                                        <h4>: &nbsp;&nbsp;{headerDetails?.reportAlias ? headerDetails?.reportAlias : headerDetails?.ReportAlias ? headerDetails?.ReportAlias : ''}/{reportTestDate} - {String(index + 1).padStart(2, '0')}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">{key ? key : ''}</label>
                                                                        <h4>:  &nbsp;&nbsp;{value ? value : ''}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Date & Shift</label>
                                                                        <h4>: &nbsp;&nbsp;{headerDetails?.dateShift || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Pipe Size</label>
                                                                        <h4>: &nbsp;&nbsp;{headerDetails?.pipeSize || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Acceptance Criteria</label>
                                                                        <h4>: &nbsp;&nbsp;{headerDetails?.specification || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Specification</label>
                                                                        <h4>: &nbsp;&nbsp;{headerDetails?.specification || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Process Sheet No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.procSheetNo} REV.  {headerDetails?.procesheet_revisionno
                                                                            ? String(headerDetails?.procesheet_revisionno).padStart(2, '0')
                                                                            : '00'}  {headerDetails?.procesheet_revisionno ? "DATE : " + convertDate(headerDetails?.procesheet_revisiondate.split("T")[0]) : ''}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Type Of Coating</label>
                                                                        <h4>: &nbsp;&nbsp;{headerDetails?.typeofCoating || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Procedure / WI No.</label>
                                                                        <h4>: &nbsp;&nbsp;{(headerDetails?.wino && condenseData(headerDetails?.procedureWINo)) || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </section>

                                                    {page && (
                                                        <section className='ReporttableSection'>
                                                            <div className='container-fluid'>
                                                                <div className='row'>
                                                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                        <div id='custom-scroll'>
                                                                            <table>
                                                                                <thead>
                                                                                    <tr><th colSpan={13} style={{ textAlign: 'left', paddingLeft: '12px' }}>Pipe No. &nbsp;&nbsp;:- {page[0]?.pipeNo || "-"}</th></tr>
                                                                                    <tr><th colSpan={13} style={{ textAlign: 'center' }}>{`EPOXY THICKNESS (micron) Required Thickness Min ${testDetails[0]?.pM_Reqmnt_test_min || "-"} ${testDetails[0]?.unit || "-"}`}</th></tr>
                                                                                    <tr><td rowSpan={2}>POSITION</td><td colSpan={3}>0°</td><td colSpan={3}>90°</td><td colSpan={3}>180°</td><td colSpan={3}>270°</td></tr>
                                                                                    <tr><td>{testDetails[0]?.pm_value0_1 || "-"}</td><td>{testDetails[0]?.pm_value0_2 || "-"}</td><td>{testDetails[0]?.pm_value0_3 || "-"}</td>
                                                                                        <td>{testDetails[0]?.pm_value90_1 || "-"}</td><td>{testDetails[0]?.pm_value90_2 || "-"}</td><td>{testDetails[0]?.pm_value90_3 || "-"}</td>
                                                                                        <td>{testDetails[0]?.pm_value180_1 || "-"}</td><td>{testDetails[0]?.pm_value180_2 || "-"}</td><td>{testDetails[0]?.pm_value180_3 || "-"}</td>
                                                                                        <td>{testDetails[0]?.pm_value270_1 || "-"}</td><td>{testDetails[0]?.pm_value270_2 || "-"}</td><td>{testDetails[0]?.pm_value270_3 || "-"}</td></tr>

                                                                                    <tr><th colSpan={13} style={{ textAlign: 'center' }}>{`EPOXY + ADHESIVE THICKNESS (micron) Required Thickness Min ${testDetails[1]?.pM_Reqmnt_test_min || "-"} ${testDetails[1]?.unit || "-"}`}</th></tr>
                                                                                    <tr><td rowSpan={2}>POSITION</td><td colSpan={3}>0°</td><td colSpan={3}>90°</td><td colSpan={3}>180°</td><td colSpan={3}>270°</td></tr>
                                                                                    <tr><td>{testDetails[1]?.pm_value0_1 || "-"}</td><td>{testDetails[1]?.pm_value0_2 || "-"}</td><td>{testDetails[1]?.pm_value0_3 || "-"}</td>
                                                                                        <td>{testDetails[1]?.pm_value90_1 || "-"}</td><td>{testDetails[1]?.pm_value90_2 || "-"}</td><td>{testDetails[1]?.pm_value90_3 || "-"}</td>
                                                                                        <td>{testDetails[1]?.pm_value180_1 || "-"}</td><td>{testDetails[1]?.pm_value180_2 || "-"}</td><td>{testDetails[1]?.pm_value180_3 || "-"}</td>
                                                                                        <td>{testDetails[1]?.pm_value270_1 || "-"}</td><td>{testDetails[1]?.pm_value270_2 || "-"}</td><td>{testDetails[1]?.pm_value270_3 || "-"}</td></tr>

                                                                                    <tr><th colSpan={13} style={{ textAlign: 'center' }}>{`TOTAL COATING THICKNESS (mm) Required Thickness Min ${testDetails[2]?.pM_Reqmnt_test_min || "-"} ${testDetails[2]?.unit || "-"}`}</th></tr>
                                                                                    <tr><td rowSpan={2}>POSITION</td><td colSpan={3}>0°</td><td colSpan={3}>90°</td><td colSpan={3}>180°</td><td colSpan={3}>270°</td></tr>
                                                                                    <tr><td>{testDetails[2]?.pm_value0_1 || "-"}</td><td>{testDetails[2]?.pm_value0_2 || "-"}</td><td>{testDetails[2]?.pm_value0_3 || "-"}</td>
                                                                                        <td>{testDetails[2]?.pm_value90_1 || "-"}</td><td>{testDetails[2]?.pm_value90_2 || "-"}</td><td>{testDetails[2]?.pm_value90_3 || "-"}</td>
                                                                                        <td>{testDetails[2]?.pm_value180_1 || "-"}</td><td>{testDetails[2]?.pm_value180_2 || "-"}</td><td>{testDetails[2]?.pm_value180_3 || "-"}</td>
                                                                                        <td>{testDetails[2]?.pm_value270_1 || "-"}</td><td>{testDetails[2]?.pm_value270_2 || "-"}</td><td>{testDetails[2]?.pm_value270_3 || "-"}</td></tr>                                                                                </thead>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    )}

                                                    <section className='ResultPageSection'>
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ borderBottom: "none", padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.specification} & QAP NO.- {headerDetails?.acceptanceCriteria}</span></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="InstrumentusedSection">
                                                        <section className="container-fluid">
                                                            <div className="row">
                                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                                    <table id="instrument-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th colSpan={6} style={{ textAlign: 'center' }}> INSTRUMENT USED</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>SR. NO.</th>
                                                                                <th>INSTRUMENT NAME</th>
                                                                                <th>INSTRUMENT ID / SERIAL NO.</th>
                                                                                <th>SR. NO.</th>
                                                                                <th>INSTRUMENT NAME</th>
                                                                                <th>INSTRUMENT ID / SERIAL NO.</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>{1}</td>
                                                                                <td>{!['NA', '', null].includes(instrumentDetails[0]?.equip_name) && instrumentDetails[0]?.equip_name ? instrumentDetails[0]?.equip_name : "-"}</td>
                                                                                <td>{!['NA', '', null].includes(instrumentDetails[0]?.equip_code) && instrumentDetails[0]?.equip_code ? instrumentDetails[0]?.equip_code : "-"}</td>
                                                                                <td>{2}</td>
                                                                                <td>{!['NA', '', null].includes(instrumentDetails[1]?.equip_name) && instrumentDetails[1]?.equip_name ? instrumentDetails[1]?.equip_name : "-"}</td>
                                                                                <td>{!['NA', '', null].includes(instrumentDetails[1]?.equip_code) && instrumentDetails[1]?.equip_code ? instrumentDetails[1]?.equip_code : "-"}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    </section>

                                                    <Footerdata data={signatureReport} />

                                                </div>
                                                {attachedFiles ? <div style={{ marginTop: '40px' }}>
                                                    {attachedFiles?.map((data) => {
                                                        return (
                                                            <div style={{ textAlign: 'center' }}>
                                                                <img src={`${Environment.ImageURL}/${data?.pm_file_name}`} />
                                                            </div>
                                                        )
                                                    })}
                                                </div> : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row text-center">
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                {renderFirstApprovalStatus()}
                            </div>
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                {renderSecondApprovalStatus()}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
export default TrialTestReport;