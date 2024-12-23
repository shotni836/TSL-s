import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Environment from "../../../../environment";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "../Bare-pipe-insp/BarePipe.css"
import Loading from '../../../Loading';
import '../../Allreports.css';
import './Phos-blast-insp.css';
import HeaderDataSection from "../../Headerdata";
import ReportRemarks from '../../Report-remarks';
import InstrumentusedSection from '../../Instrument-used';
import AboveresultsSection from '../../Above-results';
import Footerdata from '../../Footerdata';
import "../Bare-pipe-insp/BarePipe.css"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RawMaterialCommon from '../../RawMaterialCommon';
import html2pdf from 'html2pdf.js';
import secureLocalStorage from 'react-secure-storage';


const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
};

function PhosBlastInsp() {
    const { tstmaterialid } = useParams();
    const contentRef = useRef();
    const headerDetails = useRef([]);
    const [testDetails, setTestDetails] = useState([]);
    const [aboveresultsDetails, setAboveresultsDetails] = useState([]);
    const [instrumentDetails, setInstrumentDetails] = useState([]);
    const [showWitness, setShowWitness] = useState(true)
    const [witnessData, setWitnessData] = useState([])
    const [headers, setHeaders] = useState([])
    const [signatureReport, setSignatureReport] = useState([])
    const [witnessesByPipeCode, setWitnessesByPipeCode] = useState([]);
    const [showRemarks, setShowRemarks] = useState([])
    const [reportTestDate, setReportTestDate] = useState()
    const [randomWitnesses, setRandomWitnesses] = useState([])
    const [key, setKey] = useState()
    const [value, setKeyValue] = useState()
    const [rawMaterial, setRawMaterial] = useState([]);
    const [testMinMax, setTestMinMax] = useState([]);
    const [randomWitnessList, setRandomWitnessList] = useState([]);
    const location = useLocation();
    const pathSegments = location.pathname.split(/[\/&]/);
    const queryParams = new URLSearchParams(location.search);
    const navigate = useNavigate()
    const [witnessSelected, setWitnessSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [witnessValue, setWitnessValue] = useState('');
    const [isClicked, setIsClicked] = useState(false)
    const [minRow, setMinRow] = useState();
    const [maxRow, setMaxRow] = useState();
    const [regPerc, setRegPerc] = useState();
    const [lastApprover, setLastApprover] = useState(0);
    const [witnessHeight, setWitnessHeight] = useState(0);
    const refDivA = useRef(null); // Reference for the div whose height you want to track
    const refDivB = useRef(null);
    const [showInstrument, setShowInstrument] = useState(false);
    const [tableBody, setTableBody] = useState([]);

    function createTable(data) {
        console.log(data)
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');
        console.log(tableHead, tableBody)
        tableHead.innerHTML = '';  // Clear previous header
        tableBody.innerHTML = '';  // Clear previous content

        // Create table header
        const headerRow = document.createElement('tr');
        data.forEach(() => {
            const nameHeader = document.createElement('th');
            nameHeader.textContent = 'INSTRUMENT NAME';
            headerRow.appendChild(nameHeader);
            const serialHeader = document.createElement('th');
            serialHeader.textContent = 'INSTRUMENT ID';
            headerRow.appendChild(serialHeader);
        });
        tableHead.appendChild(headerRow);

        // Create table body
        let row = document.createElement('tr');
        data.forEach((item, index) => {
            const nameCell = document.createElement('td');
            nameCell.textContent = item.equip_name;
            row.appendChild(nameCell);

            const serialCell = document.createElement('td');
            serialCell.textContent = item.equip_code;
            row.appendChild(serialCell);

            // Check if we need to start a new row after every 4 pairs
            if ((index + 1) % 4 === 0) {
                tableBody.appendChild(row);
                row = document.createElement('tr');
            }
        });
        console.log(row)
        setTableBody(row)
        // Append the last row if it contains any cells
        if (row.hasChildNodes()) {
            tableBody.appendChild(row);
            // setTableBody(row);
        }
    }


    const adjustHeight = useCallback(() => {
        console.log(refDivA.current)
        if (refDivA.current) {
            const heightA = refDivA.current.offsetHeight; // Get Div A's height
            console.log(heightA, "heightA")
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
            console.log(refDivA.current)
            console.log(refDivA.current, "refDivA")
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
    // const companyId = 631
    const companyId = secureLocalStorage.getItem("emp_current_comp_id")
    const [checkedItems, setCheckedItems] = useState(
        testDetails.map(() => false) // Initialize all checkboxes as unchecked
    );

    let pm_project_id1 = null;
    let pm_processSheet_id1 = null;
    let pm_processtype_id1 = null;
    let pm_approved_by1 = null;
    let test_date1 = null;
    let pm_Approve_level1 = null;
    let menuId1 = null;
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
    const [formData, setFormData] = useState({
        pm_comp_id: 1,
        pm_location_id: 1,
        pm_project_id: parseInt(pm_project_id1),
        pm_processSheet_id: parseInt(pm_processSheet_id1),
        pm_processtype_id: parseInt(pm_processtype_id1),
        pm_remarks: "",
        pm_approver_status: true,
        pm_approved_by: pm_approved_by1,
        pm_approved_on: test_date1,
        pm_Approve_level: pm_Approve_level1 == "first" ? 1 : pm_Approve_level1 == "second" ? 2 : 0,
        pm_approvedRoleId_by: '0',
        p_test_run_id: parseInt(id2),
        pm_isfinalapproval: 0
    });


    async function callWitness() {
        const [id1, id2] = tstmaterialid.split('&');
        const response1 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${pm_processSheet_id1}&p_test_run_id=${id2}&p_type_id=${pm_processtype_id1}`);
        setWitnessData(response1?.data)
        const pm_status_app_rej = response1?.data[0]?.pm_status_app_rej
        const hasRejectCountGreaterThanZero = response1?.data.some(item => item.RejectCount > 0);
        const allHaveZeroCounts = response1?.data.every(item => item.ApproveCount === 0 && item.RejectCount === 0);
        if (pm_status_app_rej == null || pm_status_app_rej == 0 || pm_status_app_rej == 2 || pm_Approve_level1 == 'second') {
            // if (hasRejectCountGreaterThanZero || allHaveZeroCounts || pm_Approve_level1 == 'second') {
            setShowRemarks(true)
        } else {
            setShowRemarks(false)
        }
        if (response1.data.length == 1) {
            setFormData({ ...formData, pm_isfinalapproval: 1 })
        }
        // if (response1?.data.length == 1) {
        setWitnessValue(response1?.data[0]?.roleId)
        setFormData({ ...formData, pm_approvedRoleId_by: witnessValue != '' ? witnessValue : pm_Approve_level1 == 'first' ? response1?.data[0]?.roleId?.toString() : companyId?.toString() })
        setWitnessSelected(true);
        const matchingData = response1?.data.find(item => item.roleId == companyId);
        const regPerc = matchingData ? matchingData.reg_perc : null;
        setRegPerc(regPerc)
        // }
    }
    function convertDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        return formattedDate
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
                setLoading(true)
                const [id1, id2] = tstmaterialid.split('&');
                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/Get_MtcPhosphateReport?typeId=${pm_processtype_id1}&testId=${id2}`);
                const data = response.data[0];
                headerDetails.current = data._CdTesHeaderDetails[0]
                const date = data._CdTesHeaderDetails[0].reportTestDate || {}
                const parts = date?.split('/');
                const formattedDate = `${parts[2]}${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}`;
                setReportTestDate(formattedDate);
                // setRawMaterial(data._CdTestMat || []);
                setTestDetails(data._CdTesMiddleDetails || []);
                // setHeaders(Object.keys(data._CdTesMiddleDetails[0]))
                setTestMinMax(data._CdTestMaxMin || []);
                const { key, value } = parseKeyValuePair(data._CdTesHeaderDetails[0].poNo);
                setKey(key);
                setKeyValue(value)


                function findMostFrequentInSets(data) {
                    let result = [];

                    // Iterate through data in sets of 3
                    for (let i = 0; i < data.length; i += 10) {
                        // Slice the data for the current set of 3
                        const currentSet = data.slice(i, i + 10);

                        // Object to keep track of combination frequency
                        let combinationCount = {};

                        currentSet.forEach(item => {
                            const key = `${item.Material}_${item.Manfacturer}_${item.Grade}_${item.pm_rm_batch}`;
                            combinationCount[key] = (combinationCount[key] || 0) + 1;
                        });

                        // Find the most frequent combination in the current set
                        let mostFrequent = null;
                        let maxCount = 0;

                        for (let key in combinationCount) {
                            if (combinationCount[key] > maxCount) {
                                maxCount = combinationCount[key];
                                mostFrequent = key;
                            }
                        }

                        // Split the most frequent combination back into individual components (keys)
                        const [Material, Manufacturer, Grade, pm_rm_batch] = mostFrequent.split('_');

                        // Push the result as an object with the required keys
                        result.push({ Material, Manufacturer, Grade, pm_rm_batch });
                    }

                    return result;
                }

                const mostFrequentBatches = findMostFrequentInSets(data._CdTesMiddleDetails);
                console.log(mostFrequentBatches, "mostFrequentBatches");
                setRawMaterial(mostFrequentBatches)

                const mergedData = data._CdTesMiddleDetails.map(item => {
                    const result = {};
                    Object.keys(item).forEach(key => {
                        const match = data._CdTestMaxMin.find(d => d.co_param_val_alias === key);
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

                const witnessesByPipeCode = groupWitnessesByPipeCode(data._RandomWitness);
                setRandomWitnesses(data._RandomWitness)
                setWitnessesByPipeCode(witnessesByPipeCode)
                const dataWithWitnesses = combineDataWithWitnesses(mergedData, witnessesByPipeCode);
                setRandomWitnessList(dataWithWitnesses)
                const headers = Object.keys(dataWithWitnesses[0]).filter(key => key !== 'witnesses' && key !== "pm_rm_batch" && key !== "Material" && key !== "Manfacturer" && key !== "Grade");
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
                // setTestDetails(rows)

                const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${pm_processtype_id1}`);
                const data1 = response1.data[0]
                setInstrumentDetails(data1);
                setShowInstrument(true)
                setLoading(false)

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
    }, []);

    const groupWitnessesByPipeCode = (witnesses) => {
        return witnesses.reduce((acc, witness) => {
            if (!acc[witness.pm_pipe_seq_no]) {
                acc[witness.pm_pipe_seq_no] = [];
            }
            acc[witness.pm_pipe_seq_no].push({
                name: witness.co_param_val_name,
                initials: getInitials(witness.co_param_val_name),
                role: witness.RoleName
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
                <div className='BarePipeInspForm row m-0'>
                    {/* <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className='form-group'>
                            <label htmlFor="">Date of First Approval</label>
                            <span>: &nbsp;</span>
                            <h4>{headerDetails.first_approval_date || "05/30/2024"}</h4>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className='form-group'>
                            <label htmlFor="">Remarks</label>
                            <span>: &nbsp;</span>
                            <h4>{headerDetails.first_approval_remarks || "Remarks"}</h4>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className='form-group'>
                            <label htmlFor="">Approval Status</label>
                            <span>: &nbsp;</span>
                            <h4>{headerDetails.first_approval_status || "Approval Status"}</h4>
                        </div>
                    </div> */}
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
        // const updatedFormData = {
        //     ...formData,
        //     checkedPipes: pipeNos ? pipeNos : ''  // Replace this with the actual value or state that holds checked pipes
        // };
        // console.log(updatedFormData)
        // setFormData(updatedFormData)
        try {
            const response = await fetch(Environment.BaseAPIURL + "/api/User/InspectionSheetApproval", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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

    // useEffect(() => {
    //     // fetchData();
    //     setLoading(true)
    //     setTimeout(() => {
    //         setLoading(false)
    //     }, 3000);
    // }, []);

    // ----------------------------------------------------

    const processedMaterials = rawMaterial.map(item => ({
        materialName: item.materialName === 'Chromate' ? 'Chromate' : 'Chromate',
        grade: item.materialName === 'Chromate' ? item.grade : '-',
        manufacturerName: item.materialName === 'Chromate' ? item.manufacturerName : '-',
        batch: item.materialName === 'Chromate' ? item.batch : '-',
    }));

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
    console.log(randomWitnessList, "RandomWitnessList")
    const chunkedData = chunkAndPadArray(randomWitnessList, 10);

    const handleDownloadPDF = () => {
        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Phosphate-blasting-report-${headerDetails.current?.procSheetNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };


    console.log(witnessHeight, "witnessHeight");

    // Flag to track NTC rendering // Initialize a flag outside the map to track if NTC data is rendered.

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
                        <div className='PhosblastinspPrintReport'>
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
                                                        <div className='InspReportBox LandscapephosSectionPage'>

                                                            <HeaderDataSection reportData={headerDetails.current} />

                                                            <section className='Reportmasterdatasection' id='Reportmasterdata' ref={refDivA}>
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
                                                                                <h4>{headerDetails.current?.procSheetNo} REV.  {headerDetails.current?.procesheet_revisionno
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

                                                            {Array.isArray(testDetails) && testDetails.length > 0 && chunk != 'witnesses' && (
                                                                <section className='ReporttableSection PipeNumberTable'>
                                                                    <div className='container-fluid'>
                                                                        <div className='row'>
                                                                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                                <div id='custom-scroll'>
                                                                                    <table>
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th rowSpan={2}>Sr. No.</th>
                                                                                                <th rowSpan={2}>Pipe No.</th>
                                                                                                <th rowSpan={2}>ASL <br /> No.</th>
                                                                                                <th colSpan={2}>Pipe Temp. <br /> Before</th>
                                                                                                <th rowSpan={2}>Dwell Time <br />(Sec.)</th>
                                                                                                <th colSpan={2}>pH of Pipe <br /> Surface</th>
                                                                                                <th rowSpan={2}>Visual insp. After Acid W & I Clean</th>
                                                                                                <th rowSpan={2}>Pressure <br /> DM Water Wash (bar)</th>
                                                                                                <th colSpan={4}>DM Water Flow <br /> Rate(GPM)</th>
                                                                                                <th rowSpan={2}>Preheat. Temp. Air <br /> After water Wash (°C)</th>
                                                                                                <th rowSpan={2}>RH <br /> (%)</th>
                                                                                                <th rowSpan={2}>Amb. Temp. <br /> (°C)</th>
                                                                                                <th rowSpan={2}>Dew <br /> Point <br />(°C)</th>
                                                                                                <th rowSpan={2}>Pipe Surface Temp. (°C)</th>
                                                                                                <th rowSpan={2}>Degree Of Cleanliness</th>
                                                                                                <th rowSpan={2}>Roughness <br /> (µm - Rz)</th>
                                                                                                <th rowSpan={2}>Degree Of Dust <br /> Rating</th>
                                                                                                <th rowSpan={2}>Degree Of Dust <br /> Class</th>
                                                                                                <th rowSpan={2}>Salt Cont. (µg/cm²)</th>
                                                                                                <th rowSpan={2}>Rem.</th>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <th>BLAST <br /> ING(°C)</th>
                                                                                                <th>ACID WASH</th>

                                                                                                <th>Before Water Wash</th>
                                                                                                <th>After Water Wash</th>
                                                                                                <th>FM1</th>
                                                                                                <th>FM2</th>
                                                                                                <th>FM3</th>
                                                                                                <th>TOTAL</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <th colSpan={2} rowSpan={2}>Specified Requirement</th>
                                                                                                <th>Min</th>
                                                                                                {minRow?.slice(3)?.map((item, rowIndex) => {
                                                                                                    if (rowIndex === 7) {
                                                                                                        return (
                                                                                                            <td key={rowIndex} rowSpan={2} colSpan={4}>
                                                                                                                {/* {item} */} -
                                                                                                            </td>
                                                                                                        );
                                                                                                    } else if (rowIndex === 8 || rowIndex === 9 || rowIndex === 10) {
                                                                                                        return null;
                                                                                                    } else {
                                                                                                        return (
                                                                                                            <>
                                                                                                                <td key={rowIndex}>{item.toLowerCase() == "ok, not ok" || item.toLowerCase() == "ok , not ok" || item.toLowerCase() == "ok ,not ok" || item.toLowerCase() == "ok,not ok" ? "-" : item}</td>
                                                                                                            </>
                                                                                                        );
                                                                                                    }
                                                                                                })}
                                                                                                {/* {pm_Approve_level1 == "second" && regPerc != 100 ? <td>-</td> : ''} */}
                                                                                                {/* <td>-</td> */}
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <th>Max</th>
                                                                                                {maxRow?.slice(3)?.map((item, rowIndex) => {
                                                                                                    if (rowIndex === 7) {
                                                                                                        return null;
                                                                                                    } else if (rowIndex === 8 || rowIndex === 9 || rowIndex === 10) {
                                                                                                        return null;
                                                                                                    } else {
                                                                                                        return (
                                                                                                            <>
                                                                                                                <td key={rowIndex}>{item}</td>
                                                                                                            </>
                                                                                                        );
                                                                                                    }
                                                                                                })}
                                                                                                {/* {pm_Approve_level1 == "second" && regPerc != 100 ? <td>-</td> : ''} */}
                                                                                                {/* <td>-</td> */}
                                                                                            </tr>


                                                                                            {chunk?.map((row, rowIndex) => {
                                                                                                // Track merged columns
                                                                                                let mergedColumns = {};

                                                                                                return (
                                                                                                    <tr key={rowIndex}>
                                                                                                        {/* Always display serial number */}
                                                                                                        {/* <td key="srNo">{rowIndex + 1}</td> */}
                                                                                                        {headers?.map((cell, cellIndex) => {
                                                                                                            // if (cellIndex === 0) return null;
                                                                                                            if (cell === "pm_rm_batch" || cell === "Material" || cell === "Manfacturer" || cell === "Grade") {
                                                                                                                return null;
                                                                                                            }

                                                                                                            // Check if we already handled this cell due to merging
                                                                                                            console.log(cellIndex, mergedColumns[cellIndex], "cellIndex");

                                                                                                            if (mergedColumns[cellIndex]) {
                                                                                                                // Skip rendering this cell, as it has been merged
                                                                                                                return null;
                                                                                                            }

                                                                                                            const currentValue = row[cell]?.value;

                                                                                                            let colSpan = 1;

                                                                                                            // Only merge columns if the 'remarks' field is 'ntc'
                                                                                                            if (row?.Remarks?.value == 'NTC') {
                                                                                                                // Merge columns regardless of whether the value is "-" or empty
                                                                                                                for (let i = cellIndex + 1; i < headers.length; i++) {
                                                                                                                    const nextValue = row[headers[i]];
                                                                                                                    if (nextValue.value === currentValue || nextValue.value === "-" || nextValue.value === null || nextValue.value === undefined) {
                                                                                                                        colSpan++;
                                                                                                                        mergedColumns[i] = true; // Mark this column as part of the merge
                                                                                                                    } else {
                                                                                                                        break;
                                                                                                                    }
                                                                                                                }

                                                                                                            } console.log(colSpan, "colSpan");

                                                                                                            const columnName = headers[cellIndex];
                                                                                                            // Render the cell with the colSpan if there are consecutive values to merge
                                                                                                            return (
                                                                                                                <td key={cellIndex} colSpan={colSpan}>
                                                                                                                    {currentValue !== null && currentValue !== undefined && currentValue != 0 ? currentValue != 'Select' ? (row.Remarks.value == 'NTC' && columnName != "Sr. No." && columnName != "Remarks" && columnName != "ASL No." && columnName != "Pipe No.") ? "NTC due to " + currentValue : currentValue : 'Ok' : '-'}
                                                                                                                </td>
                                                                                                            );
                                                                                                        })}
                                                                                                    </tr>
                                                                                                );
                                                                                            })}



                                                                                            {/* {chunk?.map((row, rowIndex) => (
                                                                                            <tr key={rowIndex}>
                                                                                                {headers?.map((header, colIndex) => (
                                                                                                    <td key={colIndex}>{row[header]} {row.someData}</td>
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

                                                            <section className='ResultPageSection'>
                                                                <div className='container-fluid'>
                                                                    <div className='row'>
                                                                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                                            <table>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>REMARKS: {headerDetails?.current.testRemarks}</td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </section>

                                                            {/* <RawMaterialCommon rawMaterialDetails={rawMaterial} /> */}
                                                            {Array.isArray(rawMaterial) && rawMaterial.length > 0 && (
                                                                <section className="Reportrawmaterialsection">
                                                                    <div className="container-fluid">
                                                                        <div className="row">
                                                                            <div className="col-md-12 col-sm-12 col-xs-12">
                                                                                <div>
                                                                                    <table>
                                                                                        <thead>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>MATERIAL: &nbsp;&nbsp;
                                                                                                    {rawMaterial.slice(chunkIndex, chunkIndex + 1).map((rawMaterial, index) => (
                                                                                                        <>{rawMaterial.Material || "-"}</>
                                                                                                    ))}
                                                                                                </td>
                                                                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>MANUFACTURER: &nbsp;&nbsp;
                                                                                                    {rawMaterial.slice(chunkIndex, chunkIndex + 1).map((rawMaterial, index) => (
                                                                                                        <>
                                                                                                            {rawMaterial.Manufacturer || "-"}
                                                                                                        </>
                                                                                                    ))}</td>
                                                                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>GRADE: &nbsp;&nbsp;
                                                                                                    {rawMaterial.slice(chunkIndex, chunkIndex + 1).map((rawMaterial, index) => (
                                                                                                        <>{rawMaterial.Grade || "-"}</>
                                                                                                    ))}</td>
                                                                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>BATCH: &nbsp;&nbsp;
                                                                                                    {rawMaterial.slice(chunkIndex, chunkIndex + 1).map((rawMaterial, index) => (
                                                                                                        <>{rawMaterial.pm_rm_batch || "-"}</>
                                                                                                    ))}</td>
                                                                                            </tr>
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
                                                                                    {/* {headerDetails?.current.remarks ? */}
                                                                                    <tr>
                                                                                        <td>ELAPSE TIME OBSERVED MAXIMUM 1Hr. BETWEEN BLASTING & COATING APPLICATION. </td>
                                                                                    </tr>
                                                                                    {/* : ''} */}
                                                                                    {/* {headerDetails?.current.anchorRemarks == '' ?  */}
                                                                                    <tr>
                                                                                        <td style={{ textTransform: 'uppercase' }}>Anchor Pattern Under 30X Magnification has been checked on above pipes & found no dished or round profile as per appoved QAP </td>
                                                                                    </tr>
                                                                                    {/* : ''} */}
                                                                                    <tr>
                                                                                        <td style={{ borderBottom: "none" }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerDetails.current?.specification} AND QAP NO.: {headerDetails.current?.acceptanceCriteria} AND FOUND SATISFACTORY.</span></td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </section>

                                                            {/* <InstrumentusedSection reportType={"blasting"} reportData={instrumentDetails} /> */}

                                                            {showInstrument ?
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
                                                                </section> : ""}

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
                                                                    <div className='RemarksCustomHeight1'></div>
                                                                    {chunk?.map((row, rowIndex) => {
                                                                        const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');
                                                                        return (
                                                                            <div key={rowIndex} className='Approvelevel1FlexBox1'>
                                                                                {console.log(witnessesByPipeCode[row["Sr. No."]?.value])}

                                                                                {witnessesByPipeCode[row["Sr. No."]?.value] ?
                                                                                    <div className='Approvelevel1Flex'>
                                                                                        <span className='CustomBorderLine1'></span>
                                                                                        {witnessesByPipeCode[row["Sr. No."]?.value].map((witness, index) => (
                                                                                            <div id={index} key={index} className='witnessesByPipeDiv'>
                                                                                                <p title={witness.name}>&nbsp;&nbsp; <span style={{ border: '1px solid', borderRadius: '50%', padding: '2px 4px' }}>W</span> <b>-</b> {witness.initials}
                                                                                                </p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div> : ''
                                                                                }
                                                                                {/* {pm_Approve_level1 == "second" && regPerc != 100 ?
                                                                                    <div className='Approvelevel1Flex' id={rowIndex}>{!row.someData ?
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={checkedItems[rowIndex]}
                                                                                            onChange={() => handleCheckboxChange(rowIndex)}
                                                                                        /> : ''
                                                                                    }
                                                                                    </div> : ''} */}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div style={{ height: '229px' }}></div>
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
export default PhosBlastInsp;