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
import { Table } from 'react-bootstrap';
import Headerdata from '../../Common/Sample-onereport/Headerdata';

function Nc() {
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
    const menuId = queryParams.get('menuId');
    const [shift, setShift] = useState()
    const [testRunId, setTestRunId] = useState()
    const userId = secureLocalStorage.getItem('userId');
    const empId = secureLocalStorage.getItem('empId');
    const roleId = secureLocalStorage.getItem('roleId');
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    const procsheetId = searchParams.get("processSheetId");
    const action = searchParams.get("action");
    const [pipeData, setPipeData] = useState([])
    const [loading, setLoading] = useState(false);
    const [ddlYear, setddlYear] = useState([]);
    const [visible, setVisible] = useState(false);
    const [formData, setFormData] = useState({
        root_cause: "",
        correction_action: "",
        action_effectiveness: "",
        target_date: "",
        issued_date: "",
    });
    // const tallySheetId = queryParams.get('tallySheetId');

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


        const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=0&test_id=${1428}`)
        const procedures = response2?.data?.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));

        setSelectedProcedures(procedures);
        setVisible(true)
        const response3 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${1428}`);
        const data = response3?.data[0]
        setInstrumentData(data);
    }

    const handleTypeBlur = () => {
        fetchData();
    }

    const fetchData = async () => {
        try {
            if (year && type) {
                const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?processsheetno=${type}&year=${year}`);
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
        const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
        const sortedYears = response?.data?.sort((a, b) => b.year - a.year);
        setddlYear(sortedYears);

        if (action == 'edit') {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetNCDatabyid?ProcessSheetID=${procsheetId}&nc_run_id=${id}`);
            setPipeData(response?.data[1])
            setHeaderData(response?.data[0][0])
            const data = response.data[0][0]
            setFormData({
                action_effectiveness: data.action_effectiveness || "",
                correction_action: data.correction_action || "",
                root_cause: data.root_cause || "",
                issued_date: data.issued_date || "",
                target_date: data.target_date || ""
            })
            console.log(data.action_effectiveness)
            // setFormData(response?.data[0][0])
            setVisible(true)
            // setTableData(response1?.data)
            // setTestRunId(response1?.data[0][0]?.pm_test_run_id)


            const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=0&test_id=${1428}`)
            const procedures = response2?.data?.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));

            setSelectedProcedures(procedures);
        }
    };

    const handleSubmit = async (e, value) => {
        e.preventDefault()
        setLoading(true);
        const repairData = pipeData
            // .flatMap((item, index) => {
            //     const key = `${index}`;
            //     return {
            //         ...item,
            //         issued_date: issueDate[key] || '0',
            //         target_date: targetDate[key] || '0',
            //         index
            //     };
            // })
            .map(entry => ({
                reject_status: entry.Status,
                pipe_id: entry.pm_pipe_id,
                reject_date: entry.pm_reject_date,
            }
            ));

        const dataToSend = {
            project_id: headerData.projectId.toString(),
            procsheet_id: procsheetId.toString(),
            root_cause: formData.root_cause,
            correction_action: formData.correction_action,
            action_effectiveness: formData.action_effectiveness,
            process_type_id: "676",
            procedure_id: "10",
            userid: empId,
            isdraft: false,
            roleid: roleId,
            comp_id: 0,
            loc_id: 0,
            nc_run_id: id,
            _pipedetails: repairData,
            issued_date: formData.issued_date || '0',
            target_date: formData.target_date || '0',
        };

        try {
            const response = await axios.post(Environment.BaseAPIURL + '/api/User/SaveNCData', dataToSend);
            if (response.data == "200") {
                toast.success("Data saved successfully!");
                console.log("Form data sent successfully!");
                navigate(`/nc-list?menuId=${menuId}`);
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    function handlePQTChange() {
        if (isPqt === false) {
            setIsPqt(true);
        } else {
            setIsPqt(false);
        }
    }
    const [numRows, setNumRows] = useState(1);
    const [issueDate, setIssueDate] = useState();
    const [targetDate, setTargetDate] = useState();

    const handleResultSuffixInputChange = (e, index, rowIndex) => {
        const { value } = e.target;
        const key = `${index}-${rowIndex}`; // Create a unique key

        setIssueDate(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleResultSuffixInputChange1 = (e, index, rowIndex) => {
        const { value } = e.target;
        const key = `${index}-${rowIndex}`; // Create a unique key

        setTargetDate(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

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
                                            <li><Link to="/nc-list?moduleId=618">NC List</Link></li>
                                            <li><h1>/&nbsp; Edit NC </h1></li>
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
                                                            <input id="processSheet" style={{ width: '66%', cursor: 'not-allowed' }} value={action != 'edit' ? headerData.processsheetcode : headerData.ProcSheetNo} placeholder='Process sheet no.' readOnly />
                                                            <select name="year" value={year} onChange={handleTypeChange} >
                                                                <option value=""> Year </option>
                                                                {ddlYear.map((coatingTypeOption, i) => (
                                                                    <option key={i} value={coatingTypeOption.year}> {coatingTypeOption.year} </option>
                                                                ))}
                                                            </select>
                                                            <b>-</b>
                                                            <input id="type" type="text" placeholder='No.' value={headerData?.psno} onChange={handleTypeChange} onBlur={handleTypeBlur} />
                                                        </div>
                                                    </div>
                                                </div>
                                                {[
                                                    { id: 'clientName', label: 'Client Name', value: headerData?.ClientName != undefined ? headerData?.ClientName : '' },
                                                    { id: 'pipeSize', label: 'Pipe Size', value: headerData?.PipeSize != undefined ? headerData?.PipeSize : '' },
                                                    { id: 'dated', label: 'Date', value: new Date(headerData?.ReportTestDate).toLocaleDateString('en-GB') != undefined ? new Date(action != 'edit' ? headerData?.ReportTestDate : headerData?.ReportTestDate).toLocaleDateString('en-GB') : '' },
                                                    // { id: 'pm_action_effectiveness', label: 'Action Effectiveness', value: headerData?.pm_action_effectiveness != undefined ? headerData?.pm_action_effectiveness : '' },
                                                    // { id: 'pm_correction_action', label: 'Correction Action', value: headerData?.ReportTestDate != undefined ? headerData?.ReportTestDate : '' },
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

                                                {/* <div className="col-md-12 col-sm-12 col-xs-12">
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
                                                </div> */}

                                                {visible &&
                                                    <>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className='PipeDescriptionDetailsTable'>
                                                                <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                                                    <Table id='subtesttbl'>
                                                                        <thead>
                                                                            <tr style={{ background: "#5a245a", color: '#fff' }}>
                                                                                <th style={{ width: '60px' }}>Sr. No.</th>
                                                                                <th style={{ width: '100px' }}>Pipe No.</th>
                                                                                <th style={{ width: '150px' }}>Date of Non Conformance</th>
                                                                                <th style={{ width: '150px' }}>Nature Non Conformance</th>
                                                                                <th style={{ width: '150px' }}>Field No.</th>
                                                                                <th style={{ width: '150px' }}>Remarks</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {pipeData?.map((item, index) => (
                                                                                Array.from({ length: numRows }).map((_, rowIndex) => {
                                                                                    const key = `${index}-${rowIndex}`;
                                                                                    const seqno = (index * numRows + rowIndex + 1).toString();
                                                                                    return (
                                                                                        <tr key={key}>
                                                                                            <td>{seqno || "-"}</td>
                                                                                            <td>{item?.pm_pipe_code}</td>
                                                                                            <td>{new Date(item.pm_reject_date).toLocaleDateString('en-GB').replace(/\//g, "-") || "-"}</td>
                                                                                            <td>{item?.rejectStatusid == "Thickness" ? "Coating Damage" : item?.rejectStatusid}</td>
                                                                                            <td>{item?.field_no}</td>
                                                                                            <td>{item?.Remarks}</td>
                                                                                            {/* <td>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    placeholder='Enter result suffix'
                                                                                                    value={resultSuffixInput1[key] || ''}
                                                                                                    onChange={(e) => handleResultSuffixInputChange1(e, index, rowIndex)}
                                                                                                />
                                                                                            </td> */}
                                                                                            {/* <td>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    placeholder='Enter result suffix'
                                                                                                    value={resultSuffixInput2[key] || ''}
                                                                                                    onChange={(e) => handleResultSuffixInputChange2(e, index, rowIndex)}
                                                                                                />
                                                                                            </td> */}
                                                                                        </tr>
                                                                                    )
                                                                                })
                                                                            ))}
                                                                        </tbody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'><hr className='DividerLine' /></div>
                                                        <div className='col-md-6 col-sm-6 col-xs-6'>
                                                            <div className="form-group">
                                                                <label htmlFor="">Issue Date</label>
                                                                {console.log(formData)}
                                                                <input
                                                                    required
                                                                    value={formData?.issued_date ? formData.issued_date.split('T')[0] : ''}
                                                                    type='date'
                                                                    name="issued_date"
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-6 col-sm-6 col-xs-6'>
                                                            <div className="form-group">
                                                                <label htmlFor="">Target Date</label>
                                                                <input
                                                                    required
                                                                    value={formData?.target_date ? formData.target_date.split('T')[0] : ''}
                                                                    type='date'
                                                                    name="target_date"
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className="form-group">
                                                                <label htmlFor="">Root cause analysis</label>
                                                                <input
                                                                    required
                                                                    value={formData?.root_cause}
                                                                    type="text"
                                                                    id="root_cause"
                                                                    name="root_cause"
                                                                    placeholder="Enter root cause analysis"
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className="form-group">
                                                                <label htmlFor="">Correction action planned</label>
                                                                <input
                                                                    required
                                                                    value={formData?.correction_action}
                                                                    type="text"
                                                                    id="correction_action"
                                                                    name="correction_action"
                                                                    placeholder="Enter correction action planned"
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div className="form-group">
                                                                <label htmlFor="">Effectiveness of corrective action</label>
                                                                <input
                                                                    required
                                                                    value={formData?.action_effectiveness}
                                                                    type="text"
                                                                    id="action_effectiveness"
                                                                    name="action_effectiveness"
                                                                    placeholder="Enter effectiveness of corrective action"
                                                                    onChange={handleInputChange}
                                                                />
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
export default Nc;