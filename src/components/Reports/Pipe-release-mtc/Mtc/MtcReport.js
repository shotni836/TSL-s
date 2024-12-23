import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import '../../Allreports.css';
import RegisterEmployeebg from '../../../../assets/images/RegisterEmployeebg.jpg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';
import secureLocalStorage from 'react-secure-storage';
import Mtc1 from './Mtc1';
import Mtc2 from './Mtc2';
import Mtc3 from './Mtc3';
import Header from '../../../Common/Header/Header';
import Loading from '../../../Loading';
import Loader from '../../../Loader';
import { decryptData, encryptData } from '../../../Encrypt-decrypt';

function Mtcreport() {
    const token = secureLocalStorage.getItem('token')
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const contentRef = useRef();
    const [headerDetails, setHeaderDetails] = useState([]);
    const [testDetails1, setTestDetails1] = useState([]);
    const [testDetails2, setTestDetails2] = useState([]);
    const [testDetails3, setTestDetails3] = useState([]);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const [signatureReport, setSignatureReport] = useState([])
    const [randomWitnesses, setRandomWitnesses] = useState([])
    const [showRemarks, setShowRemarks] = useState([])
    const [isClicked, setIsClicked] = useState(false)
    const location = useLocation();
    const navigate = useNavigate()
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [witnessValue, setWitnessValue] = useState('');
    const [regPerc, setRegPerc] = useState();
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")
    const userId = secureLocalStorage.getItem("userId")
    const roleId = secureLocalStorage.getItem("roleId")
    const empId = secureLocalStorage.getItem("empId");
    const userRole = secureLocalStorage.getItem("userRole");
    const [itFalse, setItFalse] = useState(true);
    const [showThis, setShowThis] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const moduleId = searchParams.get('moduleId');
    const menuId = searchParams.get('menuId');
    const Id1 = searchParams.get("id");
    let Id = decryptData(Id1)
    let pm_processSheet_id1 = searchParams.get('pm_processSheet_id');
    let pm_Approve_level1 = searchParams.get('pm_Approve_level');

    const [data, setData] = useState({
        psId: '',
        packingNo: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => {
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const getReportData = async (e) => {
        if (pm_Approve_level1 != "view") { e.preventDefault() }
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetMTCDataReport?pm_procsheet_id=${pm_Approve_level1 != "view" ? encryptData(data.psId) : pm_processSheet_id1}&runid=${pm_Approve_level1 != "view" ? encryptData(data.packingNo) : Id1}&rtype=${encryptData(pm_Approve_level1 != "view" ? 1 : 2)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setItFalse(false);
            setShowThis(true);
            setHeaderDetails(response?.data[0][0]);
            setTestDetails1(response?.data[1] || [])
            setTestDetails2(response?.data[2] || []);
            setTestDetails3(response?.data[3] || []);
            if (response.data) {
                fetchData()
            }
        } catch (error) {
            toast.error('Error fetching data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
        pm_processtype_id: 1430,
        ishod: ''
    });

    async function callWitness() {
        try {
            const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithNameMTC?p_procsheet_id=${pm_Approve_level1 != "view" ? encryptData(data.psId) : pm_processSheet_id1}&runid=${pm_Approve_level1 != "view" ? encryptData(data.packingNo) : Id}&rtype=${encryptData(pm_Approve_level1 != "view" ? 1 : 2)}`, {
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
            setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId.toString() : companyId?.toString(), pm_isfinalapproval: response1?.data.length == 1 ? 1 : 0 })
            setWitnessSelected(true);

            const matchingData = response1?.data.find(item => item.roleId == companyId);
            const regPerc = matchingData ? matchingData.reg_perc : null;
            setRegPerc(regPerc);
        } catch (error) {
            console.error('Error in callWitness:', error.message);
            setWitnessSelected(false);
            setShowRemarks(false);
            setWitnessData([]);
        }
    }

    const fetchData = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetailsMTC?p_procsheet_id=${pm_Approve_level1 != "view" ? encryptData(data.psId) : pm_processSheet_id1}&runid=${pm_Approve_level1 != "view" ? encryptData(data.packingNo) : Id}&rtype=${encryptData(pm_Approve_level1 != "view" ? 1 : 2)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setSignatureReport(response?.data)
            callWitness()
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

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
                    {pm_Approve_level1 != "view" ? <div className='SubmitBtnFlexBox'>
                        {<button type="button" className="SubmitBtn" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>}
                    </div> : ""}
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
                navigate(`/mtclist?moduleId=${moduleId}&menuId=${menuId}`)
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
            setLoader(false);
        }
    };

    const [isTestPending, setIsTestPending] = useState(false);

    const submitMtc = async (e) => {
        e.preventDefault();
        setLoader(true);
        // if (isTestPending === true) {
        //     toast.error("Pending")
        //     return;
        // }

        try {
            const dataToSend = {
                comp_id: 1,
                loc_id: 1,
                mtc_run_id: 0,
                mtc_run_code: "TSL/COAT/MTC",
                procsheet_id: parseInt(headerDetails.psno),
                project_id: headerDetails.projectId,
                cprl_run_id: parseInt(data.packingNo),
                mtc_date: new Date().toLocaleDateString('fr-CA'),
                remarks: "",
                issavedraft: true,
                userid: parseInt(empId),
                roleId: parseInt(roleId)
            }

            const response = await axios.post(Environment.BaseAPIURL + "/api/User/SaveMTCData", dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            // const responseBody = await response.text();

            if (response) {
                toast.success('Status Updated Successfully!');
                navigate(`/mtclist?moduleId=${moduleId}&menuId=${menuId}`)
                console.log("Form data sent successfully!");
            } else {
                console.error("Failed to send form data to the server. Status code:", response.status);
                console.error("Server response:");
            }
        } catch (error) {
            console.error("An error occurred while sending form data:", error);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);

        if (pm_Approve_level1 === 'view') {
            getReportData()
        }
    }, []);

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `MTC-report-${headerDetails?.MTC_no}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <>
            {
                loading ? (
                    <Loading />
                ) : loader ? (
                    <Loader />
                ) : (
                    <>
                        {itFalse && <>
                            <Header />
                            <section className="InnerHeaderPageSection">
                                <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                                <div className="container">
                                    <div className="row">
                                        <div className="col-md-12 col-sm-12 col-xs-12">
                                            <ul>
                                                <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                                <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                                <li> <Link to={`/qa?moduleId=${moduleId}&menuId=${menuId}`}> QA </Link> <b style={{ color: '#fff' }}></b></li>
                                                <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                                <li> <Link to={`/mtclist?moduleId=${moduleId}&menuId=${menuId}`}> MTC List </Link> <b style={{ color: '#fff' }}></b></li>
                                                <li><h1>/&nbsp; MTC </h1></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className='RawmaterialPageSection PackingListSection'>
                                <div className='container'>
                                    <div className='row'>
                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                            <div className='PipeTallySheetDetails'>
                                                <form className="row m-0">
                                                    <div class="col-md-12 col-sm-12 col-xs-12"><h4>MTC</h4></div>
                                                    <div class="col-md-3 col-sm-12 col-xs-3">
                                                        <div className='form-group'>
                                                            <label>Process Sheet No.</label>
                                                            <input
                                                                name="psId"
                                                                placeholder='Enter process sheet no.'
                                                                value={data.psId}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3 col-sm-12 col-xs-3">
                                                        <div className='form-group'>
                                                            <label>Packing No.</label>
                                                            <input
                                                                name="packingNo"
                                                                placeholder='Enter packing no.'
                                                                value={data.packingNo}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3 col-sm-12 col-xs-3">
                                                        <div className='SaveButtonBox'>
                                                            <button type='button' className='btn btn-primary' style={{ display: 'block' }} id='btnsub' onClick={getReportData}>Submit</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div >
                            </section >
                        </>}
                        {showThis && <div className='BarePipeReport BarePipePrintReport'>
                            {pm_Approve_level1 === 'view' && <div className="DownloadPrintFlexSection">
                                <h4 onClick={handleDownloadPDF}>
                                    <i className="fas fa-download"> </i> Download PDF
                                </h4>
                                <h4 onClick={handlePrint}>
                                    <i className="fas fa-print"></i> Print
                                </h4>
                            </div>}
                            <Mtc1 headerData={headerDetails} tableData={testDetails1} sign1={signatureReport} witness1={randomWitnesses} />
                            <Mtc2 headerData={headerDetails} tableData={testDetails2} sign2={signatureReport} witness2={randomWitnesses} />
                            <Mtc3 headerData={headerDetails} tableData={testDetails3} sign3={signatureReport} witness3={randomWitnesses} pm_Approve_level1={pm_Approve_level1} mtcId={Id} onTestPendingChange={setIsTestPending} />
                            <div className='SaveButtonBox container-fluid'>
                                {pm_Approve_level1 != "view" ? <div className='SaveButtonFlexBox' style={{ display: 'flex', justifyContent: 'end' }}>
                                    <button type='button' id='btnsub' className='btn btn-primary' onClick={submitMtc}>Submit</button>
                                </div> : ""}
                            </div>
                            <div className="row text-center">
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    {renderFirstApprovalStatus()}
                                </div>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    {renderSecondApprovalStatus()}
                                </div>
                            </div>
                        </div>}
                    </>
                )
            }
        </>
    );
}
export default Mtcreport;