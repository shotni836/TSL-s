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
import './Porosity.css';
import Loading from "../../Loading";
import Loader from "../../Loader";

function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString('en-GB') : "-";
}

const parseKeyValuePair = (str) => {
    const parts = str.split(':-');
    const key = parts[0].trim(); // Key before ':-'
    const value = parts[1]?.trim(); // Value after ':-', using optional chaining
    return { key, value };
};

function PorosityTest() {
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const [headerDetails, setHeaderDetails] = useState({});
    const [testDetails, setTestDetails] = useState([]);
    const [instrumentDetails, setInstrumentDetails] = useState([]);
    const [rawMaterialDetails, setRawMaterialDetails] = useState([]);
    const [signatureReport, setSignatureReport] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [reportTestDate, setReportTestDate] = useState()
    const [witnessValue, setWitnessValue] = useState('');
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const location = useLocation();
    const [isClicked, setIsClicked] = useState(false)
    const renderRows = useRef()
    const navigate = useNavigate()
    const pathSegments = location.pathname.split(/[\/&]/);
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")
    const [regPerc, setRegPerc] = useState();
    const [attachedFiles, setAttachedFiles] = useState([])

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
        pm_approved_on: new Date().toISOString().split('T')[0],
        pm_Approve_level: pm_Approve_level1 === "first" ? 1 : pm_Approve_level1 === "second" ? 2 : 0,
        pm_approvedRoleId_by: '0',
        p_test_run_id: parseInt(id2),
        pm_isfinalapproval: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (tstmaterialid) {
                    const [id1, id2, id3, id4] = tstmaterialid.split('&');
                    const response = await axios.post(`${Environment.BaseAPIURL}/api/User/GetCrossSectionInterfacePorosity?pm_procsheet_id=${id1}&testRunId=${id2}&rtype=${id3}&testid=${id4}`);
                    const data = response?.data[0];
                    setHeaderDetails(data._CdTesHeaderDetails[0] || {});
                    setTestDetails(data._HotWaterAdhesionTest24hrsReportDetails || []);

                    setRawMaterialDetails(data._CdTestRawMaterial || []);
                    setAttachedFiles(data._attachfiles)
                    const { key, value } = parseKeyValuePair(data._CdTesHeaderDetails[0].poNo);
                    setKey(key);
                    setKeyValue(value)

                    const date = id4 === '285' || id4 === '295' ? data._CdTesHeaderDetails[0]?.testFinishDate : data._CdTesHeaderDetails[0]?.reportTestDateNew;
                    const formattedDate = date?.split('T')[0]
                    const newDateStr = formattedDate.replace(/-/g, '');
                    setReportTestDate(newDateStr);

                    const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetails?TestRunId=${id2}&ProcessSheetId=${pm_processSheet_id1}`);
                    const data1 = response1?.data;
                    setInstrumentDetails(data1);

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
                console.error('Error fetching report data:', error);
            }
        };
        fetchData();
    }, [tstmaterialid]);

    async function callWitness() {
        try {
            const [id1, id2] = tstmaterialid.split('&');
            const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}&p_type_id=${pm_processtype_id1}`);
            if (!response1 || !response1.data) {
                toast.error('Witness not found.');
            }

            setWitnessData(response1?.data)
            const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
            if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 === 'second') {
                setShowRemarks(true)
            } else {
                setShowRemarks(false)
            }
            setWitnessValue(response1?.data[0]?.roleId)
            setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 === 'first' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
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

    function convertDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        return formattedDate
    }

    const mergeRow = (testDetails) => {
        const rowSpans = [];
        let currentPipeNo = null;
        let currentSpan = 0;

        testDetails.forEach((item, index) => {
            const isSamePipeNo = item.materialDescription === currentPipeNo;

            if (isSamePipeNo) {
                currentSpan++;
                rowSpans.push(0);
            } else {
                if (currentSpan > 0) {
                    rowSpans[rowSpans.length - currentSpan] = currentSpan;
                }
                currentPipeNo = item.materialDescription;
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

    const chunkAndPadArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };
    // 285,295-3 :: 251,305,306,307-6 :: 287-5 :: 283-4
    const noOfRow = id4 === '251' || id4 === '305' || id4 === '306' || id4 === '307' ? 6 : id4 === '285' || id4 === '295' ? 3 : id4 === '287' ? 5 : id4 == '283' ? 4 : 5;
    const chunkedData = chunkAndPadArray(testDetails, noOfRow);

    const emptyRows = noOfRow - testDetails.length;

    const PrintStyle = id4 === '306' || id4 === '307' ? 'Hardness' : '';

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
                            {chunkedData.map((chunk, chunkIndex) => (
                                <div key={chunkIndex} className={`InspReportSection ${PrintStyle} page-break`} ref={contentRef}>
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
                                                                        <h4>LTR/{headerDetails?.reportAlias}/{reportTestDate} - {String(chunkIndex + 1).padStart(2, '0')}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Project Name</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails?.projectName || '-'}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Date & Shift</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.dateShift || "-"}</h4>
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
                                                                        <label htmlFor="">Process Sheet No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.procSheetNo} REV.  {headerDetails?.procesheet_revisionno
                                                                            ? String(headerDetails?.procesheet_revisionno).padStart(2, '0')
                                                                            : '00'}  {headerDetails?.procesheet_revisionno ? "DATE : " + convertDate(headerDetails?.procesheet_revisiondate.split("T")[0]) : ''}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Pipe Size</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.pipeSize || "-"}</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">Procedure / WI No.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>{headerDetails?.procedureWINo || "-"}</h4>
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
                                                                        <label htmlFor="">Production Date</label>
                                                                        <span>: &nbsp;</span>
                                                                        {/* <h4>{headerDetails?.productionDate?.split(" ")[0].replace(/\//g, '/') || ""}{headerDetails?.reportPqt == '' ? '' : (
                                                                    <> & <span style={{ fontFamily: 'Myriad Pro Regular' }}>{headerDetails.reportPqt}</span></>
                                                                )}</h4> */}
                                                                        <h4>{headerDetails?.productionDate ? new Date(headerDetails?.productionDate).toLocaleDateString('en-GB').replace(/\//g, '/') : ""}{headerDetails?.reportPqt == '' ? '' : (
                                                                            <> & <span style={{ fontFamily: 'Myriad Pro Regular' }}>{headerDetails?.reportPqt}</span></>
                                                                        )}</h4>
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
                                                                                        <th style={{ width: '60px' }}>SR. NO.</th>
                                                                                        <th>MATERIAL DESCRIPTION</th>
                                                                                        <th>BATCH NO.</th>
                                                                                        <th>TEST DESCRIPTION</th>
                                                                                        <th>TEST METHOD</th>
                                                                                        <th>REQUIREMENT</th>
                                                                                        <th>TEST RESULT</th>
                                                                                        <th>REMARKS</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {chunk?.map((item, index) => {
                                                                                        const [tgValue, cureValue] = (item.pm_test_result_remarks || "").split("~");
                                                                                        return (
                                                                                            id4 == 306 || id4 == 307 ?
                                                                                                <tr key={index} >
                                                                                                    <td key={index + 1}>{index + 1 || "-"}</td>
                                                                                                    <td>{item.batchNo || '-'}</td>
                                                                                                    <td>-</td>
                                                                                                    {rowSpans[index] > 0 && (
                                                                                                        <td rowSpan={rowSpans[index]}>
                                                                                                            {item.testDescription || "-"}
                                                                                                        </td>
                                                                                                    )}
                                                                                                    {rowSpans[index] > 0 && (
                                                                                                        <td rowSpan={rowSpans[index]}>
                                                                                                            {item.testMethod || "-"}
                                                                                                        </td>
                                                                                                    )}
                                                                                                    {rowSpans[index] > 0 && (
                                                                                                        <td rowSpan={rowSpans[index]}>
                                                                                                            {item.acceptanceCriteria || "-"}
                                                                                                        </td>
                                                                                                    )}
                                                                                                    <td>{item.pm_test_result_remarks || "-"}{item.pm_test_result_remarks ? " " + item.unit : ''}</td>
                                                                                                    <td >{item.pm_test_result_suffix || "-"}</td>
                                                                                                </tr>
                                                                                                : id4 != 283 ?
                                                                                                    <tr key={index} >
                                                                                                        {id4 == '287' ? (
                                                                                                            rowSpans[index] > 0 && (
                                                                                                                <td rowSpan={rowSpans[index]}>
                                                                                                                    {index + 1 || "-"}
                                                                                                                </td>
                                                                                                            )
                                                                                                        ) : <td key={index + 1}>{index + 1 || "-"}</td>}
                                                                                                        {rowSpans[index] > 0 && (
                                                                                                            id4 == '285' || id4 == '295' || id4 == '287' || id4 == '305' ? <td rowSpan={rowSpans[index]}>
                                                                                                                {item.materialDescription || "-"}
                                                                                                            </td> : <td>{item.batchNo || '-'}</td>
                                                                                                        )}
                                                                                                        {rowSpans[index] > 0 && (
                                                                                                            id4 == '285' || id4 == '295' || id4 == '287' || id4 == '305' ? <td rowSpan={rowSpans[index]}>
                                                                                                                {item.batchNo || "-"}
                                                                                                            </td> : <td>-</td>
                                                                                                        )}
                                                                                                        {id4 == '287' ? <td>{item.testDescription || "-"}</td> : (
                                                                                                            rowSpans[index] > 0 && (
                                                                                                                <td rowSpan={rowSpans[index]}>
                                                                                                                    {item.testDescription || "-"}
                                                                                                                </td>
                                                                                                            )
                                                                                                        )}
                                                                                                        {rowSpans[index] > 0 && (
                                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                                {item.testMethod || "-"}
                                                                                                            </td>
                                                                                                        )}
                                                                                                        {rowSpans[index] > 0 && (
                                                                                                            <td rowSpan={rowSpans[index]}>
                                                                                                                {item.acceptanceCriteria || "-"}
                                                                                                            </td>
                                                                                                        )}
                                                                                                        {id4 == '295' || id4 == '287' ? <td>{item.pm_test_result_remarks || '-'}</td>
                                                                                                            : id4 == '285' ? <td>Rating - {item.pm_test_result_remarks || '-'}</td>
                                                                                                                : id4 == 305 ? <td>ΔMFR = {item.pm_test_result_remarks || "-"}{item.pm_test_result_remarks ? " " + item.unit : ''}</td>
                                                                                                                    : <td>{item.pm_test_result_remarks || "-"}{item.pm_test_result_remarks ? " " + item.unit : ''}</td>}
                                                                                                        {id4 == '287' ? (
                                                                                                            rowSpans[index] > 0 && (
                                                                                                                <td rowSpan={rowSpans[index]}>
                                                                                                                    {item.pm_test_result_suffix || "-"}
                                                                                                                </td>
                                                                                                            )
                                                                                                        ) : <td>{item.pm_test_result_suffix || "-"}</td>}
                                                                                                    </tr>
                                                                                                    : <>
                                                                                                        <tr key={`${index}-Tg`}>
                                                                                                            <td rowSpan={2}>{index + 1 || "-"}</td>
                                                                                                            <td rowSpan={2}>{item.materialDescription || "-"}</td>
                                                                                                            <td rowSpan={2}>{item.batchNo || "-"}</td>
                                                                                                            <td rowSpan={2}>{item.testDescription || "-"}</td>
                                                                                                            <td rowSpan={2}>{item.testMethod || "-"}</td>
                                                                                                            <td>ΔTg ≤ {item.pM_Reqmnt_test_min || "-"}°C</td>
                                                                                                            <td>ΔTg = {tgValue ? tgValue.trim() : "-"}</td>
                                                                                                            <td rowSpan={2}>{item.pm_test_result_suffix || "-"}</td>
                                                                                                        </tr>
                                                                                                        <tr key={`${index}-Cure`}>
                                                                                                            <td>CURE = Min. {item.pM_Reqmnt_test_min || "-"}%</td>
                                                                                                            <td>%CURE = {cureValue ? cureValue.trim() : "-"}</td>
                                                                                                        </tr>
                                                                                                    </>
                                                                                        )
                                                                                    })}
                                                                                    {Array.from({ length: emptyRows }, (_, index) => (
                                                                                        <tr key={`empty-${index}`} style={{ height: "22px" }}>
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

                                                    {id4 === '285' || id4 === '295' ? <section className='ResultPageSections'>
                                                        <div className='container-fluid'>
                                                            <div className='row'>
                                                                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ width: '840px' }}>Test Start Date : {formatDate(headerDetails?.testStartDate).replace(/\//g, '/') || "-"} & Time : {headerDetails?.testStartTimeNew || "-"}</td>
                                                                                <td>Test Finish Date : {formatDate(headerDetails?.testFinishDate).replace(/\//g, '/') || "-"} & Time : {headerDetails?.testFinishTimeNew || "-"}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section> : ''}

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
                                                                                <th colSpan={3} style={{ textAlign: 'center' }}> INSTRUMENT USED</th>
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

export default PorosityTest;