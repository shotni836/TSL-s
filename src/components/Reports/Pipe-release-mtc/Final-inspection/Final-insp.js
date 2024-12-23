import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import "./Final-insp.css"
import '../../Allreports.css';
import HeaderDataSection from "../../Headerdata";
import ReportRemarks from '../../Report-remarks';
import Footerdata from '../../Footerdata';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2pdf from 'html2pdf.js';
import secureLocalStorage from 'react-secure-storage';
import Loading from '../../../Loading';
import Loader from '../../../Loader';
import { decryptData, encryptData } from '../../../Encrypt-decrypt';

function FInalInsp() {
  const token = secureLocalStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const { tstmaterialid } = useParams();
  const contentRef = useRef();
  const headerDetails = useRef([]);
  const [testDetails, setTestDetails] = useState([]);
  const [instrumentDetails, setInstrumentDetails] = useState([]);
  const [showWitness, setShowWitness] = useState(true)
  const [witnessData, setWitnessData] = useState([])
  const [headers, setHeaders] = useState([])
  const [signatureReport, setSignatureReport] = useState([])
  const [randomWitnesses, setRandomWitnesses] = useState([])
  const [showRemarks, setShowRemarks] = useState([])
  const [reportTestDate, setReportTestDate] = useState()
  const [isClicked, setIsClicked] = useState(false)
  const [key, setKey] = useState()
  const [value, setKeyValue] = useState()
  const location = useLocation();
  const pathSegments = location.pathname.split(/[\/&]/);
  const navigate = useNavigate()
  const [witnessSelected, setWitnessSelected] = useState(false);
  const [witnessValue, setWitnessValue] = useState('');
  const [witnessesByPipeCode, setWitnessesByPipeCode] = useState([]);
  const [testName, setTestName] = useState([]);
  const [randomWitnessList, setRandomWitnessList] = useState([]);
  const [regPerc, setRegPerc] = useState();
  // const companyId = 631
  const companyId = secureLocalStorage.getItem("emp_current_comp_id")
  const [forceUpdate, setForceUpdate] = useState(0);
  const [checkedItems, setCheckedItems] = useState(
    testDetails.map(() => false) // Initialize all checkboxes as unchecked
  );
  const [minRow, setMinRow] = useState();
  const [maxRow, setMaxRow] = useState();

  let pm_project_id1 = null;
  let pm_processSheet_id1 = null;
  let pm_processtype_id1 = null;
  let pm_approved_by1 = null;
  let test_date1 = null;
  let pm_Approve_level1 = null;
  let menuId1 = null;

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
    pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
    pm_approvedRoleId_by: '0',
    p_test_run_id: parseInt(ID2),
    pm_isfinalapproval: 0
  });

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
      const hasRejectCountGreaterThanZero = response1?.data.some(item => item.RejectCount > 0);
      const allHaveZeroCounts = response1?.data.every(item => item.ApproveCount === 0 && item.RejectCount === 0);
      if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 == 'second') {
        setShowRemarks(true)
      } else {
        setShowRemarks(false)
      }
      // if (response1.data.length == 1) {
      //     setFormData({ ...formData, pm_isfinalapproval: 1 })
      // }
      // if (response1?.data.length == 1) {
      setWitnessValue(pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId : '')
      setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId.toString() : companyId.toString(), pm_isfinalapproval: response1.data.length == 1 ? 1 : 0 })
      setWitnessSelected(true);

      const matchingData = response1?.data.find(item => item.roleId == companyId);
      const regPerc = matchingData ? matchingData.reg_perc : null;
      setRegPerc(regPerc)
    } catch (error) {
      console.error('Error in callWitness:', error.message);
      setWitnessSelected(false);
      setShowRemarks(false);
      setWitnessData([]);
    }
  }

  const parseKeyValuePair = (str) => {
    const parts = str.split(':-');
    const key = parts[0].trim(); // Key before ':-'
    const value = parts[1]?.trim(); // Value after ':-', using optional chaining
    return { key, value };
  };

  const handleCheckboxChange = (index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = [...prev];
      newCheckedItems[index] = !newCheckedItems[index];
      return newCheckedItems;
    });
  };

  // Count checked checkboxes

  const getInitials = (name) => {
    return name
      .split(' ')               // Split the name into an array of words
      .map(word => word[0])     // Take the first letter of each word
      .join('')                 // Join the letters together
      .toUpperCase();           // Convert to uppercase
  };

  function convertDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate
  }

  const checkedCount = checkedItems.filter(Boolean).length;

  const groupWitnessesByPipeCode = (witnesses) => {
    return witnesses?.reduce((acc, witness) => {
      if (!acc[witness.pm_pipe_code]) {
        acc[witness.pm_pipe_code] = [];
      }
      acc[witness.pm_pipe_code].push({
        name: witness.co_param_val_name,
        role: witness.RoleName,
        initials: getInitials(witness.co_param_val_name),
      });
      return acc;
    }, {});
  };

  const combineDataWithWitnesses = (data, witnessesByPipeCode) => {
    return data.map(pipe => {
      const pipeCode = pipe["Pipe No."].value;
      return {
        ...pipe,
        witnesses: witnessesByPipeCode[pipeCode] || []
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [id1, id2] = tstmaterialid.split('&');
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/Get_ExternalFinalReport?matid=${encryptData(528)}&testId=${id2}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = response.data[0];
        headerDetails.current = data[0]
        const date = data[0].ReportTestDate || {}
        const parts = date?.split('/');
        const formattedDate = `${parts[2]}${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}`;
        setReportTestDate(formattedDate);
        setTestDetails(data[1] || []);

        const mergedData = response.data[1].map(item => {
          const result = {};
          Object.keys(item).forEach(key => {
            const match = response.data[6].find(d => d.co_param_val_alias === key);
            if (match) {
              result[key] = {
                value: item[key],
                PM_Reqmnt_test_Max: match.PM_Reqmnt_test_Max,
                PM_Reqmnt_test_min: match.PM_Reqmnt_test_min,
                PM_Reqmnt_test_plus: match.pm_reqmnt_temp_plus,
                PM_Reqmnt_test_minus: match.pm_reqmnt_temp_Minus,
                pm_value_type: match.pm_value_type,
                pm_test_value: match.pm_test_value
              };
            } else {
              result[key] = { value: item[key] };
            }
          });
          return result;
        });

        // const headerss = response.data[3]?.map((data) => data.TestName)
        // const headerss = Object.keys(mergedData[0]);

        // const minValues = headerss.map(header => console.log(mergedData[0], header));
        // const minValues = headerss.map(header => mergedData[0][header].pm_value_type == 'A' ? mergedData[0][header].pm_test_value : mergedData[0][header].PM_Reqmnt_test_min || "-");
        // const maxValues = headerss.map(header => mergedData[0][header].PM_Reqmnt_test_Max || "-");
        // const rows = mergedData.map(entry => {
        //   return headerss.map(header => entry[header].value);
        // });
        // setMinRow(minValues)
        // setMaxRow(maxValues)

        // const mergedData = response.data[1].map(pipe => {
        //   const matchingPipe = response.data[1]?._RandomWitness?.find(
        //     match => match.pm_pipe_code === pipe["Pipe No."]
        //   );

        //   if (matchingPipe) {
        //     return {
        //       ...pipe,
        //       "Witness Name": matchingPipe.co_param_val_name,
        //       "Role": matchingPipe.RoleName
        //     };
        //   }
        //   return pipe;
        // });

        const witnessesByPipeCode = groupWitnessesByPipeCode(response.data[4]);
        setRandomWitnesses(response.data[4])
        setWitnessesByPipeCode(witnessesByPipeCode)
        const dataWithWitnesses = combineDataWithWitnesses(mergedData, witnessesByPipeCode);
        setRandomWitnessList(dataWithWitnesses)
        const headers = Object.keys(dataWithWitnesses[0]).filter(key => key !== 'witnesses');
        // Extract rows
        const minValues = headers.map(header => mergedData[0][header].pm_value_type == 'A' ? mergedData[0][header].pm_test_value : mergedData[0][header].PM_Reqmnt_test_min || "-");
        const maxValues = headers.map(header => mergedData[0][header].PM_Reqmnt_test_Max || "-");
        const rows = mergedData.map(entry => {
          return headers.map(header => entry[header].value);
        });
        setMinRow(minValues)
        setMaxRow(maxValues)
        // State hooks for headers, min/max values, and data rows
        setHeaders(headers)
        // setTestName(data._CdTestName[0].TestName || [])
        const { key, value } = parseKeyValuePair(data[0].PONo);
        setKey(key);
        setKeyValue(value)

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
          const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetails?TestRunId=${id2}&ProcessSheetId=${pm_processSheet_id1}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          const data = response?.data;
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
    const checkCount = parseInt(checkedCount)
    const testDetail = parseInt(testDetails.length)
    const regPercs = parseInt(regPerc)
    // if (pm_Approve_level1 == "second" && regPerc != 100 && formData.pm_approver_status == true) {
    //     if (checkCount / testDetail * 100 < regPercs) {
    //         toast.error(`Please check atleast ${Math.ceil((regPercs / 100) * testDetail)} data`)
    //         return
    //     }
    // }
    // return
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
    // return
    function getPipeNosByIds(checkedItems, testDetails) {
      return checkedItems
        .map((id, index) => id ? testDetails[index]["Pipe No."] : null)
        .filter(pipeNo => pipeNo !== null);
    }

    // Example usage
    const pipeNos = getPipeNosByIds(checkedItems, testDetails);
    // setFormData((...prevData) => [{ prevData, checkedPipes: pipeNos }])
    // return
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

  const chunkedData = chunkAndPadArray(randomWitnessList, 20);

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Ext-Final-report-${headerDetails.current?.procSheetNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // DYNAMIC HEIGHT OF CONTENT DATA
  const [witnessHeight, setWitnessHeight] = useState(0);
  const refDivA = useRef(null); // Reference for the div whose height you want to track
  const refDivB = useRef(null); // Reference for the div whose height you want to set

  const adjustHeight = useCallback(() => {
    if (refDivA.current) {
      const heightA = refDivA.current.offsetHeight; // Get Div A's height

      setWitnessHeight(heightA); // Set Div B's height
    }
  }, []);
  const styles = {
    printStyle: {
      height: witnessHeight,
      rowHeight: {
        height: '10px'
      }
    },
  };

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


  return (
    <>
      <style>
        {`
          @media print {
            .CustomBarePipeWitnessBox2 {
              height: ${witnessHeight - 50}px !important;
            }
          }
        `}
      </style>
      {
        loading ? (
          <Loading />
        ) : loader ? (
          <Loader />
        ) : (
          <>
            <div className='FinalInspectionReports'>
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
                          <div className='CustomPhosWitnessFlex'>
                            <div className='InspReportBox PotraitBarePipeSectionPage'>
                              <HeaderDataSection reportData={headerDetails.current} />
                              <section className='Reportmasterdatasection' id='Reportmasterdata' ref={refDivA}>
                                <div className='container-fluid'>
                                  <form className='row'>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Client</label>
                                        <span>: &nbsp;</span>
                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails.current.ClientName}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Report No.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.ReportAlias}/{reportTestDate} - {String(chunkIndex + 1).padStart(2, '0')} {headerDetails?.current.ReportPqt == '' ? '' : (
                                          <> ({headerDetails.current.ReportPqt})</>
                                        )}
                                          {headerDetails.current?.rep_revisionno ? "REV. " + headerDetails.current?.rep_revisionno : ''} {headerDetails.current?.rep_revisionno ? "DATE. " + convertDate(headerDetails.current?.rep_revisiondate.split("T")[0]) : ''}
                                        </h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">{key ? key : ''}.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{value ? value : ''}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Date & Shift</label>
                                        <span>: &nbsp;</span>
                                        <h4 style={{ textTransform: 'uppercase' }}>{headerDetails.current?.DateShift}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Pipe Size</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.PipeSize}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Acceptance Criteria</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.AcceptanceCriteria}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Specification</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.specification}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Process Sheet No.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.ProcSheetNo} {"REV. " + headerDetails.current?.procesheet_revisionno.toString().padStart(2, '0')}  {"DATE : " + convertDate(headerDetails.current?.procesheet_revisiondate.split("T")[0])}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Type Of Coating</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.TypeofCoating}</h4>
                                      </div>
                                    </div>
                                    <div className='col-md-6 col-sm-6 col-xs-12 p-0'>
                                      <div className='form-group'>
                                        <label htmlFor="">Procedure / WI No.</label>
                                        <span>: &nbsp;</span>
                                        <h4>{headerDetails.current?.WINO && condenseData(headerDetails.current.WINO) || "-"}</h4>
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
                                              <th rowSpan={2} style={{ width: '40px' }}>Sr. No.</th>
                                              <th rowSpan={2}>Coating No. / Field No.</th>
                                              <th rowSpan={2} style={{ width: '70px' }}>Pipe No.</th>
                                              <th rowSpan={2}>Heat No.</th>
                                              <th rowSpan={2}>Length (mtr)</th>
                                              <th rowSpan={2}>ASL No.</th>
                                              <th colSpan={2}>Cut Back</th>
                                              <th colSpan={2}>Epoxy Band</th>
                                              <th colSpan={2}>Cut Back Angle</th>
                                              <th rowSpan={2}>Holiday (kV)</th>
                                              <th rowSpan={2} colSpan={4}>Residual Magnetism</th>
                                              <th rowSpan={2}>Visual</th>
                                              <th rowSpan={2} style={{ width: '63px' }}>Date of Coating</th>
                                              <th rowSpan={2} style={{ width: '100px' }}>Remarks</th>
                                            </tr>
                                            <tr>
                                              <th>F End</th>
                                              <th>T End</th>
                                              <th>F End</th>
                                              <th>T End</th>
                                              <th>F End</th>
                                              <th>T End</th>
                                            </tr>
                                            <tr>
                                              <th colSpan={5} rowSpan={2}>Specified Requirement</th>
                                              <th>Min.</th>
                                              {/* <tr>
                                                <th>Min.</th>
                                                <th colSpan={2}>152 MM</th>
                                                <th colSpan={2}>25 MM</th>
                                                <th colSpan={2}>-</th>
                                              </tr> */}
                                              {minRow?.slice(6)?.map((item, rowIndex) => (
                                                <td style={{ fontWeight: '900' }} key={rowIndex}>{item}</td>
                                              ))}
                                            </tr>
                                            {/* <tr>
                                              <th colSpan={2}>175 MM</th>
                                              <th colSpan={2}>25 MM</th>
                                              <th colSpan={2}>-</th>
                                              </tr> */}
                                            <tr>
                                              <th>Max.</th>
                                              {maxRow?.slice(6)?.map((item, rowIndex) => (
                                                <td style={{ fontWeight: '900' }} key={rowIndex}>{item}</td>
                                              ))}
                                            </tr>
                                          </thead>
                                          {/* <thead>
                                            <tr>
                                              {headers?.map((header, index) => (
                                                <th key={index}>{header}</th>
                                              ))}
                                            </tr>
                                          </thead> */}
                                          <tbody>
                                            {chunk?.map((row, rowIndex) => {

                                              const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');
                                              const testOnPipe = row['Remarks'];

                                              const cdTests = [
                                                '24 Hours CD',
                                                '28 Days (Hot) CD',
                                                '28 Days (Normal) CD',
                                                '30 Days (Hot) CD',
                                                '30 Days (Normal) CD',
                                                '48 Hours CD'
                                              ];

                                              // Check for CD tests, Impact Strength Test, Bond Strength Test, Cross cut test, and Degree Of Cure conditions
                                              const showCdTest = cdTests.some(test => testOnPipe?.value?.includes(test));
                                              const showImpactTest = testOnPipe?.value?.includes('Impact Strength Test');
                                              const showPeelTest = testOnPipe?.value?.includes('Bond Strength Test - HOT') || testOnPipe?.value?.includes('Bond Strength Test - NORMAL');
                                              const showCrossCutTest = testOnPipe?.value?.includes('Cross cut');
                                              const showDSCTest = testOnPipe?.value?.includes('Degree Of Cure');

                                              const tests = [
                                                showCdTest ? "CD test" : null,
                                                showImpactTest ? "Impact test" : null,
                                                showPeelTest ? "Peel Test" : null,
                                                showCrossCutTest ? "Cross cut" : null,
                                                showDSCTest ? "DSC" : null
                                              ].filter(Boolean).join(", ") || "-";

                                              return (
                                                <tr key={rowIndex}>
                                                  {hasData ? <td key="srNo">{(chunkIndex * 20) + rowIndex + 1}</td> : <td key="srNo">{"-"}</td>}
                                                  {headers?.slice(1).map((header, colIndex) => (

                                                    <td key={colIndex}>{row[header]?.value !== undefined && row[header]?.value !== null && row[header]?.value !== "null" && row[header]?.value !== '0' ?
                                                      header === 'Remarks'
                                                        ? tests
                                                        : row[header]?.value : "-"}</td>
                                                  ))}
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

                              <ReportRemarks reportData={headerDetails.current.testRemarks} report={'inlet'} testName={testName} />

                              <section className='ResultPageSection'>
                                <div className='container-fluid'>
                                  <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                      <table style={{ border: 'none' }}>
                                        <tbody>
                                          <tr>
                                            <td style={{ borderBottom: "none", padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails.current?.specification} & QAP NO.- {headerDetails.current?.acceptanceCriteria} AND FOUND SATISFACTORY.</span></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </section>

                              {/*  <InstrumentusedSection reportType={"inlet"} reportData={instrumentDetails} /> */}

                              <section className="InstrumentusedSection">
                                <section className="container-fluid">
                                  <div className="row">
                                    <div className="col-md-12 col-sm-12 col-xs-12">
                                      <table id="instrument-table">
                                        <thead>
                                          <tr>
                                            <th colSpan={3} style={{ textAlign: 'center' }}> USED INSTRUMENT</th>
                                          </tr>
                                          <tr>
                                            <th>SR. NO.</th>
                                            <th>INSTRUMENT NAME</th>
                                            <th>INSTRUMENT ID / SERIAL NO.</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {instrumentDetails.map((item, index) => (
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
                                        {witnessesByPipeCode[row["Pipe No."]?.value] ?
                                          <div className='Approvelevel1Flex'>
                                            <span className='CustomBorderLine'></span>
                                            {witnessesByPipeCode[row["Pipe No."]?.value]?.map((witness, index) => (
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
        )
      }
    </>
  );
}
export default FInalInsp;