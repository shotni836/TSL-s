// src/components/Process-Sheet/TestTable.js
import React, { useState, useEffect } from "react";
import "./Coating.css";
import axios from "axios";
import Environment from "../../environment";
import Select from "react-select";
import { json } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

const TestTable = ({ handleChange }) => {
  const token = secureLocalStorage.getItem('token');
  const [apiResponse, setApiResponse] = useState([]);
  const [columnStates, setColumnStates] = useState([]);
  //
  const [ddlMethod, setMothods] = useState([]);
  const [ddlpqtfreq, setPqtFrequencys] = useState([]);
  const [ddlRegfreq, setRegFrequencys] = useState([]);
  const [ddlUnit, setUnits] = useState([]);
  const [ddlClient, setClient] = useState([]);


  const TSLDDLOptions = [
    { ClientName: "Tata Steel Limited", ClientID: "634" },
  ];

  useEffect(() => {
    axios.get(Environment.BaseAPIURL + "/api/User/GetTestTemplateforCoatType", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setApiResponse(response.data);
        //setApiResponse(response.data.slice(0, 5));
        let coatingmasterdata = JSON.parse(localStorage.getItem("coatingmasterdata"));
        if (response) {
          const responcceMethoddata = coatingmasterdata.data.Method || [];
          const responFreq = coatingmasterdata.data.PqtFreqData || [];
          const responRegFreq = coatingmasterdata.data.RegFreqData || [];
          const responUnit = coatingmasterdata.data.UnitData || [];
          const responClient = coatingmasterdata.data.TestGridClientDDl || [];
          setMothods(responcceMethoddata);
          setPqtFrequencys(responFreq);
          setRegFrequencys(responRegFreq);
          setUnits(responUnit);
          setClient(responClient)
        }
      })
      .catch(error => {
        console.error("Error fetching API data:", error);
      });
  }, []);

  // useEffect(() => {
  //   if (apiResponse && apiResponse.length > 0) {
  //     setColumnStates(apiResponse.map(() => ({ tsl: { mode: 'W', value: '100' }, tpi: { mode: 'W', value: '100' }, pmc: { mode: 'W', value: '100' }, surveillance: { mode: 'W', value: '100' }, client: { mode: 'W', value: '100' } })));
  //   }
  // }, [apiResponse]);

  // const handleColumnChange = (columnName, index, mode) => {
  //   setColumnStates(prevStates => {
  //     const newStates = [...prevStates];
  //     newStates[index][columnName] = { mode, value: newStates[index][columnName]?.value || '100%' };
  //     return newStates;
  //   });
  // };

  // const handleColumnInputChange = (columnName, e, index) => {
  //   const { value } = e.target;
  //   setColumnStates(prevStates => {
  //     const newStates = [...prevStates];
  //     newStates[index][columnName] = { mode: newStates[index][columnName]?.mode || 'W', value };
  //     return newStates;
  //   });
  // };

  let obj = {
    tslclientID: '',
    tpiclientID: '',
    pmcclientID: '',
    surclientID: '',
    clientID: ''
  }

  localStorage.setItem("ddlClientVal", JSON.stringify(obj));

  const handleTSLChange = (tslclient) => {
    const tslclientID = tslclient ? tslclient.value : null;
    let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
    ddlClientVal['tslclientID'] = tslclientID + '';
    localStorage.setItem("ddlClientVal", JSON.stringify(ddlClientVal));
  };


  const handleTPIChange = (tpiclient) => {
    const tpiclientID = tpiclient ? tpiclient.value : null;
    let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
    ddlClientVal['tpiclientID'] = tpiclientID + '';
    localStorage.setItem("ddlClientVal", JSON.stringify(ddlClientVal));
  };


  const handlePMCChange = (pmcclient) => {
    const pmcclientID = pmcclient ? pmcclient.value : null;
    let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
    ddlClientVal['pmcclientID'] = pmcclientID + '';
    localStorage.setItem("ddlClientVal", JSON.stringify(ddlClientVal));
  };



  const handleSurveillanceChange = (surclient) => {
    const surclientID = surclient ? surclient.value : null;
    let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
    ddlClientVal['surclientID'] = surclientID + '';
    localStorage.setItem("ddlClientVal", JSON.stringify(ddlClientVal));
  };

  const handleClientChange = (client) => {
    const clientID = client ? client.value : null;
    let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
    ddlClientVal['clientID'] = clientID + '';
    localStorage.setItem("ddlClientVal", JSON.stringify(ddlClientVal));
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fff', color: '#000', textAlign: 'left'
    }),
  };


  return (
    <>
      <section className="TestTableSectionPage">
        <div className="thirdtable-container" id="custom-scroll">
          <table className="thirdTable">
            <thead>
              <tr style={{ background: '#5A245A' }}>
                <th style={{ borderRadius: '10px 0 0 0', minWidth: '70px' }} rowspan="3">#</th>
                <th style={{ minWidth: '300px' }} rowspan="3">Test Description</th>
                <th style={{ minWidth: '220px' }} rowspan="3">Test Method</th>
                <th style={{ minWidth: '220px' }}>PQT</th>
                <th style={{ minWidth: '250px' }}>Regular</th>
                <th style={{ minWidth: '90px' }} colspan="7">Requirement</th>
                <th style={{ minWidth: '90px' }} colspan="5">Witness</th>
                {/* <th style={{ borderRadius: '0 10px 0 0', minWidth: '90px' }} rowspan="2">Action</th> */}
              </tr>
              <tr>
                <th>Frequency</th>
                <th>Frequency</th>
                {/* <th style={{ minWidth: '100px' }} rowspan="2">Prefix</th> */}
                <th style={{ minWidth: '120px' }} rowspan="3">Min</th>
                <th style={{ minWidth: '120px' }} rowspan="3">Max</th>
                <th style={{ minWidth: '180px' }} rowspan="2">Unit</th>
                <th style={{ minWidth: '120px' }} rowspan="2">Suffix</th>
                <th style={{ minWidth: '150px' }} rowspan="2">Temp. Range</th>
                <th style={{ minWidth: '100px' }} rowspan="2">Label</th>
                <th style={{ minWidth: '200px' }} rowspan="2">TSL
                  <Select
                    styles={customStyles}
                    options={TSLDDLOptions.map((ClientOption) => ({ value: ClientOption.ClientID, label: ClientOption.ClientName }))}
                    isSearchable
                    isClearable
                    onChange={handleTSLChange}
                    isMulti={false}
                    placeholder="Seacrh or client..." />
                </th>
                <th style={{ minWidth: '200px' }} rowspan="2">TPI
                  <Select
                    styles={customStyles}
                    options={ddlClient.map((ClientOption) => ({ value: ClientOption.ClientID, label: ClientOption.ClientName }))}
                    isSearchable
                    isClearable
                    onChange={handleTPIChange}
                    isMulti={false}
                    placeholder="Seacrh or client..." />
                </th>
                <th style={{ minWidth: '200px' }} rowspan="2">PMC
                  <Select
                    styles={customStyles}
                    options={ddlClient.map((ClientOption) => ({ value: ClientOption.ClientID, label: ClientOption.ClientName }))}
                    isSearchable
                    isClearable
                    onChange={handlePMCChange}
                    isMulti={false}
                    placeholder="Seacrh or client..." />
                </th>
                <th style={{ minWidth: '200px' }} rowspan="2">Surveillance
                  <Select
                    styles={customStyles}
                    options={ddlClient.map((ClientOption) => ({ value: ClientOption.ClientID, label: ClientOption.ClientName }))}
                    isSearchable
                    isClearable
                    onChange={handleSurveillanceChange}
                    isMulti={false}
                    placeholder="Seacrh or client..." />
                </th>
                <th style={{ minWidth: '200px' }} rowspan="2">Client
                  <Select
                    styles={customStyles}
                    options={ddlClient.map((ClientOption) => ({ value: ClientOption.ClientID, label: ClientOption.ClientName }))}
                    isSearchable
                    isClearable
                    onChange={handleClientChange}
                    isMulti={false}
                    placeholder="Seacrh or client..." />
                </th>
                <th style={{ minWidth: '100px' }} rowspan="2"></th>
              </tr>
            </thead>
            <tbody>
              {apiResponse.map((tests, index) => (
                <tr key={index}>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <input
                        type="checkbox"
                        name="toCheck"
                        id="toCheck"
                        onChange={(e) => handleChange(e, index, "chkchecked", tests.co_param_val_id)}
                      /></span>
                  </td>
                  <td style={{ textAlign: 'left', minWidth: '250px', color: clrBasedOnLvl(tests.pm_test_level) }}>
                    {tests.co_param_val_name}
                  </td>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {/* <select name="method" value={tests.method} onChange={(e) => handleChange(e, index)} disabled={tests.pm_leaf_node === 0}>
                        <option value="">Select Method</option>
                        <option value="method1">Method1</option>
                        <option value="method2">Method2</option>
                      </select> */}
                      <Select
                        className="select"
                        name="method"
                        onChange={(e) => handleChange(e, index, "testmethod_id", tests.co_param_val_id)}
                        options={ddlMethod.map((testmethodOption) => ({ value: testmethodOption.method_id, label: testmethodOption.method_name }))}
                        isSearchable
                        isClearable
                        isMulti={false}
                        placeholder="Seacrh or test method..." />
                    </span>
                  </td>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {/* <select name="pqtunit" value={tests.pqtunit} onChange={(e) => handleChange(e, index)} >
                        <option value="">Select Unit</option>
                        <option value="regunit1">Each Batch </option>
                        <option value="regunit2">Each pipe</option>
                        <option value="regunit3">Once</option>
                        <option value="regunit4">Start of shift</option>
                        <option value="regunit5">Every hour</option>
                        <option value="regunit6">03 Epoxy or Partially coated pipes</option>
                        <option value="regunit7">04  Sample from One pipe</option>
                        <option value="regunit8">03 Sample from One pipe</option>
                      </select> */}
                      <Select
                        className="select"
                        name="pqtunit"
                        onChange={(e) => handleChange(e, index, "PqtFreqName_id", tests.co_param_val_id)}
                        options={ddlpqtfreq.map((pqtOption) => ({ value: pqtOption.pqt_freq_id, label: pqtOption.pqt_freq_name }))}
                        isSearchable
                        isClearable
                        isMulti={false}
                        placeholder="Seacrh or pqt freq..." />
                    </span>
                  </td>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {/* <select name="regunit" value={tests.regunit} onChange={(e) => handleChange(e, index)} >
                        <option value="">Select Unit</option>
                        <option value="regunit1">Each Batch </option>
                        <option value="regunit2">Each pipe</option>
                        <option value="regunit3">Once</option>
                        <option value="regunit4">Start of shift</option>
                        <option value="regunit5">Every hour</option>
                        <option value="regunit6">03 Epoxy or Partially coated pipes</option>
                        <option value="regunit7">04  Sample from One pipe</option>
                        <option value="regunit8">03 Sample from One pipe</option>
                      </select> */}
                      <Select
                        className="select"
                        name="regunit"
                        onChange={(e) => handleChange(e, index, "RegFreqName_id", tests.co_param_val_id)}
                        options={ddlRegfreq.map((RegOption) => ({ value: RegOption.reg_freq_id, label: RegOption.reg_freq_name }))}
                        isSearchable
                        isClearable
                        isMulti={false}
                        placeholder="Seacrh or reg freq..." />
                    </span>
                  </td>
                  {/* <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <input type="text" name="prefix"
                        value={tests.prefix}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Prefix" /></span>
                  </td> */}
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <input type="number"
                        name="min"
                        onChange={(e) => handleChange(e, index, "min", tests.co_param_val_id)}
                        placeholder="Min number" /></span>
                  </td>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <input type="number" name="max"
                        onChange={(e) => handleChange(e, index, "max", tests.co_param_val_id)}
                        placeholder="Max number" /></span>
                  </td>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {/* <select name="requnit" value={tests.requnit} onChange={(e) => handleChange(e, index)} >
                        <option value="">Select unit</option>
                        <option value="requnit1">Mpa</option>
                        <option value="requnit2">N/mm</option>
                        <option value="requnit3">N/M</option>
                        <option value="requnit4">mm</option>
                        <option value="requnit5">cm</option>
                        <option value="requnit6">KV</option>
                        <option value="requnit7">J/mm</option>
                        <option value="requnit8">J/m</option>
                        <option value="requnit9">J</option>
                        <option value="requnit10">m</option>
                      </select> */}
                      <Select
                        className="select"
                        name="requnit"
                        onChange={(e) => handleChange(e, index, "requnit_id", tests.co_param_val_id)}
                        options={ddlUnit.map((unitOption) => ({ value: unitOption.unit_id, label: unitOption.unit_name }))}
                        isSearchable
                        isClearable
                        isMulti={false}
                        placeholder="Seacrh or unit..." />
                    </span>
                  </td>
                  <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <input type="text" name="suffix"
                        onChange={(e) => handleChange(e, index, "suffix", tests.co_param_val_id)}
                        placeholder="Enter suffix" /></span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <span>Base Value <input style={{ marginBottom: '4px', padding: '2px 10px' }} name="basevalue" onChange={(e) => handleChange(e, index, "basevalue", tests.co_param_val_id)} /></span>
                      <div className="BaseValueFlex">
                        <b>+</b>
                        <input type="number" name="positive" placeholder="" onChange={(e) => handleChange(e, index, "positive", tests.co_param_val_id)} />
                        <b>-</b>
                        <input type="number" name="negative" placeholder="" onChange={(e) => handleChange(e, index, "negative", tests.co_param_val_id)} />
                      </div></span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {tests.co_param_val_name}</span>
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {renderColumn('tsl', index, tests.co_param_val_id)}</span>
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {renderColumn('tpi', index, tests.co_param_val_id)}</span>
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {renderColumn('pmc', index, tests.co_param_val_id)}</span>
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {renderColumn('surveillance', index, tests.co_param_val_id)}</span>
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {renderColumn('client', index, tests.co_param_val_id)}</span>
                  </td>
                  <td style={{ textAlign: 'left', minWidth: '250px' }}>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      {tests.co_param_val_type}</span>
                  </td>
                  {/* <td>
                    <span style={{ display: tests.pm_leaf_node === 0 ? 'block' : 'none' }} >&nbsp; </span>
                    <span style={{ display: tests.pm_leaf_node === 1 ? 'block' : 'none' }} >
                      <i onClick={() => removeRowTests(index)} className="fas fa-trash-alt removeButton"></i></span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  function renderColumn(columnName, index, testdesc_id) {
    const columnState = columnStates[index]?.[columnName];
    const isEditMode = columnState?.mode === 'RW';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
          <span
            onClick={() => handleColumnChange(columnName, index, 'W')}
            style={{ cursor: 'pointer', color: columnState?.mode === 'W' ? '#0083A9' : 'black' }}
          >
            W
          </span>
          <span
            onClick={() => handleColumnChange(columnName, index, 'RW')}
            style={{ cursor: 'pointer', color: isEditMode ? '#0083A9' : 'black' }}
          >
            RW
          </span>
        </div> */}
        <input
          type="number"
          name={`${columnName}Input`}
          onChange={(e) => handleChange(e, index, columnName, testdesc_id)}
          placeholder={'0-100'} />
      </div>
    );
  }
};

const clrBasedOnLvl = (pm_test_level) => {
  switch (pm_test_level) {
    case 1: return '#BF3131';
    case 2: return '#B06161';
    default: return 'black';
  }
};

export default TestTable;