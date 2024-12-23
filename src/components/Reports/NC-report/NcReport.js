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
import Loading from "../../Loading";
import Loader from "../../Loader";

function NcReport() {
    const token = secureLocalStorage.getItem('token')
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const [headerDetails, setHeaderDetails] = useState({});
    const [testDetails, setTestDetails] = useState([]);
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const [reportTestDate, setReportTestDate] = useState()
    const [signatureReport, setSignatureReport] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [witnessValue, setWitnessValue] = useState('');
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const location = useLocation();
    const [isClicked, setIsClicked] = useState(false)
    const navigate = useNavigate();
    const pathSegments = location.pathname.split(/[\/&]/);
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")
    const [regPerc, setRegPerc] = useState();
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    const processSheetId = searchParams.get("processSheetId");
    const projectId = searchParams.get("project_id");
    const ViewType = searchParams.get("ViewType");
    const approverUser = secureLocalStorage.getItem("empId")
    console.log(secureLocalStorage.getItem("empId"), "empId")

    let pm_project_id1 = null;
    let pm_processSheet_id1 = null;
    let pm_processtype_id1 = null;
    let pm_approved_by1 = null;
    let pm_Approve_level1 = null;
    let menuId1 = null;
    for (let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i].startsWith('pm_project_id=')) {
            pm_project_id1 = pathSegments[i].substring('pm_project_id='.length);
        }
        if (pathSegments[i].startsWith('pm_processSheet_id=')) {
            pm_processSheet_id1 = pathSegments[i].substring('pm_processSheet_id='.length);
        }
        if (pathSegments[i].startsWith('pm_processtype_id=')) {
            pm_processtype_id1 = pathSegments[i].substring('pm_processtype_id='.length);
        }
        if (pathSegments[i].startsWith('pm_approved_by=')) {
            pm_approved_by1 = pathSegments[i].substring('pm_approved_by='.length);
        }
        if (pathSegments[i].startsWith('pm_Approve_level=')) {
            pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
        }
        if (pathSegments[i].startsWith('menuId=')) {
            menuId1 = pathSegments[i].substring('menuId='.length);
        }
    }

    // const [id1, id2, id3, id4] = tstmaterialid.split('&');
    const [formData, setFormData] = useState({
        co_comp_id: 1,
        co_location_id: 1,
        runid: parseInt(id),
        pm_project_id: parseInt(projectId),
        pm_processsheet_id: parseInt(processSheetId),
        pm_approver_type: ViewType == 'first' ? "1" : ViewType == "second" ? "2" : "0",
        pm_remarks: "",
        pm_approver_status: "",
        pm_approved_by: approverUser.toString(),
        pm_testdate: new Date().toISOString().split('T')[0],
    });

    const parseKeyValuePair = (str) => {
        const parts = str.split(':-');
        const key = parts[0].trim(); // Key before ':-'
        const value = parts[1]?.trim(); // Value after ':-', using optional chaining
        return { key, value };
    };

    useEffect(() => {
        const fetchData = async () => {
            console.log("true")
            setLoading(true);
            try {
                if (true) {
                    // const [id1, id2, id3, id4] = tstmaterialid.split('&');
                    const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetNCDataReport?ProcessSheetID=${processSheetId}&nc_run_id=${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    const data = response?.data[0][0];
                    setHeaderDetails(data || {});
                    console.log(response.data[0], "okasy")
                    setTestDetails(response.data[1]);
                    const { key, value } = parseKeyValuePair(data.pONo);
                    setKey(key);
                    setKeyValue(value)

                    const date = data?.formatdate || {}
                    const formattedDate = date?.split('T')[0]
                    const newDateStr = formattedDate.replace(/-/g, '');
                    setReportTestDate(newDateStr);
                }
                try {
                    if (true) {
                        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetailsNC?procsheet_id=${processSheetId}&nc_run_id=${id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            }
                        });
                        const data = response?.data
                        setSignatureReport(data)
                        // callWitness()
                    }
                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching report data:', error);
                    setLoading(false)
                }
            } catch (error) {
                setLoading(false)
                console.error('Error fetching report data:', error);
            }
        };
        fetchData();
    }, []);

    // async function callWitness() {
    //     try {
    //         const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}&p_type_id=${pm_processtype_id1}`);
    //         if (!response1 || !response1.data) {
    //             toast.error('Witness not found.');
    //         }

    //         setWitnessData(response1?.data)
    //         const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
    //         if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 == 'second') {
    //             setShowRemarks(true)
    //         } else {
    //             setShowRemarks(false)
    //         }
    //         setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
    //         setWitnessValue(response1?.data[0]?.roleId)
    //         setWitnessSelected(true);
    //         const matchingData = response1?.data.find(item => item.roleId == companyId);
    //         const regPerc = matchingData ? matchingData.reg_perc : null;
    //         setRegPerc(regPerc)
    //     } catch (error) {
    //         console.error('Error in callWitness:', error.message);
    //         setWitnessSelected(false);
    //         setShowRemarks(false);
    //         setRegPerc(null);
    //         setWitnessData([]);
    //     }
    // }

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
            setFormData({ ...formData, pm_approver_status: "A", pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? witnessValue.toString() : companyId.toString() });
            setWitnessSelected(true);
            setShowWitness(true);
        }
        if (value === "R") {
            setFormData({ ...formData, pm_approver_status: "R", pm_approvedRoleId_by: "0" });
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
        if (ViewType == "first") {
            return (
                <div className="bare-pipe-inspection">
                    {renderApprovalSection()}
                    {/* {showWitness && (<div className="SelectWitnessFlexBox">
                        <label htmlFor="" >Select Witness <b>*</b></label>
                        <select name="" value={witnessValue} onChange={handleSelect}>
                            <option disabled selected>Select Witness</option>
                            {witnessData && witnessData?.map((data) => {
                                return (
                                    <option value={data?.roleId}>{data?.Name}</option>
                                )
                            })}
                        </select>
                    </div>)} */}
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
        if (ViewType == "second") {
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
            const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionNCApproval", {
                method: "POST",
                headers: {
                    'Content-Type': `application/json`,
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const responseBody = await response.text();
            if (responseBody === '1000' || responseBody === '200') {
                toast.success('Status Updated Successfully!');
                navigate(`/nc-list?moduleId=618&menuId=38`)
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
            filename: `${headerDetails?.reportAlias}/${reportTestDate}.replace(/\//g, "-")}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handlePrint = () => {
        window.print();
    };

    const chunkAndPadArray = (array, chunkSize) => {
        console.log(array, testDetails, "array")
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const chunkedData = chunkAndPadArray(testDetails, 10);

    return (
        <>
            {
                loading ? (
                    <Loading />
                ) : loader ? (
                    <Loader />
                ) : (
                    <div style={{ overflowX: 'hidden' }}>
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
                            {chunkedData.map((chunk, chunkIndex) => (
                                <div key={chunkIndex} className='InspReportSection PrintCd page-break' ref={contentRef}>
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
                                                                        <span>: &nbsp;</span>
                                                                        <h4 style={{ textTransform: 'uppercase' }}> {headerDetails?.clientName || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Report No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>
                                                                            {headerDetails?.reportAlias}/{reportTestDate} - {String(chunkIndex + 1).padStart(2, '0')}
                                                                            {/* {headerDetails?.reportPqt == '' ? '' : (
                                                                        <> ({headerDetails.reportPqt})</>
                                                                    )} */}
                                                                        </h4>
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
                                                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails?.dateShift || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Pipe Size</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.pipeSize || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                {/* <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Process Sheet No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.procSheetNo} REV.  {headerDetails?.procesheet_revisionno
                                                                            ? String(headerDetails?.procesheet_revisionno).padStart(2, '0')
                                                                            : '00'}  {headerDetails?.procesheet_revisionno ? "DATE : " + convertDate(headerDetails?.procesheet_revisiondate.split("T")[0]) : ''}</h4>
                                                                    </div>
                                                                </div> */}
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Acceptance Criteria</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.acceptanceCriteria || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Type Of Coating</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.typeofCoating || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Procedure / WI No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.WINO || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </section>

                                                    {Array.isArray(testDetails) && testDetails.length > 0 && (
                                                        <section className='ReporttableSection'>
                                                            <div className='container-fluid'>
                                                                <div className='row'>
                                                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                        <div id='custom-scroll'>
                                                                            <table>
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th style={{ width: '60px' }}>Sr. No.</th>
                                                                                        <th>Pipe No.</th>
                                                                                        <th>Date of Non Conformance</th>
                                                                                        <th>Nature of Non Conformance</th>
                                                                                        <th>Date of Reprocess</th>
                                                                                        <th>Field No.</th>
                                                                                        <th>Remarks</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {chunk?.map((item, index) => {
                                                                                        return (
                                                                                            <tr key={index + 1}>
                                                                                                <td>{index + 1}</td>
                                                                                                <td>{item.pm_pipe_code || "-"}</td>
                                                                                                <td>{new Date(item.pm_reject_date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-"}</td>
                                                                                                <td>{item.rejectStatusid || "-"}</td>
                                                                                                <td>{item.dateOfReprocess || "-"}</td>
                                                                                                <td>{item.field_no || "-"}</td>
                                                                                                <td>{item.remarks || "-"}</td>
                                                                                            </tr>
                                                                                        )
                                                                                    })}
                                                                                </tbody>
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
                                                                                <td style={{ borderBottom: "none", padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICAION - <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.specification} & QAP NO.- {headerDetails?.acceptanceCriteria || "-"}</span></td>
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
                                                                                <th colSpan={2} style={{ textAlign: 'center' }}> ISSUED BY</th>
                                                                                <th colSpan={4} style={{ textAlign: 'center' }}> ISSUED TO</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Department</th>
                                                                                <td>Quality</td>
                                                                                {/* <td>{testDetails[0].Department || "-"}</td> */}
                                                                                <th>Department</th>
                                                                                <td>Production</td>
                                                                                <th>Responsibility</th>
                                                                                <td>Production Shift Incharge</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Date</th>
                                                                                <td>{new Date(headerDetails?.pm_issued_date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-"}</td>
                                                                                <th>Target Date</th>
                                                                                <td colSpan={3}>{new Date(headerDetails?.pm_target_date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-"}</td>
                                                                            </tr>
                                                                        </thead>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    </section>

                                                    <section className='ResultPageSection'>
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td colSpan={3} style={{ borderBottom: "none", padding: '2px 12px' }}>Root Cause Analysis: <br /> <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.pm_root_cause}</span></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td colSpan={3} style={{ padding: '2px 12px' }}>Correction Action Planned - <br /> <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.pm_correction_action}</span></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td colSpan={1} style={{ padding: '2px 12px', borderRight: '1px solid #dddddd', maxWidth: '350px', width: '350px' }}>Implementation Date - <span style={{ fontFamily: 'Myriad Pro Light' }}>{signatureReport[0] ? new Date(signatureReport[0]?.date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-" : '-'}</span></td>
                                                                                <td colSpan={2} style={{ padding: '2px 12px' }}>Signature - <span style={{ fontFamily: 'Myriad Pro Light' }}>{signatureReport[0] ? <img className="QCSignatureImg" src={`${Environment.ImageURL}/${signatureReport[0]?.employeeSign}`} alt="QC Signature" /> : "-"}</span></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td colSpan={3} style={{ padding: '2px 12px' }}>Effectiveness of corrective action - <br /> <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.pm_action_effectiveness}</span></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td colSpan={1} style={{ padding: '2px 12px', borderRight: '1px solid #dddddd', maxWidth: '350px', width: '350px' }}>Reviewed Date - <span style={{ fontFamily: 'Myriad Pro Light' }}>{signatureReport[1] ? new Date(signatureReport[1]?.date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-" : '-'}</span></td>
                                                                                <td colSpan={2} style={{ padding: '2px 12px' }}>Reviewed By - <span style={{ fontFamily: 'Myriad Pro Light' }}>{signatureReport[1] ? <img className="QCSignatureImg" src={`${Environment.ImageURL}/${signatureReport[1]?.employeeSign}`} alt="QC Signature" /> : "-"}</span></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    {/* <Footerdata data={signatureReport} /> */}
                                                </div>
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

export default NcReport;