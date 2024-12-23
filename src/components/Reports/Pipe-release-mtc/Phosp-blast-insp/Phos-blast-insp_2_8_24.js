import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Loading from '../../../Loading';
import '../../Allreports.css';
import HeaderDataSection from "../../Headerdata";
import ReportRemarks from '../../Report-remarks';
import InstrumentusedSection from '../../Instrument-used';
import AboveresultsSection from '../../Above-results';
import Footerdata from '../../Footerdata';
import "../Bare-pipe-insp/BarePipe.css"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PhosBlastInsp() {
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const headerDetails = useRef([]);
    const [testDetails, setTestDetails] = useState([]);
    const [aboveresultsDetails, setAboveresultsDetails] = useState([]);
    const [instrumentDetails, setInstrumentDetails] = useState([]);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const [headers, setHeaders] = useState([])
    const [signatureReport, setSignatureReport] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [reportTestDate, setReportTestDate] = useState()
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const [rawMaterial, setRawMaterial] = useState([]);
    const [testMinMax, setTestMinMax] = useState([]);
    const location = useLocation();
    const pathSegments = location.pathname.split(/[\/&]/);
    const queryParams = new URLSearchParams(location.search);
    const navigate = useNavigate()
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [witnessValue, setWitnessValue] = useState('');
    const [isClicked, setIsClicked] = useState(false)
    const [minRow, setMinRow] = useState();
    const [maxRow, setMaxRow] = useState();

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

    console.log(typeof pm_project_id1, typeof (parseInt(pm_project_id1)))
    const [id1, id2] = tstmaterialid.split('&');
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


    async function callWitness() {
        const [id1, id2] = tstmaterialid.split('&');
        const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}`);
        setWitnessData(response1?.data)
        const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
        const hasRejectCountGreaterThanZero = response1?.data.some(item => item.RejectCount > 0);
        const allHaveZeroCounts = response1?.data.every(item => item.ApproveCount === 0 && item.RejectCount === 0);
        if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 == 'second') {
            // if (hasRejectCountGreaterThanZero || allHaveZeroCounts || pm_Approve_level1 == 'second') {
            setShowRemarks(true)
        } else {
            setShowRemarks(false)
        }
        // if (response1?.data.length == 1) {
        setWitnessValue(response1?.data[0]?.roleId)
        setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : response1?.data[0]?.roleId.toString() })
        setWitnessSelected(true);
        // }
    }

    const parseKeyValuePair = (str) => {
        // Split the string by ':-'
        const parts = str.split(':-');

        // Trim whitespace from both parts
        const key = parts[0].trim(); // Key before ':-'
        const value = parts[1]?.trim(); // Value after ':-', using optional chaining

        return { key, value };
    };

    useEffect(() => {
        console.log(tstmaterialid)
        const fetchData = async () => {
            try {
                const [id1, id2] = tstmaterialid.split('&');
                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/Get_MtcPhosphateReport?typeId=${pm_processtype_id1}&testId=${id2}`);
                const data = response.data[0];
                headerDetails.current = data._CdTesHeaderDetails[0]
                const date = data._CdTesHeaderDetails[0].reportTestDate || {}
                const [month, day, year] = date.split('/');
                const formattedDate = `${year}${day}${month}`;
                setReportTestDate(formattedDate);
                setRawMaterial(data._CdTestMat || []);
                // setTestDetails(data._CdTesMiddleDetails || []);
                // setHeaders(Object.keys(data._CdTesMiddleDetails[0]))
                setInstrumentDetails(data._CdTestInstrument || []);
                setTestMinMax(data._CdTestMaxMin || []);
                const { key, value } = parseKeyValuePair(data._CdTesHeaderDetails[0].poNo);
                setKey(key);
                setKeyValue(value)

                const mergedData = data._CdTesMiddleDetails.map(item => {
                    const result = {};
                    Object.keys(item).forEach(key => {
                        const match = data._CdTestMaxMin.find(d => d.co_param_val_alias === key);
                        if (match) {
                            result[key] = {
                                value: item[key],
                                PM_Reqmnt_test_Max: match.PM_Reqmnt_test_Max,
                                PM_Reqmnt_test_min: match.PM_Reqmnt_test_min
                            };
                        } else {
                            result[key] = { value: item[key] };
                        }
                    });
                    return result;
                });
                console.log(mergedData);

                const headers = Object.keys(mergedData[0]);

                // Extract rows
                const minValues = headers.map(header => mergedData[0][header].PM_Reqmnt_test_min || "-");
                const maxValues = headers.map(header => mergedData[0][header].PM_Reqmnt_test_Max || "-");
                const rows = mergedData.map(entry => {
                    return headers.map(header => entry[header].value);
                });
                console.log(minValues)
                setMinRow(minValues)
                setMaxRow(maxValues)
                // State hooks for headers, min/max values, and data rows
                setHeaders(headers)

                console.log(rows, '--data--')
                setTestDetails(rows)

            } catch (error) {
                console.error('Error fetching report data:', error);
            }
            try {
                if (tstmaterialid) {
                    const [id1, id2] = tstmaterialid.split('&');
                    const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=${pm_processtype_id1}&testId=${id2}`);
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

    const handleDownload = () => {
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
        // const tableElements = content.querySelectorAll('table');
        // tableElements.forEach(table => {
        //     table.style.border = '1px solid #999999';

        //     const cells = table.querySelectorAll('td, th');
        //     cells.forEach(cell => {
        //         cell.style.border = '1px solid #999999';
        //     });
        // });

        html2canvas(content, options)
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                const pdf = new jsPDF('landscape', 'mm', 'a4');

                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const width = imgWidth * ratio;
                const height = imgHeight * ratio;

                pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
                pdf.save('PHOSPHATE APPLICATION AND BLASTING INSPECTION REPORT.pdf');
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                alert('An error occurred while generating the PDF. Please try again later.');
            });
    };


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
        // setFormData({ ...formData, pm_approver_status: status });
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
            showRemarks ? <div className='RemarksFlexBox'>
                <label htmlFor="">Remarks</label>
                <span>: &nbsp;</span>
                <input name="pm_remarks" className="form-control" value={formData.pm_remarks} onChange={handleChange} type="text" placeholder="Enter Approval/Rejection Remarks...." autoComplete="off" />
                <div className='ApproveRejectUIFlex'>
                    <label className="custom-radio">
                        <input type="radio" className="Approveinput" name="pm_approver_status" id="btnaprv" onChange={() => handleStatusChange("A")} />
                        <span className="radio-btn"><i className="fas fa-check"></i>Approve</span>
                    </label>
                    <span>: &nbsp;</span>
                    <label className="custom-radio">
                        <input type="radio" className="Rejectinput" name="pm_approver_status" id="btnreject" onChange={() => handleStatusChange("R")} />
                        <span className="radio-btn"><i className="fas fa-times"></i>Reject</span>
                    </label>
                    <span>: &nbsp;</span>
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
                        <label htmlFor="">
                            Select Witness <b>*</b>
                        </label>
                        <span>: &nbsp;</span>
                        <select className="form-control" name="" value={witnessValue} onChange={handleSelect}>
                            <option disabled selected>Select Witness</option>
                            {witnessData && witnessData?.map((data) => {
                                return (
                                    <option value={data?.roleId}>{data?.Name}</option>
                                )
                            })}
                        </select>
                    </div>)}
                    <div className='SubmitBtnFlexBox'>
                        {<button type="button" className="SubmitBtn" onClick={handleSubmit}>Submit</button>}
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
                    {/* <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className='form-group'>
                            <label htmlFor="">Date of First Approval</label>
                            <span>: &nbsp;</span>
                            <h4>{headerDetails.first_approval_date || "05/30/2024"}</h4>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className='form-group'>
                            <label htmlFor="">Remarks</label>
                            <span>: &nbsp;</span>
                            <h4>{headerDetails.first_approval_remarks || "Remarks"}</h4>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className='form-group'>
                            <label htmlFor="">Approval Status</label>
                            <span>: &nbsp;</span>
                            <h4>{headerDetails.first_approval_status || "Approval Status"}</h4>
                        </div>
                    </div> */}
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <div className='renderApprovalFlexBox'>
                            {renderApprovalSection()}
                            {<button type="button" onClick={handleSubmit}>Submit</button>}
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
        console.log(formData, formData.pm_approver_status, 264)
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
                body: JSON.stringify(formData),
            });

            const responseBody = await response.text();

            if (responseBody === '100' || responseBody === '200') {
                toast.success('Status Updated Successfully!');
                navigate(`/blastingsheetlist?menuId=${menuId1}`)
                console.log("Form data sent successfully!");
            } else {
                console.error(
                    "Failed to send form data to the server. Status code:",
                    response.status
                );
                console.error("Server response:", responseBody);
            }
        } catch (error) {
            console.error("An error occurred while sending form data:", error);
        }
    };

    function condenseData(input) {
        // Split the input string into an array
        let dataArray = input?.split(',');

        // Extract the common prefix
        let commonPrefix = dataArray[0]?.slice(0, -2);

        // Extract the unique numbers
        let uniqueNumbers = dataArray?.map(item => item.split('-').pop());

        // Join the unique numbers into a single string
        let result = commonPrefix + '' + uniqueNumbers.join(', ');

        return result;
    }

    useEffect(() => {
        // fetchData();
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 3000);
    }, []);

    return (
        <>
            {
                loading ?
                    <Loading />
                    :
                    <>
                        <div>
                            <div style={{ textAlign: 'right', paddingRight: '14px', paddingTop: '10px' }}>
                                <h4 className='DownloadPDFBtn' onClick={handleDownload}>
                                    <i className="fas fa-download"> </i> Download PDF
                                </h4>
                                <h4 className='PrintBtn' onClick={handlePrint}>
                                    <i className="fas fa-print"></i> Print
                                </h4>
                            </div>
                            <div className='InspReportSection' ref={contentRef}>
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
                                                                    <h4 style={{ textTransform: 'uppercase' }}>{headerDetails.current.clientName}</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Report No.</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>{headerDetails.current?.reportAlias}{reportTestDate} - 01</h4>
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
                                                                    <h4>{headerDetails.current?.dateShift} Shift</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Pipe Size</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>{headerDetails.current?.pipeSize}</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Acceptance Criteria</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>QAP NO.- {headerDetails.current?.acceptanceCriteria} Rev.00 DATE: 29.01.2022</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Specification</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>Client spec. - {headerDetails.current?.specification} REV. 03 DATE: 19.09.2017</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Process Sheet No.</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>{headerDetails.current?.procSheetNo} Rev.00 DATE: 01.04.2022</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Type Of Coating</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>{headerDetails.current?.typeofCoating}</h4>
                                                                </div>
                                                            </div>
                                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                <div className='form-group'>
                                                                    <label htmlFor="">Procedure / WI No.</label>
                                                                    <span>: &nbsp;</span>
                                                                    <h4>{headerDetails.current?.wino && condenseData(headerDetails.current.wino) || "-"}, Rev.00</h4>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </section>

                                                {Array.isArray(testDetails) && testDetails.length > 0 && (
                                                    <section className='ReporttableSection PipeNumberTable'>
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                    <div id='custom-scroll'>
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    {headers.map((header, index) => (
                                                                                        <th key={index}>{header}</th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td colSpan="2">Specified Requirement Min</td>
                                                                                    <td>Min</td>
                                                                                    {minRow?.slice(3)?.map((item, rowIndex) => (
                                                                                        <td key={rowIndex}>{item}</td>
                                                                                    ))}
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colSpan="2">Specified Requirement Min</td>
                                                                                    <td>Max</td>
                                                                                    {maxRow?.slice(3)?.map((item, rowIndex) => (
                                                                                        <td key={rowIndex}>{item}</td>
                                                                                    ))}
                                                                                </tr>

                                                                                {testDetails.map((row, rowIndex) => (
                                                                                    <tr key={rowIndex}>
                                                                                        {row.map((cell, cellIndex) => (
                                                                                            <td key={cellIndex}>{cell}</td>
                                                                                        ))}
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

                                                <ReportRemarks reportData={headerDetails.current.testRemarks} />

                                                {/* <section className='ReporttableSection'>
                                                    <div className='container-fluid'>
                                                        <div className='row'>
                                                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                <div id='custom-scroll'>
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                <th style={{ minWidth: '150px' }}>RAW MATERIAL</th>
                                                                                <th style={{ minWidth: '150px' }}>MANUFACTURER</th>
                                                                                <th style={{ minWidth: '200px' }}>GRADE</th>
                                                                                <th style={{ minWidth: '40px' }}>BATCH NO.</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>1</td>
                                                                                <td>Phosphoric Acid</td>
                                                                                <td>Chemetall</td>
                                                                                <td>OAKITE - 31</td>
                                                                                <td>C132473885</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section> */}

                                                <section className='ResultPageSection'>
                                                    <div className='container-fluid'>
                                                        <div className='row'>
                                                            <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                                <table>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>ELAPSE TIME OBSERVED MAXIMUM 1Hr. BETWEEN BLASTING & COATING APPLICATION.</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style={{ borderBottom: "none" }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails.current?.specification} & {headerDetails.current?.acceptanceCriteria} AND FOUND SATISFACTORY.</span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                {Array.isArray(rawMaterial) && rawMaterial.length > 0 && (
                                                    <section className='ReporttableSection'>
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                    <div id='custom-scroll'>
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Sr. No.</th>
                                                                                    <th>Raw Material</th>
                                                                                    <th>Manufacturer</th>
                                                                                    <th>Grade</th>
                                                                                    <th>Batch No.</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {rawMaterial?.map((item, rowIndex) => (
                                                                                    <tr key={rowIndex}>
                                                                                        <td>{rowIndex + 1}</td>
                                                                                        <td>{item?.materialName}</td>
                                                                                        <td>{item?.manufacturerName}</td>
                                                                                        <td>{item?.grade}</td>
                                                                                        <td>{item?.batch}</td>
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

                                                <InstrumentusedSection reportData={instrumentDetails} />

                                                <Footerdata data={signatureReport} />

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
                                </div>
                            </div>
                        </div>
                    </>
            }
        </>
    );
}

export default PhosBlastInsp;