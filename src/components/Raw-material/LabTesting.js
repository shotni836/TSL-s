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
import { decryptData, encryptData } from '../Encrypt-decrypt';

function Rawmaterial() {
    const token = secureLocalStorage.getItem('token');
    const userId = secureLocalStorage.getItem('empId');
    const searchParams = new URLSearchParams(document.location.search);
    const moduleId = searchParams.get('moduleId');
    let testingtype1 = searchParams.get('testingtype');
    let testingtype = decryptData(testingtype1)
    let menuId = searchParams.get('menuId');
    let action = searchParams.get('action');
    let procSheetId = searchParams.get('ProcessSheetID');
    let TestRunId1 = searchParams.get('TestRunId');
    let TestRunId = decryptData(TestRunId1)
    let ProcessSheetTypeID = searchParams.get('ProcessSheetTypeID');
    let TestId1 = searchParams.get('TestId');
    let TestId = decryptData(TestId1)
    const roleId = secureLocalStorage.getItem('roleId')
    let testingtypeval = "";

    if (testingtype == "608") {
        testingtypeval = "In Process Lab Testing";
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [continueCode, setContinueCode] = useState(false);
    const processSeqNo = useRef();
    const [inputCheckbox, setInputCheckbox] = useState({});
    const [sampleCheckbox, setSampleCheckbox] = useState({});
    const navigate = useNavigate();
    const [dateTimes, setDateTimes] = useState();
    const [coatingDates, setCoatingDates] = useState([]);
    const [coatingSelectedDate, setCoatingSelectedDate] = useState(null);
    const [coatingDate, setCoatingDate] = useState(null);
    const [shift, setShift] = useState();
    const [editRawMaterialList, setEditRawMaterialList] = useState([]);

    function editTransformData(data) {
        const uniqueCombinations = new Set();
        const reducedData = [];

        for (const item of data) {
            const combination = `${item.pm_pipe_code}-${item.pm_test_id}`;
            if (!uniqueCombinations.has(combination)) {
                uniqueCombinations.add(combination);
                reducedData.push(item);
            }
            if (reducedData.length === data % 2 === 0) {
                break;
            }
        }

        return reducedData;
    }

    const transformData = (data) => {
        const transformed = data.reduce((acc, item) => {
            let existing = acc.find(entry => entry.pm_pipe_id == item.pm_pipe_id);
            if (existing) {
                if (item.pm_value_type == 'N') {
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
                    hot: item.pm_value_type == 'N' ? null : {
                        initialReading: item.PM_Reqmnt_test_min,
                        finalReading: item.PM_Reqmnt_test_Max
                    },
                    normal: item.pm_value_type == 'N' ? {
                        initialReading: item.PM_Reqmnt_test_min,
                        finalReading: item.PM_Reqmnt_test_Max
                    } : null
                });
            }
            return acc;
        }, []);

        return transformed;
    };

    useEffect(() => {
        fetchYear();
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    const fetchEditDetails = async () => {
        try {
            setLoading(true);
            const testIdSend = (TestId == '293' || TestId == '986') ? '986' : TestId;
            const response = (testIdSend == '986') ?
                await axios.get(Environment.BaseAPIURL + `/api/User/GetIndentationDataById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId1}&test_id=${TestId1}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                : testIdSend == '325' ? await axios.post(Environment.BaseAPIURL + `/api/User/GetCalibrationblastingdataById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId1}&TestId=${TestId1}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                    : await axios.get(Environment.BaseAPIURL + `/api/User/GetInProcessLabFieldTestingById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId1}&TestId=${TestId1}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    })

            if (!response || !response.data || response.data.length === 0) {
                alert("Data not available. Redirecting to the previous page.");
                window.history.back();
                return;
            }

            setFormData(response?.data[0][0]);
            TestId == '986' ? setTableData(editTransformData(response?.data[1])) : setTableData(response?.data[1]);
            TestId == '325' ? setMatMafGrade(response?.data) : setMatMafGrade(response?.data[2]);
            TestId == '325' ? setIsRawMaterial(response?.data) : setIsRawMaterial(response?.data[2]);
            setDisable(true);
            initializeResultSuffixInput(response);
            if (response?.data && response?.data[1] && response?.data[1][0]) {
                setSelectedTestId(response?.data[1][0]?.pm_test_id);
            }
            const initialDateString = response?.data[1][0]?.thicknessDate;
            const initialDate = new Date(initialDateString);
            setCoatingSelectedDate(initialDate)
            setCoatingDate(response?.data[1][0]?.thicknessDate)
            setFormData((prevData) => ({
                ...prevData,
                ispqt: response?.data[0][0]?.pm_ispqt_id == 1 ? true : false,
            }))
            const procedureIds = response?.data[0][0]?.pm_Procedure_type_id.split(',').filter(value => value !== '').map(Number);
            const winoLabels = response?.data[0][0]?.WINO?.split(',');

            const procedures = procedureIds.map((id, index) => ({
                value: id,
                label: winoLabels[index] || ''
            }));
            setSelectedProcedures(procedures)
            setProcedures(procedures);
            const formattedData = formatDataForAPI(response?.data[2]);
            setEditRawMaterialList(formattedData)

            setInstrumentData(response?.data[3]);

            fetchTestOption(response?.data[1][0]?.pm_test_id, response?.data[0][0]?.psSeqNo);
            // setFormData((prevData) => [{ ...prevData, process_type: response?.data[1][0].pm_test_id }])
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("An error occurred while fetching data. Please try again.");
            window.history.back();
        } finally {
            setLoading(false);
        }
    };

    const initializeResultSuffixInput = (response) => {
        let updatedResultSuffixInput = {};
        let updatedResultInput = {};
        let updatedTemperatureInput = {};
        const updatedCheckboxState = {};
        let updatedSampleInput = {};
        let updatedResultMessage = {};
        let updatedSampleInput2 = {};

        let hot1 = {};
        let hot2 = {};
        let normal1 = {};
        let normal2 = {};

        let error = {};
        let time1 = {};

        let resultInputTemp = {};
        let resultInput1Temp = {};

        let resultInput2Temp = {};
        let resultInput3Temp = {};

        for (var i = 0; i < response?.data[1].length; i++) {
            const key = `${i}-0`; // Assuming rowIndex is 0 for initialization
            updatedResultSuffixInput[key] = response?.data[1][i]?.pm_test_result_suffix;
            updatedResultInput[key] = response?.data[1][i]?.pm_test_result_remarks;
            updatedTemperatureInput[key] = response?.data[1][i]?.pm_temperature1;
            updatedSampleInput[key] = response?.data[1][i]?.pm_sample_cut_size?.toString();
            updatedCheckboxState[key] = response?.data[1][i]?.pm_is_sample_cut == 1;
            // updatedSelectedOption[key] = response?.data[1][i]?.pm_reqmnt_temperature;
            // updatedInputCheckbox[key] = response?.data[1][i]?.pm_reqmnt_temperature;
            updatedResultMessage[key] = response?.data[1][i]?.pm_test_result_accepted == 1 ? 'Satisfactory' : 'Not Satisfactory';

            // updatedResultSuffixInput[key] = response?.data[1][i]?.pm_result_remark;
            // updatedCheckboxState[key] = response?.data[1][i]?.pm_is_sample_cut === true;
            hot1[key] = response?.data[1][i]?.pm_initial_val_hot?.toString();
            hot2[key] = response?.data[1][i]?.pm_final_val_hot?.toString();
            normal1[key] = response?.data[1][i]?.pm_initial_val_normal?.toString();
            normal2[key] = response?.data[1][i]?.pm_final_val_normal?.toString();

            error[key] = response?.data[1][i]?.pm_inst_error;
            time1[key] = response?.data[1][i]?.pm_test_time;

            updatedSampleInput2[key] = response?.data[1][i]?.pm_test_value2;

            setInputCheckbox(prevState => ({
                ...prevState,
                [key]: true,
            }));
        }

        setSampleCheckbox(prevState => ({
            ...prevState,
            ...updatedCheckboxState,
        }));

        TestId == '283' ? Object.keys(updatedResultInput).forEach(key => {
            const value = updatedResultInput[key];
            const resultInp = value.split('~');

            resultInputTemp[key] = resultInp[0] || '';
            resultInput1Temp[key] = resultInp[1] || '';
        }) :
            setResultInput(updatedResultInput);

        TestId == '284' || TestId == '304' ? Object.keys(updatedSampleInput2).forEach(key => {
            const value = updatedSampleInput2[key];
            const resultInp = value.split('~');

            resultInput2Temp[key] = resultInp[0] || '';
            resultInput3Temp[key] = resultInp[1] || '';
        })
            : setResultInput2();

        TestId == '283' ? setResultInput(resultInputTemp) : setResultInput(updatedResultInput);
        TestId == '283' ? setResultInput1(resultInput1Temp) : setResultInput(updatedResultInput);

        setResultInput2(resultInput2Temp);
        setResultInput3(resultInput3Temp);

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
            const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            setddlYear(response?.data);

            const response1 = await axios.get(Environment.BaseAPIURL + `/api/User/GetReportWiseRawMaterial?ReportId=${testingtype1}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            setIsRawMaterial(response1?.data);

            if (action == "edit") {
                fetchEditDetails()
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getHeaderData = async () => {
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?testingtype=${testingtype1}&year=${encryptData(formData?.psYear)}&processsheetno=${encryptData(formData?.psSeqNo)}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setFormData(response?.data?.Table[0]);
            setShift(response?.data?.Table5[0]);
            const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetThicknessDate?ProcessType=${encryptData('526')}&procsheetid=${encryptData(formData?.psSeqNo)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const excludedDates = response1?.data[0]?.map(item => new Date(item.thicknessdate));
            setCoatingDates(excludedDates);

            if (response1?.data) {
                fetchTestOption();
            }
        } catch (error) {
        }
    };

    const fetchTestOption = async (id_new, seq) => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetInprocessTestList?processsheetno=${encryptData(formData?.psSeqNo ? formData?.psSeqNo : seq)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            const data = response?.data;
            const L_data = data.filter(item => item.pm_test_type == "L");
            if (action == 'edit') {
                const testItem = data.find(item => item.pm_test_type_id == id_new.toString());
                setTestOption([testItem]);
            }
            else {
                setTestOption(L_data)
            }
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
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${encryptData(selectedId)}&test_id=${testingtype1}&mater_id=${(0)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const procedures = response?.data?.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setProcedures(procedures);
            setSelectedProcedures(procedures);
            const cdId = ['297', '298', '299', '300', '301', '302'];
            const hwiId = ['285', '295'];
            const instIdToSend = cdId.includes(selectedId) ? 297 : hwiId.includes(selectedId) ? 285 : selectedId;
            const response2 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${encryptData(instIdToSend)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
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

    const formatDateToISOString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const getMFRlist = async (testId) => {
        try {
            const testIdSend = (testId == '293' || testId == '986') ? '986' : testId;
            const endpoint = testIdSend == '986' ? 'GetIndentationTesting' : testIdSend == '325' ? 'GetCalibrationblastingdata' : 'GetInProcessLabTesting';

            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/${endpoint}`, {
                params: {
                    processsheetno: encryptData(formData.processsheetid),
                    testId: encryptData(testIdSend),
                    thiknessdate: encryptData(coatingDate)
                }, headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (testIdSend == '986') {
                setTableData(transformData(response?.data[0]));
            } else {
                setTableData(response?.data[0]);
                if (testIdSend != '325') {
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
        const batch = item.pm_batch == '0' ? null : item.pm_batch;
        acc[key].batches.push(batch);
        return acc;
    }, {});

    let groupedDataArray = Object.values(groupedData);
    const [selectedBatches, setSelectedBatches] = useState({});

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

    const determineMaxDate = () => {
        if (selectedTestId == '297' || TestId == '297' || selectedTestId == '285' || TestId == '285' || selectedTestId == '293' || TestId == '293' || selectedTestId == '986' || TestId == '986') {
            return new Date().setDate(new Date().getDate() - 1);
        } else if (selectedTestId == '300' || TestId == '300' || selectedTestId == '295' || TestId == '295') {
            return new Date().setDate(new Date().getDate() - 2);
        } else if (selectedTestId == '298' || TestId == '298') {
            return new Date().setDate(new Date().getDate() - 28);
        } else if (selectedTestId == '301' || TestId == '301') {
            return new Date().setDate(new Date().getDate() - 30);
        }
    };

    const filterPassedTime = (date) => {
        const currentDate = new Date();
        return currentDate.getTime() > date.getTime();
    };

    const handleDateChange = (date) => {
        if (filterPassedTime(date)) {
            setDateTimes(date);
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

    const [borderColor2, setBorderColor2] = useState({});
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

        if (value == '') {
            setBorderColor2(prevState => ({
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
            setBorderColor2(prevState => ({
                ...prevState,
                [key]: 'green',
            }));
        } else {
            setBorderColor2(prevState => ({
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
        const initialValue = parseFloat(hotSample1[key] || 0); // Get the current Initial Reading

        // Ensure that Final Reading is less than to Initial Reading
        if (temp > initialValue && !isNaN(initialValue)) {
            toast.error("Final Reading must be less than to Initial Reading.");
            return; // Prevent update
        }

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
        const initialValue = parseFloat(normalSample1[key] || 0); // Get the current Initial Reading

        // Ensure that Final Reading is less than to Initial Reading
        if (temp > initialValue && !isNaN(initialValue)) {
            toast.error("Final Reading must be less than to Initial Reading.");
            return; // Prevent update
        }

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
    const [resultInput1, setResultInput1] = useState({});
    const [resultInput2, setResultInput2] = useState({});
    const [resultInput3, setResultInput3] = useState({});
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

    const [borderColor1, setBorderColor1] = useState({});
    const [resultMessage1, setResultMessage1] = useState({});

    const handleResultInputChange1 = (e, index, rowIndex) => {
        const { value } = e.target;

        // Generate a unique key using both index and rowIndex
        const key = `${index}-${rowIndex}`;

        // Update result input state
        setResultInput1(prevState => ({
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
            setBorderColor1(prevState => ({
                ...prevState,
                [key]: '',
            }));
            setResultMessage1(prevState => ({
                ...prevState,
                [key]: '',
            }));
            return;
        }

        // Check if the input is alphanumeric or contains non-numeric characters (excluding decimal and negative sign)
        const isAlphanumeric = /[a-zA-Z]/.test(value);

        // If alphanumeric, always set as 'Satisfactory'
        if (isAlphanumeric) {
            setBorderColor1(prevState => ({
                ...prevState,
                [key]: 'green',
            }));
            setResultMessage1(prevState => ({
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
            setBorderColor1(prevState => ({
                ...prevState,
                [key]: 'red',
            }));
            setResultMessage1(prevState => ({
                ...prevState,
                [key]: 'Invalid Input',
            }));
            return;
        }

        // Fetch the item from tableData using the original index
        const item = tableData[index];

        // Ensure item properties are handled correctly
        const minRequirement = parseFloat(item.pm_reqmnt_temperature) - parseFloat(item.pm_reqmnt_temp_Minus);
        const maxRequirement = parseFloat(item.pm_reqmnt_temperature) + parseFloat(item.pm_reqmnt_temp_plus);

        // Validate the result against min and max requirements
        if ((isNaN(minRequirement) || result >= minRequirement) && (isNaN(maxRequirement) || result <= maxRequirement)) {
            setBorderColor1(prevState => ({
                ...prevState,
                [key]: 'green',
            }));
            setResultMessage1(prevState => ({
                ...prevState,
                [key]: 'Satisfactory',
            }));
        } else {
            setBorderColor1(prevState => ({
                ...prevState,
                [key]: 'red',
            }));
            setResultMessage1(prevState => ({
                ...prevState,
                [key]: 'Not Satisfactory',
            }));
        }
    };

    const handleResultInputChange2 = (e, index, rowIndex) => {
        const { value } = e.target;

        // Generate a unique key using both index and rowIndex
        const key = `${index}-${rowIndex}`;

        // Update result input state
        setResultInput2(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleResultInputChange3 = (e, index, rowIndex) => {
        const { value } = e.target;

        // Generate a unique key using both index and rowIndex
        const key = `${index}-${rowIndex}`;

        // Update result input state
        setResultInput3(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const [resultSuffixInput, setResultSuffixInput] = useState([]);

    const handleResultSuffixInputChange = (e, index, rowIndex) => {
        const { value } = e.target;
        const key = `${index}-${rowIndex}`; // Create a unique key

        setInputCheckbox(prevState => ({
            ...prevState,
            [key]: value !== '',
        }));

        setResultSuffixInput(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleSubmit = async (e, value) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true)

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
            if (resultMessage[x] === "Not Satisfactory" && continueCode === false) {
                setModalShow(true)
                return
            }
        }

        if (action != 'edit' && rawMaterialData.length < 1 && (selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302' || TestId == '297' || TestId == '298' || TestId == '299' || TestId == '300' || TestId == '301' || TestId == '302')) {
            toast.error("You didn't select any material");
            return;
        }

        const testsData = (selectedTestId == '293' || selectedTestId == '986' || TestId == '293' || TestId == '986')
            ? tableData
                .flatMap((item, index) =>
                    Array.from({ length: numRows }).map((_, rowIndex) => {
                        const key = `${index}-${rowIndex}`;
                        return {
                            ...item,
                            initial_val_hot: hotSample1[key],
                            final_val_hot: hotSample2[key],
                            result_hot: (parseFloat(hotSample1[key]).toFixed(2) - parseFloat(hotSample2[key]).toFixed(2)) || '',
                            initial_val_normal: normalSample1[key],
                            final_val_normal: normalSample2[key],
                            result_normal: (parseFloat(normalSample1[key]).toFixed(2) - parseFloat(normalSample2[key]).toFixed(2)) || '',
                            result_remarks: resultSuffixInput[key] || '',
                            pm_is_sample_cut: sampleCheckbox[key] || '0',
                            pm_sample_cut_size: sampleInput[key] || '0',
                            index
                        };
                    })
                )
                .filter(entry => entry.result_remarks.trim() !== '')
                .map((entry, idx) => ({
                    initial_val_hot: entry.initial_val_hot || '',
                    final_val_hot: entry.final_val_hot || '',
                    result_hot: (entry.result_hot).toString() || '',
                    initial_val_normal: entry.initial_val_normal || '',
                    final_val_normal: entry.final_val_normal || '',
                    result_normal: (entry.result_normal).toString() || '',
                    result_remarks: entry.result_remarks,
                    seqno: (idx + 1).toString(),
                    pipe_id: (entry.pm_pipe_id).toString(),
                    temperature1: entry.temperature1,
                    test_id: '986',
                    pm_is_sample_cut: entry.pm_is_sample_cut == true ? "1" : "0",
                    pm_sample_cut_size: entry.pm_sample_cut_size,
                    thicknessDate: coatingDate,
                    pm_test_result_id: entry.pm_test_result_id ? entry.pm_test_result_id : 0
                }))
            : selectedTestId == '325' ?
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
                        pm_test_result_id: entry.pm_test_result_id ? entry.pm_test_result_id : 0
                    }))
                : tableData
                    .flatMap((item, index) =>
                        Array.from({ length: numRows }).map((_, rowIndex) => {
                            const key = `${index}-${rowIndex}`;
                            return {
                                ...item,
                                temperature1: temperatureInput[key] || '0',
                                test_result_accepted: resultMessage[key] === 'Satisfactory' ? "1" : "0",
                                test_result_remarks: selectedTestId != 283 ? resultInput[key] || '' : `${resultInput[key]}~${resultInput1[key]}`,
                                test_value1: selectedTestId == 304 || selectedTestId == 284 || TestId == 304 || TestId == 284 ? `${resultInput2[key]}~${resultInput3[key]}` || '0' : '0',
                                test_result_suffix: resultSuffixInput[key] || '',
                                pm_is_sample_cut: sampleCheckbox[key] || '0',
                                pm_sample_cut_size: sampleInput[key] || '0',
                                index
                            };
                        })
                    )
                    .filter(entry => entry.test_result_suffix?.trim() !== '')
                    .map((entry, idx) => ({
                        seqno: (idx + 1).toString(),
                        pipe_id: (entry.pm_pipe_id).toString(),
                        temperature1: (entry.temperature1).toString(),
                        test_result_accepted: entry.test_result_accepted,
                        test_result_remarks: entry.test_result_remarks,
                        test_result_suffix: entry.test_result_suffix,
                        test_value1: entry.test_value1,
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
                        thicknessDate: coatingDate,
                        pm_test_result_id: entry.pm_test_result_id ? entry.pm_test_result_id : 0
                    }));

        const dataToSend = {
            co_comp_id: '1',
            co_location_id: '1',
            roleId: parseInt(roleId),
            project_id: formData?.projectid.toString(),
            procsheet_id: formData?.processsheetid.toString(),
            testdate: (selectedTestId == '325') ? new Date().toLocaleString("sv-SE").split(" ").join("T") : dateTimes ? new Date(dateTimes).toLocaleString("sv-SE").split(" ").join("T") : formData?.testdate,
            shift: action === 'edit' ? formData?.pm_shift_id.toString() : shift?.pm_shift_id.toString(),
            ispqt: formData?.ispqt === true ? formData?.ispqt.toString() : "false",
            created_by: userId.toString(),
            userid: userId.toString(),
            process_type: formData?.processtypeid ? formData?.processtypeid.toString() : testingtype.toString(),
            procedure_type: selectedProcedures ? selectedProcedures.map(proc => proc.value).join(',') + "," : '0',
            rm_batch: "0",
            material_id: "0",
            manufacturer_id: "0",
            grade_id: "0",
            isSubmit: value,
            testsData,
            rawMaterialData: action === 'edit' ? editRawMaterialList : rawMaterialData,
            test_run_id: TestRunId ? TestRunId.toString() : '0',
            instrumentData,
            subtype_id: (selectedTestId == '293' || selectedTestId == '986') ? '986' : selectedTestId.toString()
        };

        try {
            const testIdSend = (selectedTestId == '293' || selectedTestId == '986' || TestId == '293' || TestId == '986') ? '986' : selectedTestId;
            const endpoint = testIdSend == '986' ? `SaveIndentationtestData` : selectedTestId == '325' ? `SaveCalibrationblastingdata` : `SaveInProcessLabFieldData`;

            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/${endpoint}`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            setIsSubmitting(false);
            if (response.status == 200 && response.data == 1000) {
                toast.success("Data saved successfully!");
                console.log("Form data sent successfully!");
                navigate(`/rawmateriallist?moduleId=${moduleId}&menuId=${menuId}&testingtype=${testingtype1}`);
            } else {
                console.error("Failed to send form data to the server. Status code:", response.status);
                toast.error("Failed to save data. Please try again later.");
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Issue in saving the data. Please try again.');
        } finally {
            setLoading(false)
        }
    };

    // const handleRemoveInstrument = (event, index) => {
    //     event.preventDefault();
    //     setInstrumentData((prevData) => prevData.filter((_, i) => i !== index));
    // };

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
                                            <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li> <Link to={`/inspectiontesting?moduleId=${moduleId}&menuId=${menuId}`}>Testing</Link> <b style={{ color: '#fff' }}></b></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li> <Link to={`/rawmateriallist?moduleId=${moduleId}&menuId=${menuId}&testingtype=${testingtype1}`}>{testingtypeval} List </Link> <b style={{ color: '#fff' }}></b></li>
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
                                                    { label: "Shift", value: action === 'edit' ? formData?.pm_shiftvalue : shift?.pm_shiftvalue },
                                                    { label: "Date", value: new Date(formData?.testdate).toLocaleDateString("en-GB") }
                                                ].map((field, idx) => (
                                                    <div key={idx} className="form-group col-md-4 col-sm-4 col-xs-12">
                                                        <label>{field.label}</label>
                                                        <input type="text" value={field.value} placeholder={field.label} readOnly />
                                                    </div>
                                                ))}

                                                {selectedTestId !== '325' && <div className='col-md-4 col-sm-4 col-xs-12'>
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

                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor="testType">Test Type</label>
                                                        <select id="testType" value={selectedTestId} onChange={handleTestTypeChange} >
                                                            <option selected disabled value="" >Select type</option>
                                                            {testOption?.map(option => (
                                                                !option.co_param_val_name.toLowerCase().includes("hot") && (
                                                                    <option key={option.pm_test_type_id} value={option.pm_test_type_id}>{option.co_param_val_name}</option>
                                                                )))}
                                                        </select>
                                                    </div>
                                                </div>

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
                                                            {selectedTestId !== '325' &&
                                                                <div className="accordion FrequencyaccordionSection" id="accordionExample">
                                                                    <div className="accordion-item" id="headingOne">
                                                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">Frequency: {frequency}</button>
                                                                        <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                                            <div className="accordion-body">
                                                                                <div className="Frequencytable">
                                                                                    <div style={{ overflow: 'auto' }} id='custom-scroll'>
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
                                                                    </div>
                                                                </div>}
                                                        </div>
                                                        {isRawMaterial.length && (selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302' || selectedTestId == '303' || TestId == '297' || TestId == '298' || TestId == '299' || TestId == '300' || TestId == '301' || TestId == '302' || TestId == '303') && groupedDataArray.some(item =>
                                                            ["Adhesive", "Fusion Bonded Epoxy", "High Density Polyethylene"].includes(item.Material)) ?
                                                            <>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                                <div className="Frequencytable">
                                                                    {/* <div style={{ overflow: 'auto' }} id='custom-scroll'> */}
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
                                                                                if (selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302' || TestId == '297' || TestId == '298' || TestId == '299' || TestId == '300' || TestId == '301' || TestId == '302') {
                                                                                    return ["Adhesive", "Fusion Bonded Epoxy", "High Density Polyethylene"].includes(item.Material);
                                                                                }
                                                                                if (selectedTestId == '303' || TestId == '303') {
                                                                                    return ["High Density Polyethylene"].includes(item.Material);
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
                                                                                                {action == 'edit' ? (
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
                                                                    {/* </div> */}
                                                                </div>
                                                            </>
                                                            : ''}
                                                        <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                        <div className='row'>
                                                            <div className='col-md-3'>
                                                                <div>
                                                                    <label>No. of Samples</label>
                                                                    <input type='number' min='0' value={numRows} onChange={(e) => setNumRows(e.target.value)} className='form-control mb-3' placeholder='Enter no. of samples' style={{ maxWidth: '200px' }} />
                                                                </div>
                                                            </div>
                                                            {selectedTestId == '285' || selectedTestId == '295' || selectedTestId == '297' || selectedTestId == '298' || selectedTestId == '299' || selectedTestId == '300' || selectedTestId == '301' || selectedTestId == '302' || selectedTestId == '986' || selectedTestId == '293' ? <div className='col-md-3'>
                                                                <div>
                                                                    <label>Test Start Date/Time</label>
                                                                    <DatePicker
                                                                        selected={dateTimes ? new Date(dateTimes) : new Date(formData?.testdate)}
                                                                        onChange={(date) => handleDateChange(date)}
                                                                        showTimeSelect
                                                                        dateFormat="dd/MM/yyyy , p"
                                                                        className='form-control'
                                                                        timeFormat="h:mm aa"
                                                                        placeholderText="Select date and time"
                                                                        minDate={new Date(coatingSelectedDate)}
                                                                        maxDate={determineMaxDate()}
                                                                        timeIntervals={1}
                                                                    />
                                                                </div>
                                                            </div> : ''}
                                                            {selectedTestId != '285' ? <div className='col-md-3'>
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
                                                                    {selectedTestId == '293' || selectedTestId == '986' || TestId == '293' || TestId == '986' ?
                                                                        <Table id='subtesttbl'>
                                                                            <thead>
                                                                                <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                    <th></th>
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
                                                                                    <th style={{ minWidth: '70px' }}></th>
                                                                                    <th rowSpan={2} style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                    <th rowSpan={2} style={{ minWidth: '100px' }}>Pipe No.</th>
                                                                                    <th style={{ minWidth: '120px' }}>Initial Reading</th>
                                                                                    <th style={{ minWidth: '100px' }}>Final Reading</th>
                                                                                    <th style={{ minWidth: '120px' }}>Initial Reading</th>
                                                                                    <th style={{ minWidth: '100px' }}>Final Reading</th>
                                                                                    <th style={{ minWidth: '70px' }}>Sample Cut Required</th>
                                                                                    <th style={{ minWidth: '100px' }}>Sample Cut Size</th>
                                                                                    <th rowSpan={2} style={{ minWidth: '180px' }}>Reference Standard</th>
                                                                                    <th rowSpan={2} style={{ minWidth: '200px' }}>Remarks</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {tableData.length === 0 ? (
                                                                                    <tr><td colSpan="11">Data not available.</td></tr>
                                                                                ) : (
                                                                                    tableData?.map((item, index) => (
                                                                                        Array.from({ length: numRows }).map((_, rowIndex) => {
                                                                                            const key = `${index}-${rowIndex}`;
                                                                                            const seqno = (index * numRows + rowIndex + 1).toString();
                                                                                            return (
                                                                                                <tr key={key}>
                                                                                                    <td><input type='checkbox' checked={inputCheckbox[key] || false} /></td>
                                                                                                    <td>{seqno}</td>
                                                                                                    <td>{item.pm_pipe_code ? item.pm_pipe_code : item.co_param_val_name}</td>
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
                                                                                                    <td>
                                                                                                        <input type='checkbox' checked={sampleCheckbox[key] || false} onChange={() => handleCheckboxChange(index, rowIndex)} />
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <input type='text' className='form-control' value={sampleInput[key] || ''}
                                                                                                            onChange={(e) => handleSampleInputChange(e, index, rowIndex)} disabled={!sampleCheckbox[key]} />
                                                                                                    </td>
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
                                                                                    )))}
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
                                                                                    {tableData.length === 0 ? (
                                                                                        <tr><td colSpan="9">Data not available.</td></tr>
                                                                                    ) : (
                                                                                        tableData?.map((item, index) => (
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
                                                                                                            }{item?.Unit === "NA" ? "" : " " + item.Unit}
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
                                                                                        )))}
                                                                                </tbody>
                                                                            </Table> :
                                                                            selectedTestId == '283' || TestId == '283' ?
                                                                                <Table id='subtesttbl'>
                                                                                    <thead>
                                                                                        <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                            <th style={{ minWidth: '70px' }}></th>
                                                                                            <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                            <th style={{ minWidth: '170px' }}>Test Description / Pipe No.</th>
                                                                                            <th style={{ minWidth: '180px' }}>Reference Standard</th>
                                                                                            <th style={{ minWidth: '70px' }}>Sample Cut Required</th>
                                                                                            <th style={{ minWidth: '100px' }}>Sample Cut Size</th>
                                                                                            <th style={{ minWidth: '50px' }}>ΔTg</th>
                                                                                            <th style={{ minWidth: '160px' }}>Result</th>
                                                                                            <th style={{ minWidth: '50px' }}>CURE </th>
                                                                                            <th style={{ minWidth: '160px' }}>Result</th>
                                                                                            <th style={{ minWidth: '180px' }}>Result Suffix</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {tableData.length === 0 ? (
                                                                                            <tr><td colSpan="11">Data not available.</td></tr>
                                                                                        ) : (
                                                                                            tableData?.map((item, index) => (
                                                                                                Array.from({ length: numRows }).map((_, rowIndex) => {
                                                                                                    const key = `${index}-${rowIndex}`;
                                                                                                    const seqno = (index * numRows + rowIndex + 1).toString();
                                                                                                    return (
                                                                                                        <tr key={key}>
                                                                                                            <td><input type='checkbox' checked={inputCheckbox[key] || false} /></td>
                                                                                                            <td>{seqno}</td>
                                                                                                            <td>{item.pm_pipe_code ? item.pm_pipe_code : item.co_param_val_name}</td>
                                                                                                            <td>{item.ReferenceStandard} ({item?.pm_tm_publication_yr})</td>
                                                                                                            <td><input type='checkbox' checked={sampleCheckbox[key] || false} onChange={() => handleCheckboxChange(index, rowIndex)} /></td>
                                                                                                            <td>
                                                                                                                <input type='text' className='form-control' value={sampleInput[key] || ''}
                                                                                                                    onChange={(e) => handleSampleInputChange(e, index, rowIndex)} disabled={!sampleCheckbox[key]} />
                                                                                                            </td>
                                                                                                            <td>{item.PM_Reqmnt_test_min}</td>
                                                                                                            <td>
                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                    <input
                                                                                                                        type='text'
                                                                                                                        value={resultInput[key] || ''}
                                                                                                                        onChange={(e) => handleResultInputChange(e, index, rowIndex)}
                                                                                                                        style={{ borderColor: borderColor[key] }}
                                                                                                                        placeholder='Enter result'
                                                                                                                    />
                                                                                                                    {selectedTestId == '304' || selectedTestId == '287' || selectedTestId == '285' || selectedTestId == '295' ? '' : <div style={{ marginLeft: '5px' }}>{item?.Unit === "NA" ? "" : " " + item.Unit}</div>}
                                                                                                                </div>
                                                                                                                <span>{resultMessage[key]}</span>
                                                                                                            </td>
                                                                                                            <td>{item.pm_reqmnt_temperature}</td>
                                                                                                            <td>
                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                    <input
                                                                                                                        type='text'
                                                                                                                        value={resultInput1[key] || ''}
                                                                                                                        onChange={(e) => handleResultInputChange1(e, index, rowIndex)}
                                                                                                                        style={{ borderColor: borderColor1[key] }}
                                                                                                                        placeholder='Enter result'
                                                                                                                    />
                                                                                                                    {selectedTestId == '304' || selectedTestId == '287' || selectedTestId == '285' || selectedTestId == '295' ? '' : <div style={{ marginLeft: '5px' }}>{item?.Unit === "NA" ? "" : " " + item.Unit}</div>}
                                                                                                                </div>
                                                                                                                <span>{resultMessage1[key]}</span>
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
                                                                                            )))}
                                                                                    </tbody>
                                                                                </Table> :
                                                                                <Table id='subtesttbl'>
                                                                                    <thead>
                                                                                        <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                            <th style={{ minWidth: '70px' }}></th>
                                                                                            <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                            <th style={{ minWidth: '170px' }}>Test Description / Pipe No.</th>
                                                                                            <th style={{ minWidth: '180px' }}>Reference Standard</th>
                                                                                            <th style={{ minWidth: '200px' }}>Acceptance Criteria</th>
                                                                                            <th style={{ minWidth: '70px' }}>Sample Cut Required</th>
                                                                                            <th style={{ minWidth: '100px' }}>Sample Cut Size</th>
                                                                                            {(tableData[0]?.pm_reqmnt_temperature == '' ? '' : <th style={{ minWidth: '200px' }}>Temperature</th>)}
                                                                                            <th style={{ minWidth: '160px' }}>Result</th>
                                                                                            <th style={{ minWidth: '180px' }}>Result Suffix</th>
                                                                                            {selectedTestId == '304' || TestId == '304' || selectedTestId == '284' || TestId == '284' ? <th style={{ minWidth: '180px' }}>Required Mandrel radius</th> : ''}
                                                                                            {selectedTestId == '304' || TestId == '304' || selectedTestId == '284' || TestId == '284' ? <th style={{ minWidth: '180px' }}>Used Mandrel radius</th> : ''}
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {tableData.length === 0 ? (
                                                                                            <tr><td colSpan="12">Data not available.</td></tr>
                                                                                        ) : (
                                                                                            tableData?.map((item, index) => (
                                                                                                Array.from({ length: numRows }).map((_, rowIndex) => {
                                                                                                    const key = `${index}-${rowIndex}`;
                                                                                                    const seqno = (index * numRows + rowIndex + 1).toString();
                                                                                                    return (
                                                                                                        <tr key={key}>
                                                                                                            <td><input type='checkbox' checked={inputCheckbox[key] || false} /></td>
                                                                                                            <td>{seqno}</td>
                                                                                                            <td>{item.pm_pipe_code ? item.pm_pipe_code : item.co_param_val_name}</td>
                                                                                                            <td>{item.ReferenceStandard} ({item?.pm_tm_publication_yr})</td>
                                                                                                            <td>{item.pm_reqmnt_suffix}</td>
                                                                                                            <td><input type='checkbox' checked={sampleCheckbox[key] || false} onChange={() => handleCheckboxChange(index, rowIndex)} /></td>
                                                                                                            <td>
                                                                                                                <input type='text' className='form-control' value={sampleInput[key] || ''}
                                                                                                                    onChange={(e) => handleSampleInputChange(e, index, rowIndex)} disabled={!sampleCheckbox[key]} />
                                                                                                            </td>
                                                                                                            {item.pm_reqmnt_temperature !== ''
                                                                                                                ? (
                                                                                                                    <td>
                                                                                                                        {item.pm_reqmnt_temperature ? `${parseFloat(item.pm_reqmnt_temperature) - parseFloat(item.pm_reqmnt_temp_Minus)}-${parseFloat(item.pm_reqmnt_temperature) + parseFloat(item.pm_reqmnt_temp_plus)}` : ''}
                                                                                                                        <input
                                                                                                                            type="number"
                                                                                                                            value={temperatureInput[key] || ''}
                                                                                                                            onChange={(e) => handleTemperatureInputChange(e, index, rowIndex)}
                                                                                                                            style={{ borderColor: borderColor2[key] }}
                                                                                                                            placeholder='Enter temperature'
                                                                                                                        />
                                                                                                                    </td>
                                                                                                                ) : null}
                                                                                                            <td>
                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                    <input
                                                                                                                        type='text'
                                                                                                                        value={resultInput[key] || ''}
                                                                                                                        onChange={(e) => handleResultInputChange(e, index, rowIndex)}
                                                                                                                        style={{ borderColor: borderColor[key] }}
                                                                                                                        placeholder='Enter result'
                                                                                                                    />
                                                                                                                    {selectedTestId == '304' || selectedTestId == '287' || selectedTestId == '285' || selectedTestId == '295' ? '' : <div style={{ marginLeft: '5px' }}>{item?.Unit === "NA" ? "" : " " + item.Unit}</div>}
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
                                                                                                            {selectedTestId == '304' || TestId == '304' || selectedTestId == '284' || TestId == '284' ?
                                                                                                                <td>
                                                                                                                    <input
                                                                                                                        type='text'
                                                                                                                        value={resultInput2[key] || ''}
                                                                                                                        onChange={(e) => handleResultInputChange2(e, index, rowIndex)}
                                                                                                                        placeholder='Enter required Mandrel radius'
                                                                                                                    />
                                                                                                                </td> : ''}
                                                                                                            {selectedTestId == '304' || TestId == '304' || selectedTestId == '284' || TestId == '284' ?
                                                                                                                <td>
                                                                                                                    <input
                                                                                                                        type='text'
                                                                                                                        value={resultInput3[key] || ''}
                                                                                                                        onChange={(e) => handleResultInputChange3(e, index, rowIndex)}
                                                                                                                        placeholder='Enter used Mandrel radius'
                                                                                                                    />
                                                                                                                </td> : ''}
                                                                                                        </tr>
                                                                                                    );
                                                                                                })
                                                                                            )))}
                                                                                    </tbody>
                                                                                </Table>
                                                                    }
                                                                </div>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                                    <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                                                        <Table id='insttbl'>
                                                                            <thead>
                                                                                <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                    <th colSpan={3} style={{ fontSize: '12px', textAlign: 'center' }}> Instrument to be Used</th>
                                                                                </tr>
                                                                                <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                    <td style={{ maxWidth: '60px', background: 'whitesmoke' }}>Sr. No.</td>
                                                                                    <td style={{ maxWidth: '60px', background: 'whitesmoke' }}>Instrument Name</td>
                                                                                    <td style={{ minWidth: '60px', background: 'whitesmoke' }}>Instrument ID/Serial No.</td>
                                                                                    {/* <td style={{ minWidth: '20px', background: 'whitesmoke' }}>Action</td> */}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {instrumentData.length === 0 ? (
                                                                                    <tr><td colSpan="3">Instrument not available.</td></tr>
                                                                                ) : (
                                                                                    instrumentData?.map((tests, index) => (
                                                                                        <tr key={index}>
                                                                                            <td>{index + 1}</td>
                                                                                            <td>{tests.equip_name}</td>
                                                                                            <td>
                                                                                                <select name="" id="">
                                                                                                    <option value="">-- Select instrument id/ serial no.--{" "}</option>
                                                                                                    <option value={tests.equip_code} selected>{tests.equip_code}</option>
                                                                                                </select>
                                                                                            </td>
                                                                                            {/* <td>
                                                                                                <button
                                                                                                    onClick={(event) => handleRemoveInstrument(event, index)} disabled={instrumentData.length === 1}>
                                                                                                    <i className="fas fa-trash-alt"></i>
                                                                                                </button>
                                                                                            </td> */}
                                                                                        </tr>
                                                                                    )))}
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                </div>

                                                                <div className='SaveButtonBox'>
                                                                    <div className='SaveButtonFlexBox'>
                                                                        <button type='button' className="DraftSaveBtn SubmitBtn" style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, false)} disabled={loading}>{loading ? 'Saving...' : 'Save Draft'}</button>
                                                                        <button type='button' style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, true)} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
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