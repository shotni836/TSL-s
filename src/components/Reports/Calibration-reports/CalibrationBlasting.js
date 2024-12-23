import React, { useEffect, useState } from 'react'
import Environment from '../../../environment';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../Loading';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../Common/Header/Header';
import Select from "react-select";
import RegisterEmployeebg from '../../../assets/images/RegisterEmployeebg.jpg';
import { Table } from 'react-bootstrap';
import secureLocalStorage from 'react-secure-storage';
import DatePicker from 'react-datepicker';

const CalibrationBlasting = () => {

    useEffect(() => {
        if (action == 'edit') {
            fetchEditDetails();
        }
        else {
            getHeaderData();
        }
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    const [procedures, setProcedures] = useState([]);
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [sampleInput, setSampleInput] = useState({});
    const searchParams = new URLSearchParams(document.location.search);
    const [disable, setDisable] = useState(false);
    const userId = secureLocalStorage.getItem("empId")
    const navigate = useNavigate()
    const [selectedTime, setSelectedTime] = useState({});
    const now = new Date();
    const [resultSuffixInput, setResultSuffixInput] = useState([]);

    let action = searchParams.get('action');
    let procSheetId = searchParams.get('ProcessSheetID');
    let TestRunId = searchParams.get('TestRunId');
    let ProcessSheetTypeID = searchParams.get('ProcessSheetTypeID');
    let year = searchParams.get('year');
    let menuId = searchParams.get('menuId');

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

    const TestId = ProcessSheetTypeID == '1398' ? '324' : ProcessSheetTypeID == '1400' ? '323' : '325'
    const fetchEditDetails = async () => {
        const response = TestId == '325' ? await axios.post(Environment.BaseAPIURL + `/api/User/GetCalibrationblastingdataById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}&TestId=${TestId}`)
            : await axios.post(Environment.BaseAPIURL + `/api/User/GetCalibrationblastingdataById?ProcessSheetID=${procSheetId}&ProcessSheetTypeID=${ProcessSheetTypeID}&TestRunId=${TestRunId}&TestId=${TestId}`)
        setFormData(response?.data[0][0]);
        setTableData(response?.data[1]);
        initializeResultSuffixInput(response);
        setDisable(true);
        setFormData((prevData) => ({
            ...prevData,
            ispqt: response?.data[0][0]?.pm_ispqt_id == 1 ? true : false,
        }))
        const procedureIds = response?.data[0][0]?.pm_Procedure_type_id.split(',').filter(value => value !== '').map(Number);
        const winoLabels = response?.data[0][0]?.WINO.split(',');

        const procedures = procedureIds?.map((id, index) => ({
            value: id,
            label: winoLabels[index] || ''
        }));

        setSelectedProcedures(procedures)
        setProcedures(procedures);
    }

    const initializeResultSuffixInput = (response) => {
        let updatedResultSuffixInput = {};
        let updatedSampleInput = {};
        let error = {};
        let time1 = {};

        for (var i = 0; i < response?.data[1].length; i++) {
            const key = `${i}-0`; // Assuming rowIndex is 0 for initialization
            updatedResultSuffixInput[key] = response?.data[1][i].pm_remarks;
            updatedSampleInput[key] = response?.data[1][i].pm_inst_reading;
            error[key] = response?.data[1][i].pm_inst_error;
            time1[key] = response?.data[1][i].pm_test_time;
        }

        setResultSuffixInput(updatedResultSuffixInput);
        setSampleInput(updatedSampleInput)
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

    const getHeaderData = async (data) => {
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?testingtype=${ProcessSheetTypeID}&year=${year}&processsheetno=${procSheetId}`);
            setFormData(response?.data?.Table[0]);

            const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCalibrationblastingdata?processsheetno=${procSheetId}&testid=${ProcessSheetTypeID}`);
            setTableData(response1?.data[0]);

            const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?test_id=${ProcessSheetTypeID}&mater_id=0`);
            const procedures = response2?.data?.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setProcedures(procedures);
            setSelectedProcedures(procedures);
            setDisable(true)
        } catch (error) {
        }
    };

    const [borderColor, setBorderColor] = useState({});
    const [resultMessage, setResultMessage] = useState({});

    const handleSampleInputChange = (e, index, rowIndex) => {
        const { value } = e.target;

        // Generate a unique key using both index and rowIndex
        const key = `${index}-${rowIndex}`;

        // Update result input state
        setSampleInput(prevState => ({
            ...prevState,
            [key]: value,
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
        const minRequirement = parseFloat(item.workrangemin);
        const maxRequirement = parseFloat(item.workrangemax);

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

    const handleResultSuffixInputChange = (e, index, rowIndex) => {
        const { value } = e.target;
        const key = `${index}-${rowIndex}`; // Create a unique key

        setResultSuffixInput(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleTimeChange = (e, index, rowIndex) => {
        const key = `${index}-${rowIndex}`; // Use a combined key

        setSelectedTime(prevState => ({
            ...prevState,
            [key]: e,
        }));
    };

    const handleSubmit = async (e, value) => {
        e.preventDefault();
        setLoading(true);
        const testsData = tableData
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
                pm_inst_reading: entry.sampleInput.toString(),
                pm_inst_error: entry.pm_inst_error.toString(),
                pm_test_time: entry.selectedTime.toLocaleString("sv-SE").split(" ")[1],
                pm_remarks: entry.resultSuffixInput,
            }));

        const dataToSend = {
            project_id: formData?.projectid.toString(),
            procsheet_id: formData?.processsheetid.toString(),
            testdate: formData?.testdate,
            shift: formData?.pm_shift_id.toString(),
            ispqt: formData?.ispqt === true ? formData?.ispqt.toString() : "false",
            userid: userId,
            process_type: ProcessSheetTypeID,
            procedure_type: selectedProcedures ? selectedProcedures?.map(proc => proc.value).join(',') + "," : '0',
            rm_batch: "0",
            material_id: "0",
            manufacturer_id: "0",
            grade_id: "0",
            testsData,
            subtype_id: tableData[0].pm_test_id,
            co_comp_id: 1,
            co_location_id: 1,
            isSubmit: value,
            test_run_id: action == 'edit' ? formData?.pm_test_run_id : '0'
        };

        try {
            const response = await axios.post(Environment.BaseAPIURL + '/api/User/SaveCalibrationblastingdata', dataToSend);
            ProcessSheetTypeID == '608' ? navigate(`/rawmateriallist?menuId=24&testingtype=608`) : navigate(`/blastingsheetlist?menuId=${menuId}`);
            if (response.data === 1000) {
                toast.success("Data saved successfully!");
                console.log("Form data sent successfully!");
                navigate(`/inspectiontesting?menuId=${24}`);
            } else {
                toast.error("Failed to save.");
                console.error("Failed to send form data to the server. Status code:", response.status);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error in submitting data.');
        } finally {
            setLoading(false)
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
                                            <li> <Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                                            <li><h1>/ &nbsp; Calibration Report </h1></li>
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
                                                <div className='col-md-12 col-sm-12 col-xs-12'><h4>Calibration Report <span>- Add page</span></h4></div>
                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor="">Process Sheet</label>
                                                        <div className='ProcessSheetFlexBox'>
                                                            <input
                                                                name="processSheet"
                                                                placeholder='Process sheet'
                                                                value={formData?.processsheetcode || ''}
                                                                style={{ width: '66%', cursor: 'not-allowed' }}
                                                            />
                                                            <select name="psYear" value={year} >
                                                                <option value={year}> {year} </option>
                                                            </select>
                                                            <b>-</b>
                                                            <input
                                                                type="number"
                                                                name="psSeqNo"
                                                                value={formData?.processsheetid}
                                                                placeholder='No.'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {[
                                                    { label: "Client Name", value: formData?.clientname },
                                                    { label: "Project Name", value: formData?.projectname },
                                                    { label: "Pipe Size", value: formData?.pipesize },
                                                    { label: "Type Of Coating", value: formData?.typeofcoating },
                                                    { label: "Shift", value: formData?.pm_shiftvalue },
                                                    { label: "Date", value: new Date(formData?.testdate).toLocaleDateString("en-GB") }
                                                ].map((field, idx) => (
                                                    <div key={idx} className="form-group col-md-4 col-sm-4 col-xs-12">
                                                        <label>{field.label}</label>
                                                        <input type="text" value={field.value} placeholder={field.label} readOnly />
                                                    </div>
                                                ))}

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
                                                        </div>
                                                        {/* <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div> */}
                                                        {/* <div className='row'>
                                                            <div className='col-md-3 mb-3'>
                                                                <div>
                                                                    <label>Type of Coating</label>
                                                                    <select className='form-control' required>
                                                                        <option value=''>Select Type of Coating</option>
                                                                        <option value='3LPE'>3LPE</option>
                                                                        <option value='3LPP'>3LPP</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div> */}
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className='PipeDescriptionDetailsTable'>
                                                                <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                                                    <Table id='subtesttbl'>
                                                                        <thead>
                                                                            <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                                <th style={{ minWidth: '170px' }}>Instrument Name</th>
                                                                                <th style={{ minWidth: '180px' }}>Make</th>
                                                                                <th style={{ minWidth: '120px' }}>Standard Reading</th>
                                                                                <th style={{ minWidth: '130px' }}>Accuracy of reading</th>
                                                                                <th style={{ minWidth: '120px' }}>Actual Reading Of The Instrument</th>
                                                                                <th style={{ minWidth: '100px' }}>ERROR</th>
                                                                                <th style={{ minWidth: '110px' }}>TIME</th>
                                                                                <th style={{ minWidth: '150px' }}>Remarks</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {tableData?.map((item, index) => (
                                                                                Array.from({ length: 1 }).map((_, rowIndex) => {
                                                                                    const key = `${index}-${rowIndex}`;
                                                                                    const seqno = (index * 1 + rowIndex + 1).toString();
                                                                                    return (
                                                                                        <tr key={key}>
                                                                                            <td>{seqno}</td>
                                                                                            <td>{item.InstrumentName || "-"}</td>
                                                                                            <td>{item.Make || "-"}</td>
                                                                                            <td>{item.workrangemin + "-" + item.workrangemax || "-"}{item.Unit == "NA" ? "" : " " + item.Unit}</td>
                                                                                            <td>
                                                                                                {item.pm_value_type === "A" ? item.pm_test_value :
                                                                                                    (item.PM_Reqmnt_test_min && item.PM_Reqmnt_test_Max) ?
                                                                                                        `${item.PM_Reqmnt_test_min} - ${item.PM_Reqmnt_test_Max}` :
                                                                                                        (item.PM_Reqmnt_test_min ? `Min - ${item.PM_Reqmnt_test_min}` :
                                                                                                            (item.PM_Reqmnt_test_Max ? `Max - ${item.PM_Reqmnt_test_Max}` : ''))
                                                                                                }
                                                                                            </td>
                                                                                            <td>
                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                    <input type='text'
                                                                                                        className='form-control'
                                                                                                        value={sampleInput[key] || ''}
                                                                                                        onChange={(e) => handleSampleInputChange(e, index, rowIndex)}
                                                                                                        style={{ borderColor: borderColor[key] }}
                                                                                                    />
                                                                                                    <div style={{ marginLeft: '5px' }}>{item.Unit == "NA" ? "" : " " + item.Unit}</div>
                                                                                                </div>
                                                                                                <span>{resultMessage[key]}</span>
                                                                                            </td>
                                                                                            <td>{(Number(sampleInput[key]) - (Number(item.workrangemin) + Number(item.workrangemax)) / 2)
                                                                                                ? Number(sampleInput[key]) - (Number(item.workrangemin) + Number(item.workrangemax)) / 2 : '0'}
                                                                                                {item.Unit == "NA" ? "" : " " + item.Unit}
                                                                                            </td>
                                                                                            <td>
                                                                                                <DatePicker
                                                                                                    // value={selectedTime[key] || ''}
                                                                                                    selected={selectedTime[key] || ''}
                                                                                                    onChange={(time) => handleTimeChange(time, index, rowIndex)}
                                                                                                    showTimeSelect
                                                                                                    showTimeSelectOnly
                                                                                                    timeIntervals={1} // You can set the interval between times, e.g., 15 minutes
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
                                                                    </Table>
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
                    </>
            }
        </>
    )
}

export default CalibrationBlasting;