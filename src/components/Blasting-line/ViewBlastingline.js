import React, { useState, useEffect, useRef } from "react";
import './Blastingline.css';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Processsheetfooter from '../Blasting-line/LineFooter';
import tatasteellogo from "../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../assets/images/tata-blue-logo.png";
import html2pdf from 'html2pdf.js';
import Loading from '../Loading';
import Loader from '../Loader';

function ViewBlastingline() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const contentRef = useRef();
  const [showRemarks, setShowRemarks] = useState([])
  const [witnessValue, setWitnessValue] = useState('');
  const [witnessSelected, setWitnessSelected] = useState(false);
  const [showWitness, setShowWitness] = useState(true);
  const [witnessData, setWitnessData] = useState([])
  const location = useLocation();
  const [isClicked, setIsClicked] = useState(false)
  const navigate = useNavigate();
  const companyId = secureLocalStorage.getItem("emp_current_comp_id");
  const userId = secureLocalStorage.getItem("userId");
  const [approvalData, setApprovalData] = useState([])
  const searchParams = new URLSearchParams(location.search);
  const Id = searchParams.get("id");
  let pm_processSheet_id1 = searchParams.get('pm_processSheet_id');
  let pm_Approve_level1 = searchParams.get('pm_Approve_level');
  let menuId1 = searchParams.get('menuId');
  const [workview, setWorkview] = useState([]);
  const appBlast = menuId1 === '28' ? 2 : 1;

  const [formData, setFormData] = useState({
    pm_comp_id: 1,
    pm_location_id: 1,
    pm_project_id: parseInt(pm_processSheet_id1),
    pm_processSheet_id: parseInt(pm_processSheet_id1),
    pm_processtype_id: 2,
    pm_remarks: "",
    pm_approver_status: true,
    pm_approved_by: userId.toString(),
    pm_approved_on: new Date().toISOString().split('T')[0],
    pm_Approve_level: pm_Approve_level1 === "hod" ? 1 : pm_Approve_level1 === "first" ? 2 : 3,
    pm_approvedRoleId_by: parseInt(userId),
    p_prod_id: parseInt(Id),
    p_Approve_Pending: 0,
    pm_isfinalapproval: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProdBlastingdatabyid?id=${Id}`);
        const data = response.data;
        setWorkview(data[0]);
        try {
          if (Id) {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetailsProd?rtype=${2}&p_prod_id=${Id}`);
            setApprovalData(response?.data);
            callWitness()
          }
          setLoading(false)
        } catch (error) {
          console.error('Error fetching report data:', error);
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false)
      }
    };
    fetchData();
  }, []);

  async function callWitness() {
    try {
      const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithNameProd?p_procsheet_id=${pm_processSheet_id1}&p_prod_id=${Id}&p_type_id=${2}`);
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
      setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' || pm_Approve_level1 == 'hod' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
      setWitnessValue(response1?.data[0]?.roleId)
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
      setFormData({ ...formData, pm_approver_status: true, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' || pm_Approve_level1 == 'hod' ? '0' : companyId.toString() });
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

  const renderHodApprovalStatus = () => {
    if (pm_Approve_level1 == "hod") {
      return (
        <div className="bare-pipe-inspection">
          {renderApprovalSection()}
          <div className='SubmitBtnFlexBox'>
            {<button type="button" className="SubmitBtn" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>}
          </div>
        </div>
      );
    } else {
      return null;
    }
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
      const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionSheetApprovalProd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.text();

      if (responseBody === '100' || responseBody === '200') {
        toast.success('Status Updated Successfully!');
        navigate(`/listblastingline?menuId=${menuId1}`)
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
      filename: `Blasting-line-${new Date().toLocaleDateString('en-GB').pdf}`,
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
          <>
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
              <section className="AddproductionparameterchartSection">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <div className="PipeTallySheetDetails">
                        <form className="form row m-0">
                          <section className="HeaderDataSection" style={{ borderBottom: 'none', padding: '10px 0' }}>
                            <div className="container-fluid">
                              <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                  <div className="HeaderDataFlexdisplay">
                                    <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
                                    <img className="tatalogoimg" src={tatalogo} alt="" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                          <table className="AddproductionparameterchartTable">
                            <thead>
                              <tr><th colSpan={2}>PIPE COATING DIVISION - KHOPOLI</th></tr>
                              <tr><th colSpan={2}>BLASTING LINE : PHOSPHORIC & HIGH PRESSURE WATER WASH WINDOW</th></tr>
                            </thead>

                            <tbody>
                              <tr>
                                <td colSpan={2} style={{ textTransform: 'uppercase', textAlign: 'left', paddingLeft: '10px' }}>CLIENT : {workview?.ClientName || '-'}</td>
                              </tr>
                              <tr>
                                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '10px' }}>DATE: {new Date(workview?.ImportDate).toLocaleDateString('en-GB') || '-'}</td>
                              </tr>
                              <tr>
                                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '10px' }}>PROJECT : {workview?.ProjectName || '-'} </td>
                              </tr>
                              <tr>
                                <td colSpan={2} style={{ textTransform: 'uppercase', textAlign: 'left', paddingLeft: '10px' }}>PIPE SIZE : {workview?.PipeSize || '-'}</td>
                              </tr>
                              <tr>
                                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '10px' }}>COATING TYPE : {workview?.CoatType || '-'} </td>
                              </tr>
                              <tr>
                                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '10px' }}>SPEC NO. : {workview?.Specification || '-'} </td>
                              </tr>
                              <tr>
                                <td style={{ textAlign: 'left', paddingLeft: '10px' }} colSpan={2}>PO.NO. : {workview?.Loi_No || '-'} </td>
                              </tr>
                            </tbody>
                          </table>

                          <div className="ppcdiagramBox">
                            <div className="TopBox">
                              <span className="TopBoxspan1">
                                <label htmlFor="">Flow Meter- {workview?.FlowMeter || ''}</label>
                              </span>
                              <span className="TopBoxspan2"></span>
                              <span className="TopBoxspan3"></span>
                            </div>
                            <div className="MidBox">
                              <label htmlFor="">Phosphoric Acid Header</label>
                              <span className="MidBoxspan1"><b>{workview?.PhacidHeader || '-'}</b></span>
                            </div>
                            <div className="MidBox1">
                              <span className="Mid1Boxspan1">{workview?.PhNozzleNo || '-'}</span>
                            </div>
                            <div className="bottomBox">
                              <b className="BlastedLinePipeTxt"><hr /> Blasted Line Pipe </b>
                              <span className="bottomBoxspan1">
                                <hr /> <b> {workview?.BlastedLineSpeed || '-'}</b>
                              </span>
                              <span className="bottomBoxspan2">{workview?.WaterNozzleNo || '-'} NOZZLES</span>
                            </div>

                            <div className="ppcUlList" id="custom-scroll">
                              <table className="ppcUlListtable">
                                <thead>
                                  <tr>
                                    <th style={{ width: '100px' }}>S No.</th>
                                    <th style={{ width: '500px' }}>Name</th>
                                    <th style={{ width: '500px' }}>Value</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  <tr>
                                    <td>1</td>
                                    <td>Blasted Line Pipe</td>
                                    <td>{workview?.BlastedLineSpeed || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>2</td>
                                    <td>Distance between Phosphoric Start to DM Water</td>
                                    <td>{workview?.pm_distancephosphoric_start_dmwater || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>3</td>
                                    <td>Total Nos. of Phosphoric Nozzle Operate</td>
                                    <td>{workview?.PhNozzleNo || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>4</td>
                                    <td>Total Nos. of Water Nozzle Operate</td>
                                    <td>{workview?.WaterNozzleNo || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>5</td>
                                    <td>Water Flow Rate in Gauge - 01</td>
                                    <td>{workview?.pm_waterflowrate_guage01 || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>6</td>
                                    <td>Water Flow Rate in Gauge - 02</td>
                                    <td>{workview?.pm_waterflowrate_guage02 || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>7</td>
                                    <td>Water Flow Rate in Gauge - 03</td>
                                    <td>{workview?.pm_waterflowrate_guage03 || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>8</td>
                                    <td>Total Water Flow Rate Gauge (1+2+3)</td>
                                    <td>{workview?.pm_totalwaterflowrate_guage || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>9</td>
                                    <td>1 GPM of Water Flow Equals to</td>
                                    <td>{workview?.pm_gpmwaterflow_equals || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>10</td>
                                    <td>Total Water Flow Rate Gauge (1+2+3) in LPM</td>
                                    <td>{workview?.pm_totalwaterflowrate_guagelpm || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>11</td>
                                    <td>Total Pipe Travel Area at The Speed of 5.0 m/min</td>
                                    <td>{workview?.pm_totalpipetravel_speed || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>12</td>
                                    <td>Calculated Water Wash Flow Rate</td>
                                    <td>{workview?.pm_waterwashflowrate_required || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>13</td>
                                    <td>Water Flow Rate Required</td>
                                    <td>{workview?.pm_calculatewaterwashflow_rate || ''}</td>
                                  </tr>
                                  <tr>
                                    <td>14</td>
                                    <td>Dwell Time @ Min 20 Sec Observed at Line SpeedDwell Time @ Min 20 Sec Observed at Line Speed</td>
                                    <td>{workview?.pm_dwelltime_linespeed || ''}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </form>
                        <Processsheetfooter data={approvalData} />
                        {/* {signatureReport && signatureReport.length > 0 ? <Processsheetfooter data={signatureReport} /> : ''} */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row text-center">
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    {renderHodApprovalStatus()}
                  </div>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    {renderFirstApprovalStatus()}
                  </div>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    {renderSecondApprovalStatus()}
                  </div>
                </div>
              </section>
            </div>
          </>
        )
      }
    </>
  );
}

export default ViewBlastingline;