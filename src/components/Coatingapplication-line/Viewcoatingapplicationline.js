import React, { useState, useEffect, useRef } from "react";
import './Coatingapplicationline.css';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Environment from "../../environment";
import Processsheetfooter from '../Blasting-line/LineFooter';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from "react-secure-storage";
import tatasteellogo from "../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../assets/images/tata-blue-logo.png";
import html2pdf from 'html2pdf.js';
import Loading from '../Loading';
import Loader from '../Loader';
import { encryptData, decryptData } from '../Encrypt-decrypt';

function Viewcoatingapplicationline() {
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

  const menuId1 = searchParams.get('menuId');
  const token = secureLocalStorage.getItem('token');
  const pm_processSheet_id1 = searchParams.get('pm_processSheet_id');
  const pm_Approve_level1 = searchParams.get('pm_Approve_level');
  const Id = searchParams.get('id');

  const [workview, setWorkview] = useState([]);
  const decryptMenuId = decryptData(menuId1)
  const appBlast = decryptMenuId === '28' ? 2 : 1;

  const pm_processSheet_id2 = decryptData(pm_processSheet_id1)
  const Id2 = decryptData(Id)

  const [formData, setFormData] = useState({
    pm_comp_id: 1,
    pm_location_id: 1,
    pm_project_id: parseInt(pm_processSheet_id2),
    pm_processSheet_id: parseInt(pm_processSheet_id2),
    pm_processtype_id: parseInt(appBlast),
    pm_remarks: "",
    pm_approver_status: true,
    pm_approved_by: userId.toString(),
    pm_approved_on: new Date().toISOString().split('T')[0],
    pm_Approve_level: pm_Approve_level1 === "hod" ? 1 : pm_Approve_level1 === "first" ? 2 : 3,
    pm_approvedRoleId_by: parseInt(userId),
    p_prod_id: parseInt(Id2),
    p_Approve_Pending: 0,
    pm_isfinalapproval: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProdApplicationdatabyid?id=${Id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        setWorkview(data[0][0]);
        try {
          if (Id) {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetailsProd?rtype=${encryptData(appBlast)}&p_prod_id=${Id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
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
      }
    };
    fetchData();
  }, []);

  async function callWitness() {
    try {
      const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithNameProd?p_procsheet_id=${pm_processSheet_id1}&p_prod_id=${Id}&p_type_id=${encryptData(appBlast)}`, {
        headers: {
          Authorization: `Bearer ${token}`
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
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.text();

      if (responseBody === '100' || responseBody === '200') {
        toast.success('Status Updated Successfully!');
        navigate(`/listcoatingapplicationline?menuId=${menuId1}`)
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
      filename: `Coating-application-line-${new Date().toLocaleDateString('en-GB')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  const epoxyToAdhesive = workview?.EpoxyToAdhesive || 0;
  const epoxyToWaterQuench = workview?.EpoxyToWaterQuench || 0;
  const totalDifference = Number(epoxyToWaterQuench - epoxyToAdhesive);

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
                              <tr><th colSpan={2}>COATING APPLICATION LINE : 3LPE COATING WINDOW</th></tr>
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

                          <div className="cpldiagramBox">
                            <div style={{ display: "flex" }}>
                              <div className="topleftBox">
                                Epoxy Booth
                                <span className="topleftSpan1"></span>
                                <div style={{ textAlign: "center", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                                  <span className="topleftSpan2"></span>
                                  <span className="topleftSpan2"></span>
                                  <span className="topleftSpan2"></span>
                                  <span className="topleftSpan2"></span>
                                </div>
                              </div>

                              <div className="topRightBox">
                                <span className="topRightSpan1">
                                  <span className="topRightSpan2">
                                    <span className="topRightSpan3">
                                      <b>Adhesive Die</b>
                                    </span>
                                    <span className="topRightSpan3">
                                      <b style={{ textAlign: "right", paddingRight: "10px" }}>PE Die</b>
                                    </span>
                                  </span>

                                  <div className="topRightSpan4">
                                    <b>Water Quenching</b>
                                    <span className="topRightSpan5"></span>
                                    <span className="topRightSpan5"></span>
                                    <span className="topRightSpan5"></span>
                                    <span className="topRightSpan5"></span>
                                    <span className="topRightSpan5"></span>
                                    <span className="topRightSpan5"></span>
                                  </div>
                                </span>
                              </div>
                            </div>
                            <div className="bottomBox">
                              <b className="LinePipeTxt">
                                <hr />
                                Line Pipe
                              </b>
                              <span className="Span1"></span>
                              <span className="Span2"></span>
                              <span className="Span3">
                                <hr />
                                <b>{workview?.EpoxyToAdhesive || '-'} mm <span>{totalDifference || '-'} mm</span></b>

                                <hr style={{ bottom: '-70px' }} />
                                <b style={{ bottom: '-90px', justifyContent: "center" }}>{workview?.EpoxyToWaterQuench || '-'} mm</b>
                              </span>
                            </div>
                            <div className="ppcUlList" id="custom-scroll">
                              <table className="ppcUlListtable">
                                <thead>
                                  <tr>
                                    <th style={{ width: '100px' }}>S No.</th>
                                    <th style={{ width: '200px' }}>Name</th>
                                    <th style={{ width: '200px' }}>Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>1</td>
                                    <td>Targeted Pipe Temperature</td>
                                    <td>{workview?.TargetPipeTemp || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>2</td>
                                    <td>Line Speed</td>
                                    <td>{workview?.LineSpeed || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>3</td>
                                    <td>Application Window</td>
                                    <td>{workview?.AppWindow || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>4</td>
                                    <td>Distance between Epoxy last Spray to adhesive</td>
                                    <td>{workview?.EpoxyToAdhesive || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>5</td>
                                    <td>Distance between Epoxy last Spray to Water Quenching</td>
                                    <td>{workview?.EpoxyToWaterQuench || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>6</td>
                                    <td>Cure time in second</td>
                                    <td>{workview?.DewPoint || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>7</td>
                                    <td>No. Of Epoxy Guns operate</td>
                                    <td>{workview?.noOfEpoxyGunsOperate || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>8</td>
                                    <td>Minimum Air Pressure of Epoxy Spray (On Display 6 kg/cm² observe)</td>
                                    <td>{workview?.minAirpressOfEpoxySpray || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>9</td>
                                    <td>Required Coating Thickness Epoxy Powder</td>
                                    <td>{workview?.ReqCoatingEpoxyPwdr || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>10</td>
                                    <td>Required Coating Thickness Adhesive</td>
                                    <td>{workview?.ReqCoatingAdhesive || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>11</td>
                                    <td>Total Coating Thickness</td>
                                    <td>{workview?.TotalCoatingThiknes || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>12</td>
                                    <td>Adhesive Film Temperature</td>
                                    <td>{workview?.AdhesiveFilmTemp || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td>13</td>
                                    <td>PE Film Temperature</td>
                                    <td>{workview?.PeFilmTemp || '-'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </form>
                        <Processsheetfooter data={approvalData} />
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
        )}
    </>
  );
}
export default Viewcoatingapplicationline