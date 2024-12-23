import React, { useRef, useState, useEffect } from 'react';
import './Dailyproductionreport.css';
import tatasteellogo from "../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../assets/images/tata-blue-logo.png";
import axios from "axios";
import Environment from "../../environment";
import { useNavigate, useLocation } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footerdata from '../Reports/Footerdata';
import Loading from "../Loading";
import Loader from "../Loader";

function Dailyproductionreport() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef();
  const queryParams = new URLSearchParams(location.search);
  const menuId = queryParams.get('menuId');
  const id = queryParams.get('id');
  const procsheetID = queryParams.get('procsheetID');
  const pm_Approve_level = queryParams.get('pm_Approve_level');
  const [dprDetail, setDprDetail] = useState([]);

  const [signatureReport, setSignatureReport] = useState([])
  const [showRemarks, setShowRemarks] = useState([])
  const [witnessValue, setWitnessValue] = useState('');
  const [witnessSelected, setWitnessSelected] = useState(false);
  const [showWitness, setShowWitness] = useState(true)
  const [witnessData, setWitnessData] = useState([])
  const [testDetails, setTestDetails] = useState([])
  const [isClicked, setIsClicked] = useState(false)
  const companyId = secureLocalStorage.getItem("emp_current_comp_id")
  const [regPerc, setRegPerc] = useState();
  const [key, setKey] = useState()
  const [value, setKeyValue] = useState()

  const parseKeyValuePair = (str) => {
    console.log(str)
    const parts = str?.split(':-');
    const key = parts[0].trim(); // Key before ':-'
    const value = parts[1]?.trim(); // Value after ':-', using optional chaining
    return { key, value };
  };

  const [formData, setFormData] = useState({
    pm_comp_id: 1,
    pm_location_id: 1,
    // pm_project_id: parseInt(pm_project_id1),
    pm_processSheet_id: parseInt(procsheetID),
    // pm_processtype_id: parseInt(pm_processtype_id1),
    pm_remarks: "",
    pm_approver_status: true,
    // pm_approved_by: pm_approved_by1,
    pm_approved_on: new Date().toISOString()?.split('T')[0],
    pm_Approve_level: pm_Approve_level === "first" ? 1 : pm_Approve_level === "second" ? 2 : 0,
    pm_approvedRoleId_by: '0',
    p_test_run_id: parseInt(id),
    pm_isfinalapproval: 0
  });

  useEffect(() => {
    // setLoading(true)
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetDPRReport?p_procsheet_id=${procsheetID}&p_dpr_id=${id}`);
        const data = response.data[0][0];
        console.log(response.data[0][0])
        setDprDetail(data || []);
        setTestDetails(response.data[1][0] || []);

        const { key, value } = parseKeyValuePair(data.PONo);
        setKey(key);
        setKeyValue(value)

        const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=0&testId=${id}`);
        const data1 = response1.data
        setSignatureReport(data1)
        callWitness()

        setLoading(false)
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };
    fetchData();
  }, []);

  const callWitness = async () => {
    const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${procsheetID}&p_test_run_id=${3421}&p_type_id=${id}`);
    setWitnessData(response1?.data)
    const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
    if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level == 'second') {
      setShowRemarks(true)
    } else {
      setShowRemarks(false)
    }
    setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level == 'first' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
    setWitnessValue(response1?.data[0]?.roleId)
    setWitnessSelected(true);
    const matchingData = response1?.data.find(item => item.roleId == companyId);
    const regPerc = matchingData ? matchingData.reg_perc : null;
    setRegPerc(regPerc)
  }

  const handleSelect = (e) => {
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
      setFormData({ ...formData, pm_approver_status: true, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level == 'first' ? witnessValue.toString() : companyId.toString() });
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
    if (pm_Approve_level == "first") {
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
    if (pm_Approve_level == "second") {
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

    if (showWitness && !witnessSelected && pm_Approve_level != "second") {
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
        navigate(`/rawmateriallist?menuId=${menuId}&testingtype=2233`)
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

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${dprDetail?.reportAlias}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

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
            <div className='InspReportSection DPRPageSection'>
              <div className='container-fluid'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='InspReportBox'>

                      <section className="HeaderDataSection">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div className="HeaderDataFlexdisplay">
                                <img className="tatasteellogoimg" src={tatasteellogo} alt="Tata Steel Logo" />
                                <img className="tatalogoimg" src={tatalogo} alt="Tata Logo" />
                              </div>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <h1> PIPE COATING DIVISION <br /> DAILY PRODUCTION REPORT</h1>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div style={{ textAlign: "right" }}>
                                <p>FORMAT NO.: TSL/COAT/QC/F-28 REV. 05 DATE: 13/11/2021 </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className='Reportmasterdatasection'>
                        <div className='container-fluid'>
                          <form className='row'>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Client</label>
                                <h4>: &nbsp;&nbsp; {dprDetail.ClientName || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">DPR No.</label>
                                <h4>: &nbsp;&nbsp; {testDetails?.DPRDataId || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">PMC</label>
                                <h4>: &nbsp;&nbsp; {dprDetail.PMC || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Production Date</label>
                                <h4>: &nbsp;&nbsp; {dprDetail.Productiondate || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Type of Coating</label>
                                <h4>: &nbsp;&nbsp; {dprDetail.TypeofCoating || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Reporting Date</label>
                                <h4>: &nbsp;&nbsp; {dprDetail.Reportingdate || "-"}</h4>
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
                                <label htmlFor="">QAP No.</label>
                                <h4>: &nbsp;&nbsp; {dprDetail.AcceptanceCriteria || "-"}</h4>
                              </div>
                            </div>
                          </form>
                        </div>
                      </section>

                      <section className='ReporttableSection'>
                        <div className='container-fluid'>
                          <div className='row'>
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                              <div id='custom-scroll'>
                                <table>
                                  <thead>
                                    <tr>
                                      <td>Pipe Size (mm)</td>
                                      <td>{dprDetail.PipeSize || "-"}</td>
                                    </tr>
                                    <tr>
                                      <td>P.O. Order Quantity (mtr.)</td>
                                      <td>{dprDetail.pm_po_item_qty || "-"}</td>
                                    </tr>
                                    <tr>
                                      <td>Order Quantity Pipes Approx.</td>
                                      <td>{parseInt((dprDetail.pm_po_item_qty) / 12) || "-"}</td>
                                    </tr>
                                  </thead>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className='ReporttableSection'>
                        <div className='container-fluid'>
                          <div className='row'>
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                              <div id='custom-scroll'>
                                <table>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '60px' }}>Sr. No.</th>
                                      <th>Work Station</th>
                                      <th>Previous Day</th>
                                      <th>For The Day</th>
                                      <th>Cummulative</th>
                                    </tr>
                                    <tr>
                                      <th colSpan={5}>3LPE (External) Coating</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {console.log(testDetails?.TPIACCEPTEDPreviousDay)}
                                    <tr>
                                      <td>1</td>
                                      <td>Bare Pipe Received</td>
                                      <td>{testDetails ? testDetails?.BPRPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.BPRFortheday : '0'}</td>
                                      <td>{testDetails ? testDetails?.BPRCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>2</td>
                                      <td>Bare Pipe Received Length (mtr.)</td>
                                      <td>{testDetails ? testDetails?.BPRLengthPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.BPRLengthFortheday : '0'}</td>
                                      <td>{testDetails ? testDetails?.BPRLengthCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>3</td>
                                      <td>No. of Pipes Processed</td>
                                      <td>{testDetails ? testDetails?.NOPprocessesPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.NOPprocessesfortheday : '0'}</td>
                                      <td>{testDetails ? testDetails?.NOPprocessescummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>4</td>
                                      <td>Bare</td>
                                      <td>{testDetails ? testDetails?.BAREPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.BAREForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.BARECummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>5</td>
                                      <td>NTC</td>
                                      <td>{testDetails ? testDetails?.NTCPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.NTCForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.NTCCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>6</td>
                                      <td>H/C & S/C</td>
                                      <td>{testDetails ? testDetails?.HCSCPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.HCSCForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.HCSCCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>7</td>
                                      <td>3LPE Pipes Coated</td>
                                      <td>{testDetails ? testDetails?.LPEPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.LPEForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.LPECummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>8</td>
                                      <td>3LPE Coating Process Rejection</td>
                                      <td>{testDetails ? testDetails?.PipesRejectedPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipesRejectedForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipesRejectedCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>9</td>
                                      <td>3LPE Coating OK</td>
                                      <td>{testDetails ? testDetails?.LPECoatedOKPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.LPECoatedOKForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.LPECoatedOKCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>10</td>
                                      <td>Balance for Inspection after Coating</td>
                                      <td colSpan={3}>{testDetails ? testDetails?.BalanceForCoating : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>11</td>
                                      <td>TPI Accepted (nos.)</td>
                                      <td>{testDetails ? testDetails?.TPIAcceptedPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.TPIAcceptedForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.TPIAcceptedCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>12</td>
                                      <td>Accepted Length (mtr.)</td>
                                      <td>{testDetails ? testDetails?.TPIAcceptedLengthPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.TPIAcceptedLengthForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.TPIAcceptedLengthCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>13</td>
                                      <td>Pipe Released (nos.)</td>
                                      <td>{testDetails ? testDetails?.PipeReleasedPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeReleasedForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeReleasedCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>14</td>
                                      <td>Pipe Release (mtr.)</td>
                                      <td>{testDetails ? testDetails?.PipeReleasedLengthPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeReleasedLengthForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeReleasedLengthCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>15</td>
                                      <td>Pipe Dispatched (PCS)</td>
                                      <td>{testDetails ? testDetails?.PipeDispatchedPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeDispatchedForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeDispatchedCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>16</td>
                                      <td>Pipe Dispatched (mtr.)</td>
                                      <td>{testDetails ? testDetails?.PipeDispatchedLengthPreviousDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeDispatchedLengthForTheDay : '0'}</td>
                                      <td>{testDetails ? testDetails?.PipeDispatchedLengthCummulative : '0'}</td>
                                    </tr>
                                    <tr>
                                      <td>17</td>
                                      <td>Pipe Balance for Dispatch (mtr.)</td>
                                      <td colSpan={3}>{testDetails ? parseInt(dprDetail.pm_po_item_qty) : '0'}</td>
                                    </tr>
                                    <tr>
                                      <th colSpan='2' style={{ textAlign: 'left', paddingLeft: '20px' }}>Balance pipes for Coating Approx. (nos.)</th>
                                      <th colSpan='3'>{testDetails ? testDetails?.BARECummulative : '0'}</th>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                            </div>
                          </div>
                        </div>
                      </section>

                      {signatureReport && signatureReport.length > 0 ? <Footerdata data={signatureReport} /> : ''}
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
        )
      }
    </>
  );
}

export default Dailyproductionreport;