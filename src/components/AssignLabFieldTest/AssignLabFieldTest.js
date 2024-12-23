import React, { useState, useEffect } from "react";
import Loading from "../Loading";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import Select, { components } from "react-select";
import { toast } from 'react-toastify';
import axios from "axios";
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";

const AssignLabFieldTest = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const LabField = searchParams.get("test");
  const menuId = searchParams.get('menuId');
  const action = searchParams.get('action');
  const test_run_id = searchParams.get("test_run_id");
  const processSheetId = searchParams.get("processSheetId");
  const year = searchParams.get('year');
  const empId = secureLocalStorage.getItem("empId");
  const roleId = secureLocalStorage.getItem("roleId");
  const { Option } = components;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ddlYear, setddlYear] = useState([]);
  const [formData, setFormData] = useState({
    year: '',
    processsheetid: '',
  });
  const [shiftId, setShiftId] = useState();
  const [pipeCoatData, setPipeCoatData] = useState([]);
  const [selectedTests, setSelectedTests] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [fieldType, setFieldType] = useState();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    fetchYear();
    setFieldType(LabField === "Field" ? "F" : "L")
  }, []);

  const CustomOption = (props) => {
    return (
      <Option {...props}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
            style={{ width: '20px', marginRight: '8px' }}
          />
          <label>{props.label}</label>
        </div>
      </Option>
    );
  };

  const fetchEditDetails = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetAssignLabFieldDataById?test_run_id=${test_run_id}&type=${LabField === "Field" ? "F" : "L"}`)
      const data = response?.data;

      const groupedData = data.reduce((acc, item) => {
        // Find if the pipeid already exists in the accumulator
        let existingPipe = acc.find(pipe => pipe.pipeid === item.pipeid);

        if (existingPipe) {
          // If the pipe already exists, add the testname to the existing tests
          existingPipe.tests.push({
            label: item.testname,
            value: item.pm_test_type_id,
          });
        } else {
          // If the pipe doesn't exist, create a new entry
          acc.push({
            pipeid: item.pipeid,
            coatname: item.coatname,
            pipecode: item.pipecode,
            tests: [{
              label: item.testname,
              value: item.pm_test_type_id,
            }]
          });
        }

        return acc;
      }, []);

      setFilteredData(groupedData)
      setPipeCoatData(groupedData);
      const selectedTests = groupedData.reduce((acc, pipe) => {
        acc[pipe.pipeid] = pipe.tests.map(test => ({
          label: test.label,
          value: test.value
        }));
        return acc;
      }, {});
      setSelectedTests(selectedTests);
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchYear = async () => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
      setddlYear(response?.data);

      if (action === "edit") {
        getHeaderData();
      }
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFormData = () => {
    setFormData((prev) => ({
      processsheetid: prev.processsheetid,
      year: prev.year,
      clientname: '',
      projectname: '',
      pipesize: '',
      typeofcoating: '',
    }));
  };

  const handlePsSeqNoBlur = () => {
    if (formData.processsheetid) {
      getHeaderData();
      resetFormData();
    }
  };

  const getHeaderData = async () => {
    try {
      const processsheetId = action === 'edit' ? processSheetId : formData?.processsheetid;
      const yearValue = action === 'edit' ? year : formData?.year;

      const response = await axios.post(Environment.BaseAPIURL + `/api/User/getEPOXYProcessSheetDetails?processsheetno=${processsheetId}&year=${yearValue}`);

      if (response?.data?.Table?.length > 0 && response?.data?.Table5?.length > 0) {
        setFormData(response.data.Table[0]);
        setShiftId(response.data.Table5[0]);
      }

      if (action !== "edit" && response?.data?.Table[0] && response?.data?.Table5[0]) {
        labPipeCoatData(processsheetId, response.data.Table5[0]);
      }

      if (action === "edit") {
        fetchEditDetails();
      }
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  };

  const labPipeCoatData = async (id, shift) => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/Assignfieldlabtestonpipe?processsheet_id=${formData?.processsheetid || id}&type=${LabField === "Lab" ? "L" : "F"}&shiftid=${shift.pm_shift_id}&testdate=${new Date().toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0]}`);

      const data = response?.data;
      const filterData = data.filter(item => {
        if (LabField === "Field") {
          return item.pm_isfield === 1;
        } else if (LabField === "Lab") {
          return item.pm_islab === 1;
        }
        return false;
      });

      await labFieldTestData(id, filterData);

      setPipeCoatData(filterData);
    } catch (error) {
      console.error("Error fetching labPipeCoatData:", error);
    }
  };

  const labFieldTestData = async (id, data) => {
    try {
      const { data: response } = await axios.get(Environment.BaseAPIURL + `/api/User/Getlabfielddata?procsheet_id=${id}`);
      const mappedData = data.map(item1 => {
        const matchedTests = response.filter(item2 => item2.CoattypeID === item1.coatid && item2.type === (LabField === "Lab" ? "L" : "F"));
        return {
          ...item1,
          tests: matchedTests.map(test => ({
            value: test.id,
            label: test.testname
          }))
        };
      });
      if (action === 'edit') { setFilteredData() } else { setFilteredData(mappedData); }
      const initialSelectedTests = {};
      mappedData.forEach(pipe => {
        initialSelectedTests[pipe.pipeid] = pipe.tests;
      });
      console.log(initialSelectedTests)
      setSelectedTests(initialSelectedTests);
    } catch (error) {
      console.error("Error fetching data:", error);
    };
  };

  const handleTestChange = (selectedOptions, pipeid) => {

    const bondStrengthTests = [291, 1432];
    const bondStrengthTests1 = [987, 1433];

    // Check if both Bond Strength tests are selected
    const selectedBondStrengthTests = selectedOptions.filter(option =>
      bondStrengthTests.includes(option.value)
    );
    const selectedBondStrengthTests1 = selectedOptions.filter(option =>
      bondStrengthTests1.includes(option.value)
    );

    // If both Bond Strength tests are selected, keep only the first one
    if (selectedBondStrengthTests.length > 1 && selectedBondStrengthTests1.length > 1) {
      // Keep only the first selected Bond Strength test
      selectedOptions = selectedOptions.filter(option => !bondStrengthTests.includes(option.value) || option.value === selectedBondStrengthTests[0].value);
    }

    setSelectedTests(prevState => ({
      ...prevState,
      [pipeid]: selectedOptions
    }));
  };

  const handleSubmit = (e, value) => {

    const bondStrengthTests = [291, 1432];
    const bondStrengthTests1 = [987, 1433];

    // Validate the test data for each pipe
    const isValid = Object.keys(selectedTests).every(pipeId => {
      const selectedTests1 = selectedTests[pipeId];

      // Check if both Bond Strength tests are selected
      const selectedBondStrengthTests = selectedTests1.filter(test =>
        bondStrengthTests.includes(test.value)
      );

      const selectedBondStrengthTests1 = selectedTests1.filter(test =>
        bondStrengthTests1.includes(test.value)
      );

      // If both tests are selected, return false to indicate invalid data
      return selectedBondStrengthTests.length <= 1 && selectedBondStrengthTests1.length <= 1;
    });

    // If invalid data is found, show an error message
    if (!isValid) {
      toast.error('Only one of "Bond Strength Test" or "Bond Strength Test (Middle)" can be selected for each pipe.');
      return;
    }

    e.preventDefault();
    setLoading(true);
    const testType = LabField === "Lab" ? "L" : (LabField === "Field" ? "F" : "");
    const dataToSend = {
      co_comp_id: 1,
      co_location_id: 1,
      procsheet_id: formData?.processsheetid,
      projectid: formData?.projectid,
      testtype: testType,
      test_run_id: action === 'edit' ? test_run_id : 0,
      shiftid: parseInt(shiftId.pm_shift_id),
      process_type: LabField === "Lab" ? 608 : 609,
      testdate: new Date().toLocaleDateString('fr-CA').replace(/\//g, "-").split(" ")[0],
      userid: parseInt(empId),
      roleId: parseInt(roleId),
      issubmit: false,
      testsData: pipeCoatData.map((pipe, index) => (
        {
          pipe_id: (pipe.pipeid).toString(),
          fieldtest: (selectedTests[pipe.pipeid]?.map(test => test.value).join('@#@')) || ''
        }))
    };

    axios.post(Environment.BaseAPIURL + "/api/User/UpdateAssignfieldlabtestonpipeEntry", dataToSend)
      .then(response => {
        console.log('Data submitted successfully', response);
        if (response.status === 200) {
          toast.success("Data saved successfully!")
          navigate(`/assignfieldlabtestlist?menuId=${menuId}&test=${LabField}`);
        }
      })
      .catch(error => {
        console.error("Error submitting data:", error);
        toast.error("Failed to submit.")
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
                    <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li> <Link to={`/inspectiontesting?menuId=${menuId}`}> Raw Material Test & Inspection </Link> <b style={{ color: '#fff' }}></b></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li> <Link to={`/assignfieldlabtestlist?menuId=${menuId}&test=${LabField}`}> Assign {LabField} Test On Pipes List </Link> <b style={{ color: '#fff' }}></b></li>
                    <li><h1>/&nbsp; Assign {LabField} Test On Pipes </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="RawmaterialPageSection BlastingDataEntrySectionPage AssignLabFieldTest">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="PipeTallySheetDetails">
                    <form className="form row m-0" onSubmit={handleSubmit}>
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Assign {LabField} Test On Pipes</h4>
                      </div>
                      <div className='col-md-4 col-sm-4 col-xs-12'>
                        <div className='form-group'>
                          <label htmlFor="">Process Sheet</label>
                          <div className='ProcessSheetFlexBox'>
                            <input
                              name="processSheet"
                              placeholder='Process sheet'
                              value={formData?.["processsheetcode"] || ''}
                              onChange={handleInputChange}
                              style={{ width: '66%', cursor: 'not-allowed' }}
                            />
                            <select name="year" value={formData?.year} onChange={handleInputChange} >
                              <option value=""> Year </option>
                              {ddlYear.map((yearOption, i) => (
                                <option key={i} value={yearOption.year}> {yearOption.year} </option>
                              ))}
                            </select>
                            <b>-</b>
                            <input
                              type="number"
                              name="processsheetid"
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
                        { label: "Project Name", value: formData?.["projectname"] },
                        { label: "Pipe Size", value: formData?.pipesize },
                        { label: "Shift", value: shiftId?.pm_shiftvalue },
                        { label: "Type Of Coating", value: formData?.["typeofcoating"] },
                      ].map((field, idx) => (
                        <div key={idx} className="form-group col-md-4 col-sm-4 col-xs-12">
                          <label>{field.label}</label>
                          <input type="text" value={field.value} placeholder={field.label} readOnly />
                        </div>
                      ))}

                      {formData?.["processsheetcode"] && (
                        <div className="firsttable" id="custom-scroll">
                          <table>
                            <thead>
                              <tr style={{ background: "rgb(90, 36, 90)", top: "0px", }}>
                                <th style={{ minWidth: "60px" }}>Sr No.</th>
                                <th style={{ minWidth: "120px" }}>Pipe no.</th>
                                <th style={{ minWidth: "160px" }}>Coat Status</th>
                                <th style={{ minWidth: "200px" }}>{LabField} Test</th>
                              </tr>
                            </thead>
                            <tbody>
                              {console.log("123", filteredData)}
                              {filteredData?.map((data, index) => (
                                <tr key={data.pipeid}>
                                  <td>{index + 1}</td>
                                  <td><input type="text" value={data?.pipecode} readOnly /></td>
                                  <td><input type="text" value={data?.coatname} readOnly /></td>
                                  <td>
                                    {data.tests && data.tests.length > 0 ? (
                                      < Select
                                        components={{ Option: CustomOption }}
                                        isMulti
                                        name={`test_${index}`}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        allowSelectAll={true}
                                        options={data.tests}
                                        classNamePrefix="select"
                                        value={selectedTests[data.pipeid]} // Preselect tests
                                        onChange={(selectedOptions) => handleTestChange(selectedOptions, data.pipeid)}
                                      />
                                    ) : (
                                      <Select
                                        components={{ Option: CustomOption }}
                                        isMulti
                                        name={`test_${index}`}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        allowSelectAll={true}
                                        options={data.tests}
                                        classNamePrefix="select"
                                        value={selectedTests[data.pipeid]} // Preselect tests
                                        onChange={(selectedOptions) => handleTestChange(selectedOptions, data.pipeid)}
                                      />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className='SaveButtonBox'>
                            <div className='SaveButtonFlexBox'>
                              <button type='button' className="DraftSaveBtn SubmitBtn" style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, false)} disabled={loading}>{loading ? 'Saving...' : 'Save Draft'}</button>
                              <button type='button' style={{ display: 'block' }} id='btnsub' onClick={(e) => handleSubmit(e, true)} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </>
  );
};

export default AssignLabFieldTest;