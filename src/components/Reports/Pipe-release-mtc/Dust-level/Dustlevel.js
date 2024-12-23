import React, { useState, useEffect } from "react";
import './Dustlevel.css';
import Header from "../../../Common/Header/Header";
import Footer from "../../../Common/Footer/Footer";
import { Table } from "react-bootstrap";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import RegisterEmployeebg from "../../../../assets/images/RegisterEmployeebg.jpg";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from "axios";
import Environment from "../../../../environment";
import { toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage";
import Loading from "../../../Loading";
import Select from "react-select";
import ImageCropper from "../../../ImageCropper";

function DustLevel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ddlYear, setddlYear] = useState([]);
  const userId = secureLocalStorage.getItem('empId');
  const location = useLocation();
  const pathSegments = location.pathname.split(/[\/&]/);

  let pm_project_id1 = null;
  let pm_processSheet_id1 = null;
  let pm_processtype_id1 = null;
  let pm_approved_by1 = null;
  let test_date1 = null;
  let pm_Approve_level1 = null;
  let menuId1 = null;
  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].startsWith('pm_project_id=')) {
      pm_project_id1 = pathSegments[i].substring('pm_project_id='.length);
    }
    if (pathSegments[i].startsWith('pm_processSheet_id=')) {
      pm_processSheet_id1 = pathSegments[i].substring('pm_processSheet_id='.length);
    }
    if (pathSegments[i].startsWith('pm_processtype_id=')) {
      pm_processtype_id1 = pathSegments[i].substring('pm_processtype_id='.length);
    }
    if (pathSegments[i].startsWith('pm_approved_by=')) {
      pm_approved_by1 = pathSegments[i].substring('pm_approved_by='.length);
    }
    if (pathSegments[i].startsWith('test_date=')) {
      test_date1 = pathSegments[i].substring('test_date='.length);
    }
    if (pathSegments[i].startsWith('pm_Approve_level=')) {
      pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
    }
    if (pathSegments[i].startsWith('menuId=')) {
      menuId1 = pathSegments[i].substring('menuId='.length);
    }
  }

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
    project_id: '',
    procsheet_id: '',
  });
  const { tstmaterialid } = useParams();

  const [ddlprocedure, setProcedure] = useState([]);
  const [processSheetNo, setProcessSheetNo] = useState();
  const [visible, setVisible] = useState(false);
  const empId = secureLocalStorage.getItem('empId');
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [procedures, setProcedures] = useState([]);

  useEffect(() => {
    fetchYear()
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    // fetchData();
  }, []);

  const [id1, id2, id3, id4] = tstmaterialid.split('&');

  const fetchYear = async () => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
      setddlYear(response?.data);
      getHeaderData(response?.data);
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getHeaderData = async (data) => {
    console.log(data[0].year)
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?testingtype=${1399}&year=${data[0].year}&processsheetno=${pm_project_id1}`);
      setFormData(response?.data.Table[0]);

      // const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetCalibrationblastingdata?processsheetno=${pm_project_id1}&testid=237`);
      // setTableData(response1?.data[0]);

      const response2 = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${237}&test_id=${1399}&mater_id=0`);
      const procedures = response2?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
      setProcedures(procedures);
      setSelectedProcedures(procedures);

      setVisible(true)
    } catch (error) {
    }
  };

  const handlePsSeqNoBlur = () => {
    if (formData.psSeqNo) {
      getHeaderData();
      resetFormData();
    }
  };

  const fetchData = () => {
    axios.get(Environment.BaseAPIURL + "/api/User/GetProcessSheetDetailsList")
      .then((response) => {
        setProcedure(response?.data[3]);
        console.log(response?.data[4]);

        const procedures = response?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
        setProcedures(procedures);
        setSelectedProcedures(procedures);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [name]: type === 'checkbox' ? checked : value
  //   }));
  // };

  const resetFormData = () => {
    setFormData((prev) => ({
      psSeqNo: prev.psSeqNo,
      psYear: prev.psYear,
      clientname: '',
      project_name: '',
      pipesize: '',
      coating_type: '',
      procedure: ''
    }));
  };

  // const getHeaderData = async () => {
  //   try {
  //     const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?testingtype=${524}&year=${formData?.psYear}&processsheetno=${formData?.psSeqNo}`);
  //     setFormData(response?.data.Table[0]);
  //     setVisible(true)

  //     getWiTestList()
  //   } catch (error) {
  //   }
  // };


  async function getWiTestList(data) {
    try {
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${237}&test_id=${1399}&master_id=${0}`);
      const procedures = response?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
      setProcedures(procedures);
      setSelectedProcedures(procedures);
    } catch (error) {
      console.log('Error fetching data:', error)
    }
  }
  const handleSubmit = (e, value) => {
    e.preventDefault();
    const dataToSend = {
      project_id: formData.projectid,
      procsheet_id: formData.processsheetid,
      pipe_count: formData.pipe_count,
      shift: formData.pm_shift_id,
      ispqt: formData.ispqt === true ? formData.ispqt.toString() : "false",
      userid: userId,
      dust_test_id: 0,
      co_comp_id: '1',
      co_location_id: '1',
      testrunid: 0,
      process_type: 1399,
      procedure_type: selectedProcedures ? selectedProcedures.map(proc => proc.value).join(',') + "," : '0',
      testid: 237,
      report_name: '1',
      report_file: '1',
      testdate: new Date(),
      blasting_test_run_id: parseInt(id1),
      isSubmit: value
    }

    axios.post(Environment.BaseAPIURL + "/api/User/InsertDustLevelData_New", dataToSend)
      .then(response => {
        console.log('Data submitted successfully', response);
        if (response.status === 200) {
          toast.success("Data submitted successfully")
          navigate(`/blastingsheetlist?menuId=25`);
        }
      })
      .catch(error => {
        console.error("Error submitting data:", error);
        toast.error("Failed to submit")
      });
  };

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
                    <li><Link to="/dashboard">Quality Module</Link></li>
                    <li><h1> / &nbsp; Dust Level Report </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="DustlevelPageSection">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="DustlevelTables">
                    <form className="form row m-0">
                      <div className='col-md-12 col-sm-12 col-xs-12'>
                        <h4>Dust Level Report <span style={{ color: '#34B233' }}>- Add Page</span></h4>
                      </div>

                      <div className='col-md-4 col-sm-4 col-xs-12'>
                        <div className='form-group'>
                          <label htmlFor="">Process Sheet</label>
                          <div className='ProcessSheetFlexBox'>
                            <input
                              name="processSheet"
                              placeholder='Process sheet'
                              value={formData?.processsheetcodeNew || ''}
                              onChange={handleInputChange}
                              style={{ width: '66%', cursor: 'not-allowed' }}
                            />
                            <select name="psYear" value={ddlYear?.[0]?.year} onChange={handleInputChange} >
                              <option value=""> Year </option>
                              {ddlYear?.map((yearOption, i) => (
                                <option key={i} value={yearOption.year}> {yearOption.year} </option>
                              ))}
                            </select>
                            <b>-</b>
                            <input
                              type="number"
                              name="psSeqNo"
                              value={formData?.processsheetid}
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

                      {visible &&
                        <>
                          <div className="col-md-12 col-sm-12 col-xs-12">
                            <div className="PQTBox">
                              <input
                                className='form-check-input'
                                type="checkbox"
                                id="pqt"
                                name="ispqt"
                                checked={formData?.ispqt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ispqt: e.target.checked }))}
                              />
                              <label for="pqt"> PQT</label>
                            </div>
                          </div>
                          <div className='col-md-4 col-sm-4 col-xs-12'>
                            <div className='form-group'>
                              <label htmlFor="">One field number of pipes</label>
                              <input
                                name="pipe_count"
                                placeholder='One field number of pipes'
                                value={formData?.pipe_count}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          {/* <div className="col-md-12 col-sm-12 col-xs-12 mt-4">
                            <button type="submit" className="SubmitBtn" style={{ float: "right" }} onClick={() => handleSubmit(false)}>Save Draft</button>
                          </div> */}
                          <div className="col-md-12 col-sm-12 col-xs-12 mt-4">
                            <button type="button" className="SubmitBtn" style={{ float: "right" }} onClick={(e) => handleSubmit(e, true)}>Submit</button>
                          </div>
                        </>
                      }
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )
      }
    </>
  );
}

export default DustLevel;