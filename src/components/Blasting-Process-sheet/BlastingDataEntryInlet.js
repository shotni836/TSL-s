import React, { useState, useEffect, useRef } from 'react';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import * as XLSX from 'xlsx'
import "./BlastingDataEntry.css";
import { Link } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import secureLocalStorage from 'react-secure-storage';
import Headerdata from '../Common/Sample-onereport/Headerdata';

var excludedPipes = []

function BlastingDataEntryInlet() {
    const [fileData, setFileData] = useState([]);
    const date = new Date();
    const defaulttestdate = date.toLocaleDateString("en-CA");
    const [isLoading, setIsLoading] = useState(false);
    const [remarks, setRemarks] = useState();
    const [inputValues, setInputValues] = useState([]);
    const [remarkValues, setRemarkValues] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wiSelectedProcedure, setWiSelectedProcedure] = useState("");
    const [year, setYear] = useState('');
    const [type, setType] = useState('');
    const [usedInstrument, setusedInstrument] = useState()
    const [tpiCheckbox, setTpiCheckbox] = useState({})
    const [headerData, setHeaderData] = useState({});
    const [inputValue3, setInputValue3] = useState('');
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [input1, setInput1] = useState('');
    const [input3, setInput3] = useState('');
    const currentCompanyId = secureLocalStorage.getItem('emp_current_comp_id');
    const [isPqt, setIsPqt] = useState(false);
    const [tableData, setTableData] = useState([])
    const [headers, setHeaders] = useState()
    const modalData = useRef([])
    const checkedPipes = useRef([]);
    const [modalDataKey, setModalDataKey] = useState(0);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const menuId = queryParams.get('menuId');
    const [shift, setShift] = useState()
    const [testRunId, setTestRunId] = useState()
    const userRole = secureLocalStorage.getItem('userRole');
    const roleId = secureLocalStorage.getItem('roleId');
    const empId = secureLocalStorage.getItem('empId');
    const userId = secureLocalStorage.getItem('userId');
    const [witnessData, setWitnessData] = useState([])
    const searchParams = new URLSearchParams(window.location.search);
    const pm_test_run_id = searchParams.get("pm_test_run_id");
    const procsheetId = searchParams.get("processsheetId");
    const action = searchParams.get("action");
    const [witnessList, setWitnessList] = useState([])

    const handleTypeChange = (e) => {
        const { name, value } = e.target;
        if (name === "year") {
            setYear(value);
        } else {
            setType(value);
        }
    };

    const handleTypeBlur = () => {
        callApi();
    }

    const callApi = async () => {
        try {
            if (year && type) {
                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?processsheetno=${type}&year=${year}`);
                const firstDataItem = response.data.Table[0];
                setShift(response.data.Table5[0])
                setHeaderData(firstDataItem || []);
            } else {
                console.error('Invalid year or type:', year, type);
            }
        } catch (error) {
            console.error('Error fetching process sheet details:', error);
        }
    };

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        getYear();
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    async function getData(e) {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetTestBlastingdataEntryNewtmp?processsheetno=${headerData?.processsheetid}&processtype=523&TestDate=${headerData?.testdate}&shiftid=${shift?.pm_shift_id}`)
            setTableData(response?.data)
            setTestRunId(response?.data[1][0]?.pm_test_run_id)
            const headers = setTableDataHeader(response?.data);
            const initialInputValues = response?.data[1]?.map(() => "");
            const initialRemarkValues = response?.data[1]?.map(() => "");
            setInputValues(initialInputValues);
            setRemarkValues(initialRemarkValues);
            setHeaders(headers)

            const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${523}`);
            const data = response1.data[0]
            setusedInstrument(data);

            const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=0&test_id=${523}`)
            const procedures = response2?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setWiSelectedProcedure(procedures);
            // if (action == 'edit') {
            // editData(procedures)
            // }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    const setTableDataHeader = (data, data1) => {
        const staticHeaders = ["Sr. No", "Pipe No.", "ASL No."];
        const dynamicHeaders = action != 'edit' ? data[0]?.map(item => item.co_param_val_name).filter(Boolean) : data[1]?.map(item => item.co_param_val_name).filter(Boolean); // Filter out null/undefined
        const remarksHeader = "Remarks"; // Add remarks header
        let headers = [...staticHeaders, ...dynamicHeaders, remarksHeader];

        if (action === 'edit') {
            data1.forEach(role => {
                if (role.Name.includes("TPI")) {
                    headers.push("Witness TPI");
                }
                if (role.Name.includes("PMC")) {
                    headers.push("Witness PMC");
                }
                if (role.Name.includes("Surveillance")) {
                    headers.push("Witness Surveillance");
                }
                if (role.Name.includes("Client")) {
                    headers.push("Witness Client");
                }
            });
        }

        return headers
    };

    const [ddlYear, setddlYear] = useState([]);

    const getYear = async () => {
        const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
        const sortedYears = response.data.sort((a, b) => b.year - a.year);
        setddlYear(sortedYears);

        if (action == 'edit') {
            const response1 = await axios.post(Environment.BaseAPIURL + `/api/User/GetBlastingDetailsByIdNew?ProcessSheetID=${procsheetId}&ProcessSheetTypeID=${523}&testid=${pm_test_run_id}`)
            setHeaderData(response1?.data[0][0])
            setShift(response1?.data[0][0])
            setTableData(response1?.data)
            setTestRunId(response1?.data[0][0]?.pm_test_run_id)


            const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=0&test_id=${523}`)
            const procedures = response2?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setWiSelectedProcedure(procedures);

            const response3 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${523}`);
            const data = response3.data[0]
            setusedInstrument(data);

            const response4 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${procsheetId}&p_test_run_id=${pm_test_run_id}&p_type_id=${523}`);
            setWitnessData(response4?.data)

            const response5 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetInspectionRandomWitnessById?ProcessSheetID=${procsheetId}&ProcessSheetTypeID=${523}&testid=${pm_test_run_id}&current_companyid=${currentCompanyId}`)
            setWitnessList(response5.data[2])

            initializeResultSuffixInput(response1, response5.data[2])


            if (response4?.data) {
                const headers = setTableDataHeader(response1?.data, response4?.data);
                setHeaders(headers)
            }
        }
    };

    const initializeResultSuffixInput = (response, response2) => {
        let updatedInputValues = {};
        let updatedRemarkValues = {};
        let tpiCheckboxValues = {};
        const updatedCheckboxState = {};
        let updatedSampleInput = {};
        let updatedResultMessage = {};

        for (var i = 0; i < response?.data[2].length; i++) {
            const key = `${i}`; // Assuming rowIndex is 0 for initialization
            updatedInputValues[key] = response?.data[2][i].pm_test_value2;
            updatedRemarkValues[key] = response?.data[2][i].pm_test_result_remarks;
        }

        for (var i = 0; i < response2?.length; i++) {
            // {
            //     "3-TPI- Arif Muhammad": false,
            //     "2-TPI- Arif Muhammad": false,
            //     "4-TPI- Arif Muhammad": true
            // }
            const key = `${i}`; // Assuming rowIndex is 0 for initialization
            updatedInputValues[key] = response?.data[2][i].pm_test_value2;
        }

        setInputValues(updatedInputValues)
        setRemarkValues(updatedRemarkValues)
    }

    function getRemarks(e) {
        e.preventDefault()
        setRemarks(e.target.value)
    }

    const handleCheckboxChange = (index, witnessType) => {
        console.log(witnessType);

        setTpiCheckbox(prevState => ({
            ...prevState,
            [`${index}-${witnessType}`]: !prevState[`${index}-${witnessType}`], // Toggle checkbox state
        }));
        console.log(tpiCheckbox)
    };

    // const handleCheckboxChange = (key) => {
    //     setTpiCheckbox((prev) => {
    //         const newValue = !prev[key];
    //         const newCheckboxState = {
    //             ...prev,
    //             [key]: newValue ? (prev[key] || true) : false // Set to the value from the API if checked, otherwise false
    //         };

    //         return newCheckboxState;
    //     });
    // };

    useEffect(() => {
        const initialCheckboxState = {};
        witnessList.forEach((item, index) => {
            const witnessType = item.Name; // Get the witness type
            const checkboxKey = `${index}-${item.pm_random_witness_id}`
            // Set checkbox to true if pm_random_witness_id is not null
            initialCheckboxState[checkboxKey] = item.pm_random_witness_id !== null ? true : false;
        });
        setTpiCheckbox(initialCheckboxState);
        console.log(initialCheckboxState);

    }, [witnessList]);


    const handleSubmit = async (e, value) => {
        e.preventDefault()
        if (userRole == "Witness_PMC" || userRole == "Witness_Client" || userRole == "Witness_Surveillance" || userRole == "Witness_TPI") {
            const inputData1 = {
                pm_comp_id: 1,
                pm_location_id: 1,
                pm_project_id: tableData[0][0].project_id,
                pm_processSheet_id: tableData[0][0].procsheet_id,
                pm_processtype_id: "523",
                pm_approved_by: userId.toString(),
                p_test_run_id: testRunId ? testRunId.toString() : '0',
                checkedPipes: checkedPipes.current
            }

            Object.entries(tpiCheckbox).forEach(([key, isChecked]) => {
                if (isChecked) {
                    // Assuming the key format is "<index>-<Name>"
                    const index = key.split('-')[0]; // Extract the index from the key
                    const pipNo = tableData[2]?.[index]?.PIPNO; // Get the corresponding PIPNO from tableData
                    if (pipNo) {
                        inputData1.checkedPipes.push(pipNo); // Add the PIPNO to checkedPipes
                    }
                }
            });

            try {
                const response = await fetch(
                    Environment.BaseAPIURL + "/api/User/InsertInspectionRandomWitness",
                    {
                        method: "POST",
                        headers: {
                            'Content-Type': `application/json`,
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(inputData1),
                    }
                );

                const responseBody = await response.text();
                setIsSubmitting(false);
                if (responseBody === "100") {
                    toast.success("Form data sent successfully!");
                    console.log("Form data sent successfully!");
                    navigate(`/blastingsheetlist?menuId=${menuId}`)
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
        }

        else {
            setIsSubmitting(true);
            e.preventDefault();
            let Aggriddata = [];

            if (action != 'edit') {
                tableData[1].forEach(function (elerow, index) {
                    console.log(elerow)
                    const key = `${index}-0`;
                    let obj = {
                        seqno: "",
                        test_categ_id: "",
                        test_type_id: "",
                        test_id: "",
                        proc_template_id: "",
                        proc_test_id: "",
                        assigned_to_role_id: '',
                        shift_id: shift.pm_shift_id.toString(),
                        test_result_batch: "0",
                        pipe_id: "",
                        temperature1: "",
                        test_value1: "",
                        test_value2: "",
                        value_type: '523',
                        test_result_accepted: "",
                        assigned_to_role_id: "",
                        test_result_remarks: "",
                    };

                    obj.test_value1 = inputValues[`${index}`] || ''; // Retrieve inputValue specific to this row
                    obj.test_result_remarks = remarkValues[`${index}`] || '' // Retrieve remarkValue specific to this row
                    obj.pipe_id = elerow.pipe_id.toString();
                    obj.ntcReason = "";
                    obj.temperature1 = '0'
                    obj.seqno = elerow?.seqno ? elerow?.seqno.toString() : "1";
                    obj.proc_template_id = tableData[0][0]?.pm_proc_template_id + "";
                    obj.test_categ_id = tableData[0][0]?.pm_test_categ_id + "";
                    obj.test_type_id = tableData[0][0]?.pm_test_type_id + "";
                    obj.test_id = tableData[0][0]?.pm_test_id + "";
                    obj.proc_test_id = "0";
                    obj.airpressure_A1 = elerow.A1 ? elerow.A1 : '';
                    obj.airpressure_A2 = elerow.A2 ? elerow.A2 : '';
                    obj.airpressure_A3 = elerow.A3 ? elerow.A3 : '';
                    obj.airpressure_A4 = elerow.A4 ? elerow.A4 : '';
                    obj.airpressure_A5 = elerow.A5 ? elerow.A5 : '';
                    obj.airpressure_A6 = elerow.A6 ? elerow.A6 : '';
                    obj.airpressure_A7 = elerow.A7 ? elerow.A7 : '';
                    obj.airpressure_A8 = elerow.A8 ? elerow.A8 : '';
                    obj.airpressure_A9 = elerow.A9 ? elerow.A9 : '';
                    obj.airpressure_A10 = elerow.A10 ? elerow.A10 : '';
                    obj.airpressure_A11 = elerow.A11 ? elerow.A11 : '';
                    obj.airpressure_A12 = elerow.A12 ? elerow.A12 : '';
                    obj.airpressure_B1 = elerow.B1 ? elerow.B1 : '';
                    obj.airpressure_B2 = elerow.B2 ? elerow.B2 : '';
                    obj.airpressure_B3 = elerow.B3 ? elerow.B3 : '';
                    obj.airpressure_B4 = elerow.B4 ? elerow.B4 : '';
                    obj.airpressure_B5 = elerow.B5 ? elerow.B5 : '';
                    obj.airpressure_B6 = elerow.B6 ? elerow.B6 : '';
                    obj.airpressure_B7 = elerow.B7 ? elerow.B7 : '';
                    obj.airpressure_B8 = elerow.B8 ? elerow.B8 : '';
                    obj.airpressure_B9 = elerow.B9 ? elerow.B9 : '';
                    obj.airpressure_B10 = elerow.B10 ? elerow.B10 : '';
                    obj.airpressure_B11 = elerow.B11 ? elerow.B11 : '';
                    obj.airpressure_B12 = elerow.B12 ? elerow.B12 : '';
                    obj.flowrate_A1 = elerow.SecondA1 ? elerow.SecondA1 : '';
                    obj.flowrate_A2 = elerow.SecondA2 ? elerow.SecondA2 : '';
                    obj.flowrate_A3 = elerow.SecondA3 ? elerow.SecondA3 : '';
                    obj.flowrate_A4 = elerow.SecondA4 ? elerow.SecondA4 : '';
                    obj.flowrate_A5 = elerow.SecondA5 ? elerow.SecondA5 : '';
                    obj.flowrate_A6 = elerow.SecondA6 ? elerow.SecondA6 : '';
                    obj.flowrate_A7 = elerow.SecondA7 ? elerow.SecondA7 : '';
                    obj.flowrate_A8 = elerow.SecondA8 ? elerow.SecondA8 : '';
                    obj.flowrate_A9 = elerow.SecondA9 ? elerow.SecondA9 : '';
                    obj.flowrate_A10 = elerow.SecondA10 ? elerow.SecondA10 : '';
                    obj.flowrate_A11 = elerow.SecondA11 ? elerow.SecondA11 : '';
                    obj.flowrate_A12 = elerow.SecondA12 ? elerow.SecondA12 : '';
                    obj.flowrate_B1 = elerow.SecondB1 ? elerow.SecondB1 : '';
                    obj.flowrate_B2 = elerow.SecondB2 ? elerow.SecondB2 : '';
                    obj.flowrate_B3 = elerow.SecondB3 ? elerow.SecondB3 : '';
                    obj.flowrate_B4 = elerow.SecondB4 ? elerow.SecondB4 : '';
                    obj.flowrate_B5 = elerow.SecondB5 ? elerow.SecondB5 : '';
                    obj.flowrate_B6 = elerow.SecondB6 ? elerow.SecondB6 : '';
                    obj.flowrate_B7 = elerow.SecondB7 ? elerow.SecondB7 : '';
                    obj.flowrate_B8 = elerow.SecondB8 ? elerow.SecondB8 : '';
                    obj.flowrate_B9 = elerow.SecondB9 ? elerow.SecondB9 : '';
                    obj.flowrate_B10 = elerow.SecondB10 ? elerow.SecondB10 : '';
                    obj.flowrate_B11 = elerow.SecondB11 ? elerow.SecondB11 : '';
                    obj.flowrate_B12 = elerow.SecondB12 ? elerow.SecondB12 : '';
                    obj.lineSpeed = elerow.lineSpeed ? elerow.lineSpeed : '';
                    obj.dewPointforCoating = elerow.dewPointforCoating ? elerow.dewPointforCoating : '';
                    obj.hdpeScrewRpm1 = elerow.hdpeScrewRpm1 ? elerow.hdpeScrewRpm1 : '';
                    obj.hdpeScrewRpm2 = elerow.hdpeScrewRpm2 ? elerow.hdpeScrewRpm2 : '';
                    obj.adhesiveScrewRpm = elerow.adhesiveScrewRpm ? elerow.adhesiveScrewRpm : '';
                    if (!excludedPipes.includes(elerow.pipe_id)) {
                        Aggriddata.push(obj);
                    }
                });
                let thickness = false
                let inputData = {
                    test_run_id: testRunId ? testRunId.toString() : "0",
                    project_id: tableData[3][0]?.project_id.toString(),
                    procsheet_id: tableData[3][0]?.procsheet_id.toString(),
                    processsheet: tableData[3][0]?.pm_procsheet_code,
                    testdate: defaulttestdate,
                    shift: tableData[7][0]?.pm_shift_id.toString(),
                    rm_batch: tableData[3][0]?.rm_batch,
                    material_id: "0",
                    manufacturer_id: "0",
                    grade_id: "0",
                    created_by: empId.toString(),
                    year: year,
                    type: "",
                    clientname: tableData[3][0]?.clientname,
                    projectname: tableData[3][0]?.project_name,
                    pipesize: tableData[3][0]?.pipesize,
                    typeofcoating: tableData[3][0]?.coating_type,
                    procedure_type: wiSelectedProcedure.map((proc) => proc.value).join(',') + ',',
                    process_type: "523",
                    ispqt: isPqt.toString(),
                    testsData: Aggriddata,
                    instrumentData: usedInstrument,
                    rawMaterialData: [],
                    isSubmit: value,
                    isThickness: thickness,
                    roleId: parseInt(roleId)
                };
                let flag = 0
                if (inputData.testsData.length == 0) {
                    toast.error("There are no pipes available")
                    return
                }
                for (let i = 0; i < inputData.testsData.length; i++) {
                    if ((inputData.testsData[i].test_value1 == "" || inputData.testsData[i].temperature1 == "" || inputData.testsData[i].test_result_remarks == "Select") && inputData.testsData[i].test_result_remarks != "NTC") {
                        flag = 1
                    }
                }
                if (false) {

                }
                else {
                    try {
                        const response = await fetch(
                            Environment.BaseAPIURL + "/api/User/SaveProcessDataEntry",
                            {
                                method: "POST",
                                headers: {
                                    'Content-Type': `application/json`,
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify(inputData),
                            }
                        );

                        const responseBody = await response.text();
                        setIsSubmitting(false);
                        if (responseBody === "1000") {
                            toast.success("Form data sent successfully!");
                            console.log("Form data sent successfully!");
                            navigate(`/blastingsheetlist?menuId=${menuId}`)
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
                }
            }
            else {
                tableData[2].forEach(function (elerow, index) {
                    const key = `${index}-0`;
                    let obj = {
                        seqno: "",
                        test_categ_id: "",
                        test_type_id: "",
                        test_id: "",
                        proc_template_id: "",
                        proc_test_id: "",
                        shift_id: shift.pm_shift_id.toString(),
                        test_result_batch: "0",
                        pipe_id: "",
                        temperature1: "",
                        test_value1: "",
                        test_value2: "",
                        value_type: '523',
                        test_result_accepted: "",
                        assigned_to_role_id: "",
                        test_result_remarks: "",
                    };

                    obj.test_value1 = inputValues[`${index}`] || ''; // Retrieve inputValue specific to this row
                    obj.test_result_remarks = remarkValues[`${index}`] || '' // Retrieve remarkValue specific to this row
                    obj.pipe_id = elerow.pipe_id.toString();
                    obj.ntcReason = "";
                    obj.temperature1 = '0'
                    obj.seqno = elerow?.seqno ? elerow?.seqno.toString() : "1";
                    obj.proc_template_id = elerow?.pm_proc_template_id + "";
                    obj.test_categ_id = elerow?.pm_test_categ_id + "";
                    obj.test_type_id = elerow?.pm_test_type_id + "";
                    obj.test_id = elerow?.pm_test_id + "";
                    obj.proc_test_id = "0";
                    obj.airpressure_A1 = elerow.A1 ? elerow.A1 : '';
                    obj.airpressure_A2 = elerow.A2 ? elerow.A2 : '';
                    obj.airpressure_A3 = elerow.A3 ? elerow.A3 : '';
                    obj.airpressure_A4 = elerow.A4 ? elerow.A4 : '';
                    obj.airpressure_A5 = elerow.A5 ? elerow.A5 : '';
                    obj.airpressure_A6 = elerow.A6 ? elerow.A6 : '';
                    obj.airpressure_A7 = elerow.A7 ? elerow.A7 : '';
                    obj.airpressure_A8 = elerow.A8 ? elerow.A8 : '';
                    obj.airpressure_A9 = elerow.A9 ? elerow.A9 : '';
                    obj.airpressure_A10 = elerow.A10 ? elerow.A10 : '';
                    obj.airpressure_A11 = elerow.A11 ? elerow.A11 : '';
                    obj.airpressure_A12 = elerow.A12 ? elerow.A12 : '';
                    obj.airpressure_B1 = elerow.B1 ? elerow.B1 : '';
                    obj.airpressure_B2 = elerow.B2 ? elerow.B2 : '';
                    obj.airpressure_B3 = elerow.B3 ? elerow.B3 : '';
                    obj.airpressure_B4 = elerow.B4 ? elerow.B4 : '';
                    obj.airpressure_B5 = elerow.B5 ? elerow.B5 : '';
                    obj.airpressure_B6 = elerow.B6 ? elerow.B6 : '';
                    obj.airpressure_B7 = elerow.B7 ? elerow.B7 : '';
                    obj.airpressure_B8 = elerow.B8 ? elerow.B8 : '';
                    obj.airpressure_B9 = elerow.B9 ? elerow.B9 : '';
                    obj.airpressure_B10 = elerow.B10 ? elerow.B10 : '';
                    obj.airpressure_B11 = elerow.B11 ? elerow.B11 : '';
                    obj.airpressure_B12 = elerow.B12 ? elerow.B12 : '';
                    obj.flowrate_A1 = elerow.SecondA1 ? elerow.SecondA1 : '';
                    obj.flowrate_A2 = elerow.SecondA2 ? elerow.SecondA2 : '';
                    obj.flowrate_A3 = elerow.SecondA3 ? elerow.SecondA3 : '';
                    obj.flowrate_A4 = elerow.SecondA4 ? elerow.SecondA4 : '';
                    obj.flowrate_A5 = elerow.SecondA5 ? elerow.SecondA5 : '';
                    obj.flowrate_A6 = elerow.SecondA6 ? elerow.SecondA6 : '';
                    obj.flowrate_A7 = elerow.SecondA7 ? elerow.SecondA7 : '';
                    obj.flowrate_A8 = elerow.SecondA8 ? elerow.SecondA8 : '';
                    obj.flowrate_A9 = elerow.SecondA9 ? elerow.SecondA9 : '';
                    obj.flowrate_A10 = elerow.SecondA10 ? elerow.SecondA10 : '';
                    obj.flowrate_A11 = elerow.SecondA11 ? elerow.SecondA11 : '';
                    obj.flowrate_A12 = elerow.SecondA12 ? elerow.SecondA12 : '';
                    obj.flowrate_B1 = elerow.SecondB1 ? elerow.SecondB1 : '';
                    obj.flowrate_B2 = elerow.SecondB2 ? elerow.SecondB2 : '';
                    obj.flowrate_B3 = elerow.SecondB3 ? elerow.SecondB3 : '';
                    obj.flowrate_B4 = elerow.SecondB4 ? elerow.SecondB4 : '';
                    obj.flowrate_B5 = elerow.SecondB5 ? elerow.SecondB5 : '';
                    obj.flowrate_B6 = elerow.SecondB6 ? elerow.SecondB6 : '';
                    obj.flowrate_B7 = elerow.SecondB7 ? elerow.SecondB7 : '';
                    obj.flowrate_B8 = elerow.SecondB8 ? elerow.SecondB8 : '';
                    obj.flowrate_B9 = elerow.SecondB9 ? elerow.SecondB9 : '';
                    obj.flowrate_B10 = elerow.SecondB10 ? elerow.SecondB10 : '';
                    obj.flowrate_B11 = elerow.SecondB11 ? elerow.SecondB11 : '';
                    obj.flowrate_B12 = elerow.SecondB12 ? elerow.SecondB12 : '';
                    obj.lineSpeed = elerow.lineSpeed ? elerow.lineSpeed : '';
                    obj.dewPointforCoating = elerow.dewPointforCoating ? elerow.dewPointforCoating : '';
                    obj.hdpeScrewRpm1 = elerow.hdpeScrewRpm1 ? elerow.hdpeScrewRpm1 : '';
                    obj.hdpeScrewRpm2 = elerow.hdpeScrewRpm2 ? elerow.hdpeScrewRpm2 : '';
                    obj.adhesiveScrewRpm = elerow.adhesiveScrewRpm ? elerow.adhesiveScrewRpm : '';
                    if (!excludedPipes.includes(elerow.pipe_id)) {
                        Aggriddata.push(obj);
                    }
                });
                let thickness = false
                let inputData = {
                    test_run_id: testRunId ? testRunId.toString() : "0",
                    project_id: tableData[0][0]?.project_id.toString(),
                    procsheet_id: tableData[0][0]?.procsheet_id.toString(),
                    processsheet: tableData[0][0]?.pm_procsheet_code,
                    testdate: defaulttestdate,
                    shift: tableData[0][0]?.pm_shift_id.toString(),
                    rm_batch: tableData[0][0]?.rm_batch,
                    material_id: "0",
                    manufacturer_id: "0",
                    grade_id: "0",
                    created_by: empId.toString(),
                    year: year,
                    type: "",
                    clientname: tableData[0][0]?.clientname,
                    projectname: tableData[0][0]?.project_name,
                    pipesize: tableData[0][0]?.pipesize,
                    typeofcoating: tableData[0][0]?.coating_type,
                    procedure_type: wiSelectedProcedure.map((proc) => proc.value).join(',') + ',',
                    process_type: "523",
                    ispqt: isPqt.toString(),
                    testsData: Aggriddata,
                    instrumentData: usedInstrument,
                    rawMaterialData: [],
                    isSubmit: value,
                    isThickness: thickness,
                    roleId: parseInt(roleId)
                };
                let flag = 0
                if (inputData.testsData.length == 0) {
                    toast.error("There are no pipes available")
                    return
                }
                for (let i = 0; i < inputData.testsData.length; i++) {
                    if ((inputData.testsData[i].test_value1 == "" || inputData.testsData[i].temperature1 == "" || inputData.testsData[i].test_result_remarks == "Select") && inputData.testsData[i].test_result_remarks != "NTC") {
                        flag = 1
                    }
                }
                if (false) {

                }
                else {
                    try {
                        const response = await fetch(
                            Environment.BaseAPIURL + "/api/User/SaveProcessDataEntry",
                            {
                                method: "POST",
                                headers: {
                                    'Content-Type': `application/json`,
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify(inputData),
                            }
                        );

                        const responseBody = await response.text();
                        setIsSubmitting(false);
                        if (responseBody === "1000") {
                            toast.success("Form data sent successfully!");
                            console.log("Form data sent successfully!");
                            navigate(`/blastingsheetlist?menuId=${menuId}`)
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
                }
            }
        }

    };



    const handleInputChange = (e, index) => {
        const { value } = e.target;
        let newInputValues = { ...inputValues }; // Copy current input values

        // If it's the first row (index === 0), set all to the first row's value
        if (index === 0) {
            Object.keys(newInputValues).forEach((key) => {
                newInputValues[key] = value; // Set all input values to the first row's value
            });
        } else {
            newInputValues[index] = value; // Update only the corresponding row
        }

        setInputValues(newInputValues); // Update state
    };
    const handleRemarksChange = (e, index) => {
        const { value } = e.target;
        let newRemarkValues = [...remarkValues]; // Copy current remark values

        // If it's the first row (index === 0), set all remarks to the first row's remark value
        if (index === 0) {
            newRemarkValues = newRemarkValues.map((remark, i) => {
                return i === 0 || remark !== value ? value : remark; // Set all to the first row's remark value
            });
        } else {
            newRemarkValues[index] = value; // Update only the corresponding row
        }

        setRemarkValues(newRemarkValues); // Update state
    };



    function excludePipe(data) {
        excludedPipes.push(data.data["pipe_id"])
    }

    function handlePQTChange() {
        if (isPqt === false) {
            setIsPqt(true);
        } else {
            setIsPqt(false);
        }
    }

    const witnessMap = witnessList?.reduce((acc, witness) => {
        acc[witness.pm_pipe_id] = witness.pm_random_witness_id;
        return acc;
    }, {});

    const mergedData = tableData[2]?.map(item => {
        return {
            ...item,
            pm_random_witness_id: witnessMap[item.pm_pipe_id] || null // default to null if not found
        };
    });

    return (
        <>
            {
                loading ? <Loading /> :
                    <>
                        <Header />
                        <section className="InnerHeaderPageSection">
                            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-12 col-sm-12 col-xs-12">
                                        <ul>
                                            <li>
                                                <Link to="/dashboard?moduleId=618">Quality Module</Link>
                                            </li>
                                            <li><h1>/&nbsp;</h1></li>
                                            <li>&nbsp;<Link to={`/blastingsheetlist?menuId=${menuId}`}>&nbsp;Process Data Entry List</Link></li>
                                            <li>
                                                <h1>/&nbsp; Process Data Entry </h1>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className='TallytagmappingPageSection'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-sm-12'>
                                        <div className='PipeTallySheetDetails'>
                                            <form className='row m-0'>
                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                    <h5>Inlet Data Entry <span>- Add page</span></h5>
                                                </div>
                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor="processSheet">Process Sheet</label>
                                                        <div className='ProcessSheetFlexBox'>
                                                            <input id="processSheet" style={{ width: '66%', cursor: 'not-allowed' }} value={action != 'edit' ? headerData.processsheetcode : headerData.pm_procsheet_code} placeholder='Process sheet no.' readOnly />
                                                            <select name="year" value={year} onChange={handleTypeChange} >
                                                                <option value=""> Year </option>
                                                                {ddlYear.map((coatingTypeOption, i) => (
                                                                    <option key={i} value={coatingTypeOption.year}> {coatingTypeOption.year} </option>
                                                                ))}
                                                            </select>
                                                            <b>-</b>
                                                            <input id="type" type="text" placeholder='No.' value={type} onChange={handleTypeChange} onBlur={handleTypeBlur} />
                                                        </div>
                                                    </div>
                                                </div>
                                                {[
                                                    { id: 'clientName', label: 'Client Name', value: headerData?.clientname != undefined ? headerData?.clientname : '' },
                                                    { id: 'pipeSize', label: 'Pipe Size', value: headerData?.pipesize != undefined ? headerData?.pipesize : '' },
                                                    { id: 'dated', label: 'Date', value: new Date(headerData?.testdate).toLocaleDateString('en-GB') != undefined ? new Date(action != 'edit' ? headerData?.testdate : headerData?.test_date).toLocaleDateString('en-GB') : '' },
                                                    { id: 'shift', label: 'Shift', value: shift?.pm_shiftvalue != undefined ? shift?.pm_shiftvalue : '' },
                                                ].map(field => (
                                                    <div key={field.id} className='col-md-4 col-sm-4 col-xs-12'>
                                                        <div className='form-group'>
                                                            <label htmlFor={field.id}>{field.label}</label>
                                                            <input
                                                                id={field.id}
                                                                type='text'
                                                                value={field.value}
                                                                placeholder={field.label}
                                                                style={{ cursor: 'not-allowed' }}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label>Process Type</label>
                                                        <select className='form-control' onChange={(e) => getData(e)}>
                                                            <option value=''>Select Type</option>
                                                            <option value='Inlet'>Inlet</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className='col-md-4 col-sm-4 col-xs-12'></div>

                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <div className="d-flex align-items-center">
                                                        <div className="PQTBox">
                                                            <input
                                                                type="checkbox"
                                                                id="ispqt"
                                                                name="ispqt"
                                                                checked={isPqt}
                                                                onChange={handlePQTChange}
                                                            />
                                                            <label for="pqt"> PQT</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                {tableData.length ?
                                                    <div className="col-md-12 col-sm-12 col-xs-12 mt-4 BlastingDataEntrySectionPage ">
                                                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                                            <thead>
                                                                <tr>
                                                                    {headers?.map((header, index) => (
                                                                        <th key={index} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{header}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                    <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Min</td>
                                                                    {action != 'edit' ? <td style={{ border: '1px solid black', padding: '8px' }}>{tableData[0][0]?.pm_test_value}</td> : <td style={{ border: '1px solid black', padding: '8px' }}>{tableData[1][0]?.pm_test_value}</td>}
                                                                    <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                    {witnessData?.map((data) => {
                                                                        return (
                                                                            <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                        )
                                                                    })}
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                    <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Max</td>
                                                                    <td style={{ border: '1px solid black', padding: '8px' }}></td>
                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}></td>
                                                                    {witnessData?.map((data) => {
                                                                        return (
                                                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}></td>
                                                                        )
                                                                    })}
                                                                </tr>

                                                                {action != 'edit' ? tableData[1].map((data, index) => {
                                                                    const key = `${index}-0`;
                                                                    return (
                                                                        <>
                                                                            <tr>
                                                                                <td style={{ border: '1px solid black', padding: '8px' }}>{data?.seqno}</td>
                                                                                <td style={{ border: '1px solid black', padding: '8px' }}>{data?.PIPNO}</td>
                                                                                <td style={{ border: '1px solid black', padding: '8px' }}>{data?.pm_asl_number}</td>
                                                                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                                                                    <input
                                                                                        type='text'
                                                                                        className='form-control'
                                                                                        value={inputValues[index] || ''} // Ensure the input value is specific to the seqno
                                                                                        onChange={(e) => handleInputChange(e, index)} // Update only the corresponding seqno
                                                                                    />
                                                                                </td>
                                                                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                                                                    <select value={remarkValues[index] || ''} onChange={(e) => handleRemarksChange(e, index)}>
                                                                                        <option>Select Value</option>
                                                                                        <option value="Ok">Ok</option>
                                                                                        {/* Add more options as needed */}
                                                                                    </select>
                                                                                </td>
                                                                            </tr>
                                                                        </>
                                                                    )
                                                                }) :
                                                                    mergedData?.map((data, index) => {
                                                                        const key = `${index}-0`;
                                                                        return (
                                                                            <>
                                                                                <tr>
                                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{data?.seqno}</td>
                                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{data?.PIPNO}</td>
                                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{data?.pm_asl_number}</td>
                                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                                                                        <input
                                                                                            type='text'
                                                                                            className='form-control'
                                                                                            value={inputValues[index] || ''}
                                                                                            disabled={userRole == "Witness_PMC" || userRole == "Witness_Client" || userRole == "Witness_Surveillance" || userRole == "Witness_TPI"} // Ensure the input value is specific to the seqno
                                                                                            onChange={(e) => handleInputChange(e, index)} // Update only the corresponding seqno
                                                                                        />
                                                                                    </td>
                                                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                                                                                        <select className='form-control' disabled={userRole == "Witness_PMC" || userRole == "Witness_Client" || userRole == "Witness_Surveillance" || userRole == "Witness_TPI"} value={remarkValues[index] || ''} onChange={(e) => handleRemarksChange(e, index)}>
                                                                                            <option>Select Value</option>
                                                                                            <option value="Ok">Ok</option>
                                                                                            {/* Add more options as needed */}
                                                                                        </select>
                                                                                    </td>
                                                                                    {witnessData?.map((witness, witnessIndex) => {
                                                                                        const witnessType = witness.roleId; // Assuming you want to differentiate based on witness.Name
                                                                                        const checkboxKey = `${index}-${witnessType}`;
                                                                                        const witnessTypePrefix = userRole.split('_')[1];
                                                                                        const witnessPrefix = witness.Name.split('-')[0].trim();
                                                                                        const isChecked = tpiCheckbox[checkboxKey] || false; // Use the checkbox state
                                                                                        return (
                                                                                            <td style={{ border: '1px solid black', padding: '8px' }}>
                                                                                                <input type='checkbox' disabled={witnessPrefix !== witnessTypePrefix} checked={isChecked} onChange={() => handleCheckboxChange(index, witnessType)} />
                                                                                            </td>
                                                                                        )
                                                                                    })}
                                                                                </tr>
                                                                            </>
                                                                        )
                                                                    })}
                                                            </tbody>
                                                        </table>
                                                        <div className='mt-4 FlexSubmitFlex'>
                                                            {userRole != "Witness_PMC" && userRole != "Witness_Client" && userRole != "Witness_Surveillance" && userRole != "Witness_TPI" ? <button className='btn btn-secondary mx-2' onClick={(e) => handleSubmit(e, false)}>Save Draft</button> : ''}
                                                            <button className='btn btn-primary' onClick={(e) => handleSubmit(e, true)}>Submit</button>
                                                        </div>
                                                    </div> : ''}

                                                {tableData?.length ?
                                                    <div className="col-md-12 col-sm-12 col-xs-12 mt-4">
                                                        <table style={{ width: '100%' }}>
                                                            <thead>
                                                                <tr
                                                                    style={{
                                                                        background: "#5a245a",
                                                                        color: "#fff !important",
                                                                    }}
                                                                >
                                                                    <th
                                                                        colSpan={3}
                                                                        style={{
                                                                            fontSize: "16px",
                                                                            textAlign: "center",
                                                                            color: '#fff'
                                                                        }}
                                                                    >
                                                                        {" "}
                                                                        Used Instrument
                                                                    </th>
                                                                </tr>
                                                                <tr
                                                                    style={{
                                                                        background: "#5a245a",
                                                                        color: "#fff",
                                                                    }}
                                                                >
                                                                    <td
                                                                        style={{
                                                                            maxWidth: "30px",
                                                                            background: "whitesmoke",
                                                                            color: "#000",
                                                                            border: '1px solid black',
                                                                            padding: '8px'
                                                                        }}
                                                                    >
                                                                        Sr. No.
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            maxWidth: "30px",
                                                                            background: "whitesmoke",
                                                                            color: "#000",
                                                                            border: '1px solid black',
                                                                            padding: '8px'
                                                                        }}
                                                                    >
                                                                        Instrument Name
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            minWidth: "30px",
                                                                            background: "whitesmoke",
                                                                            color: "#000",
                                                                            border: '1px solid black',
                                                                            padding: '8px'
                                                                        }}
                                                                    >
                                                                        Instrument ID/Serial No.
                                                                    </td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {usedInstrument?.map((tests, index) => (
                                                                    <tr key={index}>
                                                                        <td style={{ border: '1px solid black', padding: '8px' }}>{index + 1}</td>
                                                                        <td style={{ border: '1px solid black', padding: '8px' }}>{tests.equip_name}</td>
                                                                        <td style={{ border: '1px solid black', padding: '8px' }}>
                                                                            <input type='text' className='form-control' value={tests.equip_code} />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    : ''}
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <Footer />
                    </>
            }
        </>
    )
}

export default BlastingDataEntryInlet;