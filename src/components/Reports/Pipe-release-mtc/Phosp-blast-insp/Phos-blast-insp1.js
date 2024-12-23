import React, { useRef, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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


function PhosBlastInsp() {

  const { tstmaterialid } = useParams();
  const contentRef = useRef();
  const headerDetails = useRef({});
  const [rawMaterial, setRawMaterial] = useState([]);
  const [testDetails, setTestDetails] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [instrumentDetails, setInstrumentDetails] = useState([]);
  const [key, setKey] = useState()
  const [showRemarks, setShowRemarks] = useState([])
  const [value, setKeyValue] = useState()
  const [reportTestDate, setReportTestDate] = useState()
  const [showWitness, setShowWitness] = useState(true)
  const [witnessData, setWitnessData] = useState([])
  const location = useLocation();
  const [signatureReport, setSignatureReport] = useState([])
  const pathSegments = location.pathname.split(/[\/&]/);
  const navigate = useNavigate()

  let pm_project_id1 = null;
  let pm_processSheet_id1 = null;
  let pm_processtype_id1 = null;
  let pm_approved_by1 = null;
  let test_date1 = null;
  let menuId1 = null;
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
    if (pathSegments[i].startsWith('menuId=')) {
      menuId1 = pathSegments[i].substring('menuId='.length);
    }
  }
  const [id1, id2] = tstmaterialid.split('&');
  const queryParams = new URLSearchParams(location.search);
  console.log(typeof pm_project_id1, typeof (parseInt(pm_project_id1)))
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
    const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}`);
    setWitnessData(response1?.data)
    const hasRejectCountGreaterThanZero = response1?.data.some(item => item.RejectCount > 0);
    const allHaveZeroCounts = response1?.data.every(item => item.ApproveCount === 0 && item.RejectCount === 0);
    if (hasRejectCountGreaterThanZero || allHaveZeroCounts || pm_Approve_level1 == 'second') {
      setShowRemarks(true)
    } else {
      setShowRemarks(false)
    }
    if (response1?.data.length == 1) {
      setFormData({ ...formData, pm_approvedRoleId_by: response1?.data[0]?.roleId })
    }
  }

  const handleSelect = (e) => {
    setFormData({ ...formData, pm_approvedRoleId_by: parseInt(e.target.value) })
    if (!showRemarks) {
      handleStatusChange("A")
    }
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
    // setFormData({ ...formData, pm_approver_status: status });
    if (value === "A") {
      setFormData({ ...formData, pm_approver_status: true });
      setShowWitness(true)
    }
    if (value === "R") {
      setFormData({ ...formData, pm_approver_status: false });
      setShowWitness(false)
    }
  };

  const renderApprovalSection = () => {
    return (
      showRemarks ? <div className='RemarksFlexBox'>
        <label htmlFor="">Remarks</label>
        <input name="pm_remarks" className="form-control" value={formData.pm_remarks} onChange={handleChange} type="text" placeholder="Enter Approval/Rejection Remarks...." autoComplete="off" />
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
            <label htmlFor="">
              Select Witness <b>*</b>
            </label>
            <select className="form-control" name="" onChange={handleSelect}>
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
        </div >
      );
    } else {
      return null;
    }
  };

  const renderSecondApprovalStatus = () => {
    if (pm_Approve_level1 == "second") {
      return (
        <div className="BarePipeInspForm row m-0">
          {/* <label htmlFor="">Date of First Approval</label>
          <h4>: &nbsp;&nbsp; {headerDetails.current.first_approval_date || "-"}</h4>
          <label htmlFor="">Remarks</label>
          <h4>: &nbsp;&nbsp; {headerDetails.current.first_approval_remarks || "-"}</h4>
          <label htmlFor="">Approval Status</label>
          <h4>: &nbsp;&nbsp; {headerDetails.current.first_approval_status || "-"}</h4> */}
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
      if (formData?.pm_remarks == '' || (formData.pm_approver_status != false && formData.pm_approver_status != true)) {
        toast.error("Please enter remarks and status")
        return
      }
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (showRemarks) {
  //     if (formData?.pm_remarks == '' || (formData.pm_approver_status != false && formData.pm_approver_status != true)) {
  //       toast.error("Please enter remarks and status")
  //       return
  //     }
  //   }
  //   try {
  //     const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionSheetApproval", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const responseBody = await response.text();

  //     if (responseBody === '100' || responseBody === '200') {
  //       toast.success('Sheet Approved!');
  //       console.log("Form data sent successfully!");
  //     } else {
  //       console.error(
  //         "Failed to send form data to the server. Status code:",
  //         response.status
  //       );
  //       console.error("Server response:", responseBody);
  //     }
  //   } catch (error) {
  //     console.error("An error occurred while sending form data:", error);
  //   }
  // };

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

                {/* {Array.isArray(testDetails) && testDetails.length > 0 && (
                  <section className='ReporttableSection'>
                    <div className='container-fluid'>
                      <div className='row'>
                        <div className='col-md-12 col-sm-12 col-xs-12'>
                          <div id='custom-scroll'>
                            <table>
                              <thead>
                                <tr>
                                  <th rowSpan={2}>Sr. No.</th>
                                  <th rowSpan={2}>Pipe No.</th>
                                  <th rowSpan={2}>ASL No.</th>
                                  <th rowSpan={2}>Pipe Temp. Before Blasting(°C)</th>
                                  <th rowSpan={2}>Pipe Temp. Before Acid Wash(°C)</th>
                                  <th rowSpan={2}>Dwell Time(Sec.)</th>
                                  <th colSpan={2}>pH of Pipe Surface</th>
                                  <th rowSpan={2}>*Visual Inspection After Acid Wash & Inside Cleaning</th>
                                  <th rowSpan={2}>Pressure Of DM Water Wash (bar)</th>
                                  <th colSpan={4}>DIM Water Flow Rate(LPM)</th>
                                  <th rowSpan={2}>Dry Air Temp. After Water Wash (°C)</th>
                                  <th rowSpan={2}>RH (%)</th>
                                  <th rowSpan={2}>Amb. Temp. (°C)</th>
                                  <th rowSpan={2}>Dew Point (°C)</th>
                                  <th rowSpan={2}>Pipe Surface Temp. (°C)</th>
                                  <th rowSpan={2}>Degree Of Cleanliness</th>
                                  <th rowSpan={2}>Roughness (µm - Rz)</th>
                                  <th rowSpan={2}>Degree Of Dust</th>
                                  <th rowSpan={2}>Salt Cont. (µg/cm²)</th>
                                  <th rowSpan={2}>Remarks</th>
                                </tr>
                                <tr>
                                  <th>Before Water Wash</th>
                                  <th>After Water Wash</th>
                                  <th>FM1</th>
                                  <th>FM2</th>
                                  <th>FM3</th>
                                  <th>Total</th>
                                </tr>
                                <tr>
                                  <td colSpan={2} rowSpan={2}>Specified Requirement</td>
                                  <td>Min</td>
                                  <td>55</td>
                                  <td>40</td>
                                  <td>20</td>
                                  <td>1</td>
                                  <td>6</td>
                                  <td>-</td>
                                  <td>69</td>
                                  <td rowSpan={2}></td>
                                  <td rowSpan={2}></td>
                                  <td rowSpan={2}></td>
                                  <td rowSpan={2}></td>
                                  <td>75</td>
                                  <td>-</td>
                                  <td>-</td>
                                  <td>-</td>
                                  <td>Dew Point+3°C</td>
                                  <td>SA 2½</td>
                                  <td>60</td>
                                  <td>-</td>
                                  <td>-</td>
                                  <td></td>
                                </tr>
                                <tr>
                                  <td>Max</td>
                                  <td>85</td>
                                  <td>65</td>
                                  <td>-</td>
                                  <td>2</td>
                                  <td>7</td>
                                  <td>-</td>
                                  <td>103</td>
                                  <td>-</td>
                                  <td>85.00</td>
                                  <td>-</td>
                                  <td>-</td>
                                  <td>-</td>
                                  <td>-</td>
                                  <td>100</td>
                                  <td>2</td>
                                  <td>2.00</td>
                                  <td></td>
                                </tr>
                              </thead>
                              <tbody>
                                {testDetails.map((item, index) => (
                                  <tr key={index + 1}>
                                    <td>{index + 1}</td>
                                    <td>{item.pipeNo || "-"}</td>
                                    <td>{item.aslno || "-"}</td>
                                    <td>{item.tempBeforeBlasting || "-"}</td>
                                    <td>{item.tempBeforeAcidWash || "-"}</td>
                                    <td>{item.dwellTime || "-"}</td>
                                    <td>{item.phBeforeWaterWash || "-"}</td>
                                    <td>{item.phAfterWaterWash || "-"}</td>
                                    <td>{item.visualInspection || "-"}</td>
                                    <td>{item.pressureOfDMWaterWash || "-"}</td>
                                    <td>{item.dmWaterFlowRateFM1 || "-"}</td>
                                    <td>{item.dmWaterFlowRateFM2 || "-"}</td>
                                    <td>{item.dmWaterFlowRateFM3 || "-"}</td>
                                    <td>{item.total || "-"}</td>
                                    <td>{item.dryAirTempAfterWaterWash || "-"}</td>
                                    <td>{typeof item.rh === 'number' ? item.rh.toFixed(2) : '-'}</td>
                                    <td>{item.ambTemp || "-"}</td>
                                    <td>{item.dewPoint || "-"}</td>
                                    <td>{item.pipeSurfaceTemp || "-"}</td>
                                    <td>{item.degreeOfCleanliness || "-"}</td>
                                    <td>{item.roughness || "-"}</td>
                                    <td>{item.degreeOfDust || "-"}</td>
                                    <td>{typeof item.saltCont === 'number' ? item.saltCont.toFixed(2) : '-' || "-"}</td>
                                    <td>{item.remarks || "-"}</td>
                                  </tr>
                                ))}
                                {rawMaterial.map((item, index) => (
                                  <tr key={index + 1}>
                                    <td>{index + 1}</td>
                                    <td colSpan={7} style={{ textAlign: "initial" }} >Raw Material Used : {item.rawmaterialUsed || "-"}</td>
                                    <td colSpan={6} style={{ textAlign: "initial" }} >Manufacturer : {item.manufacturer || "-"}</td>
                                    <td colSpan={6} style={{ textAlign: "initial" }} >Grade : {item.grade || "-"}</td>
                                    <td colSpan={5} style={{ textAlign: "initial" }} >Batch No. : {item.batchNo || "-"}</td>
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


                <section>

                </section>

                <InstrumentusedSection reportData={instrumentDetails} />

                <Footerdata data={signatureReport} />


                <div className="row text-center mt-4">
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
    </div>
  );
}

export default PhosBlastInsp;