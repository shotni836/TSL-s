import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import Loading from '../../../Loading';
import '../../Allreports.css';
import HeaderDataSection from "../../Headerdata";
import Footerdata from './MtcFooterdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';
import secureLocalStorage from 'react-secure-storage';
import { encryptData } from '../Encrypt-decrypt';

function Packingreport() {
    const token = secureLocalStorage.getItem('token')
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const [headerDetails, setHeaderDetails] = useState([]);
    const [testDetails, setTestDetails] = useState([]);
    const [releaseSumm, setReleaseSumm] = useState([]);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const [signatureReport, setSignatureReport] = useState([])
    const [randomWitnesses, setRandomWitnesses] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [isClicked, setIsClicked] = useState(false)
    const location = useLocation();
    const navigate = useNavigate()
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [witnessValue, setWitnessValue] = useState('');
    const [regPerc, setRegPerc] = useState();
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")
    const empId = secureLocalStorage.getItem("empId");
    const userRole = secureLocalStorage.getItem("userRole");

    const searchParams = new URLSearchParams(location.search);
    const Id = searchParams.get("id");
    let pm_processSheet_id1 = searchParams.get('pm_processSheet_id');
    let pm_Approve_level1 = searchParams.get('pm_Approve_level');
    let menuId1 = searchParams.get('menuId');

    const [formData, setFormData] = useState({
        pm_comp_id: 1,
        pm_location_id: 1,
        pm_project_id: '',
        pm_processSheet_id: '',
        pm_remarks: "",
        pm_approver_status: true,
        pm_approved_by: empId,
        pm_approved_on: new Date().toLocaleDateString('fr-CA'),
        pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
        pm_approvedRoleId_by: '0',
        pm_run_id: parseInt(Id),
        pm_isfinalapproval: 0,
        p_Approve_Pending: 0,
        pm_processtype_id: 1431,
        ishod: ''
    });

    async function callWitness() {
        const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithNameMTC?p_procsheet_id=${pm_processSheet_id1}&runid=${Id}&rtype=${encryptData(1)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
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
        setRegPerc(regPerc);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCPRLDataReport?pm_procsheet_id=${pm_processSheet_id1}&runid=${Id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                setHeaderDetails(response.data[0][0]);
                setTestDetails(response.data[1] || []);
                setReleaseSumm(response.data[2] || []);
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
            try {
                if (tstmaterialid) {
                    const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetailsMTC?runid=${Id}&p_procsheet_id=${pm_processSheet_id1}&rtype=${encryptData(1)}`, {}, {
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
            const dataToSend = {
                ...formData,
                pm_project_id: headerDetails.projectId,
                pm_processSheet_id: parseInt(headerDetails.psno),
                ishod: userRole.toLowerCase() === 'hod' ? 1 : 0
            }

            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/InspectionMTCApprovals`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const responseBody = await response.text();

            if (responseBody === '100' || responseBody === '200') {
                toast.success('Status Updated Successfully!');
                navigate(`/packinglist?menuId=${menuId1}`)
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

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, []);

    const chunkAndPadArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            const chunk = array.slice(i, i + chunkSize);
            while (chunk.length < chunkSize) {
                chunk.push({ someData: "-" });
            }
            chunks.push(chunk);
        }
        return chunks;
    };

    const chunkedData = chunkAndPadArray(testDetails, 20);

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Bare-Pipe-report-${headerDetails?.procSheetNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <>
            {loading ? <Loading /> :
                <>
                    <div className='BarePipeReport BarePipePrintReport'>
                        <div className="DownloadPrintFlexSection">
                            <h4 onClick={handleDownloadPDF}>
                                <i className="fas fa-download"> </i> Download PDF
                            </h4>
                            <h4 onClick={handlePrint}>
                                <i className="fas fa-print"></i> Print
                            </h4>
                        </div>
                        <div ref={contentRef}>
                            {chunkedData.map((chunk, chunkIndex) => (
                                <div key={chunkIndex} className='InspReportSection' ref={contentRef}>
                                    <div className='container-fluid'>
                                        <div className='row'>
                                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                                <div className='CustomBarePipeWitnessFlex'>
                                                    <div className='InspReportBox PotraitBarePipeSectionPage'>

                                                        <HeaderDataSection reportData={headerDetails} />

                                                        <section className='Reportmasterdatasection' id='Reportmasterdata'>
                                                            <div className='container-fluid'>
                                                                <form className='row'>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Customer Name</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails.ClientName}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">MTC No.</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.MTC_no}- {String(chunkIndex + 1).padStart(2, '0')}
                                                                            </h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Project</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.ProjectName}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Coated Pipe Release List</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.CPR_no}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Specification</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.specification}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Date</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{new Date(headerDetails?.Date).toLocaleDateString('en-GB')}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">QAP No.</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.ps_qap_no}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Pipe Size</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.PipeSize}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Type of Coating</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.TypeofCoating}</h4>
                                                                        </div>
                                                                    </div>

                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">Sales Order No.</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.pm_salesord_no}</h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                                                        <div className='form-group'>
                                                                            <label htmlFor="">P.O No.</label>
                                                                            <span>: &nbsp;</span>
                                                                            <h4>{headerDetails?.po_item_no}</h4>
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
                                                                            <table className='BarePipeInspCustomTable'>
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Sr. No.</th>
                                                                                        <th>Field No./Coat No.</th>
                                                                                        <th>Pipe No.</th>
                                                                                        <th>Heat No.</th>
                                                                                        <th>Length (mtr)</th>
                                                                                        <th>Date of Coating</th>
                                                                                        <th>Remarks</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {chunk?.map((row, index) => {
                                                                                        const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');
                                                                                        const testOnPipe = row.pm_remark;
                                                                                        const cdTests = [
                                                                                            '24 Hours CD',
                                                                                            '28 Days (Hot) CD',
                                                                                            '28 Days (Normal) CD',
                                                                                            '30 Days (Hot) CD',
                                                                                            '30 Days (Normal) CD',
                                                                                            '48 Hours CD'
                                                                                        ];

                                                                                        // Check for CD tests, Impact Strength Test, Bond Strength Test, Cross cut test, and Degree Of Cure conditions
                                                                                        const showCdTest = cdTests.some(test => testOnPipe?.includes(test));

                                                                                        const showImpactTest = testOnPipe?.includes('Impact Strength Test');
                                                                                        const showPeelTest = testOnPipe?.includes('Bond Strength Test - HOT') || testOnPipe?.includes('Bond Strength Test - NORMAL');
                                                                                        const showMiddlePeelTest = testOnPipe?.includes('Bond Strength Test - HOT (Middle)') || testOnPipe?.includes('Bond Strength Test - NORMAL (Middle)');
                                                                                        const showCrossCutTest = testOnPipe?.includes('Cross cut');
                                                                                        const showDSCTest = testOnPipe?.includes('Degree Of Cure');

                                                                                        return (
                                                                                            <tr key={index}>
                                                                                                {hasData ? <td> {index + 1 || "-"}</td> : <td>-</td>}
                                                                                                {hasData ? <td> {row.pm_field_no || "-"}</td> : <td>-</td>}
                                                                                                {hasData ? <td> {row.pm_pipe_code || "-"}</td> : <td>-</td>}
                                                                                                {hasData ? <td> {row.pm_heat_number || "-"}</td> : <td>-</td>}
                                                                                                {hasData ? <td> {row.pm_pipe_length || "-"}</td> : <td>-</td>}
                                                                                                {hasData ? <td> {new Date(row.pm_coating_date).toLocaleDateString('en-GB') || "-"}</td> : <td>-</td>}
                                                                                                {hasData ? <td> {(showCdTest || showImpactTest || showPeelTest || showMiddlePeelTest || showCrossCutTest || showDSCTest)
                                                                                                    ? [
                                                                                                        showCdTest ? "CD test" : null,
                                                                                                        showImpactTest ? "Impact test" : null,
                                                                                                        showPeelTest ? "Peel Test" : null,
                                                                                                        showMiddlePeelTest ? "Middle Peel Test" : null,
                                                                                                        showCrossCutTest ? "Cross cut" : null,
                                                                                                        showDSCTest ? "DSC" : null
                                                                                                    ].filter(Boolean).join(", ") : '-'}</td> : <td>-</td>}
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </section>

                                                        {chunkIndex === chunkedData.length - 1 && (
                                                            <section className='ReporttableSection'>
                                                                <div className='container-fluid'>
                                                                    <div className='row'>
                                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                            <div id='custom-scroll'>
                                                                                <table className='BarePipeInspCustomTable'>
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th colSpan={3} style={{ textAlign: 'center' }}> Release Summary</th>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <th>Description</th>
                                                                                            <th>Nos.</th>
                                                                                            <th>Length (mtr)</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {releaseSumm?.map((row, index) => {
                                                                                            const data = ["Order Quantity", "Bare Pipe Received Quantity", "Previous Release Quantity", "Current Release Quantity"];

                                                                                            return (
                                                                                                <tr key={index}>
                                                                                                    <td> {data[index] || "-"}</td>
                                                                                                    <td> {row.pm_pipe_code || "-"}</td>
                                                                                                    <td> {row.pm_heat_number || "-"}</td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        )}

                                                        <Footerdata data={signatureReport} witness={randomWitnesses} />

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
            }
        </>
    );
}
export default Packingreport;