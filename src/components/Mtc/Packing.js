import React, { useState, useEffect, useRef } from 'react';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../Common/Pagination/Pagination';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';
import * as XLSX from 'xlsx';
import Select from 'react-select';
import './Packing.css';

function Packing() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const searchParams = new URLSearchParams(location.search);
    const menuId = searchParams.get('menuId');
    const userId = secureLocalStorage.getItem("empId");
    const roleId = secureLocalStorage.getItem("roleId");
    const action = searchParams.get('action');
    const run_id = searchParams.get('run_id');
    const pm_processSheet_id = searchParams.get('pm_processSheet_id');

    const [loading, setLoading] = useState(true);
    const [dataList, setDataList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [ddlYear, setddlYear] = useState([]);
    const [ddOption, setDDOption] = useState([]);
    const [visible, setVisible] = useState(false);
    const [visibleTable, setVisibleTable] = useState(false);
    const [procesSheetNo, setProcessSheetNo] = useState();
    const [shift, setShift] = useState([]);
    const [bareTallySheet, setBareTallySheet] = useState('');

    const [formData, setFormData] = useState({
        psYear: '',
        psSeqNo: '',
        poNo: [],
        soNoValue: [],
        soLineNoValue: [],
        poNoValue: [],
        coatingDate: []
    });

    useEffect(() => {
        setLoading(true)
        action === 'edit' ? editDetails() : fetchYear();

        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    const fetchYear = async () => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
            const sortedYears = response?.data.sort((a, b) => b.year - a.year);
            setddlYear(sortedYears);
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const editDetails = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCPRLDataByID?pm_procsheet_id=${pm_processSheet_id}&runid=${run_id}`)
            setFormData(response?.data[0]);
            setDDOption(response?.data[0]);
            setDataList(response?.data[1]);
            setVisible(true);
            setVisibleTable(true);
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update formData state
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));

        if (name === "psSeqNo") {
            setProcessSheetNo(value)
        }

        // Filter SO Line Item No. and PO Item based on selected SO No.
        if (name === 'poNo') {
            const filteredOptions = ddOption.filter(option => option.pm_pono === value);

            // Extract distinct SO Line Item Nos. and PO Items from filtered options
            const distinctSoNos = [...new Set(filteredOptions.map(option => option.pm_salesord_no))];
            const distinctLineNos = [...new Set(filteredOptions.map(option => option.pm_item_no))];
            const distinctPoItems = [...new Set(filteredOptions.map(option => option.pm_po_item_no))];
            const distinctDates = getDistinctDateOptions(filteredOptions);

            setFilteredSoNo(distinctSoNos);
            setFilteredLineNo(distinctLineNos);  // Update state for filtered SO Line Nos.
            setFilteredPoItem(distinctPoItems);  // Update state for filtered PO Items
            setFilteredDates(distinctDates);

            // Reset dependent dropdown values
            setFormData(prevFormData => ({
                ...prevFormData,
                soNoValue: '',
                soLineNoValue: '',
                poNoValue: ''
            }));
        }
    };

    const handlePsSeqNoBlur = () => {
        if (formData.psSeqNo) {
            getDDList();
        }
    };

    const getDDList = async () => {
        try {
            const response1 = await axios.post(Environment.BaseAPIURL + `/api/User/getEPOXYProcessSheetDetails?processsheetno=${formData.psSeqNo}&year=${formData.psYear}`)
            setFormData(response1.data.Table[0])
            setShift(response1?.data.Table5[0])

            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetSoNoforCPRL?pm_procsheet_id=${formData?.psSeqNo}`)
            setDDOption(response.data)
            setVisible(true)
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const [selectedDates, setSelectedDates] = useState([]);

    const handleSearchClick = async (e) => {
        e.preventDefault();
        try {
            const { soNoValue, soLineNoValue, poNoValue, poNo } = formData;
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetMainDataForCPRL?pm_procsheet_id=${procesSheetNo}&pm_salesord_no=${soNoValue}&pm_item_no=${soLineNoValue}&pm_pono=${encodeURIComponent(poNo)}&Coatingdate=${new Date(selectedDates).toLocaleDateString("fr-CA").replace(/\//g, "-")}&pm_po_item_no=${poNoValue}`);
            setDataList(response.data);
            setVisibleTable(true);
            setCurrentPage(0);
        } catch (error) {
            toast.error("Error fetching search results");
            console.error("Error fetching data:", error);
        }
    };

    // const displayData = dataList.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    // const pageCount = Math.ceil(dataList.length / pageSize);

    // const handlePageClick = data => {
    //     setCurrentPage(data.selected);
    // };

    const [excelData, setExcelData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [excelTotalPipe, setExcelTotalPipe] = useState('');
    const [excelPipeLength, setExcelPipeLength] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Validate columns
                const requiredColumns = ["PIPE NO.", "HEAT NO.", "LENGTH (MTR.)"];
                const fileColumns = Object.keys(jsonData[0] || {});
                const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

                if (missingColumns.length > 0) {
                    toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
                    return;
                }

                // total rows
                const excelTotalPipes = jsonData.length;
                setExcelTotalPipe(excelTotalPipes);

                // total pipe length 
                let totalLength = 0;
                jsonData.forEach((row) => {
                    const length = parseFloat(row["LENGTH (MTR.)"]);
                    if (!isNaN(length)) {
                        totalLength += length;
                    }
                });
                setExcelPipeLength(totalLength);

                setExcelData(jsonData);
                setFileName(file.name);
                toast.success(`Excel file uploaded successfully!`);
            };
            reader.readAsBinaryString(file);
        } else {
            toast.error('Invalid file format. Please upload a valid Excel file.');
        }
    };

    // Function to remove the uploaded file
    const removeFile = () => {
        setExcelData(null);
        setFileName('');
        setExcelTotalPipe('');
        setExcelPipeLength('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';  // Reset the file input field
        }
        toast.info('Excel file removed.');
    };

    // Function to validate Excel data against table data and remove unmatched rows
    const validateExcelData = (e) => {
        e.preventDefault()
        if (!excelData || excelData.length === 0) {
            toast.error('No Excel data to validate.');
            return;
        }

        const matched = dataList.filter(dataRow =>
            excelData.some(excelRow =>
                dataRow.pm_pipe_code == excelRow['PIPE NO.'] &&
                // dataRow.pm_pipe_field_no == excelRow['Field No.'] &&
                dataRow.pm_heat_number == excelRow['HEAT NO.']
            )
        );

        // Collect "BARE TALLY SHEET" data from excelData but only for matching rows
        const bareTallySheetData = excelData.filter(excelRow =>
            excelRow['BARE TALLY SHEET'] &&
            dataList.some(dataRow =>
                dataRow.pm_pipe_code == excelRow['PIPE NO.'] &&
                // dataRow.pm_pipe_field_no == excelRow['Field No.'] &&
                dataRow.pm_heat_number == excelRow['HEAT NO.']
            )
        );

        // Extract distinct values from the matching "BARE TALLY SHEET" rows and concatenate them
        const distinctBareTallySheetData = [...new Set(bareTallySheetData.map(row => `${row['BARE TALLY SHEET']}`))];

        // Join the distinct values into a comma-separated string
        setBareTallySheet(distinctBareTallySheetData.join(' , '))

        if (matched.length == 0) {
            toast.info('No matching rows found.');
            setDataList([]);
        } else {
            setDataList(matched);
            toast.success(`${matched.length} rows matched and kept.`);
        }
    };

    useEffect(() => {
        // When dataList changes, initialize selectedRows with all 'false' (unchecked)
        setSelectedRows(new Array(dataList.length).fill(false));
    }, [dataList]);  // Make sure this runs when dataList changes

    const [selectedRows, setSelectedRows] = useState(new Array(dataList.length).fill(false));
    // Add state to track the selected data to be sent to the API
    const [selectedRowData, setSelectedRowData] = useState([]);

    // Function to handle row selection
    const handleRowSelect = (index) => {
        const updatedSelectedRows = [...selectedRows];
        updatedSelectedRows[index] = !updatedSelectedRows[index];  // Toggle the checkbox

        // Update the selected rows' data
        const selectedData = dataList[index];  // Get the data for the selected row
        const updatedSelectedRowData = [...selectedRowData];

        if (updatedSelectedRows[index]) {
            // Add row data if checked
            updatedSelectedRowData.push(selectedData);
        } else {
            // Remove row data if unchecked
            const rowIndex = updatedSelectedRowData.findIndex(row => row.pm_pipe_code === selectedData.pm_pipe_code);
            if (rowIndex > -1) {
                updatedSelectedRowData.splice(rowIndex, 1);
            }
        }

        setSelectedRows(updatedSelectedRows);
        setSelectedRowData(updatedSelectedRowData);  // Update the selected row data
    };

    // Function to handle select all checkboxes
    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        const updatedSelectedRows = new Array(dataList.length).fill(isChecked);

        // If all are checked, set the row data; otherwise, clear it
        if (isChecked) {
            setSelectedRowData([...dataList]);
        } else {
            setSelectedRowData([]);
        }

        setSelectedRows(updatedSelectedRows);
    };

    const handleSubmit = async (e, value) => {
        if (selectedRowData.length === 0) {
            toast.error('No rows selected.');
            return;
        }

        let currTotalLength = 0
        selectedRowData.map((data) => currTotalLength += data.pm_pipe_length);

        const dataToSend = {
            comp_id: 1,
            loc_id: 1,
            cprl_run_id: 0,
            cprl_run_code: "TSL/COAT/CPRL",
            procsheet_id: formData.processsheetid,
            project_id: formData.projectid,
            shift_id: action === 'edit' ? shift.ShiftId : shift.pm_shift_id,
            current_pipe_release: selectedRowData.length,
            current_pipe_release_length: currTotalLength,
            bpr_recv_count: excelTotalPipe,
            bpr_recv_length: excelPipeLength,
            release_date: new Date().toLocaleDateString("fr-CA").replace(/\//g, "-"),
            salesord_no: formData.soNoValue,
            item_no: formData.soLineNoValue,
            po_item_no: formData.poNoValue,
            pono: formData.poNo,
            remarks: bareTallySheet,
            issavedraft: value,
            roleId: parseInt(roleId),
            userid: parseInt(userId),
            _pipedetails: selectedRowData.map((row, index) => ({
                seq_no: index + 1,
                pipe_id: row.pm_pipe_id,
                field_no: row.pm_pipe_field_no,
                coating_date: row.Thiknessdate,
                pipe_length: row.pm_pipe_length,
                pipe_remarks: row.Remark,
                cprl_result_id: 0
            }))
        }
        try {
            console.log(dataToSend)
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/SavePackinglistData`, dataToSend);
            const responseBody = await response.data;
            if (responseBody) {
                setLoading(false);
                toast.success('Selected pipes sent successfully!');
                navigate(`/packinglist?menuId=${menuId}`);
            } else {
                setLoading(false);
                toast.error(responseBody);
            }
        } catch (error) {
            toast.error('Error sending selected rows to API.');
            console.error('Error:', error);
        }
    };

    const getDistinctDateOptions = () => {
        const uniqueDates = new Set(ddOption.filter(item => item.coatingdate).map(item => item.coatingdate));
        return Array.from(uniqueDates).map(date => ({
            value: date,
            label: new Date(date).toLocaleDateString('en-GB')
        }));
    };

    const [filteredSoNo, setFilteredSoNo] = useState([]);
    const [filteredLineNo, setFilteredLineNo] = useState([]);
    const [filteredPoItem, setFilteredPoItem] = useState([]);
    const [filteredDates, setFilteredDates] = useState([]);

    const distinctDdOptions = [...new Set(ddOption.map(option => option.pm_pono))]; // For SO No.

    return (
        <>
            {loading ? (<Loading />) : (
                <>
                    <Header />
                    <section className="InnerHeaderPageSection">
                        <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <ul>
                                        <li><Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                                        <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                        <li> <Link to={`/qa?menuId=${menuId}`}> QA </Link> <b style={{ color: '#fff' }}></b></li>
                                        <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                        <li> <Link to={`/packinglist?menuId=${menuId}`}> Packing List </Link> <b style={{ color: '#fff' }}></b></li>
                                        <li><h1>/&nbsp; Packing </h1></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className='RawmaterialPageSection PackingListSection'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    <div className='PipeTallySheetDetails'>
                                        <form className="row m-0">
                                            <div class="col-md-12 col-sm-12 col-xs-12"><h4>Packing</h4></div>
                                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                                <label htmlFor="">Process Sheet No.</label>
                                                <div className='ProcessSheetFlexBox'>
                                                    <input
                                                        name="processsheetcode"
                                                        placeholder='Process sheet'
                                                        value={formData?.processsheetcode}
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
                                            {[
                                                { id: 'clientname', label: 'Client Name', value: formData?.clientname },
                                                { id: 'projectname', label: 'Project Name', value: formData?.projectname },
                                                { id: 'pipesize', label: 'Pipe Size', value: formData?.pipesize },
                                                { id: 'PONo', label: 'LOI /PO /FOA /LOA No.', value: formData?.PONo },
                                                { id: 'testdate', label: 'Date', value: new Date(formData?.testdate).toLocaleDateString('en-GB') },
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

                                            {visible && <>
                                                <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                                    <label htmlFor="poNo">PO No.</label>
                                                    <select id="poNo" name="poNo" value={formData.poNo} onChange={handleInputChange}>
                                                        <option value="">Select option</option>
                                                        {distinctDdOptions.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                                    <label htmlFor="soNoValue">SO No.</label>
                                                    <select id="soNoValue" name="soNoValue" value={formData.soNoValue} onChange={handleInputChange}>
                                                        <option value="">Select option</option>
                                                        {filteredSoNo.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                                    <label htmlFor="soLineNoValue">SO Line Item No.</label>
                                                    <select id="soLineNoValue" name="soLineNoValue" value={formData.soLineNoValue} onChange={handleInputChange} >
                                                        <option value="" >Select option</option>
                                                        {filteredLineNo.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                                    <label htmlFor="poNoValue">PO Item</label>
                                                    <select id="poNoValue" name="poNoValue" value={formData.poNoValue} onChange={handleInputChange} >
                                                        <option value="" >Select option</option>
                                                        {filteredPoItem.map(option => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                                    <label htmlFor="coatingDate">Coating Dates</label>
                                                    <Select
                                                        isMulti
                                                        options={filteredDates}
                                                        value={selectedDates.map(date => ({
                                                            value: date,
                                                            label: new Date(date).toLocaleDateString('en-GB'),
                                                        }))}
                                                        onChange={(selectedOptions) => setSelectedDates(selectedOptions.map(option => option.value))}
                                                        placeholder="Select Coating Dates"
                                                    />
                                                </div>
                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <button className='SearchClickBtn' onClick={handleSearchClick}>Search</button>
                                                </div>
                                            </>}

                                            {visibleTable && <>
                                                <div className='form-group col-md-12 col-sm-12 col-xs-12'>
                                                    <label htmlFor="fileUpload">Upload Excel:</label>
                                                    <input
                                                        type="file"
                                                        id="fileUpload"
                                                        accept=".xlsx, .xls"
                                                        ref={fileInputRef}
                                                        onChange={handleFileUpload}
                                                    />
                                                    {fileName && (
                                                        <div>
                                                            <button className='RemoveClickBtn' onClick={removeFile}>Remove File</button>
                                                        </div>
                                                    )}
                                                    <button className='ValidaClickBtn' onClick={validateExcelData}>Validate</button>
                                                </div>

                                                <div className='table-responsive' id='custom-scroll'>
                                                    <table>
                                                        <thead>
                                                            <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                <th style={{ width: '20px', textAlign: 'center' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        onChange={handleSelectAll}
                                                                        checked={selectedRows.every(Boolean)}
                                                                    />
                                                                </th>
                                                                <th style={{ minWidth: '60px' }}>Sr. No.</th>
                                                                <th style={{ minWidth: '80px' }}>Field No.</th>
                                                                <th style={{ minWidth: '80px' }}>Pipe No.</th>
                                                                <th style={{ minWidth: '80px' }}>Heat No.</th>
                                                                <th style={{ minWidth: '80px' }}>Length (mtr)</th>
                                                                <th style={{ minWidth: '110px' }}>Date of Coating</th>
                                                                <th style={{ minWidth: '80px' }}>Remarks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataList.length === 0 ? (
                                                                <tr><td colSpan="8">No data available.</td></tr>
                                                            ) : (
                                                                dataList.map((row, index) => {
                                                                    const testOnPipe = row.Remark;
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
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>
                                                                                <input
                                                                                    type='checkbox'
                                                                                    checked={selectedRows[index]}
                                                                                    onChange={() => handleRowSelect(index)} />
                                                                            </td>
                                                                            <td>{currentPage * pageSize + index + 1}</td>
                                                                            <td>{row.pm_pipe_field_no}</td>
                                                                            <td>{row.pm_pipe_code}</td>
                                                                            <td>{row.pm_heat_number}</td>
                                                                            <td>{row.pm_pipe_length}</td>
                                                                            <td>{new Date(row.Thiknessdate).toLocaleDateString('en-GB')}</td>
                                                                            <td>{(showCdTest || showImpactTest || showPeelTest || showMiddlePeelTest || showCrossCutTest || showDSCTest)
                                                                                ? [
                                                                                    showCdTest ? "CD test" : null,
                                                                                    showImpactTest ? "Impact test" : null,
                                                                                    showPeelTest ? "Peel Test" : null,
                                                                                    showMiddlePeelTest ? "Middle Peel Test" : null,
                                                                                    showCrossCutTest ? "Cross cut" : null,
                                                                                    showDSCTest ? "DSC" : null
                                                                                ].filter(Boolean).join(", ") : '-'}</td>
                                                                        </tr>
                                                                    )
                                                                }
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {/* <Pagination pageCount={pageCount} onPageChange={handlePageClick} /> */}

                                                <div className='SaveButtonBox'>
                                                    <div className='SaveButtonFlexBox'>
                                                        <button type='button' className="DraftSaveBtn SubmitBtn" style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, true)}>Save Draft</button>
                                                        <button type='button' style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, false)}>Submit</button>
                                                    </div>
                                                </div>
                                            </>}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </section >
                    <Footer />
                </>
            )
            }
        </>
    );
}

export default Packing;