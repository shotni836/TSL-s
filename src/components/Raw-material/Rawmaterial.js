import React, { useState, useEffect, useRef } from 'react';
import './Rawmaterial.css'
import { Table } from 'react-bootstrap';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Select from "react-select";
import Loading from '../Loading';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from '../../environment';
import secureLocalStorage from 'react-secure-storage';
import DatePicker from 'react-datepicker';

function Rawmaterial() {
    const userId = secureLocalStorage.getItem('empId');
    const searchParams = new URLSearchParams(document.location.search);
    let testingtype = searchParams.get('testingtype');
    let menuId = searchParams.get('menuId');
    let action = searchParams.get('action');
    let procSheetId = searchParams.get('ProcessSheetID');
    let TestRunId = searchParams.get('TestRunId');
    let ProcessSheetTypeID = searchParams.get('ProcessSheetTypeID');
    let TestId = searchParams.get('TestId');
    const roleId = secureLocalStorage.getItem('roleId')
    let testingtypeval = "";
    if (testingtype == "607") {
        testingtypeval = "Before Process Lab Testing";
    }
    if (testingtype == "608") {
        testingtypeval = "In Process Lab Testing";
    }
    if (testingtype == "609") {
        testingtypeval = "In Process Field Testing";
    }
    if (testingtype == "605") {
        testingtypeval = "Raw Material Inhouse";
    }

    const [loading, setLoading] = useState(false);
    const [isRawMaterial, setIsRawMaterial] = useState(0);
    const [modalShow, setModalShow] = useState(false);
    const [numRows, setNumRows] = useState(1);
    const [ddlYear, setddlYear] = useState([]);
    const [formData, setFormData] = useState({
        psYear: '',
        psSeqNo: '',
        clientname: '',
        projectname: '',
        pipesize: '',
        coating_type: '',
        testdate: '',
        shift: '',
        ispqt: false,
    });

    const [disable, setDisable] = useState(false);
    const [testOption, setTestOption] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [frequency, setFrequency] = useState([]);
    const [frequencyDetails, setFrequencyDetails] = useState([]);
    const [matManGrade, setMatMafGrade] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [instrumentData, setInstrumentData] = useState([]);
    const [selectedRawMaterial, setSelectedRawMaterial] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [continueCode, setContinueCode] = useState(false);
    const processSeqNo = useRef()
    const [beforeLabSelectData, setBeforeLabSelectData] = useState();
    const [editRawMaterialList, setEditRawMaterialList] = useState([]);
    const [inputCheckbox, setInputCheckbox] = useState({});
    const [sampleCheckbox, setSampleCheckbox] = useState({});
    const navigate = useNavigate();
    const [dateTimes, setDateTimes] = useState();
    const [coatingDates, setCoatingDates] = useState([]);
    const [coatingSelectedDate, setCoatingSelectedDate] = useState(null);
    const [coatingDate, setCoatingDate] = useState(null);
    const [shift, setShift] = useState();

    const transformData = (data) => {
        const transformed = data.reduce((acc, item) => {
            let existing = acc.find(entry => entry.pm_pipe_code === item.pm_pipe_code);
            if (existing) {
                if (item.pm_value_type === 'N') {
                    existing.normal = {
                        initialReading: item.PM_Reqmnt_test_min,
                        finalReading: item.PM_Reqmnt_test_Max
                    };
                } else {
                    existing.hot = {
                        initialReading: item.PM_Reqmnt_test_min,
                        finalReading: item.PM_Reqmnt_test_Max
                    };
                }
            } else {
                acc.push({
                    pm_pipe_code: item.pm_pipe_code,
                    pm_pipe_id: item.pm_pipe_id,
                    ReferenceStandard: item.ReferenceStandard,
                    pm_tm_publication_yr: item.pm_tm_publication_yr,
                    hot: item.pm_value_type === 'N' ? null : {
                        initialReading: item.PM_Reqmnt_test_min,
                        finalReading: item.PM_Reqmnt_test_Max
                    },
                    normal: item.pm_value_type === 'N' ? {
                        initialReading: item.PM_Reqmnt_test_min,
                        finalReading: item.PM_Reqmnt_test_Max
                    } : null
                });
            }
            return acc;
        }, []);

        return transformed;
    };

    const filterPassedTime = (date) => {
        const currentDate = new Date();
        return currentDate.getTime() < date.getTime();
    };

    useEffect(() => {
        fetchYear();
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    const fetchEditDetails = async () => {
        if (testingtype == 607) {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetBeforeDetailsById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}`)
            setFormData(response?.data[0][0]);
            setTableData(response?.data[1]);
            setMatMafGrade(response?.data[3]);
            setDisable(true);
            initializeResultSuffixInput(response);
            setBeforeLabSelectData(response?.data[0][0].pm_process_subtype_id)
            setFormData((prevData) => ({
                ...prevData,
                ispqt: response.data[0][0].pm_ispqt_id == 1 ? true : false,
            }))
            const procedureIds = response?.data[0][0].pm_Procedure_type_id.split(',').filter(value => value !== '').map(Number);
            const winoLabels = response?.data[0][0].WINO.split(',');

            const procedures = procedureIds.map((id, index) => ({
                value: id,
                label: winoLabels[index] || ''
            }));

            setSelectedProcedures(procedures)
            setProcedures(procedures);

            const formattedData = formatDataForAPI(response?.data[3]);
            setEditRawMaterialList(formattedData)

            if (testingtype != 607 && testingtype != 605) {
                fetchTestOption(response?.data[1][0].pm_test_id, response?.data[0][0].psSeqNo);
            }
            if (testingtype == 607 || testingtype == 605) {
                getBeforeTypeList(response?.data[0][0].pm_process_subtype_id, response?.data[0][0].psSeqNo)
            }
        }
        else if (testingtype == 605) {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetRMTestingDetailsById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}`)
            setFormData(response?.data[0][0]);
            setTableData(response?.data[1]);
            setMatMafGrade(response?.data[3]);
            setDisable(true);
            initializeResultSuffixInput(response);
            setFormData((prevData) => ({
                ...prevData,
                ispqt: response.data[0][0].pm_ispqt_id == 1 ? true : false,
            }))
            setSelectedTestId(response?.data[0][0].pm_process_subtype_id)
            const procedureIds = response?.data[0][0].pm_Procedure_type_id.split(',').filter(value => value !== '').map(Number);
            const winoLabels = response?.data[0][0].WINO.split(',');

            const procedures = procedureIds.map((id, index) => ({
                value: id,
                label: winoLabels[index] || ''
            }));

            setSelectedProcedures(procedures)
            setProcedures(procedures);

            const formattedData = formatDataForAPI(response?.data[3]);
            setEditRawMaterialList(formattedData)

            const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GETInstrumentDetailsByReportId?ReportId=${TestId}`)
            setInstrumentData(response2?.data[0]);

            if (testingtype != 607 && testingtype != 605) {
                fetchTestOption(response?.data[1][0].pm_test_id, response?.data[0][0].psSeqNo);
            }
            if (testingtype == 607 || testingtype == 605) {
                getBeforeTypeList(response?.data[0][0].pm_process_subtype_id, response?.data[0][0].psSeqNo)
            }
        }
        else {
            // const testIdSend = (selectedTestId === '293' || selectedTestId === '986' || TestId === '293' || TestId === '986') ? '986' : selectedTestId;
            // const endpoint = testIdSend === '986' ? `GetIndentationDataById` : selectedTestId === '325' ? `GetCalibrationblastingdataById` : `GetInProcessLabFieldTestingById`;

            // const response = (testIdSend == '986') ?
            //     await axios.get(`${Environment.BaseAPIURL}/api/User/${endpoint}?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId = ${TestRunId}& test_id=${TestId} `)
            //     : await axios.get(Environment.BaseAPIURL + `/ api / User / GetInProcessLabFieldTestingById ? ProcessSheetID = ${procSheetId}& ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}& TestId=${TestId} `)

            const testIdSend = (TestId == '293' || TestId == '986') ? '986' : TestId;
            const response = (testIdSend == '986') ?
                await axios.get(Environment.BaseAPIURL + `/api/User/GetIndentationDataById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}&test_id=${TestId}`)
                : testIdSend === '325' ? await axios.post(Environment.BaseAPIURL + `/api/User/GetCalibrationblastingdataById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}&TestId=${TestId}`)
                    : await axios.get(Environment.BaseAPIURL + `/api/User/GetInProcessLabFieldTestingById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}&TestId=${TestId}`)
            setFormData(response?.data[0][0]);
            TestId == '986' ? setTableData(transformData(response?.data[1])) : setTableData(response?.data[1]);
            TestId == '325' ? setMatMafGrade(response?.data) : setMatMafGrade(response?.data[2]);
            TestId == '325' ? setIsRawMaterial(response?.data) : setIsRawMaterial(response?.data[2]);
            setDisable(true);
            initializeResultSuffixInput(response)
            // if (TestId !== '986') {
            if (response?.data && response.data[1] && response.data[1][0]) {
                setSelectedTestId(response.data[1][0].pm_test_id);
            }
            // }
            const initialDateString = response?.data[1][0].thicknessDate;
            const initialDate = new Date(initialDateString);
            setCoatingSelectedDate(initialDate)
            setCoatingDate(response?.data[1][0].thicknessDate)
            setFormData((prevData) => ({
                ...prevData,
                ispqt: response.data[0][0].pm_ispqt_id == 1 ? true : false,
            }))
            const procedureIds = response?.data[0][0].pm_Procedure_type_id.split(',').filter(value => value !== '').map(Number);
            const winoLabels = response?.data[0][0]?.WINO?.split(',');

            const procedures = procedureIds.map((id, index) => ({
                value: id,
                label: winoLabels[index] || ''
            }));
            setSelectedProcedures(procedures)
            setProcedures(procedures);

            const cdId = ['297', '298', '299', '300', '301', '302'];
            const cdIdToSend = cdId.includes(TestId) ? 297 : TestId;
            const response2 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${cdIdToSend}`);
            setInstrumentData(response2?.data[0]);

            if (testingtype != 607 && testingtype != 605) {
                fetchTestOption(response?.data[1][0].pm_test_id, response?.data[0][0].psSeqNo);
            }
            if (testingtype == 607 || testingtype == 605) {
                getBeforeTypeList()
            }
            // setFormData((prevData) => [{ ...prevData, process_type: response?.data[1][0].pm_test_id }])
        }
    }

    const initializeResultSuffixInput = (response) => {
        let updatedResultSuffixInput = {};
        let updatedResultInput = {};
        let updatedTemperatureInput = {};
        const updatedCheckboxState = {};
        let updatedSampleInput = {};
        let updatedResultMessage = {};

        let hot1 = {};
        let hot2 = {};
        let normal1 = {};
        let normal2 = {};

        let error = {};
        let time1 = {};

        for (var i = 0; i < response?.data[1].length; i++) {
            const key = `${i}-0`; // Assuming rowIndex is 0 for initialization
            updatedResultSuffixInput[key] = response?.data[1][i].pm_test_result_suffix;
            updatedResultInput[key] = response?.data[1][i].pm_test_result_remarks;
            updatedTemperatureInput[key] = response?.data[1][i].pm_temperature1;
            updatedSampleInput[key] = response?.data[1][i].pm_sample_cut_size?.toString();
            updatedCheckboxState[key] = response?.data[1][i].pm_is_sample_cut === 1;
            // updatedSelectedOption[key] = response?.data[1][i].pm_reqmnt_temperature;
            // updatedInputCheckbox[key] = response?.data[1][i].pm_reqmnt_temperature;
            updatedResultMessage[key] = response?.data[1][i].pm_test_result_accepted == 1 ? 'Satisfactory' : 'Not Satisfactory';

            // updatedResultSuffixInput[key] = response?.data[1][i].pm_result_remark;
            // updatedCheckboxState[key] = response?.data[1][i].pm_is_sample_cut === true;
            hot1[key] = response?.data[1][i].pm_initial_val_hot;
            hot2[key] = response?.data[1][i].pm_final_val_hot;
            normal1[key] = response?.data[1][i].pm_initial_val_normal;
            normal2[key] = response?.data[1][i].pm_final_val_normal;

            error[key] = response?.data[1][i].pm_inst_error;
            time1[key] = response?.data[1][i].pm_test_time;

            setInputCheckbox(prevState => ({
                ...prevState,
                [key]: true,
            }));
        }

        setSampleCheckbox(prevState => ({
            ...prevState,
            ...updatedCheckboxState,
        }));

        setResultMessage(updatedResultMessage)
        setResultInput(updatedResultInput);
        setTemperatureInput(updatedTemperatureInput)
        setSampleInput(updatedSampleInput)
        setResultSuffixInput(updatedResultSuffixInput);

        setHotSample1(hot1)
        setHotSample2(hot2)
        setNormalSample1(normal1)
        setNormalSample2(normal2)

        const parsedTimes = {};
        Object.keys(time1).forEach(key => {
            const apiTime = time1[key];
            if (apiTime) {
                // Create a new Date object for today
                const now = new Date();
                // Extract hours and minutes from the API time string
                const [time, modifier] = apiTime.split(' '); // Split "7:45 PM" into ["7:45", "PM"]
                let [hours, minutes] = time.split(':'); // Split "7:45" into ["7", "45"]
                // Convert hours based on AM/PM
                if (modifier === 'PM' && hours !== '12') {
                    hours = parseInt(hours, 10) + 12; // Add 12 to PM hours, except for 12 PM
                }
                if (modifier === 'AM' && hours === '12') {
                    hours = 0; // Convert 12 AM to 00
                }
                // Set hours and minutes on today's date
                parsedTimes[key] = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            }
        });
        setSelectedTime(parsedTimes);
    };

    const handleInputChange = (e) => {
        processSeqNo.current = e.target.value
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getBeforeTypeList = async (id_new, seq) => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetTesttypelist?projID=${formData?.psSeqNo ? formData?.psSeqNo : seq}&processtype=${testingtype}`)
            const filteredList = response?.data.filter(item => item.pm_grphdr_id === 607);
            if (action == 'edit') {
                const testItem = response?.data.find(item => item.co_param_val_id == id_new.toString());
                setTestOption([testItem]);
            }
            else {
                if (testingtype === "607") {
                    setTestOption(filteredList)
                }
                if (testingtype === "605") {
                    setTestOption(response.data)
                }
            }
            // setBeforeProcessList(filteredList);
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const handlePsSeqNoBlur = () => {
        if (formData.psSeqNo) {
            getHeaderData();
            resetFormData();
        }
    };

    const resetFormData = () => {
        setFormData((prev) => ({
            psYear: prev.psYear,
            psSeqNo: prev.psSeqNo,
            clientname: '',
            projectname: '',
            pipesize: '',
            coating_type: '',
            testdate: '',
            shift: '',
            procedures: '',
            testOption: ''
        }));
    };

    const fetchYear = async () => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
            setddlYear(response?.data);

            const response1 = await axios.get(Environment.BaseAPIURL + `/api/User/GetReportWiseRawMaterial?ReportId=${testingtype}`)
            setIsRawMaterial(response?.data);

            if (action == "edit") {
                fetchEditDetails()
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    async function getWiTestList(data) {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${data}&test_id=${testingtype}&master_id=${0}`);
            const procedures = response?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setProcedures(procedures);
            setSelectedProcedures(procedures);

            if (testingtype != 605) {
                const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GETInstrumentDetailsByReportId?ReportId=${TestId}`)
                setInstrumentData(response2?.data[0]);
            }
            else {
                const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GETInstrumentDetailsByReportId?ReportId=${data}`)
                setInstrumentData(response2?.data[0]);
            }
        } catch (error) {
            console.log('Error fetching data:', error)
        }
    }

    const getHeaderData = async () => {
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?testingtype=${testingtype}&year=${formData?.psYear}&processsheetno=${formData?.psSeqNo}`);
            setFormData(response?.data.Table[0]);
            setShift(response?.data.Table5[0]);
            const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetThicknessDate?ProcessType=526&procsheetid=${formData?.psSeqNo}`);
            const excludedDates = response1?.data[0].map(item => new Date(item.thicknessdate));
            setCoatingDates(excludedDates);


            if (response1?.data) {
                if (testingtype != 607 && testingtype != 605) {
                    fetchTestOption();
                }
                if (testingtype == 607 || testingtype == 605) {
                    getBeforeTypeList()
                }
            }
        } catch (error) {
        }
    };

    const fetchTestOption = async (id_new, seq) => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetInprocessTestList?processsheetno=${formData?.psSeqNo ? formData?.psSeqNo : seq}`)
            const data = response?.data;
            const L_data = data.filter(item => item.pm_test_type === "L");
            const F_data = data.filter(item => item.pm_test_type === "F");
            // setTestOption(data.filter(test => test.type == (testingtype === "608" ? "L" : "F")));
            if (action == 'edit') {
                const testItem = data.find(item => item.pm_test_type_id == id_new.toString());
                setTestOption([testItem]);
            }
            else {
                if (testingtype === "608") {
                    setTestOption(L_data)
                }
                else {
                    setTestOption(F_data)
                }
            }
            // setTestOption(data)
        }
        catch (error) {
            console.error('There was a problem fetching the data:', error);
        }
    };

    const [selectedTestId, setSelectedTestId] = useState('');

    const handleTestTypeChange = async (event) => {
        const selectedId = event.target.value;
        setSelectedTestId(selectedId);

        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${selectedId}&test_id=${testingtype}&mater_id=0`);
            const procedures = response?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setProcedures(procedures);
            setSelectedProcedures(procedures);
            const cdId = ['297', '298', '299', '300', '301', '302'];
            const cdIdToSend = cdId.includes(selectedId) ? 297 : selectedId;
            const response2 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${cdIdToSend}`);
            // const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GETInstrumentDetailsByReportId?ReportId=${selectedId}`)
            setInstrumentData(response2?.data[0]);
            if (response2?.data) {
                setDisable(true);
            }
            getMFRlist(selectedId);
        } catch (error) {
            console.log('Error fetching data:', error)
        }
    }

    const handleRawMaterialSelectTypeList = async (event) => {
        const newValue = testOption.filter((data) => data.co_param_val_id == event.target.value)
        setSelectedRawMaterial(newValue[0].co_param_val_name)
        const selectedId = event.target.value;
        setSelectedTestId(selectedId);
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetRawMaterialTesting?processsheetno=${processSeqNo.current}&testid=${selectedId}`);
            getWiTestList(event.target.value)
            if (response?.data) {
                setDisable(true);
                setTableData(response?.data[0]);
                setMatMafGrade(response?.data[1]);
                // getMFRlist(selectedId);
            }
        } catch (error) {
            console.log('Error fetching data:', error)
        }
    }

    const formatDateToISOString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleBeforeProcessSelect = async (event) => {
        setBeforeLabSelectData(event.target.value)
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetBeforeProcessLabTesting?processsheetno=${processSeqNo.current}&testid=${event.target.value}`);
            if (response?.data) {
                setTableData(response?.data[0])
                setMatMafGrade(response?.data[1]);
                setDisable(true);
                getWiTestList(event.target.value)
            }
        } catch (error) {
            console.log('Error fetching data:', error)
        }
    }

    // const getMFRlist = async (testId) => {
    //     try {
    //         const testIdSend = (testId == '293' || testId == '986') ? '986' : testId;
    //         const endpoint = testIdSend == '986' ? `GetIndentationTesting` : testIdSend == '325' ? `GetCalibrationblastingdata` : `GetInProcessLabTesting`;

    //         const response = await axios.get(`${Environment.BaseAPIURL}/api/User/${endpoint}`, {
    //             params: {
    //                 processsheetno: formData.processsheetid,
    //                 testId: testIdSend,
    //                 thiknessdate: coatingDate
    //             }
    //         })
    //         testIdSend == '986' ? setTableData(transformData(response?.data[0])) : setTableData(response?.data[0]);
    //         testIdSend != '325' ? setMatMafGrade(response?.data[1]) : '';
    //     } catch (error) {
    //         console.error('Failed', error.message);
    //     }
    // };
    const getMFRlist = async (testId) => {
        try {
            const testIdSend = (testId === '293' || testId === '986') ? '986' : testId;
            const endpoint = testIdSend === '986' ? 'GetIndentationTesting' : testIdSend === '325' ? 'GetCalibrationblastingdata' : 'GetInProcessLabTesting';

            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/${endpoint}`, {
                params: {
                    processsheetno: formData.processsheetid,
                    testId: testIdSend,
                    thiknessdate: coatingDate
                }
            });

            if (testIdSend === '986') {
                setTableData(transformData(response?.data[0]));
            } else {
                setTableData(response?.data[0]);
                if (testIdSend !== '325') {
                    setMatMafGrade(response?.data[1]);
                }
            }
        } catch (error) {
            console.error('Failed', error.message);
        }
    };

    const groupedData = matManGrade?.reduce((acc, item) => {
        const key = `${item.Material_Id}_${item.Manfacturer_Id}_${item.Grade_Id}`;
        if (!acc[key]) {
            acc[key] = { ...item, batches: [] };
        }
        acc[key].batches.push(item.pm_batch);
        return acc;
    }, {});


    let groupedDataArray = Object.values(groupedData);
    const [selectedBatches, setSelectedBatches] = useState({});
    let newArr = groupedDataArray?.filter((data) =>
        /epoxy/i.test(data.Material) && /epoxy/i.test(selectedRawMaterial)
    );

    if (testingtype == 605 && action != 'edit') {
        groupedDataArray = newArr
    }

    const handleBatchChange = (key, selectedOption) => {
        setSelectedBatches(prevState => ({
            ...prevState,
            [key]: selectedOption,
        }));
    };

    const formatDataForAPI = (data) => {
        return data.map(item => ({
            material: item.Material_Id.toString(),
            manufacturer: item.Manfacturer_Id.toString(),
            grade: item.Grade_Id.toString(),
            batch: item.pm_batch
        }));
    };

    const handleDateChange = (date) => {
        if (filterPassedTime(date)) {
            setDateTimes(date); // Update the single date value
        } else {
            console.log("Selected time is in the past");
        }
    };

    const [temperatureInput, setTemperatureInput] = useState({});
    const [sampleInput, setSampleInput] = useState({});
    const [hotSample1, setHotSample1] = useState({});
    const [hotSample2, setHotSample2] = useState({});
    const [normalSample1, setNormalSample1] = useState({});
    const [normalSample2, setNormalSample2] = useState({});
    const [borderColor, setBorderColor] = useState({});
    const [selectedTime, setSelectedTime] = useState({});
    const now = new Date();

    const handleTimeChange = (e, originalIndex, rowIndex) => {
        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setSelectedTime(prevState => ({
            ...prevState,
            [key]: e,
        }));
    };

    const handleTemperatureInputChange = (e, originalIndex, rowIndex) => {
        const { value } = e.target;
        const temp = parseFloat(value);

        if (isNaN(temp) && value !== '') {
            return;
        }

        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setTemperatureInput(prevState => ({
            ...prevState,
            [key]: value,
        }));

        if (value === '') {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: '',
            }));
            return;
        }

        const item = tableData[originalIndex]; // Access data using originalIndex
        const requirementTemp = parseFloat(item.pm_reqmnt_temperature || 0);
        const tempPlus = parseFloat(item.pm_reqmnt_temp_plus || 0);
        const tempMinus = parseFloat(item.pm_reqmnt_temp_Minus || 0);

        const lowerBound = requirementTemp - tempMinus;
        const upperBound = requirementTemp + tempPlus;

        if (temp >= lowerBound && temp <= upperBound) {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: 'green',
            }));
        } else {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: 'red',
            }));
        }
    };

    const handleCheckboxChange = (originalIndex, rowIndex) => {
        const key = `${originalIndex}-${rowIndex}`
        setSampleCheckbox((prevState) => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    const isDateAllowed = (date) => {
        return coatingDates.some(
            allowedDate =>
                date.toDateString() === allowedDate.toDateString()
        );
    };

    const handleCoatingDateChange = (date) => {
        if (isDateAllowed(date)) {
            // const date_new = new Date(date).toISOString()
            const date_new = formatDateToISOString(date)
            setCoatingSelectedDate(date);
            setCoatingDate(date_new)
        }
    };

    const handleHotTempInputChange1 = (e, originalIndex, rowIndex) => {
        const { value } = e.target;
        const temp = parseFloat(value);

        if (isNaN(temp) && value !== '') {
            return;
        }

        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setHotSample1(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleHotTempInputChange2 = (e, originalIndex, rowIndex) => {
        const { value } = e.target;
        const temp = parseFloat(value);

        if (isNaN(temp) && value !== '') {
            return;
        }

        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setHotSample2(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };
    const handleNormalTempInputChange1 = (e, originalIndex, rowIndex) => {
        const { value } = e.target;
        const temp = parseFloat(value);

        if (isNaN(temp) && value !== '') {
            return;
        }

        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setNormalSample1(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };
    const handleNormalTempInputChange2 = (e, originalIndex, rowIndex) => {
        const { value } = e.target;
        const temp = parseFloat(value);

        if (isNaN(temp) && value !== '') {
            return;
        }

        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setNormalSample2(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleSampleInputChange = (e, originalIndex, rowIndex) => {
        const { value } = e.target;
        const temp = parseFloat(value);

        if (isNaN(temp) && value !== '') {
            return;
        }

        const key = `${originalIndex}-${rowIndex}`; // Use a combined key

        setSampleInput(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const [resultInput, setResultInput] = useState({});
    const [resultMessage, setResultMessage] = useState({});

    const handleResultInputChange = (e, index, rowIndex) => {
        const { value } = e.target;

        // Generate a unique key using both index and rowIndex
        const key = `${index}-${rowIndex}`;

        // Update result input state
        setResultInput(prevState => ({
            ...prevState,
            [key]: value,
        }));

        // Update checkbox state based on input value
        setInputCheckbox(prevState => ({
            ...prevState,
            [key]: value !== '',
        }));

        // Early return if value is empty
        if (value === '') {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: '',
            }));
            setResultMessage(prevState => ({
                ...prevState,
                [key]: '',
            }));
            return;
        }

        // Check if the input is alphanumeric or contains non-numeric characters (excluding decimal and negative sign)
        const isAlphanumeric = /[a-zA-Z]/.test(value);

        // If alphanumeric, always set as 'Satisfactory'
        if (isAlphanumeric) {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: 'green',
            }));
            setResultMessage(prevState => ({
                ...prevState,
                [key]: 'Satisfactory',
            }));
            return;
        }

        // Parse the value as a number (it can handle decimal, negative, and positive values)
        const result = parseFloat(value);

        // Check if the parsed result is a valid number
        if (isNaN(result)) {
            // Invalid numeric input (e.g., not a valid decimal or number)
            setBorderColor(prevState => ({
                ...prevState,
                [key]: 'red',
            }));
            setResultMessage(prevState => ({
                ...prevState,
                [key]: 'Invalid Input',
            }));
            return;
        }

        // Fetch the item from tableData using the original index
        const item = tableData[index];

        // Ensure item properties are handled correctly
        const minRequirement = parseFloat(item.PM_Reqmnt_test_min);
        const maxRequirement = parseFloat(item.PM_Reqmnt_test_Max);

        // Validate the result against min and max requirements
        if ((isNaN(minRequirement) || result >= minRequirement) && (isNaN(maxRequirement) || result <= maxRequirement)) {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: 'green',
            }));
            setResultMessage(prevState => ({
                ...prevState,
                [key]: 'Satisfactory',
            }));
        } else {
            setBorderColor(prevState => ({
                ...prevState,
                [key]: 'red',
            }));
            setResultMessage(prevState => ({
                ...prevState,
                [key]: 'Not Satisfactory',
            }));
        }
    };

    const [resultSuffixInput, setResultSuffixInput] = useState([]);

    const handleResultSuffixInputChange = (e, index, rowIndex) => {
        const { value } = e.target;
        const key = `${index}-${rowIndex}`; // Create a unique key

        setResultSuffixInput(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    function mergeData(data) {
        const map = new Map();

        data.forEach(item => {
            const key = `${item.material}-${item.manufacturer}-${item.grade}`;
            if (map.has(key)) {
                map.get(key).batch.push(item.batch);
            } else {
                map.set(key, {
                    material: item.material,
                    manufacturer: item.manufacturer,
                    grade: item.grade,
                    batch: [item.batch]
                });
            }
        });

        return Array.from(map.values());
    }

    const handleSubmit = async (e, value) => {
        e.preventDefault();
        setIsSubmitting(true);

        const rawMaterialData = [];
        groupedDataArray.forEach((item, index) => {
            const key = `${item.Material}-${item.Manfacturer}-${item.Grade}`;
            const selectedOption = selectedBatches[key] || [];
            selectedOption.forEach((option) => {
                rawMaterialData.push({
                    material: (item.ps_material_id).toString(),
                    manufacturer: (item.ps_manufacturer_id).toString(),
                    grade: (item.ps_grade_id).toString(),
                    batch: (option.value).toString(),
                });
            });
        });

        for (var x = 0; x < tableData.length; x++) {
            if (resultMessage[x] == "Not Satisfactory" && continueCode == false) {
                setModalShow(true)
                return
            }
        }
        if (testingtype == 605) {
            let mergedData = mergeData(rawMaterialData);


            if (action != 'edit' && ((selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302'))) {
                if (mergedData.length != 1) {
                    toast.error("You have to select 1 material");
                    return;
                }
            }

            // Prepare testsData with unique key handling
            const testsData = tableData
                .flatMap((item, index) =>
                    Array.from({ length: numRows }).map((_, rowIndex) => {
                        const key = `${index}-${rowIndex}`;
                        return {
                            ...item,
                            temperature1: temperatureInput[key] || '0',
                            test_result_accepted: resultMessage[key] === 'Satisfactory' ? "1" : "0",
                            test_result_remarks: resultInput[key] || '',
                            test_result_suffix: resultSuffixInput[key] || '',
                            index
                        };
                    })
                )
                .filter(entry => entry.test_result_remarks.trim() !== '')
                .map(entry => ({
                    temperature1: entry.temperature1,
                    test_result_accepted: entry.test_result_accepted,
                    test_result_remarks: entry.test_result_remarks,
                    test_result_suffix: entry.test_result_suffix,
                    pm_reqmnt_temp_plus: entry.pm_reqmnt_temp_plus,
                    pm_reqmnt_temp_Minus: entry.pm_reqmnt_temp_Minus,
                    pm_reqmnt_temperature: entry.pm_reqmnt_temperature,
                    test_categ_id: entry.pm_test_categ_id.toString(),
                    test_id: entry.pm_test_id.toString(),
                    test_type_id: entry.pm_test_type_id.toString(),
                    proc_template_id: "0",
                    proc_test_id: "0",
                }));

            const dataToSend = {
                project_id: formData.projectid.toString(),
                procsheet_id: formData.processsheetid.toString(),
                testdate: new Date().toLocaleString("sv-SE").split(" ").join("T"),
                shift: formData.pm_shift_id.toString(),
                ispqt: formData.ispqt === true ? formData.ispqt.toString() : "false",
                userid: userId.toString(),
                roleId: parseInt(roleId),
                process_type: formData.processtypeid ? formData.processtypeid.toString() : testingtype.toString(),
                procedure_type: selectedProcedures ? selectedProcedures.map(proc => proc.value).join(',') + "," : '0',
                rm_batch: "0",
                material_id: "0",
                manufacturer_id: "0",
                grade_id: "0",
                testsData,
                rawMaterialData: action == 'edit' ? editRawMaterialList : rawMaterialData,
                instrumentData,
                co_comp_id: 1,
                co_location_id: 1,
                test_run_id: TestRunId ? TestRunId.toString() : '0',
                subtype_id: selectedTestId.toString(),
                isSubmit: value,
            };

            try {
                const response = await axios.post(Environment.BaseAPIURL + '/api/User/SaveRawMaterialTesting', dataToSend);
                toast.success('Form submitted successfully!');
                navigate(`/rawmateriallist?menuId=${menuId}&testingtype=${testingtype}`);
                setIsSubmitting(false);
                if (response.data === "1000") {
                    toast.success("Form data sent successfully!");
                    console.log("Form data sent successfully!");
                    navigate(`/inspectiontesting?menuId=${menuId}`);
                } else {
                    console.error("Failed to send form data to the server. Status code:", response.status);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error('Failed to submit the form.');
            }
        }

        if (testingtype != 607 && testingtype != 605) {
            // const mergedData = mergeData(rawMaterialData);
            // if (mergedData.length < 1 && (selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302')) {
            //     toast.error("You have to select atleast 1 material");
            //     return;
            // }
            // Prepare testsData with unique key handling
            const testsData = (selectedTestId == '293' || selectedTestId == '986' || TestId == '293' || TestId == '986') ?
                tableData
                    .flatMap((item, index) =>
                        Array.from({ length: numRows }).map((_, rowIndex) => {
                            const key = `${index}-${rowIndex}`;
                            return {
                                ...item,
                                initial_val_hot: hotSample1[key],
                                final_val_hot: hotSample2[key],
                                result_hot: (parseFloat(hotSample2[key]) - parseFloat(hotSample1[key])),
                                initial_val_normal: normalSample1[key],
                                final_val_normal: normalSample2[key],
                                result_normal: (parseFloat(normalSample2[key]) - parseFloat(normalSample1[key])),
                                result_remarks: resultSuffixInput[key],
                                pm_is_sample_cut: sampleCheckbox[key] || '0',
                                pm_sample_cut_size: sampleInput[key] || '0',
                                index
                            };
                        })
                    )
                    .filter(entry => entry.result_remarks.trim() !== '')
                    .map((entry, idx) => ({
                        initial_val_hot: entry.initial_val_hot.toString(),
                        final_val_hot: entry.final_val_hot.toString(),
                        result_hot: (entry.result_hot).toString(),
                        initial_val_normal: entry.initial_val_normal.toString(),
                        final_val_normal: entry.final_val_normal.toString(),
                        result_normal: (entry.result_normal).toString(),
                        result_remarks: entry.result_remarks,
                        seqno: (idx + 1).toString(),
                        pipe_id: (entry.pm_pipe_id).toString(),
                        temperature1: entry.temperature1,
                        test_id: '986',
                        pm_is_sample_cut: entry.pm_is_sample_cut == true ? "1" : "0",
                        pm_sample_cut_size: entry.pm_sample_cut_size,
                        thicknessDate: coatingDate
                    }))
                :
                selectedTestId == '325' ?
                    tableData
                        .flatMap((item, index) =>
                            Array.from({ length: 1 }).map((_, rowIndex) => {
                                const key = `${index}-${rowIndex}`;
                                return {
                                    ...item,
                                    sampleInput: sampleInput[key] || '',
                                    selectedTime: selectedTime[key] || '',
                                    resultSuffixInput: resultSuffixInput[key] || '',
                                    pm_inst_error: (Number(sampleInput[key]) - (Number(item.workrangemin) + Number(item.workrangemax)) / 2),
                                    index
                                };
                            })
                        )
                        .map(entry => ({
                            calib_id: entry.pm_calib_id.toString(),
                            test_id: entry.pm_test_id.toString(),
                            pm_inst_reading: entry.sampleInput,
                            pm_inst_error: entry.pm_inst_error.toString(),
                            pm_test_time: entry.selectedTime.toLocaleString("sv-SE").split(" ")[1],
                            pm_remarks: entry.resultSuffixInput,
                        })) :
                    tableData
                        .flatMap((item, index) =>
                            Array.from({ length: numRows }).map((_, rowIndex) => {
                                const key = `${index}-${rowIndex}`;
                                return {
                                    ...item,
                                    temperature1: temperatureInput[key] || '0',
                                    test_result_accepted: resultMessage[key] === 'Satisfactory' ? "1" : "0",
                                    test_result_remarks: resultInput[key] || '',
                                    test_result_suffix: resultSuffixInput[key] || '',
                                    pm_is_sample_cut: sampleCheckbox[key] || '0',
                                    pm_sample_cut_size: sampleInput[key] || '0',
                                    index
                                };
                            })
                        )
                        .filter(entry => entry.test_result_remarks.trim() !== '')
                        .map((entry, idx) => ({
                            seqno: (idx + 1).toString(),
                            pipe_id: (entry.pm_pipe_id).toString(),
                            temperature1: (entry.temperature1).toString(),
                            test_result_accepted: entry.test_result_accepted,
                            test_result_remarks: entry.test_result_remarks,
                            test_result_suffix: entry.test_result_suffix,
                            test_datetime: entry.test_datetime ? new Date(entry.test_datetime).toLocaleString("sv-SE").split(" ").join("T") : '',
                            pm_reqmnt_temp_plus: entry.pm_reqmnt_temp_plus,
                            pm_reqmnt_temp_Minus: entry.pm_reqmnt_temp_Minus,
                            pm_reqmnt_temperature: entry.pm_reqmnt_temperature,
                            test_categ_id: entry.pm_test_categ_id.toString(),
                            test_id: entry.pm_test_id.toString(),
                            test_type_id: entry.pm_test_type_id.toString(),
                            proc_template_id: "0",
                            proc_test_id: "0",
                            pm_is_sample_cut: entry.pm_is_sample_cut == true ? "1" : "0",
                            pm_sample_cut_size: entry.pm_sample_cut_size,
                            thicknessDate: coatingDate
                        }));

            const dataToSend = {
                co_comp_id: '1',
                co_location_id: '1',
                roleId: parseInt(roleId),
                project_id: formData.projectid.toString(),
                procsheet_id: formData.processsheetid.toString(),
                // testdate: (selectedTestId == '293' || selectedTestId == '986' || TestId == '293' || TestId == '986' || selectedTestId == '325') ? new Date().toLocaleString("sv-SE").split(" ").join("T") : dateTimes ? new Date(dateTimes).toLocaleString("sv-SE").split(" ").join("T") : '',
                testdate: new Date().toLocaleString("sv-SE").split(" ").join("T"),
                shift: formData.pm_shift_id.toString(),
                ispqt: formData.ispqt === true ? formData.ispqt.toString() : "false",
                created_by: userId.toString(),
                userid: userId.toString(),
                process_type: formData.processtypeid ? formData.processtypeid.toString() : testingtype.toString(),
                procedure_type: selectedProcedures ? selectedProcedures.map(proc => proc.value).join(',') + "," : '0',
                rm_batch: "0",
                material_id: "0",
                manufacturer_id: "0",
                grade_id: "0",
                isSubmit: value,
                testsData,
                rawMaterialData,
                test_run_id: TestRunId ? TestRunId.toString() : '0',
                instrumentData,
                subtype_id: (selectedTestId == '293' || selectedTestId == '986') ? '986' : selectedTestId
            };

            try {
                const testIdSend = (selectedTestId == '293' || selectedTestId == '986' || TestId == '293' || TestId == '986') ? '986' : selectedTestId;
                const endpoint = testIdSend == '986' ? `SaveIndentationtestData` : selectedTestId == '325' ? `SaveCalibrationblastingdata` : `SaveInProcessLabFieldData`;

                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/${endpoint}`, dataToSend)
                // const response = await axios.post(Environment.BaseAPIURL + '/api/User/SaveInProcessLabFieldData', dataToSend);
                toast.success('Form submitted successfully!');
                navigate(`/rawmateriallist?menuId=${menuId}&testingtype=${testingtype}`);
                setIsSubmitting(false);
                if (response.data === "1000") {
                    toast.success("Form data sent successfully!");
                    console.log("Form data sent successfully!");
                    navigate(`/inspectiontesting?menuId=${menuId}`);
                } else {
                    console.error("Failed to send form data to the server. Status code:", response.status);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error('Failed to submit the form.');
            }
        }

        if (testingtype == '607') {
            const mergedData = mergeData(rawMaterialData);
            if (mergedData.length > 1) {
                toast.error("You can select at most 1 material");
                return;
            }
            if (mergedData.length < 1 && beforeLabSelectData != 248) {
                toast.error("You have to select atleast 1 material");
                return;
            }

            // Prepare testsData with unique key handling
            const testsData = tableData
                .flatMap((item, index) =>
                    Array.from({ length: numRows }).map((_, rowIndex) => {
                        const key = `${index}-${rowIndex}`;
                        return {
                            ...item,
                            temperature1: temperatureInput[key] || '0',
                            test_result_accepted: resultMessage[key] === 'Satisfactory' ? "1" : "0",
                            test_result_remarks: resultInput[key] || '',
                            test_result_suffix: resultSuffixInput[key] || '',
                            index
                        };
                    })
                )
                .filter(entry => entry.test_result_remarks.trim() !== '')
                .map((entry, index) => ({
                    seqno: (index + 1).toString(),
                    temperature1: entry.temperature1,
                    test_result_accepted: entry.test_result_accepted,
                    test_result_remarks: entry.test_result_remarks,
                    test_result_suffix: entry.test_result_suffix,
                    pm_reqmnt_temp_plus: entry.pm_reqmnt_temp_plus,
                    pm_reqmnt_temp_Minus: entry.pm_reqmnt_temp_Minus,
                    pm_reqmnt_temperature: entry.pm_reqmnt_temperature,
                    test_categ_id: entry.pm_test_categ_id.toString(),
                    test_id: entry.pm_test_id.toString(),
                    test_type_id: entry.pm_test_type_id.toString(),
                    proc_template_id: "0",
                    proc_test_id: "0",
                }));

            const dataToSend = {
                co_comp_id: '1',
                co_location_id: '1',
                project_id: formData.projectid.toString(),
                roleId: roleId,
                procsheet_id: formData.processsheetid.toString(),
                testdate: new Date().toLocaleString("sv-SE").split(" ").join("T"),
                shift: formData.pm_shift_id.toString(),
                ispqt: formData.ispqt === true ? formData.ispqt.toString() : "false",
                subtype_id: beforeLabSelectData.toString(),
                userId: userId.toString(),
                process_type: formData.processtypeid ? formData.processtypeid.toString() : testingtype.toString(),
                procedure_type: selectedProcedures ? selectedProcedures.map(proc => proc.value).join(',') + "," : '0',
                rm_batch: "0",
                material_id: "0",
                manufacturer_id: "0",
                grade_id: "0",
                isSubmit: value,
                testsData,
                rawMaterialData,
                test_run_id: TestRunId ? TestRunId.toString() : '0',
                instrumentData,
            };

            try {
                const response = await axios.post(Environment.BaseAPIURL + '/api/User/SaveBeforeProcessData', dataToSend);
                toast.success('Form submitted successfully!');
                navigate(`/rawmateriallist?menuId=${menuId}&testingtype=${testingtype}`);
                setIsSubmitting(false);
                if (response.data === "1000") {
                    toast.success("Form data sent successfully!");
                    console.log("Form data sent successfully!");
                    navigate(`/inspectiontesting?menuId=${menuId}`);
                } else {
                    console.error("Failed to send form data to the server. Status code:", response.status);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error('Failed to submit the form.');
            }
        }

    };

    return (
        <>
            {
                loading ? <Loading /> :
                    <>
                        <Header />
                        <section className='InnerHeaderPageSection'>
                            <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <ul>
                                            <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li> <Link to={`/inspectiontesting?menuId=${menuId}`}> {testingtypeval} List </Link> <b style={{ color: '#fff' }}></b></li>
                                            <li><h1>/&nbsp; {testingtypeval} </h1></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className='RawmaterialPageSection'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <div className='PipeTallySheetDetails'>
                                            <form action="" className='row m-0'>
                                                <div className='col-md-12 col-sm-12 col-xs-12'><h4>{testingtypeval} <span>- Add page</span></h4></div>
                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor="">Process Sheet</label>
                                                        <div className='ProcessSheetFlexBox'>
                                                            <input
                                                                name="processSheet"
                                                                placeholder='Process sheet'
                                                                value={formData?.processsheetcode || ''}
                                                                onChange={handleInputChange}
                                                                style={{ width: '66%', cursor: 'not-allowed' }}
                                                            />
                                                            <select name="psYear" value={formData?.psYear} onChange={handleInputChange} >
                                                                <option value=""> Year </option>
                                                                {ddlYear.map((yearOption, i) => (
                                                                    <option key={i} value={yearOption.year}> {yearOption.year} </option>
                                                                ))}
                                                            </select>
                                                            <b>-</b>
                                                            <input
                                                                type="number"
                                                                name="psSeqNo"
                                                                value={formData?.psSeqNo}
                                                                onChange={handleInputChange}
                                                                placeholder='No.'
                                                                onBlur={handlePsSeqNoBlur}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {[
                                                    { label: "Client Name", value: formData?.clientname },
                                                    { label: "Project Name", value: formData?.projectname },
                                                    { label: "Pipe Size", value: formData?.pipesize },
                                                    { label: "Type Of Coating", value: formData?.typeofcoating },
                                                    { label: "Shift", value: action === 'edit' ? formData.pm_shiftvalue : shift?.pm_shiftvalue },
                                                    { label: "Date", value: new Date(formData?.testdate).toLocaleDateString("en-GB") }
                                                ].map((field, idx) => (
                                                    <div key={idx} className="form-group col-md-4 col-sm-4 col-xs-12">
                                                        <label>{field.label}</label>
                                                        <input type="text" value={field.value} placeholder={field.label} readOnly />
                                                    </div>
                                                ))}

                                                {selectedTestId != '325' && testingtype != 605 && <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label>Select Coating Date</label>
                                                        <DatePicker
                                                            selected={coatingSelectedDate}
                                                            filterDate={isDateAllowed}
                                                            onChange={handleCoatingDateChange}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText='DD/MM/YYYY'
                                                        />
                                                    </div>
                                                </div>}

                                                {testingtype == '607' ?
                                                    <div className='col-md-4 col-sm-4 col-xs-12'>
                                                        <div className='form-group'>
                                                            <label htmlFor="testType">Test Type</label>
                                                            <select id="testType" value={beforeLabSelectData} onChange={(e) => handleBeforeProcessSelect(e)} >
                                                                <option selected disabled value="" >-- Select type --</option>
                                                                {testOption.map(option => (
                                                                    <option key={option.co_param_val_id} value={option.co_param_val_id}>{option.co_param_val_name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div> :
                                                    testingtype != '605' ?
                                                        <div className='col-md-4 col-sm-4 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="testType">Test Type</label>
                                                                <select id="testType" value={selectedTestId} onChange={handleTestTypeChange} >
                                                                    <option selected disabled value="" >Select type</option>
                                                                    {testOption.map(option => (
                                                                        <option key={option.pm_test_type_id} value={option.pm_test_type_id}>{option.co_param_val_name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div> :
                                                        <div className='col-md-4 col-sm-4 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="testType">Test Type</label>
                                                                <select id="testType" value={selectedTestId} onChange={(e) => handleRawMaterialSelectTypeList(e)} >
                                                                    <option selected disabled value="" >Select type</option>
                                                                    {testOption.map(option => (
                                                                        <option key={option.co_param_val_id} value={option.co_param_val_id}>{option.co_param_val_name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                }

                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label data-bs-toggle="modal" data-bs-target="#exampleModal1">Procedure / WI No.</label>
                                                        <Select
                                                            className='select'
                                                            value={selectedProcedures}
                                                            onChange={(selectedOption) => setSelectedProcedures(selectedOption)}
                                                            options={procedures}
                                                            isSearchable
                                                            isClearable
                                                            isMulti={true}
                                                            placeholder='Search or Select procedure...'
                                                        />
                                                    </div>
                                                </div>

                                                <div className={modalShow ? "modal fade NonSatisfactoryModal show" : "modal fade NonSatisfactoryModal"} id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: modalShow ? 'block' : 'none' }}>
                                                    <div className="modal-dialog">
                                                        <div className="modal-content">
                                                            <div className="modal-body">
                                                                <div className='NonSatisfactoryBox'>
                                                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={(e) => { e.preventDefault(); setModalShow(false); }}></button>

                                                                    <p>Are you sure you want to proceed with <br /> Non-Satisfactory result?</p>

                                                                    <div className='NonSatisfactoryModalFlex'>
                                                                        <i style={{ background: '#34B233' }} onClick={(e) => { e.preventDefault(); setContinueCode(true); setModalShow(false); handleSubmit(e, true); }} class="fas fa-thumbs-up"></i>
                                                                        <i style={{ background: '#ed2939' }} class="fas fa-thumbs-down" onClick={(e) => { e.preventDefault(); setModalShow(false); }}></i>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {disable && (
                                                    <>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className="col-md-12 col-sm-12 col-xs-12">
                                                                <hr className="DividerLine" />
                                                            </div>
                                                            <div className="col-md-12 col-sm-12 col-xs-12">
                                                                <div className="PQTBox">
                                                                    <input
                                                                        className='form-check-input'
                                                                        type="checkbox"
                                                                        id="ispqt"
                                                                        name="ispqt"
                                                                        checked={formData?.ispqt}
                                                                        onChange={(e) => setFormData((prev) => ({ ...prev, ispqt: e.target.checked }))}
                                                                    />
                                                                    <label for="pqt"> PQT</label>
                                                                </div>
                                                            </div>
                                                            {selectedTestId != '325' && testingtype != 605 &&
                                                                <div className="accordion FrequencyaccordionSection" id="accordionExample">
                                                                    <div className="accordion-item" id="headingOne">
                                                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">Frequency: {frequency}</button>
                                                                        <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                                            <div className="accordion-body">
                                                                                <div className="Frequencytable">
                                                                                    <table>
                                                                                        <thead>
                                                                                            <tr style={{ background: "#5a245a", color: "#fff", }}>
                                                                                                <th>Sr No.</th>
                                                                                                <th>Batch</th>
                                                                                                <th>Pipe No.</th>
                                                                                                <th>Shift</th>
                                                                                                <th>Date</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {frequencyDetails?.map((item, index) =>
                                                                                                <tr key={index}>
                                                                                                    <td>{index + 1}</td>
                                                                                                    <td>{item.batch}</td>
                                                                                                    <td>{item.pipeno}</td>
                                                                                                    <td>{item.shift}</td>
                                                                                                    <td>{new Date(item.date).toLocaleDateString("en-GB")}</td>
                                                                                                </tr>)}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>}
                                                        </div>
                                                        {isRawMaterial.length && testingtype == '605' || selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302' && groupedDataArray.some(item =>
                                                            ["Adhesive", "Fusion Bonded Epoxy", "High Density Polyethylene"].includes(item.Material)) ?
                                                            <>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                                <div className="Frequencytable">
                                                                    <table>
                                                                        <thead>
                                                                            <tr style={{ background: "#5a245a", color: "#fff", }}>
                                                                                <th>Sr. No.</th>
                                                                                <th style={{ minWidth: "150px" }}>Material</th>
                                                                                <th style={{ minWidth: "150px" }}>Manufacturer</th>
                                                                                <th style={{ minWidth: "150px" }}>Grade</th>
                                                                                <th style={{ minWidth: "150px" }}>Batch No.</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {groupedDataArray.filter(item => {
                                                                                if (testingtype == '605' || selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302') {
                                                                                    return ["Adhesive", "Fusion Bonded Epoxy", "High Density Polyethylene"].includes(item.Material);
                                                                                }
                                                                                return false;
                                                                            })
                                                                                .map((item, index) => {
                                                                                    const key = `${item.Material}-${item.Manfacturer}-${item.Grade}`;
                                                                                    const selectedOption = selectedBatches[key] || null;

                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <td>{index + 1}</td>
                                                                                            <td><select><option value={item.ps_material_id}>{item.Material}</option></select></td>
                                                                                            <td><select><option value={item.ps_manufacturer_id}>{item.Manfacturer}</option></select></td>
                                                                                            <td><select><option value={item.ps_grade_id}>{item.Grade}</option></select></td>
                                                                                            <td>
                                                                                                {action === 'edit' ? (
                                                                                                    <div>
                                                                                                        <Select
                                                                                                            className="select"
                                                                                                            id='batchno'
                                                                                                            value={item.batches.map((batch) => ({ value: batch, label: batch }))}
                                                                                                            isMulti={true}
                                                                                                        />
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <Select
                                                                                                        className="select"
                                                                                                        id='batchno'
                                                                                                        value={selectedOption}
                                                                                                        onChange={(selectedOption) => handleBatchChange(key, selectedOption)}
                                                                                                        options={item.batches.map((batch) => ({
                                                                                                            value: batch,
                                                                                                            label: batch,
                                                                                                        }))}
                                                                                                        isSearchable
                                                                                                        isClearable
                                                                                                        isMulti={true}
                                                                                                        placeholder="Search or Select batch..."
                                                                                                    />
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </>
                                                            : ''}
                                                        <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                        <div className='row'>
                                                            {testingtype != 605 && testingtype == 608 && selectedTestId == 304 && <div className='col-md-3'>
                                                                <div>
                                                                    <label>No. of Samples</label>
                                                                    <input type='number' min='0' value={numRows} onChange={(e) => setNumRows(e.target.value)} className='form-control mb-3' placeholder='Enter no. of samples' style={{ maxWidth: '200px' }} />
                                                                </div>
                                                            </div>}
                                                            {selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302' ? <div className='col-md-3'>
                                                                <div>
                                                                    <label>Test Start Date/Time</label>
                                                                    <DatePicker
                                                                        selected={dateTimes ? new Date(dateTimes) : new Date(formData?.testdate)}
                                                                        onChange={(date) => handleDateChange(date)}
                                                                        showTimeSelect
                                                                        dateFormat="dd/MM/yyyy , p"
                                                                        className='form-control'
                                                                        timeFormat="HH:mm"
                                                                        placeholderText="Select date and time"
                                                                    />
                                                                </div>
                                                            </div> : ''}
                                                            {testingtype == 608 || testingtype == 609 ? <div className='col-md-3'>
                                                                <div>
                                                                    <label>Type of Coating</label>
                                                                    <select className='form-control  mb-3' required>
                                                                        <option value=''>Select Type of Coating</option>
                                                                        <option value='1'>3LPE</option>
                                                                        <option value='2'>3LPP</option>
                                                                    </select>
                                                                </div>
                                                            </div> : ''}
                                                        </div>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className='PipeDescriptionDetailsTable'>
                                                                <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                                                    {selectedTestId == 293 || selectedTestId == 986 || TestId == '293' || TestId == '986' ?
                                                                        <Table id='subtesttbl'>
                                                                            <thead>
                                                                                <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                    <th></th>
                                                                                    <th></th>
                                                                                    <th colSpan={2} style={{ textAlign: 'center' }}>Hot</th>
                                                                                    <th colSpan={2} style={{ textAlign: 'center' }}>Normal</th>
                                                                                    <th></th>
                                                                                    <th></th>
                                                                                    <th></th>
                                                                                    <th></th>
                                                                                </tr>
                                                                                <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                    <th rowSpan={2} style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                    {testingtype != "607" ? <th rowSpan={2} style={{ minWidth: '100px' }}>Pipe No.</th> : ''}
                                                                                    <th style={{ minWidth: '120px' }}>Initial Reading</th>
                                                                                    <th style={{ minWidth: '100px' }}>Final Reading</th>
                                                                                    <th style={{ minWidth: '120px' }}>Initial Reading</th>
                                                                                    <th style={{ minWidth: '100px' }}>Final Reading</th>
                                                                                    {testingtype == "608" || testingtype == "609" ? <><th style={{ minWidth: '70px' }}>Sample Cut Required</th>
                                                                                        <th style={{ minWidth: '100px' }}>Sample Cut Size</th></> : ""}
                                                                                    <th rowSpan={2} style={{ minWidth: '180px' }}>Reference Standard</th>
                                                                                    <th rowSpan={2} style={{ minWidth: '200px' }}>Remarks</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {tableData.map((item, index) => (
                                                                                    Array.from({ length: numRows }).map((_, rowIndex) => {
                                                                                        const key = `${index}-${rowIndex}`;
                                                                                        const seqno = (index * numRows + rowIndex + 1).toString();
                                                                                        return (
                                                                                            <tr key={key}>
                                                                                                <td>{seqno}</td>
                                                                                                {testingtype !== "607" ? (
                                                                                                    <td>{item.pm_pipe_code ? item.pm_pipe_code : item.co_param_val_name}</td>
                                                                                                ) : null}
                                                                                                <td>
                                                                                                    <input type='text' className='form-control' value={hotSample1[key] || ''}
                                                                                                        onChange={(e) => handleHotTempInputChange1(e, index, rowIndex)} />
                                                                                                </td>
                                                                                                <td>
                                                                                                    <input type='text' className='form-control' value={hotSample2[key] || ''}
                                                                                                        onChange={(e) => handleHotTempInputChange2(e, index, rowIndex)} />
                                                                                                </td>
                                                                                                <td>
                                                                                                    <input type='text' className='form-control' value={normalSample1[key] || ''}
                                                                                                        onChange={(e) => handleNormalTempInputChange1(e, index, rowIndex)} />
                                                                                                </td>
                                                                                                <td>
                                                                                                    <input type='text' className='form-control' value={normalSample2[key] || ''}
                                                                                                        onChange={(e) => handleNormalTempInputChange2(e, index, rowIndex)} />
                                                                                                </td>
                                                                                                {testingtype == '608' || testingtype == '609' ? <><td>
                                                                                                    <input type='checkbox' checked={sampleCheckbox[key] || false} onChange={() => handleCheckboxChange(index, rowIndex)} />
                                                                                                </td>
                                                                                                    <td>
                                                                                                        <input type='text' className='form-control' value={sampleInput[key] || ''}
                                                                                                            onChange={(e) => handleSampleInputChange(e, index, rowIndex)} disabled={!sampleCheckbox[key]} />
                                                                                                    </td></> : ''}
                                                                                                <td>{item.ReferenceStandard} ({item?.pm_tm_publication_yr})</td>
                                                                                                <td>
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        placeholder='Enter result suffix'
                                                                                                        value={resultSuffixInput[key] || ''}
                                                                                                        onChange={(e) => handleResultSuffixInputChange(e, index, rowIndex)}
                                                                                                    />
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    })
                                                                                ))}
                                                                            </tbody>
                                                                        </Table> : selectedTestId == '325' ?
                                                                            <Table id='subtesttbl'>
                                                                                <thead>
                                                                                    <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                        <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                        <th style={{ minWidth: '170px' }}>Instrument Name</th>
                                                                                        <th style={{ minWidth: '180px' }}>Make</th>
                                                                                        <th style={{ minWidth: '100px' }}>Standard Reading</th>
                                                                                        <th style={{ minWidth: '120px' }}>Accuracy of reading</th>
                                                                                        <th style={{ minWidth: '100px' }}>Actual Reading Of The Instrument</th>
                                                                                        <th style={{ minWidth: '100px' }}>ERROR</th>
                                                                                        <th style={{ minWidth: '100px' }}>TIME</th>
                                                                                        <th style={{ minWidth: '200px' }}>Remarks</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {tableData.map((item, index) => (
                                                                                        Array.from({ length: 1 }).map((_, rowIndex) => {
                                                                                            const key = `${index}-${rowIndex}`;
                                                                                            const seqno = (index * 1 + rowIndex + 1).toString();
                                                                                            return (
                                                                                                <tr key={key}>
                                                                                                    <td>{seqno}</td>
                                                                                                    <td>{item.InstrumentName || "-"}</td>
                                                                                                    <td>{item.Make || "-"}</td>
                                                                                                    <td>{item.workrangemin + "-" + item.workrangemax || "-"}</td>
                                                                                                    <td>
                                                                                                        {item.pm_value_type === "A" ? item.pm_test_value :
                                                                                                            (item.PM_Reqmnt_test_min && item.PM_Reqmnt_test_Max) ?
                                                                                                                `${item.PM_Reqmnt_test_min} - ${item.PM_Reqmnt_test_Max}` :
                                                                                                                (item.PM_Reqmnt_test_min ? `Min - ${item.PM_Reqmnt_test_min}` :
                                                                                                                    (item.PM_Reqmnt_test_Max ? `Max - ${item.PM_Reqmnt_test_Max}` : ''))
                                                                                                        }{" " + item.Unit}
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <input type='text' className='form-control' value={sampleInput[key] || ''}
                                                                                                            onChange={(e) => handleSampleInputChange(e, index, rowIndex)} />
                                                                                                    </td>
                                                                                                    <td>{(Number(sampleInput[key]) - (Number(item.workrangemin) + Number(item.workrangemax)) / 2) ? Number(sampleInput[key]) - (Number(item.workrangemin) + Number(item.workrangemax)) / 2 : '0'}
                                                                                                        {/* <div>{((12 / 11.5).toFixed(2))}%</div> */}
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <DatePicker
                                                                                                            selected={selectedTime[key]}
                                                                                                            onChange={(time) => handleTimeChange(time, index, rowIndex)}
                                                                                                            showTimeSelect
                                                                                                            showTimeSelectOnly
                                                                                                            timeIntervals={15} // You can set the interval between times, e.g., 15 minutes
                                                                                                            timeCaption="Time"
                                                                                                            dateFormat="h:mm aa" // Format for displaying time
                                                                                                            minDate={now} // Prevents selecting past dates
                                                                                                            minTime={now} // Prevents selecting past times on the current date
                                                                                                            maxTime={new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)} // Limits time selection to the end of the current day
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            placeholder='Enter result suffix'
                                                                                                            value={resultSuffixInput[key] || ''}
                                                                                                            onChange={(e) => handleResultSuffixInputChange(e, index, rowIndex)}
                                                                                                        />
                                                                                                    </td>
                                                                                                </tr>
                                                                                            );
                                                                                        })
                                                                                    ))}
                                                                                </tbody>
                                                                            </Table> :
                                                                            <Table id='subtesttbl'>
                                                                                <thead>
                                                                                    <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                        <th style={{ minWidth: '70px' }}></th>
                                                                                        <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                        {testingtype != "607" ? <th style={{ minWidth: '170px' }}>Test Description / Pipe No.</th> : ''}
                                                                                        <th style={{ minWidth: '180px' }}>Reference Standard</th>
                                                                                        <th style={{ minWidth: '200px' }}>Acceptance Criteria</th>
                                                                                        {testingtype == "608" || testingtype == "609" ? <><th style={{ minWidth: '70px' }}>Sample Cut Required</th>
                                                                                            <th style={{ minWidth: '100px' }}>Sample Cut Size</th></> : ""}
                                                                                        {testingtype != "605" && (tableData[0]?.pm_reqmnt_temperature == '' ? '' : <th style={{ minWidth: '200px' }}>Temperature</th>)}
                                                                                        <th style={{ minWidth: '200px' }}>Result</th>
                                                                                        <th style={{ minWidth: '200px' }}>Result Suffix</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {tableData.map((item, index) => (
                                                                                        Array.from({ length: numRows }).map((_, rowIndex) => {
                                                                                            const key = `${index}-${rowIndex}`;
                                                                                            const seqno = (index * numRows + rowIndex + 1).toString();
                                                                                            return (
                                                                                                <tr key={key}>
                                                                                                    <td>
                                                                                                        <input
                                                                                                            type='checkbox'
                                                                                                            checked={inputCheckbox[key] || false}
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td>{seqno}</td>
                                                                                                    {testingtype !== "607" ? (
                                                                                                        <td>{item.pm_pipe_code ? item.pm_pipe_code : item.co_param_val_name}</td>
                                                                                                    ) : null}
                                                                                                    <td>{item.ReferenceStandard} ({item?.pm_tm_publication_yr})</td>

                                                                                                    {(selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302')
                                                                                                        ? <td>{item.pm_reqmnt_suffix}</td> : <td>
                                                                                                            {item.pm_value_type === "A" ? item.pm_test_value :
                                                                                                                (item.PM_Reqmnt_test_min && item.PM_Reqmnt_test_Max) ?
                                                                                                                    `${item.PM_Reqmnt_test_min} - ${item.PM_Reqmnt_test_Max}` :
                                                                                                                    (item.PM_Reqmnt_test_min ? `Min - ${item.PM_Reqmnt_test_min}` :
                                                                                                                        (item.PM_Reqmnt_test_Max ? `Max - ${item.PM_Reqmnt_test_Max}` : ''))
                                                                                                            }{" " + item.Unit}
                                                                                                        </td>}
                                                                                                    {testingtype == '608' || testingtype == '609' ? <><td>
                                                                                                        <input type='checkbox' checked={sampleCheckbox[key] || false} onChange={() => handleCheckboxChange(index, rowIndex)} />
                                                                                                    </td>
                                                                                                        <td>
                                                                                                            <input type='text' className='form-control' value={sampleInput[key] || ''}
                                                                                                                onChange={(e) => handleSampleInputChange(e, index, rowIndex)} disabled={!sampleCheckbox[key]} />
                                                                                                        </td></> : ''}
                                                                                                    {testingtype != "605" && item.pm_reqmnt_temperature !== '' ? (
                                                                                                        <td>
                                                                                                            {item.pm_reqmnt_temperature ? `${parseFloat(item.pm_reqmnt_temperature) - parseFloat(item.pm_reqmnt_temp_Minus)}-${parseFloat(item.pm_reqmnt_temperature) + parseFloat(item.pm_reqmnt_temp_plus)}` : ''}
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                value={temperatureInput[key] || ''}
                                                                                                                onChange={(e) => handleTemperatureInputChange(e, index, rowIndex)}
                                                                                                                style={{ borderColor: borderColor[key] }}
                                                                                                                placeholder='Enter temperature'
                                                                                                            />
                                                                                                        </td>
                                                                                                    ) : null}
                                                                                                    <td>
                                                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                            {item.pm_value_type === "A" && item?.pm_test_value?.split(/,\s*/).length > 1 ? (
                                                                                                                <select value={resultInput[key] || ''} onChange={(e) => handleResultInputChange(e, index, rowIndex)}>
                                                                                                                    <option>Select Value</option>
                                                                                                                    {item?.pm_test_value?.split(/,\s*/)?.map((data) => (
                                                                                                                        <option key={data} value={data}>{data}</option>
                                                                                                                    ))}
                                                                                                                </select>
                                                                                                            ) : (
                                                                                                                <input
                                                                                                                    // type={item.pm_value_type === 'A' ? "text" : "number"}
                                                                                                                    type='text'
                                                                                                                    value={resultInput[key] || ''}
                                                                                                                    onChange={(e) => handleResultInputChange(e, index, rowIndex)}
                                                                                                                    style={{ borderColor: borderColor[key] }}
                                                                                                                    placeholder='Enter result'
                                                                                                                />
                                                                                                            )}
                                                                                                            <div style={{ marginLeft: '5px' }}>{" " + item.Unit}</div>
                                                                                                        </div>
                                                                                                        <span>{resultMessage[key]}</span>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            placeholder='Enter result suffix'
                                                                                                            value={resultSuffixInput[key] || ''}
                                                                                                            onChange={(e) => handleResultSuffixInputChange(e, index, rowIndex)}
                                                                                                        />
                                                                                                    </td>
                                                                                                </tr>
                                                                                            );
                                                                                        })
                                                                                    ))}
                                                                                </tbody>
                                                                            </Table>
                                                                    }
                                                                </div>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                    <Table id='insttbl'>
                                                                        <thead>
                                                                            <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                <th colSpan={3} style={{ fontSize: '16px', textAlign: 'center' }}> Instrument to be Used</th>
                                                                            </tr>
                                                                            <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                <td style={{ maxWidth: '30px', background: 'whitesmoke' }}>Sr. No.</td>
                                                                                <td style={{ maxWidth: '30px', background: 'whitesmoke' }}>Instrument Name</td>
                                                                                <td style={{ minWidth: '30px', background: 'whitesmoke' }}>Instrument ID/Serial No.</td>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {instrumentData.map((tests, index) => (
                                                                                <tr key={index}>
                                                                                    <td>{index + 1}</td>
                                                                                    <td>{tests.equip_name}</td>
                                                                                    <td>
                                                                                        <select name="" id="">
                                                                                            <option value="">-- Select instrument id/ serial no.--{" "}</option>
                                                                                            <option value={tests.equip_code} selected>{tests.equip_code}</option>
                                                                                        </select>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                            {/* {instrumentData?.map((type, index) => (
                                                                                <tr key={index}>
                                                                                    <td>{index + 1}</td>
                                                                                    <td><select><option value={type.equip_id}>{type.equip_name}</option></select></td>
                                                                                    <td><select><option value={type.equip_id}>{type.equip_code}</option></select></td>
                                                                                </tr>
                                                                            ))} */}
                                                                        </tbody>
                                                                    </Table>
                                                                </div>

                                                                <div className='SaveButtonBox'>
                                                                    <div className='SaveButtonFlexBox'>
                                                                        <button type='button' className="DraftSaveBtn SubmitBtn" style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, false)}>Save Draft</button>
                                                                        <button type='button' style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, true)}>Submit</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
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

export default Rawmaterial;