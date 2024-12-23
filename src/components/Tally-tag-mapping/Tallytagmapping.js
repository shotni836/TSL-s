import React, { useState, useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import './Tallytagmapping.css';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import * as XLSX from 'xlsx'
import Dropzone from 'react-dropzone';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import secureLocalStorage from "react-secure-storage";

function Tallytagmapping() {
    const [fileData, setFileData] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [totalPipeLength, setTotalPipeLength] = useState();
    const [isPipeNumbersValid, setIsPipeNumbersValid] = useState(true);
    const [totalPipeNumbers, setTotalPipeNumberCount] = useState(0);
    const [errorContent, setErrorContent] = useState('');
    const [isValidateButtonVisible, setIsValidateButtonVisible] = useState(true);
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);
    const [processSheetNumber, setProcessSheetNumber] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState('');
    const [headerData, setHeaderData] = useState({});
    const [inputValue3, setInputValue3] = useState('');
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [input1, setInput1] = useState('');
    const [input3, setInput3] = useState('');
    const [isPVisible, setIsPVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const modalData = useRef([])
    const [modalDataKey, setModalDataKey] = useState(0);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const menuId = queryParams.get('menuId');
    const empId = secureLocalStorage.getItem('empId');
    const [shift, setShift] = useState()

    useEffect(() => {
        if (fileData.length > 0) {
            const totalPipeNumbers = fileData.reduce((count, row) => row['PIPE NO.'] ? count + 1 : count, 0);
            setTotalPipeNumberCount(totalPipeNumbers);

            const totalPipeLength = fileData.reduce((acc, row) => acc + parseFloat(row['LENGTH (MTR.)'] || 0), 0);
            setTotalPipeLength(totalPipeLength);
        }
    }, [fileData]);

    useEffect(() => {
        if (errorContent) {
            setIsModalOpen(true);
        }
    }, [errorContent]);

    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const handleDrop = (files) => {
        const file = files[0];
        setIsLoading(true);
        setErrorMessage('');
        setIsFileUploaded(true);  // Set this to true when a file is uploaded
        setIsSubmitDisabled(true);

        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                const firstRow = jsonData[0] || {};
                const columnNames = Object.keys(firstRow);
                const allowedColumns = ["S No.", "PIPE NO.", "HEAT NO.", "LENGTH (MTR.)", "WEIGHT (MT.)", "REMARKS (ASL NO.)"];

                const extraColumns = columnNames.filter(col => !allowedColumns.includes(col));

                if (extraColumns.length > 0) {
                    toast.error("Wrong Excel file! It contains extra columns: " + extraColumns.join(", "));
                    setIsLoading(false);
                    return;
                }

                const filteredData = jsonData.map((row) => {
                    const newRow = {};
                    columnNames.forEach((columnName) => {
                        newRow[columnName] = row[columnName];
                    });
                    return newRow;
                });
                setFileData(filteredData);
                setRowCount(filteredData.length);
                const totalPipeNumbers = filteredData.reduce((count, row) => {
                    const pipeNumber = row['PIPE NO.'];
                    if (pipeNumber) {
                        return count + 1;
                    }
                    return count;
                }, 0);

                setTotalPipeNumberCount(totalPipeNumbers);
                const totalPipeLength = filteredData.reduce((acc, row) => acc + parseFloat(row['LENGTH (MTR.)'] || 0), 0);
                setTotalPipeLength(totalPipeLength);
                setIsLoading(false);
            };

            reader.readAsBinaryString(file);
        } else {
            setIsLoading(false);
            setErrorMessage('Please select an Excel file with a .xlsx extension.');
        }
    };

    useEffect(() => {
        if (handleDrop) {
            checkDuplicatePipeNumbers();
        }
    }, []);

    const removeDuplicates = () => {
        const pipeCodesSet1 = new Set(fileData.map(entry => entry['PIPE NO.']));
        const pipeCodesSet2 = new Set(modalData.current.map(entry => entry.pipeCode));
        // Find non-matching entries
        const nonMatchingEntries = {
            inSet1ButNotSet2: fileData.filter(entry => !pipeCodesSet2.has(entry['PIPE NO.'])),
            inSet2ButNotSet1: modalData.current.filter(entry => !pipeCodesSet1.has(entry.pipeCode))
        };
        setFileData(nonMatchingEntries.inSet1ButNotSet2)
        setShowModal(false)
    }

    const checkDuplicatePipeNumbers = () => {
        if (fileData.length > 0) {
            setErrorContent(
                <div className='ValidateModalDeleteConfirm' key={modalDataKey}>
                    <h4>Validate</h4>
                    <table>
                        <thead>
                            <tr style={{ background: '#5a245a' }}>
                                <th>S.No.</th>
                                <th>Pipe No.</th>
                                <th>ASL No.</th>
                                <th>Process Sheet No.</th>
                                <th>Tally Sheet No.</th>
                                <th>Issue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modalData.current?.map((data, i) => {
                                let rowStyle = {};
                                if (data.status === 'DPN') {
                                    rowStyle.backgroundColor = '#ED2939';
                                } else if (data.status === 'DAN') {
                                    rowStyle.backgroundColor = '#3D7EDB';
                                } else if (data.status === 'IPNL') {
                                    rowStyle.backgroundColor = '#5A245A';
                                } else if (data.status === 'Range') {
                                    rowStyle.backgroundColor = '#FFA100';
                                }

                                return (
                                    <tr key={i} style={rowStyle}>
                                        <td>{i + 1}</td>
                                        <td>{data?.pipeCode}</td>
                                        <td>{data?.aslNo}</td>
                                        <td>{data?.processSheetNo}</td>
                                        <td>{data?.tallySheetNo}</td>
                                        <td>{data?.status}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <div className='deleteFlexBox'>
                        <button type="button" data-bs-dismiss="modal"
                            className="ConfirmDeleteBtn"
                            onClick={removeDuplicates}
                        >Confirm Delete</button>
                        <button type="button" className="Cancelbtn" data-bs-dismiss="modal" onClick={(e) => { e.preventDefault(); setShowModal(false); setIsSubmitDisabled(true); }}>Cancel</button>
                    </div>

                    <div className="errorNotes">
                        <ul>
                            <li>
                                <span style={{ color: 'red' }}>DPN:</span> Duplicate Pipe Number , &nbsp; &nbsp;
                                <span style={{ color: 'blue' }}>DAN:</span> Duplicate ASL Number , &nbsp; &nbsp;
                                <span style={{ color: '#8F00FF' }}>IPNL:</span> Invalid Pipe Number Length , &nbsp; &nbsp;
                                <span style={{ color: 'orange' }}>Range:</span> Pipe Length out of Range
                            </li>
                        </ul>
                    </div>
                </div>
            );

            setIsSubmitDisabled(true);
        } else {
            setIsPipeNumbersValid(true);
            setIsSubmitDisabled(false);
            const updatedTotalPipeLength = fileData.reduce((acc, row) => acc + parseFloat(row['LENGTH (MTR.)'] || 0), 0);
            setTotalPipeLength(updatedTotalPipeLength);

            setErrorContent(
                <div className='validateSuccessfullModal'>
                    <div className='validatesuccessfuliconBox'>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>All is Good!</h3>
                    <h6>Please submit to import</h6>
                    <button type='button' data-bs-dismiss="modal" >OK</button>
                </div>
            );
        }
    };

    const excelFileURL = '/assets/excel-files/tally-tag-mapping.xlsx';

    const handleTypeChange = (e) => {
        const { name, value } = e.target;
        if (name === "year") {
            setYear(value);
        } else {
            setType(value);
        }
    };

    const handleRemoveExcel = () => {
        setFileData([]);
        setIsFileUploaded(false);  // Set this to false when excel is removed
        setIsSubmitDisabled(true);  // Disable submit button when excel is removed
    }

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
                setShowAdditionalFields(parseInt(type) > 0);
                setProcessSheetNumber(type);
            } else {
                console.error('Invalid year or type:', year, type);
            }
        } catch (error) {
            console.error('Error fetching process sheet details:', error);
        }
    };

    const handleInputChange = (event, maxCharacters, fieldName) => {
        const inputValue = event.target.value;

        if (inputValue.length > maxCharacters) {
            toast.error(`Maximum ${maxCharacters} characters allowed for ${fieldName}.`);
            return;
        }

        const regex = /^[a-zA-Z0-9\s]+$/;
        if (inputValue !== '' && !regex.test(inputValue)) {
            toast.error(`Special characters are not allowed for ${fieldName}.`);
            return;
        }

        // Check if the field is being cleared (inputValue is an empty string)
        if (fieldName === 'S. No.') {
            setInput1(inputValue);
        } else if (fieldName === 'Tally Sheet No.') {
            setInputValue3(inputValue);
        } else if (fieldName === 'MTC No.') {
            setInput3(inputValue);
        }
    };

    useEffect(() => {
        if (input1 !== '' && input3 !== '') {
            setIsPVisible(true);
            setIsSubmitDisabled(true);
        } else {
            setIsPVisible(false);
            setIsSubmitDisabled(true);
        }
    }, [input1, input3]);

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        getYear();
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    const validateTallysheet = async () => {
        const dataArrays = fileData.map(row => ({
            processSheetNo: type.toString(),
            pippeCode: row['PIPE NO.'],
            heatNo: row['HEAT NO.'],
            aslNo: row['REMARKS (ASL NO.)'],
            pipeLength: row['LENGTH (MTR.)'],
            pipeWeight: row['WEIGHT (MT.)']
        }));

        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/VildateTallySheetData`, dataArrays);
            modalData.current = response.data;
            setModalDataKey(prevKey => prevKey + 1);
            if (response.data.length == 0) {
                toast.success("No duplicate pipe found");
                setIsSubmitDisabled(false);
            }
            else {
                setShowModal(true);
                // setIsSubmitDisabled(true);
            }
            checkDuplicatePipeNumbers();
            setIsSubmitDisabled(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    function tallytagmappinginfo(callback) {
        try {
            const data = {
                companyId: 1,
                locationId: 1,
                tallySheetId: 0,
                tallySheetNo: inputValue3,
                procesSheetNo: headerData.processsheetid.toString(),
                projectId: headerData.projectid.toString(),
                soNo: input1,
                mtcNo: input3,
                userid: parseInt(empId),
                shiftid: parseInt(shift.pm_shift_id),
                importDate: new Date(selectedDate).toLocaleDateString("fr-CA").replace(/\//g, "-").split(" ")[0],
            };

            axios.post(`${Environment.BaseAPIURL}/api/User/TallyTagMappingInfo`, data)
                .then(response => {
                    setInput1('');
                    setInputValue3('');
                    setInput3('');
                    setSelectedDate('');
                    callback("Data from api one")
                })
                .catch(error => {
                    toast.error("Failed to save")
                    console.error('Error:', error);
                })
                .finally(() => {
                    setIsSubmitDisabled(false);
                });
        }
        catch (error) {
            console.error('Error:', error);
        }
    }

    const handleClick = async () => {
        tallytagmappinginfo((data) => {
            handleSubmit((data1) => console.log(data1));
        })
    };

    const handleSubmit = (callback) => {

        const dataArray = fileData.map(row => ({
            processSheetNo: (headerData.processsheetid).toString(),
            pippeCode: row['PIPE NO.'],
            heatNo: row['HEAT NO.'],
            aslNo: row['REMARKS (ASL NO.)'],
            pipeLength: row['LENGTH (MTR.)'],
            pipeWeight: row['WEIGHT (MT.)'],
            pipeReceivedDate: new Date(selectedDate).toLocaleDateString("fr-CA").replace(/\//g, "-").split(" ")[0],
            userid: parseInt(empId),
            shiftid: parseInt(shift.pm_shift_id),
        }));

        axios.post(`${Environment.BaseAPIURL}/api/User/ImportTallySheet`, dataArray)
            .then(response => {
                toast.success("Saved successfully")
                navigate(`/tallytagmappinglist?menuId=${menuId}`)
                callback("Data from api two")
            })
            .catch(error => {
                toast.error("Failed to save")
                console.error('Error:', error);
            })
            .finally(() => {
                setIsSubmitDisabled(false);
            });
    };

    const [ddlYear, setddlYear] = useState([]);

    const getYear = () => {
        axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
            .then((response) => {
                const sortedYears = response.data.sort((a, b) => b.year - a.year);
                setddlYear(sortedYears);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

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
                                            <li><Link to="/ppcdashboard?moduleId=617">PPC Module</Link></li>
                                            <li><h1>/&nbsp;</h1></li>
                                            <li>&nbsp;<Link to="/tallytagmappinglist?menuId=5">&nbsp;Tally Tag Mapping List</Link></li>
                                            <li><h1>/&nbsp; Tally Tag Mapping </h1></li>
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
                                                    <h5>Tally Tag Mapping <span>- Add page</span></h5>
                                                </div>
                                                <div className='col-md-4 col-sm-4 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor="processSheet">Process Sheet</label>
                                                        <div className='ProcessSheetFlexBox'>
                                                            <input id="processSheet" style={{ width: '66%', cursor: 'not-allowed' }} value={headerData.processsheetcode} placeholder='Process sheet no.' readOnly />
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
                                                {console.log(shift)}
                                                {[
                                                    { id: 'clientName', label: 'Client Name', value: headerData?.clientname },
                                                    { id: 'projectName', label: 'Project Name', value: headerData?.projectname },
                                                    { id: 'pipeSize', label: 'Pipe Size', value: headerData?.pipesize },
                                                    { id: 'specification', label: 'Specification', value: headerData?.specification },
                                                    { id: 'poNo', label: 'LOI /PO /FOA /LOA No.', value: headerData?.PONo },
                                                    { id: 'dated', label: 'Dated', value: new Date(headerData?.testdate).toLocaleDateString('en-GB') },
                                                    { id: 'shift', label: 'Shift', value: shift?.pm_shiftvalue },
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
                                                <div className='col-md-4 col-sm-4 col-xs-12'></div>
                                                {showAdditionalFields && (
                                                    <>
                                                        <div className='col-md-3 col-sm-3 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="sNo">S. No.</label>
                                                                <input id="sNo" type="text" value={input1} onChange={(e) => handleInputChange(e, 40, 'S. No.')} placeholder='Enter S. No.' />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-3 col-sm-3 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="tallySheetNo">Tally Sheet No.</label>
                                                                <input id="tallySheetNo" type="text" value={inputValue3} onChange={(e) => handleInputChange(e, 40, 'Tally Sheet No.')} placeholder='Enter tally sheet no.' />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-3 col-sm-3 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="mtcNo">MTC No.</label>
                                                                <input id="mtcNo" type="text" value={input3} onChange={(e) => handleInputChange(e, 40, 'MTC No.')} placeholder='Enter MTC No.' />
                                                            </div>
                                                        </div>
                                                        <div className='col-md-3 col-sm-3 col-xs-12'>
                                                            <div className='form-group'>
                                                                <label htmlFor="date">Date</label>
                                                                <DatePicker id="date" maxDate={Date.now()} selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="dd-MM-yyyy" placeholderText="DD-MM-YYYY" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                                    <div className='DownloadButton'>
                                                        <a className='DownloadTemplateBtn' href={excelFileURL} download><i className="fas fa-file-excel"></i> Download Template</a>
                                                    </div>
                                                    <div className='col-md-4 col-sm-4 col-xs-12'>
                                                        {fileData.length > 0 && (
                                                            <button className="btn btn-danger" onClick={handleRemoveExcel}>Remove Uploaded Excel</button>
                                                        )}
                                                    </div>
                                                    {isPVisible &&
                                                        <div className="DragDropUploadDivBox">
                                                            {isLoading && <p className="loading">Loading...</p>}
                                                            {errorMessage && <p className="error-message">{errorMessage}</p>}

                                                            {fileData.length > 0 && !isLoading && !errorMessage && (
                                                                <div className='Tallytagmappingtable'>
                                                                    <div className='NumberrowsSubmitFlexBox'>
                                                                        <p className='NumberrowsTxt'>Number of rows in the Excel file / Total Pipe Numbers : <b>{totalPipeNumbers}</b></p>
                                                                        <label htmlFor="totalPipeLength" style={{ margin: '0', fontSize: '14px' }}>Total Pipe Length(MTR.):<span style={{ padding: '0.5em', color: '#518ada' }} id="totalPipeLength" readOnly>{totalPipeLength.toFixed(2)}</span></label>
                                                                        <div className='DownloadButton'>
                                                                            {isValidateButtonVisible && (
                                                                                <button type='button' style={{ display: isSubmitDisabled ? 'inline-block' : 'none' }} onClick={() => {
                                                                                    validateTallysheet();
                                                                                }}>Validate</button>
                                                                            )}

                                                                            <div class={showModal ? "modal fade ValidateModalBox show" : "modal fade ValidateModalBox"} id="ValidatemodaL" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="ValidatemodaLLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
                                                                                <div class="modal-dialog">
                                                                                    <div class="modal-content">
                                                                                        <div class="modal-body">
                                                                                            {errorContent}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <button type='button' disabled={isSubmitDisabled} style={{ backgroundColor: isSubmitDisabled ? '#CCCCCC' : '#1353ad', cursor: isSubmitDisabled ? 'not-allowed' : 'pointer', }} onClick={(e) => { handleClick(); }}>Submit</button>
                                                                        </div>
                                                                    </div>

                                                                    <Table striped bordered className='tallytagmappingExcelfileTable'>
                                                                        <thead>
                                                                            <tr style={{ background: 'rgb(90, 36, 90)', color: '#fff' }}>
                                                                                {fileData.length > 0 &&
                                                                                    Object.keys(fileData[0]).map((header) => (
                                                                                        <th key={header}>{header}</th>
                                                                                    ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {fileData.length > 0 &&
                                                                                fileData.map((row, index) => (
                                                                                    <tr key={index}>
                                                                                        {Object.values(row).map((value, cellIndex) => (
                                                                                            <td key={cellIndex}>{value}</td>
                                                                                        ))}
                                                                                    </tr>
                                                                                ))}
                                                                        </tbody>
                                                                    </Table>

                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                        {fileData.length > 0 && (
                                                                            <div className='NumberrowsSubmitFlexBox' style={{ border: 'none', margin: '10', padding: '0' }}>
                                                                                <div className='form-group' style={{ margin: '0' }}>
                                                                                    <p className='NumberrowsTxt'>Number of rows in the Excel file / Total Pipe Numbers : <b>{totalPipeNumbers}</b> </p>
                                                                                </div>

                                                                                <label htmlFor="totalPipeLength" style={{ margin: '0', fontSize: '14px' }}>Total Pipe Length(MTR.):<span style={{ padding: '0.5em', color: '#518ada' }} id="totalPipeLength" readOnly>{totalPipeLength.toFixed(2)}</span></label>
                                                                                <div>
                                                                                    <button type='button' disabled={isSubmitDisabled} style={{ backgroundColor: isSubmitDisabled ? '#CCCCCC' : '#1353ad', cursor: isSubmitDisabled ? 'not-allowed' : 'pointer', }} onClick={(e) => { handleClick(); }}>Submit</button>
                                                                                </div>
                                                                            </div>)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {!fileData.length && (
                                                                <div className="DragDropUploadBox">
                                                                    <Dropzone onDrop={handleDrop} accept=".xlsx">
                                                                        {({ getRootProps, getInputProps }) => (
                                                                            <div {...getRootProps()} className="dropzone">
                                                                                <input {...getInputProps()} />
                                                                                <i className="fas fa-cloud-upload-alt"></i>
                                                                                <h4>Drag & drop an Excel file here</h4>
                                                                                <span>or</span>
                                                                                <h6>Click to select one</h6>
                                                                            </div>
                                                                        )}
                                                                    </Dropzone>
                                                                </div>
                                                            )}
                                                        </div>
                                                    }
                                                </div>
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

export default Tallytagmapping;