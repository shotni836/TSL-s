import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../environment";
import '../Allreports.css';
import './Callibration.css'
import HeaderDataSection from "../Headerdata";
import Footerdata from '../Footerdata';
import "../Pipe-release-mtc/Bare-pipe-insp/BarePipe.css"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';
import secureLocalStorage from 'react-secure-storage';
import Loading from "../../Loading";
import Loader from "../../Loader";
import { decryptData } from '../../Encrypt-decrypt';

function CalibrationBlastingReport() {
    const token = secureLocalStorage.getItem('token');
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const headerDetails = useRef([]);
    const [testDetails, setTestDetails] = useState([]);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const [signatureReport, setSignatureReport] = useState([])
    const [randomWitnesses, setRandomWitnesses] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [reportTestDate, setReportTestDate] = useState()
    const [isClicked, setIsClicked] = useState(false)
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const location = useLocation();
    const pathSegments = location.pathname.split(/[\/&]/);
    const navigate = useNavigate()
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [witnessValue, setWitnessValue] = useState('');
    const [regPerc, setRegPerc] = useState();
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")

    let pm_project_id1 = null;
    let pm_processSheet_id1 = null;
    let pm_processtype_id1 = null;
    let pm_approved_by1 = null;
    let test_date1 = null;
    let pm_Approve_level1 = null;
    let menuId1 = null;

    let pm_project_id = null;
    let pm_processSheet_id = null;
    let pm_processtype_id = null;
    let pm_approved_by = null;
    let test_date = null;

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
        if (pathSegments[i].startsWith('test_date=')) {
            test_date1 = pathSegments[i].substring('test_date='.length);
            test_date = decryptData(test_date1)
        }
        if (pathSegments[i].startsWith('pm_Approve_level=')) {
            pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
        }
        if (pathSegments[i].startsWith('menuId=')) {
            menuId1 = pathSegments[i].substring('menuId='.length);
        }
    }

    const [id1, id2] = tstmaterialid.split('&');
    let ID1 = decryptData(id1)
    const [formData, setFormData] = useState({
        pm_comp_id: 1,
        pm_location_id: 1,
        pm_project_id: parseInt(pm_project_id),
        pm_processSheet_id: parseInt(pm_processSheet_id),
        pm_processtype_id: parseInt(pm_processtype_id),
        pm_remarks: "",
        pm_approver_status: true,
        pm_approved_by: pm_approved_by,
        pm_approved_on: test_date,
        pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
        pm_approvedRoleId_by: '0',
        p_test_run_id: parseInt(ID1),
        pm_isfinalapproval: 0
    });

    async function callWitness() {
        try {
            const [id1, id2] = tstmaterialid.split('&');
            const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id1}&p_type_id=${pm_processtype_id1}`, {}, {
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
            setWitnessValue(pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId : '')
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

    const parseKeyValuePair = (str) => {
        const parts = str.split(':-');
        const key = parts[0].trim(); // Key before ':-'
        const value = parts[1]?.trim(); // Value after ':-', using optional chaining
        return { key, value };
    };

    function formatDateToCompact(dateTimeStr) {
        const date = new Date(dateTimeStr);
        // Extract the year, month, and day
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}${month}${day}`;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [id1, id2] = tstmaterialid.split('&');
                const testId2 = id2 === '325' ? '325' : '324';
                const response = await axios.get(`${Environment.BaseAPIURL}/api/User/CalibRoughnessReport?typeid=${pm_processtype_id1}&TestRunId=${id1}&procsheet_id=${pm_processSheet_id1}&test_id=${testId2}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const data = response.data[0];
                headerDetails.current = data[0]
                const date = data[0].ReportTestDate || {}
                const formattedDate = formatDateToCompact(date)
                setReportTestDate(formattedDate);
                setTestDetails(response.data[1] || []);
                setRandomWitnesses(data._RandomWitness)
                const { key, value } = parseKeyValuePair(data?.[0].PONo);
                setKey(key);
                setKeyValue(value)

            } catch (error) {
                console.error('Error fetching report data:', error);
            }
            try {
                if (tstmaterialid) {
                    const [id1] = tstmaterialid.split('&');
                    const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=${pm_processtype_id1}&testId=${id1}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    const data = response.data
                    setSignatureReport(data)
                    callWitness()
                }
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        setFormData(prevData => ({ ...prevData, pm_approved_on: currentDate }));
    }, []);

    const handlePrint = () => {
        window.print();
    };

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
            showRemarks ? <div className='RemarksFlexBox'>
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
                navigate(`/blastingsheetlist?menuId=${menuId1}`)
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

    function condenseData(input) {
        let dataArray = input?.split(',');
        let commonPrefix = dataArray[0]?.slice(0, -2);
        let uniqueNumbers = dataArray?.map(item => item.split('-').pop());
        let result = commonPrefix + '' + uniqueNumbers.join(', ');
        return result;
    }

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 3000);
    }, []);

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `CRMTI-${reportTestDate}-${headerDetails.current?.procSheetNo}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    function convertTo12HourFormat(timeStr) {
        const date = new Date(`1970-01-01T${timeStr}Z`);

        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();

        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'

        const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

        return `${hours}:${minutesFormatted} ${ampm}`;
    }

    function convertDate(dateStr) {
        console.log(dateStr);
        const [year, month, day] = dateStr.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        return formattedDate
    }

    const emptyRows = 4 - testDetails.length;

    return (
        <>
            {
                loading ? (
                    <Loading />
                ) : loader ? (
                    <Loader />
                ) : (
                    <>
                        <div className='BarePipeReport'>
                            <div className="DownloadPrintFlexSection">
                                <h4 onClick={handleDownloadPDF}>
                                    <i className="fas fa-download"> </i> Download PDF
                                </h4>
                                <h4 onClick={handlePrint}>
                                    <i className="fas fa-print"></i> Print
                                </h4>
                            </div>

                            <div ref={contentRef}>
                                <div className='InspReportSection PrintCallib page-break' ref={contentRef}>
                                    <div className='container-fluid'>
                                        <div className='row'>
                                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                                <div className='InspReportBox'>
                                                    <HeaderDataSection reportData={headerDetails.current} />
                                                    <section className='Reportmasterdatasection'>
                                                        <div className='container-fluid'>
                                                            <form className='row'>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Client</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails?.current?.ClientName}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Report No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>CRMTI/{reportTestDate} - 01 {headerDetails?.current?.ReportPqt == '' ? '' : (
                                                                            <> ({headerDetails?.current?.ReportPqt})</>
                                                                        )} </h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">{key ? key : ''}.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{value ? value : ''}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Date & Shift</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails?.current?.DateShift}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Pipe Size</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.current?.PipeSize}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Acceptance Criteria</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.current?.AcceptanceCriteria}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    {/* <div className='form-group'>
                                                                        <label htmlFor="">Specification</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails.current?.specification}</h4>
                                                                    </div> */}
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Process Sheet No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.current?.ProcSheetNo} {headerDetails?.current?.procesheet_revisionno ? "REV. " + headerDetails?.current?.procesheet_revisionno : 0}  {headerDetails?.current?.procesheet_revisionno ? "DATE : " + convertDate(headerDetails?.current?.procesheet_revisiondate.split("T")[0]) : ''}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Type Of Coating</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.current?.TypeofCoating}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Procedure / WI No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.current?.WINO && condenseData(headerDetails?.current?.WINO) || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </section>

                                                    <section className='ReporttableSection' >
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                    <div id='custom-scroll'>
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th style={{ width: '60px' }}>Sr. No.</th>
                                                                                    <th>Instrument Name</th>
                                                                                    <th>Make</th>
                                                                                    <th>Standard Reading</th>
                                                                                    <th>Accuracy of Reading</th>
                                                                                    <th>Actual Reading of The Instrument</th>
                                                                                    <th>Error</th>
                                                                                    <th>Time</th>
                                                                                    <th>Remarks</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {testDetails?.map((item, index) =>
                                                                                    <tr key={index}>
                                                                                        <td>{index + 1}</td>
                                                                                        <td>{item.InstrumentName}</td>
                                                                                        <td>{item.Make}</td>
                                                                                        <td>{item.workmin + "-" + item.workmax}{item.Unit == "NA" ? "" : " " + item.Unit}</td>
                                                                                        <td>{item.PM_Reqmnt_test_min + "-" + item.PM_Reqmnt_test_Max}</td>
                                                                                        <td>{item.pm_inst_reading}{item.Unit == "NA" ? "" : " " + item.Unit}</td>
                                                                                        <td>{item.pm_inst_error}{item.Unit == "NA" ? "" : " " + item.Unit}</td>
                                                                                        <td>{convertTo12HourFormat(item.pm_test_time)}</td>
                                                                                        <td>{item.pm_remarks}</td>
                                                                                    </tr>
                                                                                )}
                                                                                {Array.from({ length: emptyRows }, (_, index) => (
                                                                                    <tr key={`empty-${index}`} style={{ height: "30px" }}>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                        <td>&nbsp;-</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className='ResultPageSection'>
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.current?.specification} & QAP NO.- {headerDetails?.current?.AcceptanceCriteria} AND FOUND SATISFACTORY.</span></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <Footerdata data={signatureReport} witness={randomWitnesses} />

                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                        </div>
                    </>
                )
            }
        </>
    );
}

export default CalibrationBlastingReport;