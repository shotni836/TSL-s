import React, { useState, useEffect } from 'react'
import './Beforeprocesslabtesting.css'
import { Table } from 'react-bootstrap';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Beforeprocesslabtesting() {

  const [apiResponse, setApiResponse] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [Instrument, setInstrument] = useState([]);
  const [procedureinputContent, setprocedureInputContent] = useState('');
  const [proceduresuggestions, setprocedureSuggestions] = useState([]);
  const [procedureselectedSuggestion, setprocedureSelectedSuggestion] = useState('');
  const [processsheetno, setprocesssheetno] = useState('');
  const [SubTestListResp, setSubTestListResp] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableData1, setTableData1] = useState([]);

  const [educationData, setEducationData] = useState([
    {
      emp_user_id: 1,
      emp_edu_id: 1,
      emp_degree_id: '',
      emp_start_yr: '',
      emp_end_yr: '',
      emp_edu_grade: '',
      // Marks: '',
    },
  ]);

  const handleEducationInputChange = (e, emp_edu_id) => {
    const { name, value } = e.target;
    setEducationData((prevData) =>
      prevData.map((row) =>
        row.emp_edu_id === emp_edu_id ? { ...row, [name]: value } : row
      )
    );
  };

  const handleContentChange = (event) => {
    const newContent = event.target.value;
    setInputContent(newContent);
    const mockApiData = ['M/S GAIL (INDIA) LIMITED'];
    const filteredSuggestions = mockApiData.filter(suggestion =>
      suggestion.toLowerCase().includes(newContent.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setInputContent(suggestion);
    setSuggestions([]);
  };

  const procedurehandleContentChange = (event) => {
    const newContent = event.target.value;
    setprocedureInputContent(newContent);
    const mockApiData = ['TSL/COAT/QC/WI-57,55,56,72'];
    const filteredSuggestions = mockApiData.filter(proceduresuggestion =>
      proceduresuggestion.toLowerCase().includes(newContent.toLowerCase())
    );
    setprocedureSuggestions(filteredSuggestions);
  };

  const procedurehandleSuggestionSelect = (proceduresuggestion) => {
    setprocedureSelectedSuggestion(proceduresuggestion);
    setprocedureInputContent(proceduresuggestion);
    setprocedureSuggestions([]);
  };

  //////////////////////////////////

  const [selectedOption, setSelectedOption] = useState('');
  const [inputValues, setInputValues] = useState({
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    input5: '',
  });

  const handleSelectChange = (e) => {
    const optionValue = e.target.value;
    setSelectedOption(optionValue);

    // For demonstration purposes, filling input boxes with the selected option value
    setInputValues({
      input1: 'TSL/CPFOP/INT/TNGCL/2022-02A Rev.01',
      input2: '457 mm OD X 8.2 mm WT',
      input3: 'INTERNAL EPOXY COATING',
      // input4: 'LOINO. SGL/C&P/LOI/22-23/95/01',
      // input5: '13/FEB/2023',
    });
  };

  const newhandleInputChange = (e, inputName) => {
    const value = e.target.value;
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [inputName]: value,
    }));
  };

  // ----------------------------------------------------

  const [refresh, setRefresh] = useState(false);

  const handleRefreshClick = () => {
    setRefresh(refresh);
    window.location.reload();
  };

  // ---------------------------------------------

  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [prosnum, setprosnum] = useState('');

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const shouldDisableFields = year && type;
  const ProcessSheetFields = year && type;

  // ---------------------------------------------    

  const [selectedDate, setSelectedDate] = useState(null);

  // ---------------------------------------------

  // Get the current date
  const currentDate = new Date();

  // Format the date in dd/mm/yyyy format
  const formattedDate = format(currentDate, 'dd/MM/yyyy');

  // -----------------------------------------------

  const [isChecked, setIsChecked] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [bgColor, setBgColor] = useState('#0083A9');

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const checkhandleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleSubmit = () => {
    if (isChecked && selectedValue !== '') {
      setBgColor('#0083A9');
    } else {
      // Handle the case where either checkbox is not checked or no value is selected
      setBgColor('red');
    }
  };

  // -------------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])

  const GetEPOXYProcessSheetDetails = async (e) => {

    setType(e.target.value);
    e.preventDefault();

    if (!setType || !setYear) {
      toast.error('Please provide both processsheetno and year');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('processsheetno', e.target.value);
      params.append('year', year);

      const response = await axios.post(
        `http://localhost:20609/api/User/getEPOXYProcessSheetDetails?${params.toString()}`
      );
      if (response.status === 200) {
        // toast.error('API Called.');
        setApiResponse(response.data[0]);

        document.getElementById("Processsheetno").value = response.data[0].processsheetcode;
        document.getElementById('Processsheetno').setAttribute('title', response.data[0].processsheetcode);

        document.getElementById("ProcessSheet").value = response.data[0].processsheetcode;
        document.getElementById('ProcessSheet').setAttribute('title', response.data[0].processsheetcode);

        document.getElementById("ClientName").value = response.data[0].clientname;
        document.getElementById('ClientName').setAttribute('title', response.data[0].clientname);


        document.getElementById("ProjectName").value = response.data[0].projectname;
        document.getElementById('ProjectName').setAttribute('title', response.data[0].projectname);

        document.getElementById("pappersize").value = response.data[0].pipesize;
        document.getElementById('pappersize').setAttribute('title', response.data[0].pipesize);

        document.getElementById("TypeOfCoating").value = response.data[0].typeofcoating;
        document.getElementById('TypeOfCoating').setAttribute('title', response.data[0].typeofcoating);

        document.getElementById("Procedure").value = response.data[0].procedurewino;
        document.getElementById('Procedure').setAttribute('title', response.data[0].procedurewino);

        document.getElementById("Shift").value = response.data[0].shift;
        GetRawMaterialTestList();
      }
    } catch (error) {
      toast.error('Failed' + error.message);
      console.error('Failed', error.message);
    }
  };

  const GetRawMaterialTestList = async (e) => {

    try {
      const params = new URLSearchParams();
      params.append('processsheetno', 'asd');
      //  params.append('year', year);

      const response = await axios.post(`http://localhost:20609/api/User/getInstrumentList?${params.toString()}`);
      if (response.status === 200) {
        //  toast.error('API Called.');
        setInstrument(response.data);
        //  setInstrument(JSON.stringify(response.data));
        getSubTestList();
      }
    } catch (error) {
      toast.error('Failed' + error.message);
      console.error('Failed', error.message);
    }
  };

  const getSubTestList = async (e) => {

    try {
      const params = new URLSearchParams();
      params.append('TestId', '184');
      //  params.append('year', year);

      const response = await axios.post(`http://localhost:20609/api/User/getSubTestList?${params.toString()}`);
      if (response.status === 200) {
        // toast.error('API Called.');
        setSubTestListResp(response.data);
        //  setInstrument(JSON.stringify(response.data));
      }
    } catch (error) {
      toast.error('Failed' + error.message);
      console.error('Failed', error.message);
    }
  };

  const [personalDetails, setPersonalDetails] = useState({
    emp_user_id: 1,
    emp_fname: '',
    emp_mname: '',
    emp_lname: '',
    MobNo: '',
    TataEmailId: '',
    department: '',
    designation: '',
    altMobNo: '',
    password: '',
    confirmPassword: '',
    passwordsMatch: true,
    signature: null,
    role: '',
  });

  const submitRawMaterialDetails = async () => {
    try {
      let RawmaterialDetailsPayload;
      let RawmaterialSubTestPayload;
      let RawmaterialUsedInstrumentPayload;
      let ispqt;

      if (document.getElementById("pqt").checked == 'true') {
        ispqt = 1;
      } else {
        ispqt = 0;
      }

      // Function to fetch table data

      const table = document.getElementById('insttbl');
      const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      const data = [];
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const rowData = {
          pm_equip_id: cells[0].innerText,
        };
        data.push(rowData);
      }
      setTableData(data);


      const table1 = document.getElementById('subtesttbl');
      const rows1 = table1.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      const data1 = [];
      for (let i = 0; i < rows1.length; i++) {
        let j = i + 1;
        const cells = rows1[i].getElementsByTagName('td');
        const rowData = {
          pm_test_categ_id: cells[0].innerText,
          pm_test_type_id: '1',
          pm_test_id: '1',
          pm_proc_template_id: '1',
          pm_proc_test_id: '1',
          pm_value_type: document.getElementById("result" + j).value,
          pm_test_value1: document.getElementById("result" + j).value,
          pm_test_result_accepted: '1',
          pm_test_result_remarks: document.getElementById("resultsuffix" + j).value,
          pm_assigned_to_role_id: '1',
          pm_test_run_id: '1',
          userid: '1',
          TestDescriptionID: '1',
          ReferenceStandard: '1',
          Result: document.getElementById("result" + j).value,
          ResultSuffix: document.getElementById("resultsuffix" + j).value,
        };
        data1.push(rowData);
      }
      setTableData1(data1);


      RawmaterialSubTestPayload = [{
        pm_test_categ_id: '1',
        pm_test_type_id: '1',
        pm_test_id: '1',
        pm_proc_template_id: '1',
        pm_proc_test_id: '1',
        pm_value_type: '1',
        pm_test_value1: '1',
        pm_test_result_accepted: '1',
        pm_test_result_remarks: '1',
        pm_assigned_to_role_id: '1',
        pm_test_run_id: '1',
        userid: '1',
        TestDescriptionID: '1',
        ReferenceStandard: '1',
        Result: '1',
        ResultSuffix: '1',
      }];

      RawmaterialUsedInstrumentPayload = [{
        pm_equip_id: '1'
      },
      {
        pm_equip_id: '2'
      },
      {
        pm_equip_id: '3'
      },
      {
        pm_equip_id: '4'
      },
      {
        pm_equip_id: '5'
      },
      {
        pm_equip_id: '6'
      }];

      RawmaterialDetailsPayload = {
        compid: '1',
        locationid: '1',
        projectid: '1',
        ProcessSheetId: document.getElementById("ProcessSheet").value,
        TestDate: document.getElementById("testdate").value,
        Shift: document.getElementById('Shift').value,
        BatchNo: document.getElementById('batchno').value,
        RawMaterialid: document.getElementById("rawmaterialname").value,
        MFR: document.getElementById("mrf").value,
        userid: '1',
        RawMaterialName: '1',
        Grade: document.getElementById("grade").value,
        ispqt: ispqt,
        RawmaterialSubTest: data1,
        RawmaterialUsedInstrument: data,
      };


      const response1 = await axios.post(`http://localhost:20609/api/User/saveRawMaterialTestDataTest`, RawmaterialDetailsPayload);
      console.log('Personal details API response:', response1.data);
      // var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
      //    myModal.show();
    } catch (error) {
      console.error('Error submitting personal details:', error);
      //  var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
      //  myModal.show();

    }
  };


  const UpdateRawMaterialDetails = async () => {
    try {
      let RawmaterialDetailsPayload;
      let RawmaterialSubTestPayload;
      let RawmaterialUsedInstrumentPayload;
      let ispqt;

      if (document.getElementById("pqt").checked == 'true') {
        ispqt = 1;
      } else {
        ispqt = 0;
      }

      // Function to fetch table data

      const table = document.getElementById('insttbl');
      const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      const data = [];
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const rowData = {
          pm_equip_id: cells[0].innerText,
        };
        data.push(rowData);
      }
      setTableData(data);


      const table1 = document.getElementById('subtesttbl');
      const rows1 = table1.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      const data1 = [];
      for (let i = 0; i < rows1.length; i++) {
        let j = i + 1;
        const cells = rows1[i].getElementsByTagName('td');
        const rowData = {
          pm_test_categ_id: cells[0].innerText,
          pm_test_type_id: '1',
          pm_test_id: '1',
          pm_proc_template_id: '1',
          pm_proc_test_id: '1',
          pm_value_type: document.getElementById("result" + j).value,
          pm_test_value1: document.getElementById("result" + j).value,
          pm_test_result_accepted: '1',
          pm_test_result_remarks: document.getElementById("resultsuffix" + j).value,
          pm_assigned_to_role_id: '1',
          pm_test_run_id: '1',
          userid: '1',
          TestDescriptionID: '1',
          ReferenceStandard: '1',
          Result: document.getElementById("result" + j).value,
          ResultSuffix: document.getElementById("resultsuffix" + j).value,
        };
        data1.push(rowData);
      }
      setTableData1(data1);

      RawmaterialDetailsPayload = {
        compid: '1',
        locationid: '1',
        projectid: '1',
        ProcessSheetId: document.getElementById("ProcessSheet").value,
        TestDate: document.getElementById("testdate").value,
        Shift: document.getElementById('Shift').value,
        BatchNo: document.getElementById('batchno').value,
        RawMaterialid: document.getElementById("rawmaterialname").value,
        MFR: document.getElementById("mrf").value,
        userid: '1',
        RawMaterialName: '1',
        Grade: document.getElementById("grade").value,
        ispqt: ispqt,
        RawmaterialSubTest: data1,
        RawmaterialUsedInstrument: data,
      };


      const response1 = await axios.post(`http://localhost:20609/api/User/updateRawMaterialSubTestData`, RawmaterialDetailsPayload);
      console.log('Personal details API response:', response1.data);
      // var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
      //    myModal.show();
    } catch (error) {
      console.error('Error submitting personal details:', error);
      //  var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
      //  myModal.show();

    }
  };

  return (
    <>
      {
        loading ?
          <Loading />
          :
          <>
            <Header />
            <section className='InnerHeaderPageSection'>
              <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <ul>
                      <li> <Link to='/dashboard'>Quality Module</Link></li>
                      <li><h1>/ &nbsp; Before Process Lab Testing </h1></li>
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
                        <div className='col-md-12 col-sm-12 col-xs-12'>
                          <h4>Before Process Lab Testing <span>- Add page</span></h4>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Process Sheet</label>
                            <div className='ProcessSheetFlexBox'>
                              <input id='Processsheetno' style={{ width: '66%', cursor: 'not-allowed' }} disabled={ProcessSheetFields} placeholder='Process sheet no.' readOnly />
                              <select value={year} onChange={handleYearChange} >
                                <option value=""> Year </option>
                                <option value="2022"> 2022 </option>
                                <option value="2023"> 2023 </option>
                                <option value="2024"> 2024 </option>
                              </select>
                              <b>-</b>
                              <input type="text" placeholder='No.' value={type} onChange={GetEPOXYProcessSheetDetails} />
                            </div>
                          </div>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Process Sheet</label>
                            <input id='ProcessSheet' type="text" disabled placeholder='Process sheet' style={{ cursor: 'not-allowed' }} readOnly />
                          </div>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Client Name</label>
                            <input id='ClientName' type="text" disabled placeholder='Client name' style={{ cursor: 'not-allowed' }} readOnly />
                          </div>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Project Name</label>
                            <input type="text" id='ProjectName' disabled placeholder='Project name' style={{ cursor: 'not-allowed' }} readOnly />
                          </div>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Pipe Size</label>
                            <input type="text" id='pappersize' disabled placeholder='Pipe size' style={{ cursor: 'not-allowed' }} readOnly />
                          </div>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Type Of Coating</label>
                            <input id='TypeOfCoating' type="text" disabled placeholder='Type of coating' style={{ cursor: 'not-allowed' }} readOnly />
                          </div>
                        </div>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Procedure/ WI No.</label>
                            <input id='Procedure' type="text" disabled placeholder='Procedure/ WI No.' style={{ cursor: 'not-allowed' }} readOnly />
                          </div>
                        </div>
                        {/* <div className='col-md-4 col-sm-4 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Report No.</label>
                                                    <input type="text" value={shouldDisableFields ? 'CCAIR/20230415-3' : ''} title={shouldDisableFields ? 'CCAIR/20230415-3' : ''} disabled={shouldDisableFields} placeholder='Report No.' style={{ cursor: 'not-allowed' }} readOnly />
                                                </div>
                                            </div> */}
                        {shouldDisableFields && (
                          <>
                            <div className='col-md-4 col-sm-4 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Test Date</label>

                                <DatePicker
                                  maxDate={Date.now()}
                                  selected={selectedDate}
                                  onChange={(date) => setSelectedDate(date)}
                                  dateFormat="dd/MMM/yyyy"
                                  placeholderText="DD/MMM/YYYY"
                                  id='testdate'
                                />
                              </div>
                            </div>
                            <div className='col-md-4 col-sm-4 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Shift</label>
                                <select name="" id="Shift">
                                  <option value="">-- Select shift --</option>
                                  <option value="0">Day</option>
                                  <option value="1">Night</option>
                                </select>

                                {/* <input type="text" value={shouldDisableFields ? 'DAY' : ''} title={shouldDisableFields ? 'DAY' : ''} disabled={shouldDisableFields} placeholder='Report No.' style={{ cursor: 'not-allowed' }} readOnly /> */}
                              </div>
                            </div>
                          </>
                        )}

                        {shouldDisableFields && (
                          <>
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                              <div className='PQTBox'>
                                <input type="checkbox" id="pqt" name="pqt" value="pqt" />
                                <label for="pqt"> PQT</label>
                              </div>
                            </div>

                            <div className='col-md-3 col-sm-3 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Batch No.</label>
                                <input type="text" placeholder='Enter batch no.' id='batchno' />
                              </div>
                            </div>

                            <div className='col-md-3 col-sm-3 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Raw Material Name</label>
                                <input style={{ background: 'whitesmoke', pointerEvents: 'all', cursor: 'not-allowed' }} type="text" value='Raw Material Name' id='rawmaterialname' />
                              </div>
                            </div>

                            <div className='col-md-3 col-sm-3 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">MFR.</label>
                                {/* <input style={{ background: 'whitesmoke', pointerEvents: 'all', cursor: 'not-allowed' }} type="text" value='MFR' /> */}
                                <select name="" id="mrf">
                                  <option value="">-- Select MFR --</option>
                                  <option value="1">01</option>
                                  <option value="2">02</option>
                                  <option value="3">03</option>
                                </select>
                              </div>
                            </div>

                            <div className='col-md-3 col-sm-3 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Grade</label>
                                {/* <input style={{ background: 'whitesmoke', pointerEvents: 'all', cursor: 'not-allowed' }} type="text" value='Grade' /> */}

                                <select name="" id="grade">
                                  <option value="">-- Select grade --</option>
                                  <option value="1">01</option>
                                  <option value="2">02</option>
                                  <option value="3">03</option>
                                </select>
                              </div>
                            </div>

                            <div className='col-md-12 col-sm-12 col-xs-12'>
                              <div className='PipeDescriptionDetailsTable'>
                                <div style={{ overflow: 'auto' }} id='custom-scroll'>
                                  <Table id='subtesttbl'>
                                    <thead>
                                      <tr style={{ background: '#5a245a', color: '#fff' }}>
                                        <th style={{ minWidth: '70px' }}>Sr. No.</th>
                                        {/* <th style={{ minWidth: '100px' }}>Batch No.</th> */}
                                        <th style={{ minWidth: '200px' }}>Test Description</th>
                                        <th style={{ minWidth: '150px' }}>Reference Standard</th>
                                        <th style={{ minWidth: '300px' }}>Acceptance Criteria</th>
                                        <th style={{ minWidth: '250px' }}>Result</th>
                                        <th style={{ minWidth: '200px' }}>Result Suffix</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {SubTestListResp.map((item) => (
                                        <tr>
                                          <td>{item["serial_number"]}</td>
                                          <td>{item["TestDescription"]}</td>
                                          <td>{item["ReferenceStandard"]}</td>
                                          <td>{item["AcceptanceCriteria"]}</td>
                                          <td>
                                            <div className='UnitRemarksFlex'>
                                              <input type="text" placeholder='Enter results' maxLength={500} id={'result' + item["serial_number"]} />
                                              <span>Unit</span>
                                              <span>Remarks</span>
                                            </div>
                                          </td>
                                          <td><input type="text" placeholder='Enter result suffix' maxLength={500} id={'resultsuffix' + item["serial_number"]} /></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>

                                <div className='SaveButtonBox'>
                                  <div className='SaveButtonFlexBox'>
                                    {/* <button type='button' data-bs-toggle="modal" onClick={(e) => UpdateRawMaterialDetails(e)} style={{background: '#34B233'}}>Update</button> */}
                                    <button type='button' data-bs-toggle="modal" onClick={(e) => submitRawMaterialDetails(e)}>Submit</button>
                                  </div>

                                  <div className="modal fade SaveModalBox" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className='saveiconBox'>
                                          <i className="fas fa-check-circle"></i>
                                        </div>
                                        <div className="modal-body">
                                          <h5>Great!</h5>
                                          <p>Input Saved Successfully</p>
                                          <button onClick={handleRefreshClick}>OK</button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className='col-md-12 col-sm-12 col-xs-12'>
                              <hr className='DividerLine' />
                            </div>

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

                                  {Instrument.map((type, index) => (
                                    <tr key={index}>
                                      <td hidden >{type["equip_id"]}</td>
                                      <td>{type["serial_number"]}</td>
                                      <td>{type["equip_name"]}</td>
                                      <td>{type["equip_code"]}</td>
                                    </tr>
                                  ))}

                                </tbody>
                              </Table>
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

export default Beforeprocesslabtesting