import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../environment";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../Allreports.css';
import './BeforeProcess.css';
import HeaderDataSection from "../Headerdata";
import Footerdata from '../Footerdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "../../Loading";
import Loader from "../../Loader";

function BeforeProcessLabTestReport() {
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const [headerDetails, setHeaderDetails] = useState({});
    const [testDetails, setTestDetails] = useState([]);
    const [instrumentDetails, setInstrumentDetails] = useState([]);
    const [rawMaterialDetails, setRawMaterialDetails] = useState([]);
    const [reportTestDate, setReportTestDate] = useState()
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
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

    const parseKeyValuePair = (str) => {
        // Split the string by ':-'
        const parts = str.split(':-');

        // Trim whitespace from both parts
        const key = parts[0].trim(); // Key before ':-'
        const value = parts[1]?.trim(); // Value after ':-', using optional chaining

        return { key, value };
    };

    let pm_project_id1 = null;
    let pm_processSheet_id1 = null;
    let pm_processtype_id1 = null;
    let pm_approved_by1 = null;
    let test_date1 = null;
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
        if (pathSegments[i].startsWith('test_date=')) {
            test_date1 = pathSegments[i].substring('test_date='.length);
        }
        if (pathSegments[i].startsWith('pm_Approve_level=')) {
            pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
        }
        if (pathSegments[i].startsWith('menuId=')) {
            menuId1 = pathSegments[i].substring('menuId='.length);
        }
    }

    const [id1, id2, id3, id4] = tstmaterialid.split('&');
    const [formData, setFormData] = useState({
        pm_comp_id: 1,
        pm_location_id: 1,
        pm_project_id: parseInt(pm_project_id1),
        pm_processSheet_id: parseInt(pm_processSheet_id1),
        pm_processtype_id: parseInt(pm_processtype_id1),
        pm_remarks: "",
        pm_approver_status: true,
        pm_approved_by: pm_approved_by1,
        pm_approved_on: test_date1,
        pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
        pm_approvedRoleId_by: '0',
        p_test_run_id: parseInt(id2)
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                if (tstmaterialid) {
                    const [id1, id2, id3, id4] = tstmaterialid.split('&');
                    const response = await axios.get(`${Environment.BaseAPIURL}/api/User/BeforeProcessReport?typeid=${id3}&TestRunId=${id2}&procsheet_id=${id1}&test_id=${id4}`);
                    const data = response?.data;
                    const date = data[0][0]?.ReportTestDate || {}
                    // const [month, day, year] = date.split('T');
                    const formattedDate = date?.split('T')[0]
                    const newDateStr = formattedDate.replace(/-/g, '');
                    setReportTestDate(newDateStr);
                    setHeaderDetails(data[0][0] || {});
                    setTestDetails(data[1] || []);

                    const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetails?TestRunId=${id2}&ProcessSheetId=${pm_processSheet_id1}`);
                    const data1 = response1?.data
                    setInstrumentDetails(data1);
                    setRawMaterialDetails(data[3]);

                    const { key, value } = parseKeyValuePair(data[0][0].PONo);
                    setKey(key);
                    setKeyValue(value)

                    try {
                        if (tstmaterialid) {
                            const [id1, id2, id3, id4] = tstmaterialid.split('&');
                            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=${id3}&testId=${id2}`);
                            const data = response?.data
                            setSignatureReport(data)
                            callWitness()
                        }
                        setLoading(false)
                    } catch (error) {
                        console.error('Error fetching report data:', error);
                        setLoading(false)
                    }
                }
            } catch (error) {
                setLoading(false)
                console.error('Error fetching report data:', error);
            }
        };
        fetchData();
    }, [tstmaterialid]);

    async function callWitness() {
        try {
            const [id1, id2] = tstmaterialid.split('&');
            const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${id1}&p_test_run_id=${id2}&p_type_id=${pm_processtype_id1}`);
            if (!response1 || !response1.data) {
                toast.error('Witness not found.');
            }

            setWitnessData(response1?.data)
            setWitnessValue(response1?.data[0]?.roleId)
            setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : response1?.data[0]?.roleId.toString() })
            setWitnessSelected(true);
        } catch (error) {
            console.error('Error in callWitness:', error.message);
            setWitnessSelected(false);
            setShowRemarks(false);
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
            setFormData({ ...formData, pm_approver_status: true, pm_approvedRoleId_by: witnessValue.toString() });
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
            showRemarks ? <div className='RemarksFlexBox' style={{ marginTop: '10px' }}>
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
                    "Content-Type": "application/json",
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
        const content = contentRef.current;
        const options = {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight,
        };

        // table borders for PDF generation
        const tableElements = content.querySelectorAll('table');
        tableElements.forEach(table => {
            table.style.border = '1px solid #999999';

            // borders from table cells
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.border = '1px solid #999999';
            });
        });

        html2canvas(content, options)
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF('landscape', 'mm', 'a4');
                pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
                pdf.save(`LTR-${headerDetails?.ReportAlias}/${reportTestDate}.pdf`);
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                alert('An error occurred while generating the PDF. Please try again later.');
            });
    };

    const handlePrint = () => {
        window.print();
    };

    function convertDate(dateString) {
        const date = dateString.split("T")[0]
        // Split the input date string into its components
        const dateParts = date?.split('-');

        // Rearrange the date parts to the desired format
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        return formattedDate.replace(/-/g, '.');
    }

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

    const mergeRow = (testDetails) => {
        const rowSpans = [];
        let currentPipeNo = null;
        let currentSpan = 0;

        testDetails.forEach((item, index) => {
            const isSamePipeNo = item.Test_Method === currentPipeNo;

            if (isSamePipeNo) {
                currentSpan++;
                rowSpans.push(0);
            } else {
                if (currentSpan > 0) {
                    rowSpans[rowSpans.length - currentSpan] = currentSpan;
                }
                currentPipeNo = item.Test_Method;
                currentSpan = 1;
                rowSpans.push(currentSpan);
            }
        });

        if (currentSpan > 0) {
            rowSpans[rowSpans.length - currentSpan] = currentSpan;
        }

        return rowSpans;
    }

    const rowSpans = mergeRow(testDetails);

    const emptyRows = 7 - testDetails.length;

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
                        <div className='InspReportSection page-break' ref={contentRef}>
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
                                                                <h4>: &nbsp;&nbsp; {headerDetails?.ClientName || "-"}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-5 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Report No.</label>:
                                                                <h4 style={{ marginLeft: '5px' }}>
                                                                    LTR/{headerDetails?.ReportAlias}/{reportTestDate} - 01
                                                                </h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-7 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Project Name</label>
                                                                <h4>: &nbsp;&nbsp; {headerDetails?.ProjectName || "-"}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-5 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Date & Shift</label>
                                                                <h4>: &nbsp;&nbsp;{headerDetails?.DateShift || "-"}
                                                                    {headerDetails?.ReportPqt == '' ? '' : (
                                                                        <> ({headerDetails?.ReportPqt})</>
                                                                    )}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-7 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">{key ? key : ''} </label>:
                                                                {/* <span>:</span> */}
                                                                <h4 style={{ marginLeft: '10px' }}>{value ? value : ''}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-5 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Process Sheet No.</label>
                                                                <span>: &nbsp;</span>
                                                                <h4>{headerDetails?.ProcSheetNo} REV.  {headerDetails?.procesheet_revisionno
                                                                    ? String(headerDetails?.procesheet_revisionno).padStart(2, '0')
                                                                    : '00'}  {headerDetails?.procesheet_revisionno ? "DATE : " + convertDate(headerDetails?.procesheet_revisiondate.split("T")[0]) : ''}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-7 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Pipe Size</label>
                                                                <h4>: &nbsp;&nbsp;{headerDetails?.PipeSize || "-"}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-5 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Procedure / WI No.</label>
                                                                <h4>: &nbsp;&nbsp;{headerDetails?.WINO && condenseData(headerDetails?.WINO) || "-"}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-7 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Type Of Coating</label>
                                                                <h4>: &nbsp;&nbsp;{headerDetails?.TypeofCoating || "-"}</h4>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-5 col-sm-6 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="">Production Date</label>
                                                                <h4>: &nbsp;&nbsp;{new Date(headerDetails?.ProductionDate).toLocaleDateString('en-GB') || "-"}</h4>
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
                                                                                <th>MATERIAL DESCRIPTION</th>
                                                                                <th>{id4 === '243' || id4 === '248' ? "BATCH NO." : "BATCH NO. / GRADE"}</th>
                                                                                <th>TEST DESCRIPTION</th>
                                                                                <th>TEST METHOD</th>
                                                                                <th>REQUIREMENT</th>
                                                                                <th>TEST RESULT</th>
                                                                                <th>REMARKS</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {id4 === '226' || id4 === '243' || id4 === '260' || id4 === '650' || id4 === '215' || id4 === '208' ?
                                                                                testDetails?.map((item, index) => (
                                                                                    <tr key={index}>
                                                                                        <td>{index + 1 || "-"}</td>
                                                                                        {rowSpans[index] > 0 && (
                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                {rawMaterialDetails[0]?.MaterialName || "-"}
                                                                                            </td>
                                                                                        )}
                                                                                        {rowSpans[index] > 0 && (
                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                {id4 === '243' || id4 === '248' ? rawMaterialDetails.map((data, index) => index === rawMaterialDetails.length - 1 ? data?.Batch + ' ' : data?.Batch + ', ') || "-" : 'Grade : ' + rawMaterialDetails[0]?.Grade || "-"}
                                                                                            </td>
                                                                                        )}
                                                                                        {rowSpans[index] > 0 && (
                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                {item.test_name || "-"}
                                                                                            </td>
                                                                                        )}
                                                                                        {rowSpans[index] > 0 && (
                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                {item.Test_Method || "-"}
                                                                                            </td>
                                                                                        )}
                                                                                        <td>{item.AcceptanceCriteria}</td>
                                                                                        <td>{item.pm_test_result_remarks}{item?.Unit === "NA" ? "" : " " + item.Unit}</td>
                                                                                        <td>{item.pm_test_result_suffix}</td>
                                                                                    </tr>
                                                                                )) :
                                                                                // 248 DM Water 
                                                                                testDetails?.map((item, index) => (
                                                                                    <tr key={index + 1}>
                                                                                        <td>{index + 1}</td>
                                                                                        {rowSpans[index] > 0 && (
                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                {item.test_name || "-"}
                                                                                            </td>
                                                                                        )}
                                                                                        <td>{"-"}</td>
                                                                                        <td>{item.Test_Description || "-"}</td>
                                                                                        {rowSpans[index] > 0 && (
                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                {item.Test_Method || "-"}
                                                                                            </td>
                                                                                        )}
                                                                                        <td>{item.AcceptanceCriteria}</td>
                                                                                        <td>{item.pm_test_result_remarks}{item?.Unit === "NA" ? "" : " " + item.Unit}</td>
                                                                                        <td>{item.pm_test_result_suffix}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            {Array.from({ length: emptyRows }, (_, index) => (
                                                                                <tr key={`empty-${index}`}>
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
                                            )}

                                            <section className='ResultPageSection'>
                                                <div className='container-fluid'>
                                                    <div className='row'>
                                                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <td style={{ borderBottom: "none", padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails?.specification} & QAP NO.- {headerDetails?.AcceptanceCriteria}</span></td>
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
                                                                        <th colSpan={3} style={{ textAlign: 'center', fontSize: '13px' }}>  USED INSTRUMENT</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>SR. NO.</th>
                                                                        <th>INSTRUMENT NAME</th>
                                                                        <th>INSTRUMENT ID / SERIAL NO.</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {instrumentDetails?.map((item, index) => (
                                                                        (item.SrNo || item.equip_name || item.equip_code) && (
                                                                            <tr key={index}>
                                                                                <td>{index + 1}</td>
                                                                                <td>{item.equip_name || "-"}</td>
                                                                                <td>{item.equip_code || "-"}</td>
                                                                            </tr>
                                                                        )))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </section>
                                            </section>

                                            <Footerdata data={signatureReport} />

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
                )
            }
        </>
    );
}

export default BeforeProcessLabTestReport;