import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import '../../Allreports.css';
import Loading from '../../../Loading';
import '../../Allreports.css';
import './Thickness-insp.css';
import HeaderDataSection from "../../Headerdata";
import ReportRemarks from '../../Report-remarks';
import Footerdata from '../../Footerdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';
import secureLocalStorage from 'react-secure-storage';
import { decryptData } from '../../../Encrypt-decrypt';

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

function ThicknessInsp() {
  const token = secureLocalStorage.getItem('token');
  const { tstmaterialid } = useParams();
  const contentRef = useRef();
  const headerDetails = useRef({});
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
  const [witnessSelected, setWitnessSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [witnessValue, setWitnessValue] = useState('');
  const [isClicked, setIsClicked] = useState(false)
  const [randomWitnesses, setRandomWitnesses] = useState([])
  const [regPerc, setRegPerc] = useState();
  const [witnessesByPipeCode, setWitnessesByPipeCode] = useState([]);
  const companyId = secureLocalStorage.getItem("emp_current_comp_id")
  const [checkedItems, setCheckedItems] = useState(
    testDetails.map(() => false) // Initialize all checkboxes as unchecked
  );

  function convertDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate
  }

  let pm_project_id1 = null;
  let pm_processSheet_id1 = null;
  let pm_processtype_id1 = null;
  let pm_approved_by1 = null;
  let test_date1 = null;
  let menuId1 = null;
  let pm_Approve_level1 = null;

  let pm_project_id = null;
  let pm_processSheet_id = null;
  let pm_processtype_id = null;
  let pm_approved_by = null;
  let test_date = null;

  for (let i = 0; i < pathSegments.length; i++) {
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
    if (pathSegments[i].startsWith('test_date=')) {
      test_date1 = pathSegments[i].substring('test_date='.length);
      test_date = decryptData(test_date1)
    }
    if (pathSegments[i].startsWith('pm_Approve_level=')) {
      pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
    }
    if (pathSegments[i].startsWith('menuId=')) {
      menuId1 = pathSegments[i].substring('menuId='.length);
    }
  }
  const [id1, id2] = tstmaterialid.split('&');
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
    pm_approved_on: test_date,
    pm_approvedRoleId_by: 0,
    pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
    p_test_run_id: parseInt(ID2)
  });


  const [witnessHeight, setWitnessHeight] = useState(0);
  const refDivA = useRef(null); // Reference for the div whose height you want to track
  const refDivB = useRef(null); // Reference for the div whose height you want to set

  const adjustHeight = useCallback(() => {
    if (refDivA.current) {
      const heightA = refDivA.current.offsetHeight; // Get Div A's height
      setWitnessHeight(heightA); // Set Div B's height
    }
  }, []);

  useEffect(() => {
    // Delay execution to ensure elements are fully rendered
    const handleInitialAdjustment = () => {
      setTimeout(() => adjustHeight(), 100); // Timeout to ensure DOM is fully rendered
    };

    // Observer to track size changes of Div A
    const resizeObserver = new ResizeObserver(() => adjustHeight());

    // Observer to track DOM changes and ensure refs are set
    const mutationObserver = new MutationObserver(() => {
      if (refDivA.current) {
        adjustHeight(); // Adjust height when changes are detected
        resizeObserver.observe(refDivA.current); // Start observing Div A
      }
    });

    // Start observing changes in the DOM (i.e., body or a parent node)
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Perform the initial adjustment when the component mounts
    handleInitialAdjustment();

    // Cleanup observers on component unmount
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [adjustHeight]);

  async function callWitness() {
    const [id1, id2] = tstmaterialid.split('&');
    const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}&p_type_id=${pm_processtype_id1}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    setWitnessData(response1?.data)
    const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
    const hasRejectCountGreaterThanZero = response1?.data.some(item => item.RejectCount > 0);
    const allHaveZeroCounts = response1?.data.every(item => item.ApproveCount === 0 && item.RejectCount === 0);
    // if (hasRejectCountGreaterThanZero || allHaveZeroCounts || pm_Approve_level1 == 'second') {
    if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 == 'second') {
      setShowRemarks(true)
    } else {
      setShowRemarks(false)
    }
    // if (response1?.data.length == 1) {
    setWitnessValue(response1?.data[0]?.roleId)
    setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? witnessValue.toString() : companyId.toString() })
    setWitnessSelected(true);
    const matchingData = response1?.data.find(item => item.roleId == companyId);
    const regPerc = matchingData ? matchingData.reg_perc : null;
    setRegPerc(regPerc)
    // }
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
          const response = await axios.post(`${Environment.BaseAPIURL}/api/User/Get_CoatingThicknessInspectionReport?typeid=${pm_processtype_id1}&testId=${id2}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const data = response.data[0];
          headerDetails.current = data._CdTesHeaderDetails[0] || {}
          setTestDetails(data._CdTesMiddleDetails || []);
          setHeaders(Object.keys(data._CdTesMiddleDetails[0]))
          // setRawMaterial(data._CdTestMat || []);
          const date = data._CdTesHeaderDetails[0].reportTestDate || {}
          const [month, day, year] = date.split('/');
          const formattedDate = `${year}${day}${month}`;
          setReportTestDate(formattedDate);
          const { key, value } = parseKeyValuePair(data._CdTesHeaderDetails[0].poNo);
          setKey(key);
          setKeyValue(value)
          setRandomWitnesses(data._RandomWitness)
          const witnessesByPipeCode = groupWitnessesByPipeCode(data._RandomWitness);
          setWitnessesByPipeCode(witnessesByPipeCode)
        }

        const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${pm_processtype_id1}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data1 = response1.data[0]
        setInstrumentDetails(data1);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
      try {
        if (tstmaterialid) {
          const [id1, id2] = tstmaterialid.split('&');
          const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInspectedByAcceptedByDetails?matid=${pm_processtype_id1}&testId=${id2}`, {
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
  }, [tstmaterialid]);

  const handleCheckboxChange = (index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = [...prev];
      newCheckedItems[index] = !newCheckedItems[index];
      return newCheckedItems;
    });
  };
  const checkedCount = checkedItems.filter(Boolean).length;

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setFormData(prevData => ({ ...prevData, pm_approved_on: currentDate }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

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
    // setFormData({ ...formData, pm_approver_status: status });
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
        <div className="BarePipeInspForm">
          {/* <label htmlFor="">Date of First Approval</label>
          <h4> {headerDetails.current.first_approval_date || "-"}</h4>
          <label htmlFor="">Remarks</label>
          <h4> {headerDetails.current.first_approval_remarks || "-"}</h4>
          <label htmlFor="">Approval Status</label>
          <h4> {headerDetails.current.first_approval_status || "-"}</h4> */}
          <div className='renderApprovalFlexBox' style={{ padding: '20px' }}>
            {renderApprovalSection()}
            {<button type="button" onClick={handleSubmit}>Submit</button>}
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

    const checkCount = parseInt(checkedCount)
    const testDetail = parseInt(testDetails.length)
    const regPercs = parseInt(regPerc)

    if (pm_Approve_level1 == "second" && regPerc != 100) {
      if (checkCount / testDetail * 100 < regPercs) {
        toast.error(`Please check atleast ${Math.ceil((regPercs / 100) * testDetail)} data`)
        return
      }
    }

    function getPipeNosByIds(checkedItems, testDetails) {
      return checkedItems
        .map((id, index) => id ? testDetails[index]["Pipe No."] : null)
        .filter(pipeNo => pipeNo !== null);
    }

    // Example usage
    const pipeNos = getPipeNosByIds(checkedItems, testDetails);

    try {
      const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionSheetApproval", {
        method: "POST",
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ formData, 'checkedPipes': pipeNos ? pipeNos : '' }),
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
  //         'Content-Type': `application/json`,
  // 'Authorization': `Bearer ${token}`,
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

  function condenseData(input) {
    // Split the input string into an array
    let dataArray = input?.split(',');

    // Extract the common prefix
    let commonPrefix = dataArray[0]?.slice(0, -2);

    // Extract the unique numbers
    let uniqueNumbers = dataArray?.map(item => item.split('-').pop());

    // Join the unique numbers into a single string
    let result = commonPrefix + '' + uniqueNumbers.join(', ');

    return result;
  }

  useEffect(() => {
    // fetchData();
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 3000);
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
      filename: `Bare-Pipe-report-${headerDetails.current?.procSheetNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };


  const groupWitnessesByPipeCode = (witnesses) => {
    return witnesses.reduce((acc, witness) => {
      if (!acc[witness.pm_pipe_code]) {
        acc[witness.pm_pipe_code] = [];
      }
      acc[witness.pm_pipe_code].push({
        name: witness.co_param_val_name,
        initials: getInitials(witness.co_param_val_name),
        role: witness.RoleName
      });
      return acc;
    }, {});
  };

  return (
    <>
      <style>
        {`
          @media print {
            .CustomBarePipeWitnessBox2 {
              height: ${witnessHeight - 100}px !important;
            }
          }
        `}
      </style>
      {
        loading ?
          <Loading />
          :
          <>
            <div className='ThicknessinspPrintReport'>
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
                  <div key={chunkIndex} className='InspReportSection' ref={contentRef} style={{ pageBreakAfter: 'always' }}>
                    <div className='container-fluid'>
                      <div className='row'>
                        <div className='col-md-12 col-sm-12 col-xs-12'>
                          <div className='CustomPhosWitnessFlex'>
                            <div className='InspReportBox LandscapethickSectionPage'>

                              <HeaderDataSection reportData={headerDetails.current} />

                              <section className='Reportmasterdatasection' ref={refDivA}>
                                <div className='container-fluid'>
                                  <form className='row'>
                                    <div className='col-md-7 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Client</label>
                                        <span>: &nbsp;</span>
                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails.current.clientName}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-5 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Report No.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.reportAlias}/{reportTestDate} - {String(chunkIndex + 1).padStart(2, '0')} {headerDetails?.current.reportPqt == '' ? '' : (
                                          <> ({headerDetails.current.reportPqt})</>
                                        )} </h4>
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
                                        <label htmlFor="">Date & Shift</label>
                                        <span>: &nbsp;</span>
                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails.current?.dateShift}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-7 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Pipe Size</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.pipeSize}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-5 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Acceptance Criteria</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.acceptanceCriteria}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-7 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Specification</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.specification}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-5 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Process Sheet No.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.procSheetNo} REV. {headerDetails.current?.procesheet_revisionno
                                          ? String(headerDetails.current.procesheet_revisionno).padStart(2, '0')
                                          : '00'}  {headerDetails.current?.procesheet_revisionno ? "DATE : " + convertDate(headerDetails.current?.procesheet_revisiondate.split("T")[0]) : ''}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-7 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Type Of Coating</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.typeofCoating}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-5 col-sm-6 col-xs-12'>
                                      <div className='form-group'>
                                        <label htmlFor="">Procedure / WI No.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.wino && condenseData(headerDetails.current.wino) || "-"}</h4>
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
                                          <table style={{ tableLayout: 'auto' }}>
                                            <thead>
                                              {/* <tr>
                                          <th>Sr. No.</th>
                                          {headers.map((header, index) => (
                                            <th key={index}>{header}</th>
                                          ))}
                                        </tr> */}
                                              <tr>
                                                <th rowspan="2" style={{ width: '50px' }}>Sr. No.</th>
                                                <th rowspan="2" style={{ width: '70px' }}>Pipe No.</th>
                                                <th rowspan="2" style={{ width: '50px' }}>ASL No.</th>
                                                <th colSpan={12}>Total Coating Thickness(mm) Required Thickness -2.4</th>
                                                <th rowspan="2" style={{ width: '80px' }}>Visual Of <br /> Coated Pipe</th>
                                                <th rowspan="2" style={{ width: '100px' }}>Remarks(Quench. temp. °C)</th>
                                                <th rowspan="2" style={{ width: '80px' }}>Coating Status</th>
                                                <th rowspan="2" style={{ width: '180px' }}>Test On Pipe</th>
                                              </tr>
                                              <tr>
                                                <th colSpan={3}>3 o'clock</th>
                                                <th colSpan={3}>6 o'clock</th>
                                                <th colSpan={3}>9 o'clock</th>
                                                <th colSpan={3}>12 o'clock</th>
                                              </tr>
                                            </thead>
                                            <tbody>

                                              {chunk?.map((row, rowIndex) => {
                                                let mergedColumns = {};

                                                const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');

                                                const isHCTrail = headers?.some(cell => (row[cell] === 'H/C Trial' || row[cell] === 'Bare' || row[cell] === 'FBE' || row[cell] === 'H/C' || row[cell] === 'NTC'));
                                                return (
                                                  <tr key={rowIndex}>
                                                    {/* {hasData ? <td key="srNo">{rowIndex + 1}</td> : <td key="srNo">{"-"}</td>} */}
                                                    {headers?.map((cell, cellIndex) => {

                                                      if (mergedColumns[cellIndex]) {
                                                        // Skip rendering this cell, as it has been merged
                                                        return null;
                                                      }

                                                      const currentValue = row[cell]

                                                      let colSpan = 1;

                                                      // Only merge columns if the 'remarks' field is 'ntc'
                                                      if (row?.Remarks == 'Reject') {
                                                        // Merge columns regardless of whether the value is "-" or empty
                                                        for (let i = cellIndex + 1; i < headers.length; i++) {
                                                          const nextValue = row[headers[i]];
                                                          if (nextValue === currentValue || nextValue === "-" || nextValue === null || nextValue === undefined) {
                                                            colSpan++;
                                                            mergedColumns[i] = true; // Mark this column as part of the merge
                                                          } else {
                                                            break;
                                                          }
                                                        }
                                                      }

                                                      if (cell === 'Remarks') {
                                                        return null;
                                                      }

                                                      const testOnPipe = row['Test on Pipe'];
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
                                                      const isSpecialColumn = cell === 'Sr. No.' || cell === 'Pipe No.' || cell === 'Visual Of Coated Pipe' || cell === 'Coating Status' || cell === 'Test on Pipe' || cell === 'Remarks' || cell === 'ASL No.';
                                                      const columnName = headers[cellIndex];
                                                      return (
                                                        <td key={cellIndex} colSpan={colSpan}> {isHCTrail && !isSpecialColumn ? "-" : (row[cell] == "NA" ? "-" : row[cell] !== null && row[cell] !== undefined && row[cell] !== 0 && row[cell] !== "Select" ? (row.Remarks == 'Reject' && columnName != "Sr. No." && columnName != "Visual Of Coated Pipe" && columnName != "Remarks" && columnName != "ASL No." && columnName != "Pipe No.") ? columnName != "Coating Status" && columnName != "Test on Pipe" ? "Reject due to " + row[cell] : "-" :
                                                          cell === 'Test on Pipe' && (showCdTest || showImpactTest || showPeelTest || showMiddlePeelTest || showCrossCutTest || showDSCTest)
                                                            ? [
                                                              showCdTest ? "CD test" : null,
                                                              showImpactTest ? "Impact test" : null,
                                                              showMiddlePeelTest && showPeelTest ? "Middle Peel Test" : null,
                                                              showPeelTest && !showMiddlePeelTest ? "Peel Test" : null,
                                                              showCrossCutTest ? "Cross cut" : null,
                                                              showDSCTest ? "DSC" : null
                                                            ].filter(Boolean).join(", ")
                                                            : columnName != "Sr. No." && columnName != "Remarks" && columnName != "ASL No." && columnName != "Pipe No." && columnName != "Coating Status" && columnName != "Test on Pipe" && columnName != "Visual Of Coated Pipe" && row[cell] != 0 && row[cell] != "-" ? parseFloat(row[cell])?.toFixed(2) : row[cell] != 0 ? row[cell] : "-" : "-")}</td>
                                                      )
                                                      // < td key={cellIndex} > {row[cell] == "NA" ? "-" : (row.coat_status == "H/C" || row.coat_status == "H/C Trial") ? "-" : row[cell]}{row.someData == "NA" ? "-" : (row.coat_status == "H/C" || row.coat_status == "H/C Trial") ? "-" : row.someData}</td>
                                                    })}
                                                  </tr>
                                                );
                                              })}
                                              {/* {chunk?.map((item, rowIndex) => (
                                              <tr key={rowIndex}>
                                                <td key={rowIndex}>{rowIndex + 1}</td>
                                                {headers?.map((header, colIndex) => (
                                                  <td key={colIndex}>{item[header]}{item.someData}</td>
                                                ))}
                                              </tr>
                                            ))} */}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </section>
                              )}

                              <ReportRemarks reportData={headerDetails.current.testRemarks} />

                              <section className='ResultPageSection'>
                                <div className='container-fluid'>
                                  <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                      <table>
                                        <tbody>
                                          <tr>
                                            <td style={{ borderBottom: "none", padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails.current.specification || "-"} & {headerDetails.current.acceptanceCriteria || "-"} AND FOUND SATISFACTORY.</span></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </section>

                              {/* {Array.isArray(rawMaterial) && rawMaterial.length > 0 && (
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
                )} */}


                              <section className="InstrumentusedSection">
                                <div className="container-fluid">
                                  <div className="row">
                                    <div className="col-md-12 col-sm-12 col-xs-12">
                                      <table id="instrument-table">
                                        <thead>
                                          <tr>
                                            <th colSpan={instrumentDetails?.length * 2}>
                                              USED INSTRUMENT
                                            </th>
                                          </tr>
                                          <tr>
                                            {instrumentDetails?.map((data) => {
                                              return (
                                                <>
                                                  <th style={{ fontWeight: 'bold' }}>INSTRUMENT NAME</th>
                                                  <th>INSTRUMENT ID</th>
                                                </>
                                              )
                                            })}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            {instrumentDetails?.map((data) => {
                                              return (
                                                <>
                                                  <td>{data.equip_name}</td>
                                                  <td>{data.equip_code}</td>
                                                </>
                                              )
                                            })}
                                          </tr>
                                        </tbody>
                                        {/* <thead>
                                                                                        <tr>
                                                                                            <th colSpan={instrumentDetails.length * 2} style={{ textAlign: 'center', fontSize: '14px' }}>  USED INSTRUMENT</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <thead id="table-head">
                                                                                    </thead>
                                                                                    {tableBody?.map((instrument, index) => (
                                                                                        <li key={index}>
                                                                                            {instrument.name} - {instrument.code}
                                                                                        </li>
                                                                                    ))}
                                                                                    <tbody id="table-body">
                                                                                    </tbody> */}
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </section>
                              {/* <InstrumentusedSection reportType={"thickness"} reportData={instrumentDetails} /> */}

                              <Footerdata data={signatureReport} witness={randomWitnesses} />

                            </div>

                            <div className='CustomBarePipeWitnessBox'>
                              <div className='CustomBarePipeWitnessBox1'></div>
                              <div
                                className='CustomBarePipeWitnessBox2'
                                style={{ height: witnessHeight }}
                                ref={refDivB}
                              ></div>
                              <div className='CustomBareWitnessBox'>
                                {/* <span></span> */}
                                <div>
                                  <div className='RemarksCustomHeight4'></div>
                                  {chunk?.map((row, rowIndex) => {
                                    const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');

                                    return (
                                      <div key={rowIndex} className='Approvelevel1FlexBox'>
                                        {witnessesByPipeCode[row["Pipe No."]] ?
                                          <div className='Approvelevel1Flex'>
                                            <span className='CustomBorderLine'></span>
                                            {witnessesByPipeCode[row["Pipe No."]].map((witness, index) => (
                                              <div id={index} key={index} className='witnessesByPipeDiv'>
                                                <p title={witness.full_name}>&nbsp;&nbsp; <span style={{ border: '1px solid', borderRadius: '50%', padding: '2px 4px' }}>W</span> <b>-</b> {witness.initials}
                                                </p>
                                              </div>
                                            ))}
                                          </div> : ''
                                        }
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div style={{ height: '229px' }}></div>
                            </div>
                          </div>
                        </div>
                        <section className='ApprovalStatusSection'>
                          <div className='container-fluid'>
                            <div className="row text-center">
                              <div className='col-md-12 col-sm-12 col-xs-12'>
                                {renderFirstApprovalStatus()}
                              </div>
                              <div className='col-md-12 col-sm-12 col-xs-12'>
                                {renderSecondApprovalStatus()}
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
      }
    </>
  );
}

export default ThicknessInsp;