import React, { useRef, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../../Allreports.css';
import HeaderDataSection from "../../Headerdata";
import ReportRemarks from '../../Report-remarks';
import InstrumentusedSection from '../../Instrument-used';
import Footerdata from '../../Footerdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChromateCoatInsp() {

    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const headerDetails = useRef({});
    const [rawMaterial, setRawMaterial] = useState([]);
    const [testDetails, setTestDetails] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [instrumentDetails, setInstrumentDetails] = useState([]);
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const [reportTestDate, setReportTestDate] = useState()
    const [showWitness, setShowWitness] = useState(false)
    const [witnessData, setWitnessData] = useState([])
    const location = useLocation();
    const [signatureReport, setSignatureReport] = useState([])
    const pathSegments = location.pathname.split(/[\/&]/);

    let pm_project_id1 = null;
    let pm_processSheet_id1 = null;
    let pm_processtype_id1 = null;
    let pm_approved_by1 = null;
    let test_date1 = null;
    let pm_Approve_level1 = null;
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
    }
    const [id1, id2] = tstmaterialid.split('&');

    const [formData, setFormData] = useState({
        pm_comp_id: 1,
        pm_location_id: 1,
        pm_project_id: parseInt(pm_project_id1),
        pm_processSheet_id: parseInt(pm_processSheet_id1),
        pm_processtype_id: parseInt(pm_processtype_id1),
        pm_remarks: "",
        pm_approver_status: "",
        pm_approved_by: pm_approved_by1,
        pm_approved_on: test_date1,
        pm_approvedRoleId_by: 0,
        pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
        p_test_run_id: parseInt(id2)
    });

    async function callWitness() {
        const [id1, id2] = tstmaterialid.split('&');
        const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?testid=${id2}`);
        setWitnessData(response1?.data)
    }

    const handleSelect = (e) => {
        setFormData({ ...formData, pm_approvedRoleId_by: parseInt(e.target.value) })
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
        const fetchData = async () => {
            try {
                if (tstmaterialid) {
                    const [id1, id2] = tstmaterialid.split('&');
                    const response = await axios.post(`${Environment.BaseAPIURL}/api/User/Get_MtcPhosphateReport?typeid=${pm_processtype_id1}&testId=${id2}`);
                    const data = response.data[0];
                    headerDetails.current = data._CdTesHeaderDetails[0] || {}
                    setTestDetails(data._CdTesMiddleDetails || []);
                    console.log(data._CdTesMiddleDetails, 94)
                    setHeaders(Object.keys(data._CdTesMiddleDetails[0]))
                    setRawMaterial(data._CdTestMat || []);
                    const date = data._CdTesHeaderDetails[0].reportTestDate || {}
                    const parts = date?.split('/');
                    const formattedDate = `${parts[2]}${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}`;
                    setReportTestDate(formattedDate);
                    setInstrumentDetails(data._CdTestInstrument || []);
                    const { key, value } = parseKeyValuePair(data._CdTesHeaderDetails[0].poNo);
                    setKey(key);
                    setKeyValue(value)
                }
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
    }, [tstmaterialid]);

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
                pdf.save('Phos-blast-insp_report.pdf');
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                alert('An error occurred while generating the PDF. Please try again later.');
            });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStatusChange = (value) => {
        if (value === "A") {
            setFormData({ ...formData, pm_approver_status: true });
            setShowWitness(true)
            callWitness()
        }
        if (value === "R") {
            setFormData({ ...formData, pm_approver_status: false });
            setShowWitness(false)
        }
    };

    const renderApprovalSection = () => {
        return (
            <div className="col-md-12 col-sm-12 col-xs-12">
                <label htmlFor="">Remarks</label>
                <input name="pm_remarks" className="form-control" value={formData.pm_remarks} onChange={handleChange} type="text" placeholder="Enter Approval/Rejection Remarks...." autoComplete="off" />
                <label className="custom-radio">
                    <input type="radio" className="Approveinput" name="pm_approver_status" id="btnaprv" onChange={() => handleStatusChange("A")} />
                    <span className="radio-btn"><i className="fas fa-check"></i>Approve</span>
                </label>
                <label className="custom-radio">
                    <input type="radio" className="Rejectinput" name="pm_approver_status" id="btnreject" onChange={() => handleStatusChange("R")} />
                    <span className="radio-btn"><i className="fas fa-times"></i>Reject</span>
                </label>
            </div>
        );
    };

    const renderFirstApprovalStatus = () => {
        if (pm_Approve_level1 == "first") {
            return (
                <div className="col-md-12 col-sm-12 col-xs-12 bare-pipe-inspection">
                    {renderApprovalSection()}
                    {showWitness ? <div className="col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group Remarksform-group">
                            <label htmlFor="">
                                Select Witness <b>*</b>
                            </label>
                            <select className="form-control" onChange={handleSelect}>
                                <option disabled selected>Select Witness</option>
                                {witnessData?.map((data) => {
                                    return (
                                        <option value={data?.roleId}>{data?.Name}</option>
                                    )
                                })}
                            </select>
                        </div>
                    </div> : ""
                    }
                    {<button type="button" className="SubmitBtn mt-4" onClick={handleSubmit}>Submit</button>}
                </div >
            );
        } else {
            return null;
        }
    };

    const renderSecondApprovalStatus = () => {
        if (pm_Approve_level1 == "second") {
            return (
                <div className="col-md-12 col-sm-12 col-xs-12">
                    <label htmlFor="">Date of First Approval</label>
                    <h4>: &nbsp;&nbsp; {headerDetails.current.first_approval_date || "-"}</h4>
                    <label htmlFor="">Remarks</label>
                    <h4>: &nbsp;&nbsp; {headerDetails.current.first_approval_remarks || "-"}</h4>
                    <label htmlFor="">Approval Status</label>
                    <h4>: &nbsp;&nbsp; {headerDetails.current.first_approval_status || "-"}</h4>
                    {renderApprovalSection()}
                    {<button type="button" className="fas fa-submit" onClick={handleSubmit}>Submit</button>}
                </div>
            );
        } else {
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionSheetApproval", {
                method: "POST",
                headers: {
<<<<<<< HEAD
                    'Content-Type': `application/json`,
                    'Authorization': `Bearer ${token}`,
=======
                    "Content-Type": "application/json",
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
                },
                body: JSON.stringify(formData),
            });

            const responseBody = await response.text();

            if (responseBody === '100' || responseBody === '200') {
                toast.success('Sheet Approved!');
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

    return (
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
                                                    <h4>: &nbsp;&nbsp; {headerDetails.current.clientName || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Report No.</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.reportAlias}/{reportTestDate}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">{key ? key : ''}</label>
                                                    <h4>: &nbsp;&nbsp;{value ? value : "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Date & Shift</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.dateShift || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Pipe Size</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.pipeSize || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Acceptance Criteria</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.acceptanceCriteria || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Specification</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.specification || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Process Sheet No.</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.procSheetNo || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-7 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Type Of Coating</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.typeofCoating || "-"}</h4>
                                                </div>
                                            </div>
                                            <div className='col-md-5 col-sm-6 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Procedure / WI No.</label>
                                                    <h4>: &nbsp;&nbsp;{headerDetails.current.procedureWINo || "-"}</h4>
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
                                                                    <th>Sr. No.</th>
                                                                    {headers.map((header, index) => (
                                                                        <th key={index}>{header}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {testDetails?.map((item, rowIndex) => (
                                                                    <tr key={rowIndex}>
                                                                        <td key={rowIndex}>{rowIndex + 1}</td>
                                                                        {headers.map((header, colIndex) => (
                                                                            <td key={colIndex}>{item[header]}</td>
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

                                <ReportRemarks reportData={headerDetails.current} />

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
                                                                    <th>Line Speed (Mtr./Min)</th>
                                                                    <th>Dew Point of Air for Coating Application (°C)</th>
                                                                    <th>no. of Epoxy Gun</th>
                                                                    <th>HDPE Screw RPM</th>
                                                                    <th>Adhesive Screw RPM</th>
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
                                                                        <td>{'TBD'}</td>
                                                                        <td>{'TBD'}</td>
                                                                        <td>{'TBD'}</td>
                                                                        <td>{'TBD'}</td>
                                                                        <td>{'TBD'}</td>
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

                                {/* {Array.isArray(rawMaterial) && rawMaterial.length > 0 && (
                                    <section className='ReporttableSection'>
                                        <div className='container-fluid'>
                                            <div className='row'>
                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                    <div id='custom-scroll'>
                                                        <table>
                                                            <thead>
                                                                <tr>

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
                                )} */}

                                <section>
                                </section>

                                <InstrumentusedSection reportData={instrumentDetails} />
                                <Footerdata data={signatureReport} />
                                <div className="row text-center mt-4">
                                    {renderFirstApprovalStatus()}
                                    {renderSecondApprovalStatus()}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChromateCoatInsp;