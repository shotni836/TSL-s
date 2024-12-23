import React, { useState, useEffect, useRef } from 'react';
import Header from '../../Common/Header/Header'
import Footer from '../../Common/Footer/Footer';
import Loading from '../../Loading';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../../environment";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import '../Allreports.css';
import './Repair.css'
import { Table } from 'react-bootstrap';
import { encryptData } from '../../Encrypt-decrypt';

function Repair() {
    const token = secureLocalStorage.getItem('token');
    const [inputValues, setInputValues] = useState([]);
    const [remarkValues, setRemarkValues] = useState([]);
    const [year, setYear] = useState('');
    const [type, setType] = useState('');
    const [instrumentData, setInstrumentData] = useState([]);
    const [headerData, setHeaderData] = useState({});
    const navigate = useNavigate();
    const [isPqt, setIsPqt] = useState(false);
    const [tableData, setTableData] = useState([])
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const moduleId = queryParams.get('moduleId');
    const menuId = queryParams.get('menuId');
    const [shift, setShift] = useState()
    const [testRunId, setTestRunId] = useState()
    const userId = secureLocalStorage.getItem('userId');
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const searchParams = new URLSearchParams(window.location.search);
    const pm_test_run_id = searchParams.get("pm_test_run_id");
    const procsheetId = searchParams.get("processsheetId");
    const action = searchParams.get("action");
    const [pipeData, setPipeData] = useState([])
    const [loading, setLoading] = useState(false);
    const [ddlYear, setddlYear] = useState([]);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        getYear();
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    const handleTypeChange = (e) => {
        const { name, value } = e.target;
        if (name === "year") {
            setYear(value);
        } else {
            setType(value);
        }
    };

    const getRepairDataById = async (data1, data2) => {
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetRepairDataById?processsheet_id=${encryptData(type)}&processtype=${encryptData(1428)}&TestDate=${encryptData(data1)}&shiftid=${encryptData(data2)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        setPipeData(response?.data[0])

        const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${encryptData(0)}&test_id=${encryptData(1428)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const procedures = response2?.data?.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));

        setSelectedProcedures(procedures);
        setVisible(true)
        const response3 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${encryptData(1428)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = response3?.data[0]
        setInstrumentData(data);
    }

    const handleTypeBlur = () => {
        fetchData();
    }

    const fetchData = async () => {
        try {
            if (year && type) {
                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?processsheetno=${encryptData(type)}&year=${encryptData(year)}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const firstDataItem = response?.data?.Table[0];
                setShift(response?.data?.Table5[0])
                setHeaderData(firstDataItem || []);

                if (response?.data) {
                    getRepairDataById(firstDataItem.testdate, response?.data?.Table5[0]?.pm_shift_id)
                }
            } else {
                console.error('Invalid year or type:', year, type);
            }
        } catch (error) {
            console.error('Error fetching process sheet details:', error);
        }
    };

    const getYear = async () => {
        const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear", {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const sortedYears = response?.data?.sort((a, b) => b.year - a.year);
        setddlYear(sortedYears);

        if (action == 'edit') {
            const response1 = await axios.post(Environment.BaseAPIURL + `/api/User/GetRepairDataByTestRunId?processsheet_id=${procsheetId}&pm_test_run_id=${pm_test_run_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            setHeaderData(response1?.data[0][0])
            setTableData(response1?.data)
            setTestRunId(response1?.data[0][0]?.pm_test_run_id)

            const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${encryptData(0)}&test_id=${encryptData(1428)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            const procedures = response2?.data?.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));

            setSelectedProcedures(procedures);

            const response3 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${encryptData(1428)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const data = response3?.data[0]
            setInstrumentData(data);

            initializeResultSuffixInput(response1)
        }
    };

    const initializeResultSuffixInput = (response, response2) => {
        let updatedInputValues = {};
        let updatedRemarkValues = {};

        for (var i = 0; i < response?.data[2].length; i++) {
            const key = `${i}`; // Assuming rowIndex is 0 for initialization
            updatedInputValues[key] = response?.data[2][i].pm_test_value2;
            updatedRemarkValues[key] = response?.data[2][i].pm_test_result_remarks;
        }

        for (var i = 0; i < response2?.length; i++) {
            const key = `${i}`; // Assuming rowIndex is 0 for initialization
            updatedInputValues[key] = response?.data[2][i].pm_test_value2;
        }

        setInputValues(updatedInputValues)
        setRemarkValues(updatedRemarkValues)
    }

    const handleSubmit = async (e, value) => {
        e.preventDefault()
        setLoading(true);
        const repairData = pipeData
            .flatMap((item, index) => {
                const key = `${index}`;
                return {
                    ...item,
                    inputValue: inputValues[key] || '0',
                    remarkValues: remarkValues[key] || '0',
                    index
                };
            })
            .map(entry => ({
                pipe_id: entry.pm_pipe_id.toString(),
                seqno: entry.pm_seqno.toString(),
                pm_rfid_data_id: entry.pm_rfiddata_id.toString(),
                reasonofDamage: entry.Reason,
                repairArea: entry.inputValue,
                visual: entry.remarkValues,
                holiday: "25Kv",
                remarks: "Ok",
                pm_shift_id: shift.pm_shift_id.toString(),
                pm_coatingdate: entry.date,
            }
            ));

        const dataToSend = {
            project_id: headerData.projectid.toString(),
            procsheet_id: headerData.processsheetid.toString(),
            shiftID: shift.pm_shift_id.toString(),
            ispqt: headerData.ispqt === true ? "1" : "0",
            created_by: userId.toString(),
            process_type: "1428",
            procedure_type: selectedProcedures ? selectedProcedures.map(proc => proc.value).join(',') + "," : '0',
            repairData,
            instrumentData,
            co_comp_id: '1',
            co_location_id: '1',
            p_test_run_id: '0',
        };

        try {
            const response = await axios.post(Environment.BaseAPIURL + '/api/User/SaveRepairDetails', dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.data == "100") {
                toast.success("Data saved successfully!");
                console.log("Form data sent successfully!");
                navigate(`/repair-list?moduleId=${moduleId}&menuId=${menuId}`);
            } else {
                toast.error('Failed to submit data.');
                console.error("Failed to send form data to the server. Status code:", response.status);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error in submitting data.');
        } finally {
            setLoading(false);
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

    function handlePQTChange() {
        if (isPqt === false) {
            setIsPqt(true);
        } else {
            setIsPqt(false);
        }
    }

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
                        <section className="InnerHeaderPageSection">
                            <div className="InnerHeaderPageBg"></div>
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-12 col-sm-12 col-xs-12">
                                        <ul>
                                            <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li> <Link to={`/blastingsheetlist?moduleId=${moduleId}&menuId=${menuId}`}>Process Data Entry List</Link> <b style={{ color: '#fff' }}></b></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li>&nbsp;<Link to={`/repair-list?moduleId=${moduleId}&menuId=${menuId}`}>&nbsp;Repair List</Link></li>
                                            <li><h1>/&nbsp; Repair Station </h1></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className='RawmaterialPageSection'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-sm-12'>
                                        <div className='PipeTallySheetDetails'>
                                            <form className='row m-0'>
                                                <div className='col-md-12 col-sm-12 col-xs-12'><h4>Repair Station <span>- Add page</span></h4></div>
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
                                                            <label for="pqt">  PQT</label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {visible &&
                                                    <>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className='PipeDescriptionDetailsTable'>
                                                                <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                                                    <Table id='subtesttbl'>
                                                                        <thead>
                                                                            <tr style={{ background: '#5a245a', color: '#fff' }}>
                                                                                <th></th>
                                                                                <th></th>
                                                                                <th></th>
                                                                                <th></th>
                                                                                <th></th>
                                                                                <th colSpan={2} style={{ textAlign: 'center' }}>Inspection of Repair Area</th>
                                                                            </tr>
                                                                            <tr style={{ background: "#5a245a", color: '#fff' }}>
                                                                                <th style={{ width: '60px' }}>Sr. No.</th>
                                                                                <th style={{ width: '100px' }}>Pipe No.</th>
                                                                                <th style={{ width: '100px' }}>Coating Date</th>
                                                                                <th style={{ width: '150px' }}>Reason of Damage</th>
                                                                                <th style={{ width: '160px' }}>Repair Area</th>
                                                                                <th style={{ width: '160px' }}>Visual</th>
                                                                                <th style={{ width: '160px' }}>Holiday</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {pipeData?.map((data, index) => {
                                                                                const key = `${index}`;
                                                                                return (
                                                                                    <tr key={key}>
                                                                                        <td>{index + 1 || "-"}</td>
                                                                                        <td>{data?.pipino || "-"}</td>
                                                                                        <td>{new Date(data.date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-"}</td>
                                                                                        <td>{data?.Reason == "Thickness" ? "Coating Damage" : data?.Reason}</td>
                                                                                        <td>
                                                                                            <input type='text' className='form-control' placeholder='Area' value={inputValues[key] || ''} onChange={(e) => handleInputChange(e, key)} />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input type='text' className='form-control' placeholder='Visual' value={remarkValues[key] || ''} onChange={(e) => handleRemarksChange(e, key)} />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input type='text' className='form-control' placeholder='Holiday' value={'25Kv'} />
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            })}
                                                                        </tbody>
                                                                    </Table>
                                                                </div>
                                                            </div>
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
                                                                {/* <button className='btn btn-secondary mx-2' onClick={(e) => handleSubmit(e, false)} disabled={loading}>{loading ? 'Saving...' : 'Save Draft'}</button> */}
                                                                <button className='btn btn-primary' onClick={(e) => handleSubmit(e, true)} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
                                                            </div>
                                                        </div>
                                                    </>}
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
export default Repair;