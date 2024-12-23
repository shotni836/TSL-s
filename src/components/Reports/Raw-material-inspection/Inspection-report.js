import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../environment";
import HeaderDataSection from "../Headerdata";
import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from 'react-secure-storage';
import tatastamp from '../Stamps.png';
import './Inspectionreport.css';
import Loading from "../../Loading";
import Loader from "../../Loader";
import { encryptData, decryptData } from '../../Encrypt-decrypt';

function InspectionReport() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const { tstmaterialid } = useParams();
  const contentRef = useRef();
  const headerDetails = useRef([]);
  const [testDetails, setTestDetails] = useState([]);
  const [signatureReport, setSignatureReport] = useState([]);
  const [showRemarks, setShowRemarks] = useState([]);
  const [reportTestDate, setReportTestDate] = useState();
  const [isClicked, setIsClicked] = useState(false);
  const location = useLocation();
  const pathSegments = location.pathname.split(/[\/&]/);
  const navigate = useNavigate();
  const empId = secureLocalStorage.getItem("empId");
  const token = secureLocalStorage.getItem('token');
  const [image, setImage] = useState();

  let menuId1 = null;
  let pm_Approve_level1 = null;
  let inspId1 = null;

  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].startsWith('menuId=')) {
      menuId1 = pathSegments[i].substring('menuId='.length);
    }
    if (pathSegments[i].startsWith('pm_Approve_level=')) {
      pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
    }
    if (pathSegments[i].startsWith('id=')) {
      inspId1 = pathSegments[i].substring('id='.length);
    }
  }

  const sendInspId = decryptData(inspId1)

  const [formData, setFormData] = useState({
    pm_comp_id: 1,
    pm_location_id: 1,
    pm_remarks: "",
    pm_approver_status: true,
    pm_approved_by: empId.toString(),
    pm_approved_on: new Date().toISOString().split('T')[0],
    insp_id: sendInspId,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetRMInspectiondata?id=${inspId1}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = response?.data;
        headerDetails.current = data.Header[0];
        const date = data.Header[0].ReportTestDate || {};
        const [month, day, year] = date.split('/');
        const formattedDate = `${year}${month}${day}`;
        setReportTestDate(formattedDate);

        setTestDetails(data.Body || []);
        setImage(data.attachment || []);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
      try {
        if (tstmaterialid) {
          const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetailsRMInsp?inspid=${inspId1}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const data = response?.data
          setSignatureReport(data);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value) => {
    setIsClicked(true)
    if (value === "A") {
      setFormData({ ...formData, pm_approver_status: true, pm_approvedRoleId_by: empId.toString() });
    }
    if (value === "R") {
      setFormData({ ...formData, pm_approver_status: false, pm_approvedRoleId_by: "0" });
    }
  };

  const renderApprovalSection = () => {
    return (
      showRemarks ?
        <div className='RemarksFlexBox'>
          <label htmlFor="">Remarks</label>
          <input name="pm_remarks" value={formData?.pm_remarks} onChange={handleChange} type="text" placeholder="Enter Approval/Rejection Remarks...." autoComplete="off" />
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

  const renderSecondApprovalStatus = () => {
    if (pm_Approve_level1 == "first") {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    if (showRemarks) {
      if (formData?.pm_remarks == '' || isClicked == false) {
        toast.error("Please enter remarks and status")
        return
      }
    }

    try {
      const response = await fetch(Environment.BaseAPIURL + "/api/User/RMinspectionApproval", {
        method: "POST",
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.text();

      if (responseBody === '1000') {
        toast.success('Status Updated Successfully!');
        navigate(`/rawmaterialinwardlist?menuId=${menuId1}`)
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
      filename: `${headerDetails.current?.ReportNo}/${reportTestDate}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => { window.print(); };

  function condenseData(input) {
    let dataArray = input?.split(',');
    let commonPrefix = dataArray[0]?.slice(0, -2);
    let uniqueNumbers = dataArray?.map(item => item.split('-').pop());
    let result = commonPrefix + '' + uniqueNumbers.join(', ');

    return result;
  }

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 3000);
  }, []);

  const emptyRows = 9 - testDetails.length;

  function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString('en-GB') : "-";
  }

  const renderSignatureSection = (level) => {
    const signature = signatureReport.find(sig => sig.pm_Approve_level === level);
    if (!signature) {
      return (
        <div className="FooterDataSignBox">
          <h3 style={{ margin: '0' }}>Draft</h3>
        </div>
      );
    }

    return (
      <>
        <div className="FooterDataSignBox">
          {signature?.emp_sign_filename &&
            <img className="QCSignatureImg" src={`${Environment.ImageURL}/${signature?.emp_sign_filename}`} alt="QC Signature" />}
          <img src={tatastamp} style={{ filter: 'brightness(2.9)', left: '100px' }} className="TATAStampImg" alt="TATA Stamp" />
        </div>
        <div className="INSPECTEDBYBoxLabelBox">
          <span>{signature?.EmployeeName}</span>
          <span>{signature?.Designation} {signature?.Department}</span>
          <span>{formatDate(signature?.ApproveDate)}</span>
          <span className='hideApproval' style={{ color: signature?.Status === "Accepted" || signature?.Status === "Approved" ? '#34B233' : signature?.Status === "Pending" ? "#FFA100" : "#ED2939" }}>{signature?.Status}</span>
          <span className="QCFooterText">( QC ENGINEER )</span>
        </div>
      </>
    );
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

              <div className='InspReportSection page-break' ref={contentRef}>
                <div className='container-fluid'>
                  <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12'>
                      <div className='InspReportBox'>

                        <HeaderDataSection reportData={headerDetails?.current} />

                        <section className='Reportmasterdatasection'>
                          <div className='container-fluid'>
                            <form className='row'>
                              <div className='col-md-7 col-sm-6 col-xs-12'>
                                <div className='form-group'>
                                  <label htmlFor="">Client</label>
                                  <span>: &nbsp;</span>
                                  <h4 style={{ textTransform: 'uppercase' }}>{headerDetails?.current?.ClientName || "------"}</h4>
                                </div>
                              </div>
                              <div className='col-md-5 col-sm-6 col-xs-12'>
                                <div className='form-group'>
                                  <label htmlFor="">Report No.</label>
                                  <span>: &nbsp;</span>
                                  <h4>{headerDetails?.current?.ReportNo}/{reportTestDate} - 01</h4>
                                </div>
                              </div>
                              <div className='col-md-7 col-sm-6 col-xs-12'>
                                <div className='form-group'>
                                  <label htmlFor="">Procedure / WI No.</label>
                                  <span>: &nbsp;</span>
                                  <h4>{headerDetails?.current?.WorkInstr && condenseData(headerDetails?.current?.WorkInstr) || "-"}</h4>
                                </div>
                              </div>
                              <div className='col-md-5 col-sm-6 col-xs-12'>
                                <div className='form-group'>
                                  <label htmlFor="">Date</label>
                                  <span>: &nbsp;</span>
                                  <h4>{new Date(headerDetails?.current?.Inspectiondate).toLocaleDateString('en-GB').replace(/\//g, "/")}</h4>
                                </div>
                              </div>
                              <div className='col-md-7 col-sm-6 col-xs-12'>
                                <div className='form-group'>
                                  <label htmlFor="">Type Of Coating</label>
                                  <span>: &nbsp;</span>
                                  <h4>{headerDetails?.current?.Coattype}</h4>
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
                                          <th>Receiving Date</th>
                                          <th>Material Description</th>
                                          <th>Manufacturer / Grade</th>
                                          <th>Batch No.</th>
                                          <th>Received Quantity</th>
                                          <th>Lab Test Report No.</th>
                                          <th>Inspection Status</th>
                                          <th>Remark</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {testDetails?.map((item, rowIndex) => (
                                          <tr key={rowIndex} style={{ height: "40px" }}>
                                            <td key={rowIndex}>{rowIndex + 1}</td>
                                            <td>{new Date(item.ReceivingDate).toLocaleDateString('en-GB').replace(/\//g, "/")}</td>
                                            <td>{item.Material.toUpperCase()}</td>
                                            <td>{item.Manufacturer.toUpperCase()} / {item.Grade.toUpperCase()}</td>
                                            <td>{item.BatchNo}</td>
                                            <td>{item.Recvdqty} {item.Unit}</td>
                                            <td>{item.TestReportId}</td>
                                            <td>{item.Status.toUpperCase()}</td>
                                            <td>{item.Remark.toUpperCase()}</td>
                                          </tr>
                                        ))}
                                        {Array.from({ length: emptyRows }, (_, index) => (
                                          <tr key={`empty-${index}`} style={{ height: "25px" }}>
                                            <td>&nbsp;-</td>
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

                        <section className="FooterdataSection">
                          <div className="container-fluid">
                            <div className="row">
                              <div className="col-md-12 col-sm-12 col-xs-12">
                                <table>
                                  <thead>
                                    <tr>
                                      <th style={{ borderTop: 'none' }}>INSPECTED BY</th>
                                      <th style={{ borderTop: 'none' }}>ACCEPTED BY</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td style={{ width: '50%' }}><div className='FooterDataSignatureSection renderSignatureSectionCustom'>{renderSignatureSection(0)}</div></td>
                                      <td><div className='FooterDataSignatureSection renderSignatureSectionCustom'>{renderSignatureSection(1)}</div></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {image?.map((data) => {
                return (
                  <div className='InspReportSection page-break'>
                    <div className='container-fluid'>
                      <div className='row'>
                        <div className='col-md-12 col-sm-12 col-xs-12'>
                          <img src={`${Environment.ImageURL}/${data?.pm_file_name}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* {image?.map((data, index) => (
              <div className='InspReportSection page-break' key={index}>
                <div className='container-fluid'>
                  <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12'>
                      <a href={`${Environment.ImageURL}/${data?.pm_file_name}`} target="_blank" rel="noopener noreferrer">
                        Attachments - {index + 1}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))} */}

              <div className="row text-center">
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  {renderSecondApprovalStatus()}
                </div>
              </div>
            </div >
          </>
        )
      }
    </>
  );
}

export default InspectionReport;