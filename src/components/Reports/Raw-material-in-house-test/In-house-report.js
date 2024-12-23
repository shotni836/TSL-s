import React, { useRef, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../environment";
import "./InHouse.css"
import '../Allreports.css';
import HeaderDataSection from "../Headerdata";
import Footerdata from '../Footerdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from 'react-secure-storage';
import html2pdf from 'html2pdf.js';
import Loading from "../../Loading";
import Loader from "../../Loader";
import { decryptData } from '../../Encrypt-decrypt';

function InHouseReport() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const { tstmaterialid } = useParams();
  const contentRef = useRef();
  const [headerDetails, setHeaderDetails] = useState({});
  const [testDetails, setTestDetails] = useState([]);
  const [instrumentDetails, setInstrumentDetails] = useState([]);
  const [reportTestDate, setReportTestDate] = useState()
  const [newDate, setNewDate] = useState()
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
  const companyId = secureLocalStorage.getItem("emp_current_comp_id")
  const token = secureLocalStorage.getItem('token');
  const [regPerc, setRegPerc] = useState();

  let moduleId = null;
  let menuId = null;
  let pm_Approve_level1 = null;
  let pm_project_id1 = null;
  let pm_processSheet_id1 = null;
  let pm_processtype_id1 = null;
  let pm_approved_by1 = null;
  let pm_project_id = null;
  let pm_processSheet_id = null;
  let pm_processtype_id = null;
  let pm_approved_by = null;

  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].startsWith('moduleId=')) {
      moduleId = pathSegments[i].substring('moduleId='.length);
    }
    if (pathSegments[i].startsWith('menuId=')) {
      menuId = pathSegments[i].substring('menuId='.length);
    }
    if (pathSegments[i].startsWith('pm_Approve_level=')) {
      pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
    }
    if (pathSegments[i].startsWith('pm_project_id=')) {
      pm_project_id1 = pathSegments[i].substring('pm_project_id='.length);
      pm_project_id = decryptData(pm_project_id1)
    }
    if (pathSegments[i].startsWith('pm_processSheet_id=')) {
      pm_processSheet_id1 = pathSegments[i].substring('pm_processSheet_id='.length);
      pm_processSheet_id = decryptData(pm_processSheet_id1)
    }
    if (pathSegments[i].startsWith('pm_processtype_id=')) {
      pm_processtype_id1 = pathSegments[i].substring('pm_processtype_id='.length);
      pm_processtype_id = decryptData(pm_processtype_id1)
    }
    if (pathSegments[i].startsWith('pm_approved_by=')) {
      pm_approved_by1 = pathSegments[i].substring('pm_approved_by='.length);
      pm_approved_by = decryptData(pm_approved_by1)
    }
  }

  const [id1, id2, id3, id4] = tstmaterialid.split('&');
  let ID2 = decryptData(id2)

  const [formData, setFormData] = useState({
    pm_comp_id: 1,
    pm_location_id: 1,
    pm_project_id: parseInt(pm_project_id),
    pm_processSheet_id: parseInt(pm_processSheet_id),
    pm_processtype_id: parseInt(pm_processtype_id),
    pm_remarks: "",
    pm_approver_status: true,
    pm_approved_by: pm_approved_by,
    pm_approved_on: new Date().toISOString().split('T')[0],
    pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
    pm_approvedRoleId_by: '0',
    p_test_run_id: parseInt(ID2),
    pm_isfinalapproval: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (tstmaterialid) {
          const [id1, id2, id3, id4] = tstmaterialid.split('&');
          const response = await axios.get(`${Environment.BaseAPIURL}/api/User/RMTestingReport?procsheet_id=${id1}&TestRunId=${id2}&typeid=${id3}&test_id=${id4}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const data = response?.data[0];
          setHeaderDetails(data[0] || {});
          const date = data[0]?.ReportTestDate || {}
          // const [month, day, year] = date.split('T');
          const formattedDate = date?.split('T')[0]
          const newDateStr = formattedDate.replace(/-/g, '');
          setReportTestDate(newDateStr);
          const date1 = new Date(data[0]?.ReportTestDate);

          const day = String(date1.getDate()).padStart(2, '0');
          const month = String(date1.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
          const year = date1.getFullYear();

          const formattedDate1 = `${day}/${month}/${year}`;
          setNewDate(formattedDate1)

          setTestDetails(response?.data[1] || []);

          const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetails?TestRunId=${id2}&ProcessSheetId=${pm_processSheet_id1}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const data1 = response1?.data;
          setInstrumentDetails(data1);

          try {
            if (tstmaterialid) {
              const [id1, id2, id3, id4] = tstmaterialid.split('&');
              const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=${id3}&testId=${id2}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                }
              });
              const data = response?.data;
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

  async function callWitness() {
    try {
      const [id1, id2] = tstmaterialid.split('&');
      const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}&p_type_id=${pm_processtype_id1}`, {}, {
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
      setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
      setWitnessValue(response1?.data[0]?.roleId)
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
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ formData, 'checkedPipes': [''] }),
      });

      const responseBody = await response.text();

      if (responseBody === '100' || responseBody === '200') {
        toast.success('Status Updated Successfully!');
        navigate(`/rawmateriallist?moduleId=${moduleId}&menuId=${menuId}&testingtype=${pm_processtype_id1}`)
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

  const getTestMethodRowSpans = (testDetails) => {
    const rowSpans = [];
    let currentMethod = null;
    let currentSpan = 0;

    testDetails.forEach((item, index) => {
      if (item.Test_Method === currentMethod) {
        currentSpan++;
        rowSpans.push(0);
      } else {
        if (currentSpan > 0) {
          rowSpans[rowSpans.length - currentSpan] = currentSpan;
        }
        currentMethod = item.Test_Method;
        currentSpan = 1;
        rowSpans.push(currentSpan);
      }
    });

    if (currentSpan > 0) {
      rowSpans[rowSpans.length - currentSpan] = currentSpan;
    }

    return rowSpans;
  }

  const rowSpans = getTestMethodRowSpans(testDetails);

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
            <div className='InspReportSection InHousePrintOnly page-break' ref={contentRef}>
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
                                <label htmlFor="">Material Description</label>
                                <h4>: &nbsp;&nbsp; {headerDetails?.materialName || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Report No.</label>
                                <h4>:  &nbsp;&nbsp;RMTR/{reportTestDate} - 01
                                  {headerDetails?.ReportPqt == '' ? '' : (
                                    <> ({headerDetails?.ReportPqt})</>
                                  )}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Supplier</label>
                                <h4>: &nbsp;&nbsp;{headerDetails?.manufacturerName || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Date</label>
                                <h4>: &nbsp;&nbsp;{newDate || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Coating Type</label>
                                <h4>: &nbsp;&nbsp;{headerDetails?.Coattype || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Client</label>
                                <h4>: &nbsp;&nbsp;{headerDetails?.Clientname || "-"}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Procedure / WI No.</label>
                                <h4>: &nbsp;&nbsp;{headerDetails?.WINO && condenseData(headerDetails?.WINO) || "-"}</h4>
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
                                        <th style={{ width: '70px' }}>Sr. No.</th>
                                        <th>Batch No.</th>
                                        <th>Test</th>
                                        <th>Test Method</th>
                                        <th>Requirement</th>
                                        <th>Test Result</th>
                                        <th>Remarks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {testDetails?.map((item, index) => (
                                        <tr key={index + 1}>
                                          <td>{index + 1}</td>
                                          {index === 0 ? (
                                            <td rowSpan={testDetails.length}>
                                              {headerDetails?.manufacturerName}<br />{headerDetails?.grade || "-"}<br />BATCH NO. - {headerDetails?.batch || "-"}
                                            </td>
                                          ) : null}
                                          <td>{item.Test_Description || "-"}</td>
                                          {rowSpans[index] > 0 && (
                                            <td rowSpan={rowSpans[index]}>
                                              {item.Test_Method || "-"}
                                            </td>
                                          )}
                                          <td>{item.pm_value_type == "A" ? item.pm_test_value : (item.PM_Reqmnt_test_min && item.PM_Reqmnt_test_Max) ?
                                            `${item.PM_Reqmnt_test_min} - ${item.PM_Reqmnt_test_Max}` :
                                            (item.PM_Reqmnt_test_min ? `Min - ${item.PM_Reqmnt_test_min}` :
                                              (item.PM_Reqmnt_test_Max ? `Max - ${item.PM_Reqmnt_test_Max}` : ''))} {(item.PM_Reqmnt_test_min || item.PM_Reqmnt_test_Max) && item.Unit != "NA" ? " " + item.Unit : ''}{id4 == 184 && item.Test_Description.includes('Cure Time 232±3°C') ? ' @ 90 Sec.' : ''}</td>
                                          <td>{item.pm_test_result_remarks || "-"}{item.pm_test_result_remarks && item.Unit != "NA" ? " " + item.Unit : ""}{id4 == 184 && item.Test_Description.includes('Cure Time 232±3°C') ? ' @ 90 Seconds' : ''}</td>
                                          <td>{item.pm_test_result_suffix}</td>
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
                                    <td style={{ borderBottom: "none", padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICAION - <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails.specification} & QAP NO.- {headerDetails.AcceptanceCriteria || "-"}</span></td>
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
                                  <tr><th colSpan={3} style={{ textAlign: 'center' }}> INSTRUMENT USED</th></tr>
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

export default InHouseReport;