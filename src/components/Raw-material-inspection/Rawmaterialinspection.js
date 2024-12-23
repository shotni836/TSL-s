import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Rawmaterialinspection.css';
import Loading from '../Loading';
import DatePicker from 'react-datepicker';
import { Table } from 'react-bootstrap';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { toast } from 'react-toastify';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Select from 'react-select';
import axios from 'axios';
import Environment from '../../environment';
import secureLocalStorage from "react-secure-storage";
import { encryptData, decryptData } from '../Encrypt-decrypt';

function Rawmaterialinspection() {
    const roleId = secureLocalStorage.getItem('roleId');
    const empId = secureLocalStorage.getItem('empId');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [coatingTypes, setCoatingTypes] = useState([]);
    const [selectedCoatingTypes, setSelectedCoatingTypes] = useState(null);
    const [procedures, setProcedures] = useState([]);
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [unit, setUnit] = useState([]);
    const [unitFetched, setUnitFetched] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const moduleId = searchParams.get('moduleId');
    const menuId = searchParams.get('menuId');
    const token = secureLocalStorage.getItem('token');
    let action = searchParams.get('action');
    let id = searchParams.get('id');

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, []);

    const fetchEditDetails = async () => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetRMInspectiondata?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.data) {
                const data = response.data.Header[0];
                const inspectionData = response.data.Body;

                // header values
                setSelectedCoatingTypes({ value: data.CoatId, label: data.Coattype });
                setSelectedClient({ value: data.Clientid, label: data.ClientName });
                setSelectedProcedures(data.WorkInstr.split(',').filter(Boolean).map(id => ({ value: id, label: id })));
                setSelectedDate(new Date(data.Inspectiondate));

                // mapping rows
                const fetchedRows = inspectionData.map((row, index) => ({
                    inspTestid: index + 1,
                    inspReceivingDate: new Date(row.ReceivingDate),
                    inspMaterialId: row.MaterialId,
                    inspManufacturerId: row.ManufacturerID,
                    inspGradeId: row.GradeId,
                    inspBatchNo: row.BatchNo,
                    inspValue: (row.Recvdqty).toString(),
                    inspUnit: row.UnitId,
                    inspLabTestReportNo: row.TestReportId,
                    inspTestStatus: row.Status,
                    inspRemarks: row.Remark
                }));
                setInspectionRows(fetchedRows);

                fetchDropdownValues();
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching edit details:', error);
            setLoading(false);
        }
    };

    const initialRow = {
        inspTestid: 1,
        inspReceivingDate: null,
        inspMaterialId: '',
        inspManufacturerId: '',
        inspGradeId: '',
        inspBatchNo: '',
        inspValue: '',
        inspUnit: '',
        inspLabTestReportNo: '',
        inspTestStatus: '',
        inspRemarks: ''
    };

    const [inspectionRows, setInspectionRows] = useState([initialRow]);

    const addRow = () => {
        const newRow = { ...initialRow, inspTestid: inspectionRows.length + 1 };
        setInspectionRows((prevData) => [...prevData, newRow]);
    };

    const removeRow = (inspTestid) => {
        if (inspectionRows.length === 1) {
            setInspectionRows([initialRow]);
        } else {
            setInspectionRows((prevData) => prevData.filter((row) => row.inspTestid !== inspTestid));
        }
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const parsedValue = name === 'inspMaterialId' || name === 'inspManufacturerId' || name === 'inspGradeId' ? parseInt(value, 10) : value;
        const newRows = [...inspectionRows];
        newRows[index][name] = parsedValue;
        setInspectionRows(newRows);

        // Check for duplicates
        const hasDuplicates = newRows.some((row, idx) => {
            return newRows.findIndex((innerRow, innerIdx) => {
                const { inspTestid: rowTestId, ...rowWithoutTestId } = row;
                const { inspTestid: innerRowTestId, ...innerRowWithoutTestId } = innerRow;

                return (JSON.stringify(rowWithoutTestId) === JSON.stringify(innerRowWithoutTestId) && idx !== innerIdx);
            }) !== -1;
        });

        if (hasDuplicates) toast.error('Duplicate entries found.');
    };

    const handleReceivingDateChange = (date, index) => {
        const newRows = [...inspectionRows];
        newRows[index].inspReceivingDate = date;
        setInspectionRows(newRows);
    };

    useEffect(() => {
        if (action == "edit") {
            fetchEditDetails()
        } else {
            fetchDropdownValues();
        }
    }, []);

    const fetchDropdownValues = async () => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=${encryptData('External')}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const coatingTypes = response.data.CoatingType.map(item => ({ value: item.CoatingType_Id, label: item.CoatingType }));
            const clients = response.data.Clients.map(item => ({ value: item.ClientID, label: item.ClientName }));
            const materials = response.data.MatManGrade;
            const manufacturers = response.data.MatManufacture;
            const grades = response.data.MatGrade;

            setCoatingTypes(coatingTypes);
            setClients(clients);
            setMaterials(materials);
            setManufacturers(manufacturers);
            setGrades(grades);

            if (response.data) {
                await procedure();
            }
        } catch (error) {
            console.error('Error fetching dropdown values:', error);
        }
    };

    const procedure = async () => {
        try {
            const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?test_id=${encryptData('606')}&master_id=${encryptData('0')}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const procedures = response?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
            setProcedures(procedures);
            setSelectedProcedures(procedures);
            setUnitFetched(true);
        } catch (error) {
            console.log('Error fetching data:', error)
        }
    }

    useEffect(() => {
        const getUnit = async () => {
            try {
                const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetCalibrationDataList`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const unit = response?.data[0].calibrationData.Units_Of_Measure.map(item => ({ value: item.masterid, label: item.valname }));
                setUnit(unit);
            } catch (error) {
                console.log('Error fetching data:', error)
            }
        }
        if (unitFetched) {
            getUnit();
        }
    }, [unitFetched]);

    const handleSubmit = async (e, value) => {
        e.preventDefault();

        if (!selectedCoatingTypes) {
            toast.error('Please select Type Of Coating');
            return;
        }
        if (!selectedProcedures || selectedProcedures.length === 0) {
            toast.error('Please select Procedure / WI No.');
            return;
        }
        if (!selectedDate) {
            toast.error('Please select Inspection Date');
            return;
        }

        let allRowsValid = true;
        inspectionRows.forEach((row, index) => {
            if (row.inspReceivingDate === null) {
                toast.error(`Please select Receiving Date for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspMaterialId === '') {
                toast.error(`Please select Material for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspManufacturerId === '') {
                toast.error(`Please select Manufacturer for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspGradeId === '') {
                toast.error(`Please select Grade for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspBatchNo === '') {
                toast.error(`Please enter Batch No. for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspValue === '') {
                toast.error(`Please enter Received Quantity for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspUnit === '') {
                toast.error(`Please select Unit for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspLabTestReportNo === '') {
                toast.error(`Please enter Lab Test Report No. for row ${index + 1}`);
                allRowsValid = false;
            } else if (row.inspTestStatus === '') {
                toast.error(`Please enter Test Status for row ${index + 1}`);
                allRowsValid = false;
            }
        });

        if (!allRowsValid) return;

        setLoading(true);
        const formattedDate = new Date(selectedDate).toLocaleDateString("fr-CA").replace(/\//g, "-").split(" ")[0];
        try {
            const payload = {
                compId: 1,
                locId: 1,
                type_of_coating: (selectedCoatingTypes.value).toString(),
                client_id: selectedClient ? selectedClient.value : 0,
                procedure_wi_No: selectedProcedures.map(proc => proc.value).join(',') + ",",
                inspection_date: formattedDate,
                insp_status: "A",
                inspReportSeqNo: 0,
                userid: empId,
                inspID: parseInt(id) || 0,
                roleId: parseInt(roleId),
                issumbit: value === true ? 1 : 0,
                inspectiondata: inspectionRows.map((row) => ({
                    inspReceivingDate: new Date(row.inspReceivingDate).toLocaleDateString("fr-CA").replace(/\//g, "-").split(" ")[0],
                    inspMaterialId: row.inspMaterialId,
                    inspManufacturerId: row.inspManufacturerId,
                    inspGradeId: row.inspGradeId,
                    inspBatchNo: row.inspBatchNo,
                    inspValue: (row.inspValue).toString(),
                    inspUnit: parseInt(row.inspUnit, 10),
                    inspLabTestReportNo: row.inspLabTestReportNo,
                    inspTestStatus: row.inspTestStatus,
                    inspRemarks: row.inspRemarks
                }))
            };

            let response;

            response = await axios.post(Environment.BaseAPIURL + '/api/User/InsertRMInspectiondata', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const responseBody = await response.data;
            if (responseBody === "Inserted Successfully") {
                toast.success(responseBody);
                setLoading(false);
                navigate(`/rawmaterialinwardlist?moduleId=${moduleId}&menuId=${menuId}`);
            } else {
                setLoading(false);
                toast.error(responseBody);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error submitting data:', error);
            toast.error('Failed');
        }
    };

    const allFieldsFilled = inspectionRows.every(row => (
        row.inspReceivingDate !== null &&
        row.inspMaterialId !== '' &&
        row.inspManufacturerId !== '' &&
        row.inspGradeId !== '' &&
        row.inspBatchNo !== '' &&
        row.inspValue !== '' &&
        row.inspUnit !== '' &&
        row.inspTestStatus !== ''
    ));

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
                                            <li> <Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                            <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                            <li> <Link to={`/rawmaterialinwardlist?moduleId=${moduleId}&menuId=${menuId}`}> Raw Material Inward </Link> <b style={{ color: '#fff' }}></b></li>
                                            <li><h1>/ &nbsp;Raw Material Inspection</h1></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className='RawmaterialPageSection RawmaterialInspectionPageSection'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <div className='PipeTallySheetDetails'>
                                            <form action="" className='row m-0'>
                                                <div className='col-md-3 col-sm-3 col-xs-12'>
                                                    <div className='form-group' style={{ marginBottom: '0' }}>
                                                        <label htmlFor='coatingTypes' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Type Of Coating </label>
                                                        <Select
                                                            options={coatingTypes}
                                                            value={selectedCoatingTypes}
                                                            onChange={setSelectedCoatingTypes}
                                                            placeholder='Search or Select coating type...'
                                                            isClearable
                                                        />
                                                    </div>
                                                </div>
                                                <div className='col-md-3 col-sm-3 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label htmlFor='clientName' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Client Name <b style={{ color: 'grey' }}>(optional)</b></label>
                                                        <Select
                                                            options={clients}
                                                            value={selectedClient}
                                                            onChange={setSelectedClient}
                                                            placeholder='Search or Select client...'
                                                            isClearable
                                                        />
                                                    </div>
                                                </div>
                                                <div className='col-md-3 col-sm-3 col-xs-12'>
                                                    <div className='form-group'>
                                                        <label>Procedure / WI No.</label>
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
                                                <div className='col-md-3 col-sm-3 col-xs-12'>
                                                    <div className='form-group' style={{ marginBottom: '10px' }}>
                                                        <label htmlFor="">Date</label>
                                                        <DatePicker
                                                            maxDate={Date.now()}
                                                            selected={selectedDate}
                                                            onChange={date => { setSelectedDate(date); console.log(date) }}
                                                            placeholderText='DD-MM-YYYY'
                                                            className='form-control date-picker'
                                                            dateFormat="dd-MM-yyyy"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <div id="custom-scroll" style={{ overflow: 'auto' }}>
                                                        <Table className='RawmaterialInspectionTable'>
                                                            <thead>
                                                                <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                    <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                                                    <th style={{ minWidth: '120px' }}>Receiving Date</th>
                                                                    <th style={{ minWidth: '210px' }}>Material Description</th>
                                                                    <th style={{ minWidth: '190px' }}>Manufacturer</th>
                                                                    <th style={{ minWidth: '150px' }}>Grade</th>
                                                                    <th style={{ minWidth: '160px' }}>Batch No.</th>
                                                                    <th style={{ minWidth: '180px' }}>Received Quantity</th>
                                                                    <th style={{ minWidth: '130px' }}>Lab Test Report No.</th>
                                                                    <th style={{ minWidth: '140px' }}>Inspection Status</th>
                                                                    <th style={{ minWidth: '260px' }}>Remarks</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {inspectionRows.map((row, index) => (
                                                                    <tr key={row.inspTestid}>
                                                                        <td>{index + 1}</td>
                                                                        <td>
                                                                            <DatePicker
                                                                                maxDate={Date.now()}
                                                                                selected={row.inspReceivingDate}
                                                                                onChange={(date) => handleReceivingDateChange(date, index)}
                                                                                dateFormat="dd-MM-yyyy"
                                                                                placeholderText='DD-MM-YYYY'
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <select className="form-control" name="inspMaterialId"
                                                                                value={row.inspMaterialId}
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                            >
                                                                                <option value="">Select material</option>
                                                                                {materials
                                                                                    .filter(material => index === 0 || material.Material_Id === inspectionRows[0].inspMaterialId)
                                                                                    .map((material) => (
                                                                                        <option key={material.Material_Id} value={material.Material_Id}>
                                                                                            {material.Material}
                                                                                        </option>
                                                                                    ))}
                                                                            </select>
                                                                        </td>
                                                                        <td>
                                                                            <select className="form-control" name="inspManufacturerId"
                                                                                value={row.inspManufacturerId}
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                            >
                                                                                <option value="">Select manufacturer</option>
                                                                                {manufacturers
                                                                                    .filter(manufacturer => manufacturer.Material_Id === row.inspMaterialId)
                                                                                    .map((manufacturer) => (
                                                                                        <option key={manufacturer.Manfacturer_Id} value={manufacturer.Manfacturer_Id}>{manufacturer.Manfacturer}</option>
                                                                                    ))}
                                                                            </select>
                                                                        </td>
                                                                        <td>
                                                                            <select className="form-control" name="inspGradeId"
                                                                                value={row.inspGradeId}
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                            >
                                                                                <option value="">Select grade</option>
                                                                                {grades
                                                                                    .filter(grade => grade.Material_Id == row.inspMaterialId && grade.Manfacturer_Id == row.inspManufacturerId)
                                                                                    .map((grade) => (
                                                                                        <option key={grade.Grade_Id} value={grade.Grade_Id}>{grade.Grade}</option>
                                                                                    ))}
                                                                            </select>
                                                                        </td>
                                                                        <td>
                                                                            <input type="text"
                                                                                name='inspBatchNo'
                                                                                id={`inspBatchNo-${index}`}
                                                                                value={row.inspBatchNo}
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                                maxLength="20"
                                                                                placeholder='Enter batch no.' /></td>
                                                                        <td>
                                                                            <div className='ReceivedQuantityFlex'>
                                                                                <input type="text"
                                                                                    name='inspValue'
                                                                                    id={`inspValue-${index}`}
                                                                                    value={row.inspValue}
                                                                                    onChange={(e) => handleInputChange(e, index)}
                                                                                    placeholder='Enter quantity'
                                                                                    style={{ minWidth: '100px' }}
                                                                                    onInput={(e) => {
                                                                                        e.target.value = e.target.value.replace(/[^0-9\.]/g, '');
                                                                                    }}
                                                                                />
                                                                                <Select
                                                                                    menuPortalTarget={document.querySelector("body")}
                                                                                    name="inspUnit"
                                                                                    id={`inspUnit-${index}`}
                                                                                    value={unit.find(option => option.value === row.inspUnit)}
                                                                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'inspUnit', value: selectedOption.value } }, index)}
                                                                                    options={unit}
                                                                                    placeholder='Select unit...'
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <input type="text"
                                                                                name='inspLabTestReportNo'
                                                                                id={`inspLabTestReportNo-${index}`}
                                                                                value={row.inspLabTestReportNo}
                                                                                maxLength="20"
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                                placeholder='Enter LTRN' /></td>
                                                                        <td>
                                                                            <select name="inspTestStatus" id={`inspTestStatus-${index}`}
                                                                                value={row.inspTestStatus}
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                            >
                                                                                <option selected disabled value="">Select status</option>
                                                                                <option value="ok"> OK</option>
                                                                                <option value="notOk"> Not OK</option>
                                                                            </select>
                                                                        </td>
                                                                        <td>
                                                                            <textarea
                                                                                name='inspRemarks'
                                                                                id={`inspRemarks-${index}`}
                                                                                value={row.inspRemarks}
                                                                                onChange={(e) => handleInputChange(e, index)}
                                                                                placeholder='Enter remarks'></textarea>
                                                                        </td>
                                                                        <td>
                                                                            {row.inspTestid > 1 && (
                                                                                <i className="fas fa-trash-alt" onClick={() => removeRow(row.inspTestid)} disabled={inspectionRows.length === 1}></i>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                    {allFieldsFilled &&
                                                        <div style={{ width: "100%", textAlign: "right", marginTop: "20px" }}>
                                                            <button type="button" className="AddnewBtn" onClick={addRow} >
                                                                <i className="fas fa-plus"></i> Add
                                                            </button>
                                                        </div>}
                                                </div>
                                                <div className='SaveButtonBox'>
                                                    <div className='SaveButtonFlexBox'>
                                                        <button type='button' className="DraftSaveBtn SubmitBtn" style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, false)}>Save Draft</button>
                                                        <button type='button' style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, true)}>Submit</button>
                                                    </div>
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
export default Rawmaterialinspection;