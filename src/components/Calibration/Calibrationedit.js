import React, { useState, useEffect, useRef } from 'react';
import './Calibration.css';
import Loading from '../Loading';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Select from "react-select";
import DatePicker from 'react-datepicker';
import YesImg from '../../assets/images/check.png'
import NoImg from '../../assets/images/remove.png'

function Calibrationedit() {
  // AUTOFILL DROPDOWN

  // Status

  const [selectedOption, setSelectedOption] = useState({
    value: 1,
    label: 'Active'
  });
  const [suggestions, setSuggestions] = useState([]);

  const handleClientChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const suggestionList = [
        { ClientID: 'Active', ClientName: 'Active' },
        { ClientID: 'InActive', ClientName: 'In Active' },
        { ClientID: 'Lost', ClientName: 'Lost' },
      ];
      setSuggestions(suggestionList);
    };

    fetchSuggestions();
  }, []);

  // Type

  const [selectedtypeOption, setSelectedtypeOption] = useState(null);
  const [typesuggestions, settypeSuggestions] = useState([]);

  const handletypeClientChange = (selectedtypeOption) => {
    setSelectedtypeOption(selectedtypeOption);
  };

  useEffect(() => {
    const fetchtypeSuggestions = async () => {
      const suggestiontypeList = [
        { ClientTypeID: 'Balances', ClientTypeName: 'Balances' },
        { ClientTypeID: 'Caliper', ClientTypeName: 'Caliper' },
        { ClientTypeID: 'Clock', ClientTypeName: 'Clock' },
        { ClientTypeID: 'ColorMeter', ClientTypeName: 'Color Meter' },
      ];
      settypeSuggestions(suggestiontypeList);
    };

    fetchtypeSuggestions();
  }, []);

  // Manufacturer

  const [selectedManufacturerOption, setSelectedManufacturerOption] = useState(null);
  const [Manufacturersuggestions, setManufacturerSuggestions] = useState([]);

  const handleManufacturerClientChange = (selectedManufacturerOption) => {
    setSelectedManufacturerOption(selectedManufacturerOption);
  };

  useEffect(() => {
    const fetchManufacturerSuggestions = async () => {
      const suggestionManufacturerList = [
        { ClientManufacturerID: 'Accurate', ClientManufacturerName: 'Accurate tech inc.' },
        { ClientManufacturerID: 'Admit', ClientManufacturerName: 'Admit inc.' },
        { ClientManufacturerID: 'Brown', ClientManufacturerName: 'Brown & Sharpe tesa' },
      ];
      setManufacturerSuggestions(suggestionManufacturerList);
    };

    fetchManufacturerSuggestions();
  }, []);

  // Measurement Types

  const [selectedmtOption, setSelectedmtOption] = useState(null);
  const [mtsuggestions, setmtSuggestions] = useState([]);

  const handlemtClientChange = (selectedmtOption) => {
    setSelectedmtOption(selectedmtOption);
  };

  useEffect(() => {
    const fetchmtSuggestions = async () => {
      const suggestionmtList = [
        { ClientmtID: 'Area', ClientmtName: 'Area' },
        { ClientmtID: 'Energy', ClientmtName: 'Energy' },
        { ClientmtID: 'Force', ClientmtName: 'Force' },
        { ClientmtID: 'Length', ClientmtName: 'Length' },
      ];
      setmtSuggestions(suggestionmtList);
    };

    fetchmtSuggestions();
  }, []);

  // Units of Measure

  const [selecteduomOption, setSelecteduomOption] = useState(null);
  const [uomsuggestions, setuomSuggestions] = useState([]);

  const handleuomClientChange = (selecteduomOption) => {
    setSelecteduomOption(selecteduomOption);
  };

  useEffect(() => {
    const fetchuomSuggestions = async () => {
      const suggestionuomList = [
        { ClientuomID: 'Foot', ClientuomName: 'Foot' },
        { ClientuomID: 'Inch', ClientuomName: 'Inch.' },
        { ClientuomID: 'Kg', ClientuomName: 'Kg.' },
        { ClientuomID: 'Mtr', ClientuomName: 'Mtr.' },
      ];
      setuomSuggestions(suggestionuomList);
    };

    fetchuomSuggestions();
  }, []);

  // Condition Acquired

  const [selectedcoaOption, setSelectedcoaOption] = useState(null);
  const [coasuggestions, setcoaSuggestions] = useState([]);

  const handlecoaClientChange = (selectedcoaOption) => {
    setSelectedcoaOption(selectedcoaOption);
  };

  useEffect(() => {
    const fetchcoaSuggestions = async () => {
      const suggestioncoaList = [
        { ClientcoaID: 'New', ClientcoaName: 'New' },
        { ClientcoaID: 'Repaired', ClientcoaName: 'Repaired' },
        { ClientcoaID: 'Used', ClientcoaName: 'Used' },
      ];
      setcoaSuggestions(suggestioncoaList);
    };

    fetchcoaSuggestions();
  }, []);

  // Location

  const [selectedlocOption, setSelectedlocOption] = useState(null);
  const [locsuggestions, setlocSuggestions] = useState([]);

  const handlelocClientChange = (selectedlocOption) => {
    setSelectedlocOption(selectedlocOption);
  };

  useEffect(() => {
    const fetchlocSuggestions = async () => {
      const suggestionlocList = [
        { ClientlocID: 'Location1', ClientlocName: 'Location 1' },
        { ClientlocID: 'Location2', ClientlocName: 'Location 2' },
        { ClientlocID: 'Location3', ClientlocName: 'Location 3' },
      ];
      setlocSuggestions(suggestionlocList);
    };

    fetchlocSuggestions();
  }, []);

  // Area

  const [selectedareaOption, setSelectedareaOption] = useState(null);
  const [areasuggestions, setareaSuggestions] = useState([]);

  const handleareaClientChange = (selectedareaOption) => {
    setSelectedareaOption(selectedareaOption);
  };

  useEffect(() => {
    const fetchareaSuggestions = async () => {
      const suggestionareaList = [
        { ClientareaID: 'Area', ClientareaName: 'Area 1' },
        { ClientareaID: 'Area2', ClientareaName: 'Area 2' },
        { ClientareaID: 'Area3', ClientareaName: 'Area 3' },
      ];
      setareaSuggestions(suggestionareaList);
    };

    fetchareaSuggestions();
  }, []);

  // Assignee

  const [selectedassigneeOption, setSelectedassigneeOption] = useState(null);
  const [assigneesuggestions, setassigneeSuggestions] = useState([]);

  const handleassigneeClientChange = (selectedassigneeOption) => {
    setSelectedassigneeOption(selectedassigneeOption);
  };

  useEffect(() => {
    const fetchassigneeSuggestions = async () => {
      const suggestionassigneeList = [
        { ClientassigneeID: 'Assignee1', ClientassigneeName: 'Assignee 1' },
        { ClientassigneeID: 'Assignee2', ClientassigneeName: 'Assignee 2' },
        { ClientassigneeID: 'Assignee3', ClientassigneeName: 'Assignee 3' },
      ];
      setassigneeSuggestions(suggestionassigneeList);
    };

    fetchassigneeSuggestions();
  }, []);


  // Interval

  const [selectedintOption, setSelectedintOption] = useState(null);
  const [intsuggestions, setintSuggestions] = useState([]);

  const handleintClientChange = (selectedintOption) => {
    setSelectedintOption(selectedintOption);
  };

  useEffect(() => {
    const fetchintSuggestions = async () => {
      const suggestionintList = [
        { ClientintID: 'Before', ClientintName: 'Before each used' },
        { ClientintID: 'Scheduled', ClientintName: 'Scheduled' },
        { ClientintID: 'NotScheduled', ClientintName: 'Not Scheduled' },
      ];
      setintSuggestions(suggestionintList);
    };

    fetchintSuggestions();
  }, []);

  // Environment

  const [selectedenvOption, setSelectedenvOption] = useState(null);
  const [envsuggestions, setenvSuggestions] = useState([]);

  const handleenvClientChange = (selectedenvOption) => {
    setSelectedenvOption(selectedenvOption);
  };

  useEffect(() => {
    const fetchenvSuggestions = async () => {
      const suggestionenvList = [
        { ClientenvID: 'Relative', ClientenvName: '68 F & - 50% Relative Humanlity' },
      ];
      setenvSuggestions(suggestionenvList);
    };

    fetchenvSuggestions();
  }, []);

  // Instructions

  const [selectedinstOption, setSelectedinstOption] = useState(null);
  const [instsuggestions, setinstSuggestions] = useState([]);

  const handleinstClientChange = (selectedinstOption) => {
    setSelectedinstOption(selectedinstOption);
  };

  useEffect(() => {
    const fetchinstSuggestions = async () => {
      const suggestioninstList = [
        { ClientinstID: 'Instructions1', ClientinstName: 'Instructions 1' },
        { ClientinstID: 'Instructions2', ClientinstName: 'Instructions 2' },
        { ClientinstID: 'Instructions3', ClientinstName: 'Instructions 3' },
      ];
      setinstSuggestions(suggestioninstList);
    };

    fetchinstSuggestions();
  }, []);

  // Date
  const [selectedDate, setSelectedDate] = useState();
  const [ncdselectedDate, setncdSelectedDate] = useState();
  const [cdselectedDate, setcdSelectedDate] = useState();
  const [dcselectedDate, setdcSelectedDate] = useState();



  // SHOW AUTO TEXT
  const [gageList, setgageList] = useState([
    {
      "Gagelistid": "Auto"
    }
  ]);

  // Attachment Files

  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).filter(
      (file) => file.size <= 50 * 1024 * 1024
    );
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddFileClick = () => {
    fileInputRef.current.click();
  };

  // ---------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

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
                      <li> <Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/calibrationlist?menuId=30`}> Calibration List</Link></li>
                      <li><h1>/ &nbsp; Calibration Edit</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='RegisterEmployeePageSection CalibrationPageSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <form className="RegisterEmployeeForm row m-0">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Calibration <span style={{ color: "#3d7edb" }}>- Edit page </span></h4>
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
                                <label htmlFor='batchno'>Status</label>
                                <Select
                                  className="select"
                                  value={selectedOption}
                                  onChange={handleClientChange}
                                  options={suggestions.map((clientOption) => ({
                                    value: clientOption.ClientID,
                                    label: clientOption.ClientName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select status..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Last Calibration</label>
                                <DatePicker
                                  selected={selectedDate}
                                  onChange={(date) => setSelectedDate(date)}
                                  maxDate={new Date()}
                                  placeholderText="dd/mm/yyyy"
                                  dateFormat="dd/mm/yyyy"
                                  showDisabledMonthNavigation
                                />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Next Calibration Due</label>
                                <DatePicker
                                  selected={ncdselectedDate}
                                  onChange={(date) => setncdSelectedDate(date)}
                                  placeholderText="dd/mm/yyyy"
                                  dateFormat="dd/mm/yyyy"
                                  showDisabledMonthNavigation
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
                                <input style={{ pointerEvents: 'none', background: "#f3f3f3" }} type="text" value={gageList[0]["Gagelistid"]} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Created Date</label>
                                <DatePicker
                                  selected={cdselectedDate}
                                  onChange={(date) => setcdSelectedDate(date)}
                                  maxDate={new Date()}
                                  placeholderText="dd/mm/yyyy"
                                  dateFormat="dd/mm/yyyy"
                                  showDisabledMonthNavigation
                                />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Control No.</label>
                                <input type="text" placeholder="Enter control no." />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Serial No.</label>
                                <input type="text" placeholder="Enter serial no." />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Asset No.</label>
                                <input type="text" placeholder="Enter asset no." />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Type</label>
                                <Select
                                  className="select"
                                  value={selectedtypeOption}
                                  onChange={handletypeClientChange}
                                  options={typesuggestions.map((clientTypeOption) => ({
                                    value: clientTypeOption.ClientTypeID,
                                    label: clientTypeOption.ClientTypeName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select type..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Model</label>
                                <input type="text" placeholder="Enter model" />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Manufacturer</label>
                                <Select
                                  className="select"
                                  value={selectedManufacturerOption}
                                  onChange={handleManufacturerClientChange}
                                  options={Manufacturersuggestions.map((clientManufacturerOption) => ({
                                    value: clientManufacturerOption.ClientManufacturerID,
                                    label: clientManufacturerOption.ClientManufacturerName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Manufacturer..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Measurement Types</label>
                                <Select
                                  className="select"
                                  value={selectedmtOption}
                                  onChange={handlemtClientChange}
                                  options={mtsuggestions.map((clientmtOption) => ({
                                    value: clientmtOption.ClientmtID,
                                    label: clientmtOption.ClientmtName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Measurement Types..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Units Of Measure</label>
                                <Select
                                  className="select"
                                  value={selecteduomOption}
                                  onChange={handleuomClientChange}
                                  options={uomsuggestions.map((clientuomOption) => ({
                                    value: clientuomOption.ClientuomID,
                                    label: clientuomOption.ClientuomName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Units Of Measure..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Range or Size</label>
                                <input type="text" placeholder="Enter range or size" />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Accuracy</label>
                                <input type="text" placeholder="Enter accuracy" />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Reference Standard</label>
                                <div class="FormGenderFlexBox">
                                  <div class="FormGenderBox">
                                    <label for="Yes">
                                      <span>
                                        <img src={YesImg} alt="YesImg" /> Yes
                                      </span>
                                      <input type="radio" id="Yes" name="Reference" required="" value="Yes" />
                                    </label>
                                  </div>
                                  <div class="FormGenderBox">
                                    <label for="No">
                                      <span>
                                        <img src={NoImg} alt="NoImg" /> No
                                      </span>
                                      <input type="radio" id="No" name="Reference" required="" value="No" />
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Date Acquired</label>
                                <DatePicker
                                  selected={dcselectedDate}
                                  onChange={(date) => setdcSelectedDate(date)}
                                  maxDate={new Date()}
                                  placeholderText="dd/MM/yyyy"
                                  dateFormat="dd/MM/yyyy"
                                  showDisabledMonthNavigation
                                />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Condition Acquired</label>
                                <Select
                                  className="select"
                                  value={selectedcoaOption}
                                  onChange={handlecoaClientChange}
                                  options={coasuggestions.map((clientcoaOption) => ({
                                    value: clientcoaOption.ClientcoaID,
                                    label: clientcoaOption.ClientcoaName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select condition acquired..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Source/Vendor</label>
                                <input type="text" placeholder="Enter source/vendor" />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Gage Cost</label>
                                <input type="text" placeholder="Enter gage cost" />
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
                                <label htmlFor='batchno'>Location</label>
                                <Select
                                  className="select"
                                  value={selectedlocOption}
                                  onChange={handlelocClientChange}
                                  options={locsuggestions.map((clientlocOption) => ({
                                    value: clientlocOption.ClientlocID,
                                    label: clientlocOption.ClientlocName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Location..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Area</label>
                                <Select
                                  className="select"
                                  value={selectedareaOption}
                                  onChange={handleareaClientChange}
                                  options={areasuggestions.map((clientareaOption) => ({
                                    value: clientareaOption.ClientareaID,
                                    label: clientareaOption.ClientareaName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Area..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Assignee</label>
                                <Select
                                  className="select"
                                  value={selectedassigneeOption}
                                  onChange={handleassigneeClientChange}
                                  options={assigneesuggestions.map((clientassigneeOption) => ({
                                    value: clientassigneeOption.ClientassigneeID,
                                    label: clientassigneeOption.ClientassigneeName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Assignee..."
                                />
                                <span id='testrunid' hidden></span>
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
                                <Select
                                  className="select"
                                  value={selectedintOption}
                                  onChange={handleintClientChange}
                                  options={intsuggestions.map((clientintOption) => ({
                                    value: clientintOption.ClientintID,
                                    label: clientintOption.ClientintName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Interval..."
                                />
                                <span id='testrunid' hidden></span>
                                <div className="YMDFlexBox">
                                  <div className="boxFlex">
                                    <label htmlFor="">Years</label>
                                    <select name="" id="">
                                      <option value="" disabled selected>-</option>
                                      <option value="">0</option>
                                      <option value="">1</option>
                                      <option value="">2</option>
                                    </select>
                                  </div>
                                  <div className="boxFlex">
                                    <label htmlFor="">Months</label>
                                    <select name="" id="">
                                      <option value="" disabled selected>-</option>
                                      <option value="">0</option>
                                      <option value="">1</option>
                                      <option value="">2</option>
                                    </select>
                                  </div>
                                  <div className="boxFlex">
                                    <label htmlFor="">Days</label>
                                    <select name="" id="">
                                      <option value="" disabled selected>-</option>
                                      <option value="">1</option>
                                      <option value="">2</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Environment</label>
                                <Select
                                  className="select"
                                  value={selectedenvOption}
                                  onChange={handleenvClientChange}
                                  options={envsuggestions.map((clientenvOption) => ({
                                    value: clientenvOption.ClientenvID,
                                    label: clientenvOption.ClientenvName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Environment..."
                                />
                                <span id='testrunid' hidden></span>
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Instructions</label>
                                <Select
                                  className="select"
                                  value={selectedinstOption}
                                  onChange={handleinstClientChange}
                                  options={instsuggestions.map((clientinstOption) => ({
                                    value: clientinstOption.ClientinstID,
                                    label: clientinstOption.ClientinstName,
                                  }))}
                                  isSearchable
                                  isClearable
                                  isMulti={false}
                                  placeholder="Search or Select Instructions..."
                                />
                                <span id='testrunid' hidden></span>
                              </div><div className='form-group col-md-12 col-sm-12 col-xs-12'>
                                <label htmlFor='batchno'>Attachments</label>
                                <div className="AttachmentsFlexBox">
                                  <input
                                    type="file"
                                    onChange={handleFileChange}
                                    multiple
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                  />
                                  <div className="ButtonFlexBox">
                                    <button onClick={handleAddFileClick} type="button">
                                      <i className="fa fa-plus"></i> Add File
                                    </button>
                                  </div>
                                  <p>(Each file less than 50 MB)</p>
                                </div>

                                <div className="FixedHeaderThead" id="custom-scroll">
                                  <table className="AttachmentsTable">
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
                                          <td>{file.name}</td>
                                          <td>{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                                          <td><i className="fa fa-trash" onClick={() => handleRemoveFile(index)}></i></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                              </div>
                              <div className='form-group col-md-12 col-sm-12 col-xs-12'>
                                <label htmlFor='batchno'>Other Information</label>
                                <textarea name="" id="" placeholder="Enter other information"></textarea>
                              </div>

                              <div className='form-group col-md-12 col-sm-12 col-xs-12' style={{ textAlign: "right", marginTop: "10px" }}>
                                <button className="SubmitBtn">Submit</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section >
            <Footer />
          </>
      }
    </>
  );
}

export default Calibrationedit;
