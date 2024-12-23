import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../Loading";
import "../Calibration/Calibration.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Select from "react-select";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import axios from 'axios';
import Environment from "../../environment";
import YesImg from '../../assets/images/check.png'
import NoImg from '../../assets/images/remove.png'
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import secureLocalStorage from "react-secure-storage";
import { decryptData } from "../Encrypt-decrypt";

function Calibration() {
  const token = secureLocalStorage.getItem('token')
  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");
  let Id1 = decryptData(Id)
  const action = searchParams.get("action");
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    action == 'edit' ? fetchCalibrationDetails() : fetchOptions();

    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])

  const fetchCalibrationDetails = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCalibrationDatabyid?id=${Id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = response.data[0];
      fetchOptions();
      setFormData({
        ...formData,
        pm_calib_contr_no: data.pm_calib_contr_no,
        pm_calib_ser_no: data.pm_calib_ser_no,
        pm_calib_asset_no: data.pm_calib_asset_no,
        pm_Inst_name_id: data.pm_calib_inst_name_id,
        pm_calib_model: data.pm_calib_model,
        pm_calib_manufac_id: data.pm_calib_manufac_id,
        pm_calib_meas_units_id: data.pm_calib_meas_units_id,
        pm_calib_range_min: data.pm_calib_range_min,
        pm_calib_range_max: data.pm_calib_range_max,
        pm_working_range_min: data.pm_calib_work_range_min,
        pm_working_range_max: data.pm_calib_work_range_max,
        least_count_min: data.pm_calib_least_min,
        least_count_max: data.pm_calib_least_max,
        pm_calib_accuracy: data.pm_calib_accuracy,
        pm_accept_criteria: data.pm_calib_acc_criteria,
        pm_calib_dt_acq: new Date(data.pm_calib_dt_acq),
        pm_calib_cond_acq_id: data.pm_calib_cond_acq_id,
        pm_calib_loc_id: data.pm_calib_loc_id,
        pm_calib_status_id: data.pm_calib_status_id,
        pm_calib_next_calib: new Date(data.pm_next_calib),
        pm_calib_last_calib: new Date(data.pm_last_calib),
        pm_calib_gage_cost: data.pm_calib_gage_cost,
        ref_standard: data.pm_calib_ref_std,
        pm_isACM: data.pm_calib_isamc,
        isNABL: data.pm_calib_isnabl,
        pm_calib_yrs: data.pm_calib_yrs,
        pm_calib_months: data.pm_calib_months,
        pm_calib_days: data.pm_calib_days,
        pm_calib_other_info: data.pm_calib_other_info,
        mst_calib_date: new Date(data.pm_calib_date_master),
        mst_calib_due_date: new Date(data.pm_calib_due_date_master),
        mst_cert_no: data.pm_certificate_no_master,
        mst_inst_range_min: data.pm_inst_range_min_master,
        mst_inst_range_max: data.pm_inst_range_max_master,
        mst_inst_name: data.pm_inst_name_master,
        mst_inst_id: data.pm_inst_id_master,
        calib_attach_name: data.pm_calib_attachmnt,
        mst_attchmnt_name: data.pm_instrument_attach_master
      });
      updateGageListId(data.pm_calib_asset_no, data.pm_calib_gagelist_id);
      if (formData.calib_attach_name) {
        setSelectedFiles([{ name: `${data.pm_calib_attachmnt}`, size: 1024 * 1024 }]); // Example
      }
      if (formData.mst_attchmnt_name) {
        setFiles([{ name: `${data.pm_instrument_attach_master}`, size: 1024 * 1024 }]); // Example
      }

      // Set dropdown selections
      setSelectedStatus({ value: data.pm_calib_status_id, label: data.pm_calib_status });
      setSelectedType({ value: data.pm_calib_inst_name_id, label: data.pm_calib_inst_name });
      setSelectedManufacturer({ value: data.pm_calib_manufac_id, label: data.pm_calib_manufac });
      setSelectedUnits({ value: data.pm_calib_meas_units_id, label: data.pm_calib_meas_units });
      setSelectedAcquired({ value: data.pm_calib_cond_acq_id, label: data.pm_calib_cond_acq });
      setSelectedLocation({ value: data.pm_calib_loc_id, label: data.pm_calib_location });
      setSelectedAssignee({ value: data.emp_id, label: data.Asignee });
      setSelectedReportFormat([{ value: data.pm_report_format_id != null ? parseInt(data.pm_report_format_id) : '', label: data.pm_report_format_id != null ? data.pm_report_format : '' }]);
      setSelectedEnvironment({ value: data.pm_calib_env_id, label: data.pm_calib_env });
      setSelectedInstruction({ value: data.pm_calib_inst_id, label: data.pm_calib_inst_id1 });
      setSelectedInstrument({ value: data.pm_calib_inst_type_id, label: data.pm_calib_inst_type });
      setSelectedVendors({ value: data.pm_calib_src_vendor_id, label: data.pm_calib_src_vendor });
    } catch (error) {
      console.error("Error fetching calibration details:", error);
    }
  };

  const navigate = useNavigate();
  const userId = secureLocalStorage.getItem("userId");
  const departmentId = secureLocalStorage.getItem('departmentId');
  const userDepartment = secureLocalStorage.getItem('userDepartment');

  const optionsYears = Array.from({ length: 21 }, (_, i) => ({ value: i.toString(), label: i.toString() }));
  const optionsMonths = Array.from({ length: 13 }, (_, i) => ({ value: i.toString(), label: i.toString() }));
  const optionsDays = Array.from({ length: 32 }, (_, i) => ({ value: i.toString(), label: i.toString() }));

  // Attachment Files
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e, fieldName) => {
    let value = e.target.value;
    if ((fieldName === 'calib_attach_name' || fieldName === 'mst_attchmnt_name') && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        e.target.value = '';
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error("Upload file less than 50 MB");
        e.target.value = '';
        return;
      }

      const base64Value = await fileToBase64(file);

      if (fieldName === 'calib_attach_name') {
        setFormData(prevData => ({
          ...prevData,
          pm_calib_attachmnt: base64Value,
          calib_attach_name: file.name
        }));
      } else if (fieldName === 'mst_attchmnt_name') {
        setFormData(prevData => ({
          ...prevData,
          mst_attachmnt: base64Value,
          mst_attchmnt_name: file.name
        }));
      }
      return;
    }

    setFormData(prevData => ({ ...prevData, [fieldName]: value }));
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedBase64Files = formData.pm_calib_attachmnt.filter((_, i) => i !== index);
    const updatedFileNames = formData.calib_attach_name.filter((_, i) => i !== index);

    setFiles(updatedFiles);
    setFormData({
      ...formData,
      pm_calib_attachmnt: updatedBase64Files,
      calib_attach_name: updatedFileNames
    });
  };

  // ----------------------------------------------

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  const [ManufacturerOptions, setManufacturerOptions] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  const [unitsOptions, setUnitsOptions] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState(null);

  const [AcquiredOptions, setAcquiredOptions] = useState([]);
  const [selectedAcquired, setSelectedAcquired] = useState(null);

  const [LocationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [AssigneeOptions, setAssigneeOptions] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  const [EnvironmentOptions, setEnvironmentOptions] = useState([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);

  const [InstructionOptions, setInstructionOptions] = useState([]);
  const [selectedInstruction, setSelectedInstruction] = useState(null);

  const [InstrumentType, setInstrumentType] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  const [ReportFormat, setReportFormat] = useState([]);
  const [selectedReportFormat, setSelectedReportFormat] = useState(null);

  const [Vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState(null);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCalibrationDataList`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data && response.data[0] && response.data[0].calibrationData) {
        const calibrationData = response.data[0].calibrationData;

        setStatusOptions(mapOptions(calibrationData.Status));
        // setTypeOptions(mapOptions(calibrationData.Type));
        setManufacturerOptions(mapOptions(calibrationData.Manufacturer));
        setUnitsOptions(mapOptions(calibrationData.Units_Of_Measure));
        setAcquiredOptions(mapOptions(calibrationData.Condition_Acquired));
        setLocationOptions(mapOptions(calibrationData.Location));
        setAssigneeOptions(mapOptions(calibrationData.Assignee));
        setEnvironmentOptions(mapOptions(calibrationData.Environment));
        setInstructionOptions(mapOptions(calibrationData.Instruction));
        setInstrumentType(mapOptions(calibrationData.InstrumentTypes));
        setReportFormat(mapOptions(calibrationData.Report));
        setVendors(mapOptions(calibrationData.Vendors));

        const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetInstrumentDropdown`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setTypeOptions(mapOptions1(response1.data));
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching the options:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapOptions = (data) => {
    return data.map(item => ({
      value: item.masterid,
      label: item.valname
    }));
  };

  const mapOptions1 = (data) => {
    return data.map(item => ({
      value: item.co_param_val_Id,
      label: item.co_param_val_name,
      id: item.next_calib_gagelist_id
    }));
  };

  const handleStatusChange = selectedOption => {
    setSelectedStatus(selectedOption);
  };

  const [assetNo, setAssetNo] = useState('');
  const [serialNo, setSerialNo] = useState();
  const [gageListId, setGageListId] = useState('TSM/LDP/COAT/QA');

  useEffect(() => {
    if (action != "edit") {
      updateGageListId(assetNo, serialNo);
    }
  }, [assetNo, selectedType]);

  const handleTypeChange = (selectedOption) => {
    setSelectedType(selectedOption);
    setSerialNo(selectedOption?.id)
    if (selectedOption) {
      const cleanedLabel = selectedOption.label.replace(/\s*\(.*?\)\s*/g, ' ').trim();
      const firstLetters = cleanedLabel
        .split(' ')
        .map(word => word[0])
        .join('');
      setAssetNo(firstLetters);
    } else {
      setAssetNo('');
    }
  };

  const handleAssetNoChange = (event) => {
    const newAssetNo = event.target.value;
    setAssetNo(newAssetNo);
  };

  const updateGageListId = (assetNo, serialNo) => {
    console.log(assetNo, serialNo)
    const prefix = 'TSM/LDP/COAT/QA';
    const gageId = `${prefix}/${assetNo}-${serialNo}`;
    setGageListId(gageId);
  };

  const handleManufacturerChange = selectedOption => {
    setSelectedManufacturer(selectedOption);
  };

  const handleUnitsChange = selectedOption => {
    setSelectedUnits(selectedOption);

    const match = selectedOption.label.match(/\(([^)]+)\)$/);
    const newRangeOptionValue = match ? match[1] : '---';

    const newRangeOptions = [{ value: newRangeOptionValue, label: newRangeOptionValue }];
    setRangeOptions(newRangeOptions);
  };

  const handleAcquiredChange = selectedOption => {
    setSelectedAcquired(selectedOption);
  };

  const handleLocationChange = selectedOption => {
    setSelectedLocation(selectedOption);
  };

  const handleAssigneeChange = selectedOption => {
    setSelectedAssignee(selectedOption);
  };

  const handleEnvironmentChange = selectedOption => {
    setSelectedEnvironment(selectedOption);
  };

  const handleInstructionChange = selectedOption => {
    setSelectedInstruction(selectedOption);
  };

  const handleInstrumentType = selectedOption => {
    setSelectedInstrument(selectedOption);
  };

  const handleReportChange = selectedOption => {
    console.log(selectedOption)
    setSelectedReportFormat(selectedOption);
  };

  const handleVendorChange = selectedOption => {
    setSelectedVendors(selectedOption);
  };

  // ---------------------------------------------

  const [formData, setFormData] = useState({
    co_comp_id: 1,
    co_location_id: 1,
    calib_id: Id1,
    gagelist_id: 0,
    pm_calib_contr_no: "",
    pm_calib_ser_no: "",
    pm_calib_asset_no: "",
    pm_Inst_name_id: 0,
    pm_calib_model: "",
    pm_calib_manufac_id: 0,
    pm_calib_instr_type_id: 0,
    pm_calib_meas_units_id: 0,
    pm_calib_range_min: null,
    pm_calib_range_max: null,
    pm_working_range_min: null,
    pm_working_range_max: null,
    least_count_min: null,
    least_count_max: null,
    pm_calib_accuracy: "",
    pm_accept_criteria: "",
    pm_calib_nist_no: "",
    pm_calib_dt_acq: "",
    pm_calib_cond_acq_id: 0,
    pm_calib_src_vendor: "",
    pm_calib_gage_cost: "",
    ref_standard: false,
    ref_value: "",
    isNABL: false,
    pm_isACM: false,
    plant_name: "",
    pm_calib_loc_id: 0,
    pm_department_id: 0,
    report_format: "",
    pm_calib_area_id: 0,
    emp_id: 0,
    pm_calib_intrv_id: 0,
    pm_calib_yrs: 0,
    pm_calib_months: 0,
    pm_calib_days: 0,
    pm_calib_env_id: 0,
    pm_calib_inst_id: 0,
    calib_attach_name: "",
    pm_calib_attachmnt: "",
    pm_calib_other_info: "",
    pm_calib_status_id: 0,
    pm_calib_last_calib: "",
    pm_calib_next_calib: "",
    pm_calib_isactive: false,
    pm_calib_isdeleted: false,
    mst_inst_name: "",
    mst_inst_id: "",
    mst_inst_range_min: null,
    mst_inst_range_max: null,
    mst_inst_unit_id: 0,
    mst_calib_date: "",
    mst_calib_due_date: "",
    mst_cert_no: "",
    mst_attchmnt_name: "",
    mst_attachmnt: "",
    mst_attchmnt_info: "",
    userid: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(123, selectedReportFormat)
    try {
      const updatedFormData = {
        ...formData,
        gagelist_id: parseInt(gageListId.split("-")[1]),
        pm_calib_asset_no: assetNo,
        pm_Inst_name_id: selectedType.value,
        pm_calib_manufac_id: selectedManufacturer.value,
        pm_calib_instr_type_id: selectedInstrument.value,
        pm_calib_meas_units_id: selectedUnits.value,
        pm_calib_range_min: parseFloat(formData.pm_calib_range_min),
        pm_calib_range_max: parseFloat(formData.pm_calib_range_max),
        pm_working_range_min: parseFloat(formData.pm_working_range_min),
        pm_working_range_max: parseFloat(formData.pm_working_range_max),
        least_count_min: parseFloat(formData.least_count_min),
        least_count_max: parseFloat(formData.least_count_max),
        pm_calib_cond_acq_id: selectedAcquired.value,
        pm_calib_loc_id: selectedLocation.value,
        pm_department_id: departmentId,
        report_format: selectedReportFormat?.map(proc => proc.value).join(','),
        emp_id: selectedAssignee.value,
        mst_calib_date: new Date(formData.mst_calib_date).toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0],
        mst_calib_due_date: new Date(formData.mst_calib_due_date).toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0],
        pm_calib_dt_acq: new Date(formData.pm_calib_dt_acq).toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0],
        pm_calib_last_calib: new Date(nextCalibrationDate).toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0],
        pm_calib_next_calib: new Date(nextCalibrationDate).toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0],
        pm_calib_yrs: parseInt(formData.pm_calib_yrs),
        pm_calib_months: parseInt(formData.pm_calib_months),
        pm_calib_days: parseInt(formData.pm_calib_days),
        pm_calib_env_id: selectedEnvironment.value,
        pm_calib_inst_id: selectedInstruction.value,
        pm_calib_status_id: selectedStatus.value,
        mst_inst_range_min: parseFloat(formData.mst_inst_range_min),
        mst_inst_range_max: parseFloat(formData.mst_inst_range_max),
        userid: userId,
        pm_calib_src_vendor: (selectedVendors.value).toString(),
      };

      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/InsertCalibrationData`, updatedFormData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log('Calibration data submitted successfully');
        toast.success("Form submitted successfully!", { delay: 100 });
        navigate(`/calibrationlist?moduleId=${moduleId}&menuId=${menuId}`);
      } else {
        console.error('Failed to submit calibration data');
      }
    } catch (error) {
      console.error('Error submitting calibration data:', error);
      toast.error("Error submitting form. Please try again.", { delay: 100 });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleDropdownChange = (field, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : null,
    }));
  };

  const currentDate = new Date();
  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: new Date(date),
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let min, max;

    switch (name) {
      case 'pm_calib_range_min':
        max = parseFloat(formData.pm_calib_range_max);
        break;
      case 'pm_calib_range_max':
        min = parseFloat(formData.pm_calib_range_min);
        break;
      case 'pm_working_range_min':
        min = parseFloat(formData.pm_calib_range_min);
        max = parseFloat(formData.pm_calib_range_max) && parseFloat(formData.pm_working_range_max);
        break;
      case 'pm_working_range_max':
        min = parseFloat(formData.pm_working_range_min);
        max = parseFloat(formData.pm_calib_range_max);
        break;
      default:
        break;
    }

    if (value < min || value > max) {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: ''
      }));
    }
  };

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      ref_standard: value === "Yes"
    }));
  };

  // ---------------------------------------------------------

  const [rangeOptions, setRangeOptions] = useState([{ value: '', label: '---' }]);

  const [nextCalibrationDate, setNextCalibrationDate] = useState('Auto');

  useEffect(() => {
    const { pm_calib_yrs, pm_calib_months, pm_calib_days } = formData;
    if (pm_calib_yrs || pm_calib_months || pm_calib_days) {
      const currentDate = new Date();
      const yearsToAdd = parseInt(pm_calib_yrs) || 0;
      const monthsToAdd = parseInt(pm_calib_months) || 0;
      const daysToAdd = parseInt(pm_calib_days) || 0;

      const nextDate = new Date(
        currentDate.getFullYear() + yearsToAdd,
        currentDate.getMonth() + monthsToAdd,
        currentDate.getDate() + daysToAdd
      );

      setNextCalibrationDate(nextDate);
    } else {
      setNextCalibrationDate('Auto');
    }
  }, [formData]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Admin</Link></li>
                    <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/calibrationlist?moduleId=${moduleId}&menuId=${menuId}`}> Calibration List</Link></li>
                    <li><h1>/&nbsp; Calibration </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="RegisterEmployeePageSection CalibrationPageSection">
            <div className="container">
              <div className="row">
                <div className="">
                  <form className="RegisterEmployeeForm row m-0" onSubmit={handleSubmit}>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h4>Calibration <span>- Add page</span></h4>
                    </div>

                    <div className="CalibrationDepartmentSection">
                      <div className="form-group">
                        <label htmlFor="">Department <b>*</b></label>
                        <input type="text" defaultValue={userDepartment} style={{ background: 'whitesmoke', width: '30%' }} />
                      </div>
                    </div>

                    <div className="accordion" id="accordionExample">
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingOne">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Gage Status
                          </button>
                        </h2>
                        <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                          <div className="accordion-body row m-0">
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='status'>Status</label>
                              <Select
                                name="pm_calib_status_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select status..."
                                options={statusOptions}
                                value={selectedStatus}
                                onChange={(option) => {
                                  setSelectedStatus(option);
                                  handleDropdownChange('pm_calib_status_id', option);
                                }}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='pm_calib_last_calib'>Last Calibration</label>
                              <DatePicker
                                name="pm_calib_last_calib"
                                selected={formData.pm_calib_last_calib}
                                onChange={(date) => handleDateChange(date, 'pm_calib_last_calib')}
                                maxDate={new Date()}
                                dateFormat="dd-MM-yyyy"
                                placeholderText='DD-MM-YYYY'
                                showDisabledMonthNavigation
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Next Calibration Due</label>
                              <input
                                style={{ pointerEvents: 'none', background: "#f3f3f3" }}
                                name="pm_calib_next_calib"
                                type="text"
                                value={new Date(nextCalibrationDate).toLocaleDateString('en-GB')}
                              // value={action == 'edit' ? new Date(formData.pm_calib_next_calib).toLocaleDateString('en-GB') : new Date(nextCalibrationDate).toLocaleDateString("en-GB").replace(/\//g, "-").split(" ")[0]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingTwo">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Gage Information
                          </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                          <div className="accordion-body row m-0">
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">GageList ID</label>
                              <input type="text" value={gageListId} style={{ background: 'whitesmoke' }}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12 CreatedDateform'>
                              <label htmlFor=''>Created Date</label>
                              <DatePicker
                                name="createdDate"
                                selected={currentDate}
                                maxDate={currentDate}
                                dateFormat="dd-MM-yyyy"
                                placeholderText='DD-MM-YYYY'
                                showDisabledMonthNavigation
                                // 
                                style={{ pointerEvents: 'none', background: "#f3f3f3" }}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Serial No.</label>
                              <input type="text" placeholder="Enter serial no." name="pm_calib_ser_no" value={formData.pm_calib_ser_no}
                                onChange={handleChange} maxLength={50} />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor=''>Instrument Name</label>
                              <Select
                                name="pm_Inst_name_id"
                                className="select"
                                isSearchable
                                isClearable
                                isDisabled={action == "edit"}
                                isMulti={false}
                                placeholder="Search or Select Instrument Name..."
                                options={typeOptions}
                                value={selectedType}
                                onChange={handleTypeChange}
                              />
                            </div>
                            <div className="form-group col-md-4 col-sm-4 col-xs-12">
                              <label htmlFor="">Asset No.</label>
                              <input type="text" placeholder="Asset No." name="pm_calib_asset_no" value={assetNo || formData.pm_calib_asset_no}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Model</label>
                              <input
                                type="text"
                                placeholder="Enter model"
                                name="pm_calib_model"
                                value={formData.pm_calib_model}
                                onChange={handleChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor=''>Manufacturer</label>
                              <Select
                                name="pm_calib_manufac_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select manufacturer..."
                                options={ManufacturerOptions}
                                value={selectedManufacturer}
                                onChange={handleManufacturerChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor=''>Instrument Type</label>
                              <Select
                                name="pm_calib_instr_type_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select type..."
                                options={InstrumentType}
                                value={selectedInstrument}
                                onChange={handleInstrumentType}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor=''>Unit Of Measure</label>
                              <Select
                                name="pm_calib_meas_units_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select unit of measure..."
                                options={unitsOptions}
                                value={selectedUnits}
                                onChange={handleUnitsChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Range or Size</label>
                              <div className="RangeSizeFlexBox">
                                <input
                                  name="pm_calib_range_min"
                                  type="number"
                                  placeholder="min"
                                  onChange={handleChange}
                                  value={formData.pm_calib_range_min}
                                />
                                <input
                                  name="pm_calib_range_max"
                                  type="number"
                                  placeholder="max"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={formData.pm_calib_range_max}
                                  min={formData.pm_calib_range_min}
                                />
                                <select name="" id="" className="rangeOptionsSelect">
                                  {rangeOptions.map(option => (
                                    <option key={option.value} defaultValue={option.value} >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <ToastContainer />
                            </div>

                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Working Range</label>
                              <div className="RangeSizeFlexBox">
                                <input
                                  name="pm_working_range_min"
                                  type="number"
                                  placeholder="min"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={formData.pm_working_range_min}
                                  min={formData.pm_calib_range_min}
                                  max={formData.pm_calib_range_max}
                                />
                                <input
                                  name="pm_working_range_max"
                                  type="number"
                                  placeholder="max"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={formData.pm_working_range_max}
                                  min={formData.pm_working_range_min}
                                  max={formData.pm_calib_range_max}
                                />
                                <select name="" id="" className="rangeOptionsSelect">
                                  {rangeOptions.map(option => (
                                    <option key={option.value} defaultValue={option.value} >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <ToastContainer />
                            </div>

                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Least Count</label>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '10px' }}>-</span>
                                <input
                                  style={{ marginBottom: '0' }}
                                  name="least_count_min"
                                  type="number"
                                  placeholder="-"
                                  onChange={handleChange}
                                  value={formData.least_count_min}
                                />
                                <span style={{ marginLeft: '10px' }}>+</span>
                                <input
                                  name="least_count_max"
                                  type="number"
                                  placeholder="+"
                                  style={{ marginLeft: "10px", marginBottom: '0' }}
                                  onChange={handleChange}
                                  value={formData.least_count_max}
                                />
                              </div>
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Accuracy</label>
                              <input type="text" placeholder="Enter accuracy" name="pm_calib_accuracy" value={formData.pm_calib_accuracy} onChange={handleChange} />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Acceptance Criteria</label>
                              <input type="text" name="pm_accept_criteria" value={formData.pm_accept_criteria} onChange={handleChange} placeholder="Enter acceptance criteria" />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='pm_calib_dt_acq'>Date Acquired</label>
                              <DatePicker
                                name="pm_calib_dt_acq"
                                selected={formData.pm_calib_dt_acq}
                                onChange={(date) => handleDateChange(date, 'pm_calib_dt_acq')}
                                // maxDate={new Date()}
                                dateFormat="dd-MM-yyyy"
                                placeholderText='DD-MM-YYYY'
                                showDisabledMonthNavigation
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Condition Acquired</label>
                              <Select
                                name="pm_calib_cond_acq_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select condition acquired..."
                                options={AcquiredOptions}
                                value={selectedAcquired}
                                onChange={handleAcquiredChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Source/Vendor</label>
                              <Select
                                name="pm_calib_src_vendor"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select..."
                                options={Vendors}
                                value={selectedVendors}
                                onChange={handleVendorChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Gage Cost</label>
                              <input type="text" placeholder="Enter gage cost" name="pm_calib_gage_cost" value={formData.pm_calib_gage_cost} onChange={handleChange} />
                            </div>
                            <div className="form-group col-md-8 col-sm-8 col-xs-12">
                              <label htmlFor="">Reference Standard</label>
                              <div className="FormReferenceFlexBox">
                                <div className="FormGenderFlexBox">
                                  <div className="FormGenderBox">
                                    <label htmlFor="Yes">
                                      <span>
                                        <img src={YesImg} alt="YesImg" /> Yes
                                      </span>
                                      <input
                                        type="radio"
                                        id="Yes"
                                        name="Reference"
                                        value="Yes"
                                        checked={formData.ref_standard === true}
                                        onChange={handleRadioChange}
                                      />
                                    </label>
                                  </div>
                                  <div className="FormGenderBox">
                                    <label htmlFor="No">
                                      <span>
                                        <img src={NoImg} alt="NoImg" /> No
                                      </span>
                                      <input
                                        type="radio"
                                        id="No"
                                        name="Reference"
                                        value="No"
                                        checked={formData.ref_standard === false}
                                        onChange={handleRadioChange}
                                      />
                                    </label>
                                  </div>
                                </div>
                                {formData.ref_standard === true && (
                                  <div className="input-box">
                                    <input
                                      style={{ marginBottom: '0', cursor: 'pointer' }}
                                      type="text"
                                      id="referenceInput"
                                      name="referenceInput"
                                      value={formData.referenceInput}
                                      onChange={handleChange}
                                      placeholder="Enter reference standard"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="form-group col-md-12 col-sm-12 col-xs-12">
                              <label className="NABLCheckbox" htmlFor="isNABL">
                                <span style={{ margin: '10px' }}>NABL</span> <input type="checkbox" id="isNABL" name="isNABL" value="isNABL" checked={formData.isNABL} onChange={handleChange} style={{ cursor: 'pointer' }} />
                              </label>
                              <label className="NABLCheckbox" htmlFor="pm_isACM">
                                <span style={{ margin: '10px' }}>AMC</span> <input type="checkbox" id="pm_isACM" name="pm_isACM" value="pm_isACM" checked={formData.pm_isACM} onChange={handleChange} style={{ cursor: 'pointer' }} />
                              </label>
                            </div>

                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingThree">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            Gage Assignment
                          </button>
                        </h2>
                        <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                          <div className="accordion-body row m-0">
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Plant Name</label>
                              <input type="text" value="LDP" style={{ background: 'whitesmoke' }} />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Location</label>
                              <Select
                                name="pm_calib_loc_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select status..."
                                options={LocationOptions}
                                value={selectedLocation}
                                onChange={handleLocationChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Department</label>
                              <input type="text" defaultValue={userDepartment} style={{ background: 'whitesmoke' }} />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Report Format</label>
                              <Select
                                name="report_format"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti
                                placeholder="Search or Select status..."
                                options={ReportFormat}
                                value={selectedReportFormat}
                                onChange={handleReportChange}
                              />
                            </div>
                            {/* <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Area</label>
                              <Select
                                className="select"
                                isSearchable
                                isClearableLocation
                                isMulti={false}
                                placeholder="Search or Select status..."
                                options={AreaOptions}
                                value={selectedArea}
                                onChange={handleAreaChange} 
                              />
                            </div> */}
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Assignee</label>
                              <Select
                                name="emp_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select assignee..."
                                options={AssigneeOptions}
                                value={selectedAssignee}
                                onChange={handleAssigneeChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingFour">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                            Calibration Information
                          </button>
                        </h2>
                        <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                          <div className="accordion-body row m-0">
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Interval</label>
                              <div className="IntervalFlexBox">
                                <select name="pm_calib_yrs" value={formData.pm_calib_yrs} onChange={handleChange}>
                                  <option value="" disabled>Years</option>
                                  {optionsYears.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <select name="pm_calib_months" value={formData.pm_calib_months} onChange={handleChange}>
                                  <option value="" disabled>Months</option>
                                  {optionsMonths.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <select name="pm_calib_days" value={formData.pm_calib_days} onChange={handleChange}>
                                  <option value="" disabled>Days</option>
                                  {optionsDays.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Environment</label>
                              <Select
                                name="pm_calib_env_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select environment..."
                                options={EnvironmentOptions}
                                value={selectedEnvironment}
                                onChange={handleEnvironmentChange}
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor='batchno'>Instructions</label>
                              <Select
                                name="pm_calib_inst_id"
                                className="select"
                                isSearchable
                                isClearable
                                isMulti={false}
                                placeholder="Search or Select instructions..."
                                options={InstructionOptions}
                                value={selectedInstruction}
                                onChange={handleInstructionChange}
                              />
                            </div>
                            <div className='form-group col-md-12 col-sm-12 col-xs-12' style={{ marginTop: '20px' }}>
                              <label htmlFor='batchno'>Calibration Certificate Attachments</label>
                              <div className="AttachmentsFlexBox">
                                <input
                                  name="calib_attach_name"
                                  type="file"
                                  onChange={(e) => handleFileChange(e, 'calib_attach_name')}
                                  multiple
                                  accept="application/pdf"
                                // style={{ display: 'none' }}
                                // 
                                />
                                {/* <div className="ButtonFlexBox">
                                  <button onClick={handleAddFileClick} type="button">
                                    <i className="fa fa-plus"></i> Add File
                                  </button>
                                </div> */}
                                <p>(Each file less than 50 MB)</p>
                              </div>
                              <div className="CalibrationCertificateAttachmentsList">
                                <ul>
                                  {selectedFiles.map((file, index) => (
                                    <li key={index}>{file.name.split("_")[6]}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className='form-group col-md-12 col-sm-12 col-xs-12'>
                              <label htmlFor='batchno'>Other Information</label>
                              <textarea id="" placeholder="Enter other information" name="pm_calib_other_info" value={formData.pm_calib_other_info} onChange={handleChange} ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingSix">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                            Calibration Master
                          </button>
                        </h2>
                        <div id="collapseSix" className="accordion-collapse collapse" aria-labelledby="headingSix" data-bs-parent="#accordionExample">
                          <div className="accordion-body row m-0">
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Instrument Name</label>
                              <input type="text" name="mst_inst_name" value={formData.mst_inst_name} onChange={handleChange} placeholder="Enter instrument name" />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Instrument ID</label>
                              <input type="text" name="mst_inst_id" value={formData.mst_inst_id} onChange={handleChange} placeholder="Enter instrument ID" />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Instrument Range</label>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                  name="mst_inst_range_min"
                                  type="number"
                                  placeholder="min"
                                  onChange={handleChange}
                                  value={formData.mst_inst_range_min}
                                />
                                <input
                                  name="mst_inst_range_max"
                                  type="number"
                                  placeholder="max"
                                  style={{ marginLeft: "10px" }}
                                  onChange={handleChange}
                                  value={formData.mst_inst_range_max}
                                />
                                <select name="" id="" style={{ marginLeft: "20px", maxWidth: '27%', textTransform: 'lowercase' }}>
                                  {rangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Calibration Date</label>
                              <DatePicker
                                name="mst_calib_date"
                                selected={formData.mst_calib_date}
                                onChange={(date) => handleDateChange(date, 'mst_calib_date')}
                                maxDate={new Date()}
                                dateFormat="dd-MM-yyyy"
                                placeholderText='DD-MM-YYYY'
                                showDisabledMonthNavigation
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Calibration Due Date</label>
                              <DatePicker
                                name="mst_calib_due_date"
                                selected={formData.mst_calib_due_date}
                                onChange={(date) => handleDateChange(date, 'mst_calib_due_date')}
                                maxDate={new Date()}
                                dateFormat="dd-MM-yyyy"
                                placeholderText='DD-MM-YYYY'
                                showDisabledMonthNavigation
                              />
                            </div>
                            <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                              <label htmlFor="">Master Certificate No.</label>
                              <input type="text" name="mst_cert_no" value={formData.mst_cert_no} onChange={handleChange} placeholder="Enter master certificate no." />
                            </div>
                            <div className='form-group col-md-12 col-sm-12 col-xs-12'>
                              <label htmlFor='batchno'>Instrument Attachment</label>
                              <div className="AttachmentsFlexBox">
                                <input
                                  name="mst_attchmnt_name"
                                  type="file"
                                  onChange={(e) => handleFileChange(e, 'mst_attchmnt_name')}
                                  accept="application/pdf"
                                  multiple
                                  ref={fileInputRef}
                                // style={{ display: 'none' }}
                                // 
                                />
                                {/* <div className="ButtonFlexBox">
                                  <button onClick={handleAddFileClick} type="button">
                                    <i className="fa fa-plus"></i> Add File
                                  </button>
                                </div> */}
                                <p>(Each file less than 50 MB)</p>
                                <div className="CalibrationCertificateAttachmentsList">
                                  <ul>
                                    {files.map((file, index) => (
                                      <li key={index}>{file.name.split("_")[6]}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              {/* <table className="AttachmentsTable">
                                <thead>
                                  <tr>
                                    <th>File Name</th>
                                    <th>Size</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {files.map((file, index) => (
                                    <tr key={index}>
                                      <td>{file.name.split("/Upload/")}</td>
                                      <td>{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                                      <td><i className="fa fa-trash" onClick={() => handleRemoveFile(index)}></i></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingFive">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                            Calibration History
                          </button>
                        </h2>
                        <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                          <div className="accordion-body row m-0">
                            <div className="col-md-12 col-sm-12 col-xs-12 p-0">
                              <div className="CalibrationHistorytable" id="custom-scroll">
                                <table>
                                  <thead>
                                    <tr>
                                      <th style={{ minWidth: '120px' }}>Record No.</th>
                                      <th style={{ minWidth: '150px' }}>Calibration Date</th>
                                      <th style={{ minWidth: '200px' }}>Calibrated By</th>
                                      <th style={{ minWidth: '120px' }}>Result</th>
                                      <th style={{ minWidth: '200px' }}>Adjustments </th>
                                      <th style={{ minWidth: '150px' }}>Repairs </th>
                                      <th style={{ minWidth: '200px' }}>Gage Status - As Found</th>
                                      <th style={{ minWidth: '200px' }}>Gage Status - As Left</th>
                                      <th style={{ minWidth: '200px' }}>Next Calibration Due</th>
                                      <th style={{ minWidth: '200px' }}>File Attachment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>1</td>
                                      <td>08-08-2024</td>
                                      <td>Digambar Mahanwar</td>
                                      <td>-</td>
                                      <td>Yes</td>
                                      <td>Yes</td>
                                      <td>Active</td>
                                      <td>Inactive</td>
                                      <td>08-08-2025</td>
                                      <td><button type="button" className="DownloadBtn">Download</button></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='form-group col-md-12 col-sm-12 col-xs-12' style={{ textAlign: "right", marginTop: "10px" }}>
                      <button type="submit" className="SubmitBtn">Submit</button>
                    </div>
                  </form>
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

export default Calibration;