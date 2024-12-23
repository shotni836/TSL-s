// src/components/Process-Sheet/TestTable.js
import React, { useState, useEffect } from "react";
import "./Coating.css";
import axios from "axios";
import Environment from "../../environment";
import Select from "react-select";
import { json } from "react-router-dom";
import { toast } from "react-toastify";

const TestTable = ({ testsData, handleChange, handleDdlChange }) => {
  const [apiResponse, setApiResponse] = useState([]);
  const [columnStates, setColumnStates] = useState([]);
  //
  const [ddlMethod, setMothods] = useState([]);
  const [ddlpqtfreq, setPqtFrequencys] = useState([]);
  const [ddlRegfreq, setRegFrequencys] = useState([]);
  const [ddlUnit, setUnits] = useState([]);
  const [ddlClient, setClient] = useState([]);

  const TSLDDLOptions = [{ ClientName: "Tata Steel Limited", ClientID: "634" }];

  const getInitialClientVal = () => {
    return (
      JSON.parse(localStorage.getItem("ddlClientVal")) || {
        tslclientID: "",
        tpiclientID: "",
        pmcclientID: "",
        surclientID: "",
        clientID: "",
      }
    );
  };
  useEffect(() => {
    axios
      .get(Environment.BaseAPIURL + "/api/User/GetTestTemplateforCoatType")
      .then((response) => {
        setApiResponse(response.data);

        //setApiResponse(response.data.slice(0, 5));
        let coatingmasterdata = JSON.parse(
          localStorage.getItem("coatingmasterdata")
        );
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
          setClient(responClient);
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  }, []);

  const combinedData = apiResponse?.map((test) => {
    const testData = testsData.find(
      (data) => data.co_param_val_id === test.co_param_val_id
    );

    return {
      ...test,
      ...(testData ? testData : {}),
    };
  });
  localStorage.setItem("combinedData", JSON.stringify(combinedData))

  const testsId = apiResponse.map((item, index) => ({
    index,
    ...item
  }));

  // Save to localStorage
  localStorage.setItem('TableAllData', JSON.stringify(testsId));
  // useEffect(() => {
  //   const elements = document.querySelectorAll(".checkByDefault");
  //   elements.forEach((element) => {
  //     element.click();
  //   });
  // }, [combinedData]);

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

  const [ddlClientVal, setDdlClientVal] = useState(getInitialClientVal());

  const updateLocalStorage = (key, value) => {
    const updatedDdlClientVal = { ...ddlClientVal, [key]: value };
    setDdlClientVal(updatedDdlClientVal);

    localStorage.setItem("ddlClientVal", JSON.stringify(updatedDdlClientVal));
  };

  const handleTSLChange = (tslclient) => {
    console.log("here", 109)
    handleDdlChange("tslclientID")
    const tslclientID = tslclient ? tslclient.value + "" : "0";
    updateLocalStorage("tslclientID", tslclientID);
  };

  const handleTPIChange = (tpiclient) => {
    handleDdlChange("tpiclientID")
    const tpiclientID = tpiclient ? tpiclient.value + "" : "0";
    updateLocalStorage("tpiclientID", tpiclientID);
  };

  const handlePMCChange = (pmcclient) => {
    handleDdlChange("pmcclientID")
    const pmcclientID = pmcclient ? pmcclient.value + "" : "0";
    updateLocalStorage("pmcclientID", pmcclientID);
  };

  const handleSurveillanceChange = (surclient) => {
    handleDdlChange("surclientID")
    const surclientID = surclient ? surclient.value + "" : "0";
    updateLocalStorage("surclientID", surclientID);
  };

  const handleClientChange = (client) => {
    handleDdlChange("clientID")
    const clientID = client ? client.value + "" : "0";
    updateLocalStorage("clientID", clientID);
  };

  const handleInputChange = (e, index, fieldname, testdesc_id) => {
    const value = e.target.value;
    const validNumberPattern = /^\d*\.?\d*$/;
    console.log(fieldname)

    if (validNumberPattern.test(value)) {
      if (value >= 0 && value <= 100 || (fieldname == 'basevalue' || fieldname == 'negative' || fieldname == 'positive')) {
        console.log(e, index, fieldname, testdesc_id)
        handleChange(e, index, fieldname, testdesc_id);
      }
      else {
        toast.error("Value must be between 0 and 100", { errorId: 40 });
      }
    }
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      color: "#000",
      textAlign: "left",
    }),
  };

  function renderColumn(columnName, index, testdesc_id, tests) {
    const columnState = columnStates[index]?.[columnName];
    const isEditMode = columnState?.mode === "RW";
    console.log(columnName, index, testdesc_id, tests)
    return (
      <div
        className="d-flex align-items-center"
        style={{
          gap: "0.5rem",
        }}
      >
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
          type="text"
          name={`${columnName}Input`}
          onChange={(e) => handleInputChange(e, index, columnName, testdesc_id)}
          placeholder={"0-100"}
          value={tests?.[columnName]}
        />

        {columnName !== "tsl" && (
          <input
            type="text"
            name={`Regular${columnName}Input`}
            onChange={(e) =>
              handleInputChange(e, index, `regular_${columnName}`, testdesc_id)
            }
            placeholder={"0-100"}
            value={tests?.regular_ + [columnName]}
          />
        )}
      </div>
    );
  }

  const containsAlphabets = (value) => {
    return /[a-zA-Z!@#$%^&*()_+±\=\[\]{};':"\\|,<>\/?]/.test(value);
  };

  const isAlphaNumeric = (value) => {
    return (/^(?=.*[0-9])(?=.*[a-zA-Z])/.test(value));
  };

  return (
    <>
      <section className="TestTableSectionPage">
        <div className="thirdtable-container" id="custom-scroll">
          <table className="thirdTable">
            <thead>
              <tr style={{ background: "#5A245A" }}>
                <th
                  style={{ borderRadius: "10px 0 0 0", minWidth: "70px" }}
                  rowSpan="3"
                >
                  #
                </th>
                <th style={{ minWidth: "300px" }} rowSpan="3">
                  Test Description
                </th>
                <th style={{ minWidth: "220px" }} rowSpan="3">
                  Test Method
                </th>
                <th style={{ minWidth: "220px" }}>PQT</th>
                <th style={{ minWidth: "250px" }}>Regular</th>
                <th style={{ minWidth: "90px" }} colSpan="7">
                  Requirement
                </th>
                <th style={{ minWidth: "90px" }} colSpan="5">
                  Witness
                </th>
                {/* <th style={{ borderRadius: '0 10px 0 0', minWidth: '90px' }} rowSpan="2">Action</th> */}
              </tr>
              <tr>
                <th>Frequency</th>
                <th>Frequency</th>
                {/* <th style={{ minWidth: '100px' }} rowSpan="2">Prefix</th> */}
                <th style={{ minWidth: "120px" }} rowSpan="3">
                  Min
                </th>
                <th style={{ minWidth: "120px" }} rowSpan="3">
                  Max
                </th>
                <th style={{ minWidth: "180px" }} rowSpan="2">
                  Unit
                </th>
                <th style={{ minWidth: "120px" }} rowSpan="2">
                  Suffix
                </th>
                <th style={{ minWidth: "150px" }} rowSpan="2">
                  Temp. Range
                </th>
                <th style={{ minWidth: "100px" }} rowSpan="2">
                  Label
                </th>
                <th style={{ minWidth: "220px" }} rowSpan="2">
                  TSL
                  <Select
                    styles={customStyles}
                    options={TSLDDLOptions.map((ClientOption) => ({
                      value: ClientOption.ClientID,
                      label: ClientOption.ClientName,
                    }))}
                    isSearchable
                    isClearable
                    onChange={handleTSLChange}
                    isMulti={false}
                    placeholder="Search or client..."
                    value={
                      TSLDDLOptions.find(
                        (option) => option.ClientID == ddlClientVal.tslclientID
                      ) && {
                        value: TSLDDLOptions.find(
                          (option) =>
                            option.ClientID == ddlClientVal.tslclientID
                        ).ClientID,
                        label: TSLDDLOptions.find(
                          (option) =>
                            option.ClientID == ddlClientVal.tslclientID
                        ).ClientName,
                      }
                    }
                  />
                </th>
                <th style={{ minWidth: "200px" }} rowSpan="2">
                  TPI
                  <Select
                    styles={customStyles}
                    options={ddlClient
                      .filter(
                        (ClientOption) =>
                          ClientOption.ClientID != ddlClientVal.pmcclientID &&
                          ClientOption.ClientID != ddlClientVal.tslclientID &&
                          ClientOption.ClientID != ddlClientVal.surclientID &&
                          ClientOption.ClientID != ddlClientVal.clientID
                      )
                      .map((ClientOption) => ({
                        value: ClientOption.ClientID,
                        label: ClientOption.ClientName,
                      }))}
                    tslclientID
                    isSearchable
                    isClearable
                    onChange={handleTPIChange}
                    isMulti={false}
                    placeholder="Search or client..."
                    value={
                      ddlClient.find(
                        (option) => option.ClientID == ddlClientVal.tpiclientID
                      ) && {
                        value: ddlClient.find(
                          (option) =>
                            option.ClientID == ddlClientVal.tpiclientID
                        ).ClientID,
                        label: ddlClient.find(
                          (option) =>
                            option.ClientID == ddlClientVal.tpiclientID
                        ).ClientName,
                      }
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      minWidth: "200px",
                    }}
                  >
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      PQT
                    </th>
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      Regular
                    </th>
                  </div>
                </th>
                <th style={{ minWidth: "200px" }} rowSpan="2">
                  PMC
                  <Select
                    styles={customStyles}
                    options={ddlClient
                      .filter(
                        (ClientOption) =>
                          ClientOption.ClientID != ddlClientVal.tpiclientID &&
                          ClientOption.ClientID != ddlClientVal.tslclientID &&
                          ClientOption.ClientID != ddlClientVal.surclientID &&
                          ClientOption.ClientID != ddlClientVal.clientID
                      )
                      .map((ClientOption) => ({
                        value: ClientOption.ClientID,
                        label: ClientOption.ClientName,
                      }))}
                    isSearchable
                    isClearable
                    onChange={handlePMCChange}
                    isMulti={false}
                    placeholder="Search or client..."
                    value={
                      ddlClient.find(
                        (option) => option.ClientID == ddlClientVal.pmcclientID
                      ) && {
                        value: ddlClient.find(
                          (option) =>
                            option.ClientID == ddlClientVal.pmcclientID
                        ).ClientID,
                        label: ddlClient.find(
                          (option) =>
                            option.ClientID == ddlClientVal.pmcclientID
                        ).ClientName,
                      }
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      minWidth: "200px",
                    }}
                  >
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      PQT
                    </th>
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      Regular
                    </th>
                  </div>
                </th>
                <th style={{ minWidth: "200px" }} rowSpan="2">
                  Surveillance
                  <Select
                    styles={customStyles}
                    options={ddlClient
                      .filter(
                        (ClientOption) =>
                          ClientOption.ClientID != ddlClientVal.tslclientID &&
                          ClientOption.ClientID != ddlClientVal.tpiclientID &&
                          ClientOption.ClientID != ddlClientVal.pmcclientID &&
                          ClientOption.ClientID != ddlClientVal.clientID
                      )
                      .map((ClientOption) => ({
                        value: ClientOption.ClientID,
                        label: ClientOption.ClientName,
                      }))}
                    isSearchable
                    isClearable
                    onChange={handleSurveillanceChange}
                    isMulti={false}
                    placeholder="Search or client..."
                    value={
                      ddlClient.find(
                        (option) => option.ClientID == ddlClientVal.surclientID
                      ) && {
                        value: ddlClient.find(
                          (option) =>
                            option.ClientID == ddlClientVal.surclientID
                        ).ClientID,
                        label: ddlClient.find(
                          (option) =>
                            option.ClientID == ddlClientVal.surclientID
                        ).ClientName,
                      }
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      minWidth: "200px",
                    }}
                  >
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      PQT
                    </th>
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      Regular
                    </th>
                  </div>
                </th>
                <th style={{ minWidth: "200px" }} rowSpan="2">
                  Client
                  <Select
                    styles={customStyles}
                    options={ddlClient
                      .filter(
                        (ClientOption) =>
                          ClientOption.ClientID != ddlClientVal.tslclientID &&
                          ClientOption.ClientID != ddlClientVal.tpiclientID &&
                          ClientOption.ClientID != ddlClientVal.pmcclientID &&
                          ClientOption.ClientID != ddlClientVal.surclientID
                      )
                      .map((ClientOption) => ({
                        value: ClientOption.ClientID,
                        label: ClientOption.ClientName,
                      }))}
                    isSearchable
                    isClearable
                    onChange={handleClientChange}
                    isMulti={false}
                    placeholder="Search or client..."
                    value={
                      ddlClient.find(
                        (option) => option.ClientID == ddlClientVal.clientID
                      ) && {
                        value: ddlClient.find(
                          (option) => option.ClientID == ddlClientVal.clientID
                        ).ClientID,
                        label: ddlClient.find(
                          (option) => option.ClientID == ddlClientVal.clientID
                        ).ClientName,
                      }
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      minWidth: "200px",
                    }}
                  >
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      PQT
                    </th>
                    <th
                      style={{
                        flex: 1,
                        textAlign: "center",
                        borderRadius: "4px",
                        border: 'none'
                      }}
                    >
                      Regular
                    </th>
                  </div>
                </th>
                <th style={{ minWidth: "100px" }} rowSpan="2"></th>
              </tr>
            </thead>
            <tbody>
              {combinedData?.length > 0 &&
                combinedData.map((tests, index) => (
                  <tr key={index} id={"test-row-" + index}>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {console.log(tests.chkchecked)}
                        <input
                          type="checkbox"
                          name="toCheck"
                          id="toCheck"
                          className={tests.chkchecked ? "checkByDefault" : ""}
                          onChange={(e) =>
                            handleChange(
                              e,
                              index,
                              "chkchecked",
                              tests.co_param_val_id
                            )
                          }
                          checked={tests.chkchecked}
                        />
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "left",
                        minWidth: "250px",
                        color: clrBasedOnLvl(tests.pm_test_level),
                      }}
                    >
                      {tests.co_param_val_name}
                    </td>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {/* <select name="method" value={tests.method} onChange={(e) => handleChange(e, index)} disabled={tests.pm_leaf_node === 0}>
                        <option value="">Select Method</option>
                        <option value="method1">Method1</option>
                        <option value="method2">Method2</option>
                      </select> */}
                        <Select
                          className="select"
                          id={"test-method-" + index}
                          name="method"
                          isDisabled={!tests.chkchecked}
                          onChange={(e) =>
                            handleChange(
                              e,
                              index,
                              "testmethod_id",
                              tests.co_param_val_id
                            )
                          }
                          options={ddlMethod.map((testmethodOption) => ({
                            value: testmethodOption.method_id,
                            label: testmethodOption.method_name,
                          }))}
                          isSearchable
                          isClearable
                          isMulti={false}
                          placeholder="Search or test method..."
                          value={
                            ddlMethod.find(
                              (option) =>
                                option.method_id == tests.testmethod_id
                            ) && {
                              value: ddlMethod.find(
                                (option) =>
                                  option.method_id == tests.testmethod_id
                              ).method_id,
                              label: ddlMethod.find(
                                (option) =>
                                  option.method_id == tests.testmethod_id
                              ).method_name,
                            }
                          }
                        />
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
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
                          id={"pqt-frequency-" + index}
                          name="pqtunit"
                          isDisabled={!tests.chkchecked}
                          onChange={(e) =>
                            handleChange(
                              e,
                              index,
                              "PqtFreqName_id",
                              tests.co_param_val_id
                            )
                          }
                          className="select"
                          options={ddlpqtfreq.map((pqtOption) => ({
                            value: pqtOption.pqt_freq_id,
                            label: pqtOption.pqt_freq_name,
                          }))}
                          isSearchable
                          isClearable
                          isMulti={false}
                          placeholder="Search or pqt freq..."
                          value={
                            ddlpqtfreq.find(
                              (option) =>
                                option.pqt_freq_id == tests.PqtFreqName_id
                            ) && {
                              value: ddlpqtfreq.find(
                                (option) =>
                                  option.pqt_freq_id == tests.PqtFreqName_id
                              ).pqt_freq_id,
                              label: ddlpqtfreq.find(
                                (option) =>
                                  option.pqt_freq_id == tests.PqtFreqName_id
                              ).pqt_freq_name,
                            }
                          }
                        />
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
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
                          id={"regular-frequency-" + index}
                          className="select"
                          isDisabled={!tests.chkchecked}
                          name="regunit"
                          onChange={(e) =>
                            handleChange(
                              e,
                              index,
                              "RegFreqName_id",
                              tests.co_param_val_id
                            )
                          }
                          options={ddlRegfreq.map((RegOption) => ({
                            value: RegOption.reg_freq_id,
                            label: RegOption.reg_freq_name,
                          }))}
                          isSearchable
                          isClearable
                          isMulti={false}
                          placeholder="Search or reg freq..."
                          value={
                            ddlRegfreq.find(
                              (option) =>
                                option.reg_freq_id == tests.RegFreqName_id
                            ) && {
                              value: ddlRegfreq.find(
                                (option) =>
                                  option.reg_freq_id == tests.RegFreqName_id
                              ).reg_freq_id,
                              label: ddlRegfreq.find(
                                (option) =>
                                  option.reg_freq_id == tests.RegFreqName_id
                              ).reg_freq_name,
                            }
                          }
                        />
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
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        <input
                          type="text"
                          name="min"
                          onChange={(e) =>
                            handleChange(e, index, "min", tests.co_param_val_id)
                          }
                          id={"min-number-" + index}
                          placeholder="Min number"
                          value={tests.min}
                          disabled={(tests.max && containsAlphabets(tests.max)) || !tests.chkchecked}
                        />
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>

                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        <input
                          type="text"
                          name="max"
                          isDisabled={!tests.chkchecked}
                          onChange={(e) =>
                            handleChange(e, index, "max", tests.co_param_val_id)
                          }
                          placeholder="Max number"
                          id={"max-number-" + index}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/[^\d.-]/g, '');
                          }}
                          value={containsAlphabets(tests.min) ? "" : tests.max}
                          disabled={tests.min && containsAlphabets(tests.min) || isAlphaNumeric(tests.min) || !tests.chkchecked}
                        />
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
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
                          id={"req-unit-" + index}
                          className="select"
                          isDisabled={!tests.chkchecked}
                          name="requnit"
                          onChange={(e) =>
                            handleChange(
                              e,
                              index,
                              "requnit_id",
                              tests.co_param_val_id
                            )
                          }
                          options={ddlUnit.map((unitOption) => ({
                            value: unitOption.unit_id,
                            label: unitOption.unit_name,
                          }))}
                          isSearchable
                          isClearable
                          isMulti={false}
                          placeholder="Search or unit..."
                          value={
                            ddlUnit.find(
                              (option) => option.unit_id == tests.requnit_id
                            ) && {
                              value: ddlUnit.find(
                                (option) => option.unit_id == tests.requnit_id
                              ).unit_id,
                              label: ddlUnit.find(
                                (option) => option.unit_id == tests.requnit_id
                              ).unit_name,
                            }
                          }
                        />
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        <input
                          type="text"
                          name="suffix"
                          onChange={(e) =>
                            handleChange(
                              e,
                              index,
                              "suffix",
                              tests.co_param_val_id
                            )
                          }
                          id={"suffix-" + index}
                          placeholder="Enter suffix"
                          value={tests.suffix}
                          style={{ minWidth: '400px' }}
                          disabled={!tests.chkchecked}
                        />
                      </span>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        <span>
                          Base Value
                          <input
                            style={{ marginBottom: "4px", padding: "2px 10px" }}
                            name="basevalue"
                            disabled={!tests.chkchecked}
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                index,
                                "basevalue",
                                tests.co_param_val_id
                              )
                            }
                            className={"base-value-" + index}
                            value={tests.basevalue}
                          />
                        </span>
                        <div className="BaseValueFlex">
                          <b>+</b>
                          <input
                            type="text"
                            name="positive"
                            disabled={!tests.chkchecked}
                            className={"positive-method-" + index}
                            placeholder=""
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                index,
                                "positive",
                                tests.co_param_val_id
                              )
                            }
                            value={tests.positive}
                          />
                          <b>-</b>
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name="negative"
                            className={"negative-method-" + index}
                            placeholder=""
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                index,
                                "negative",
                                tests.co_param_val_id
                              )
                            }
                            value={tests.negative}
                          />
                        </div>
                      </span>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {tests.co_param_val_name}
                      </span>
                    </td>
                    <td style={{ minWidth: "100px" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {/* {renderColumn(
                          "tsl",
                          index,
                          tests.co_param_val_id,
                          tests
                        )} */}
                        <div
                          className="d-flex align-items-center"
                          style={{
                            gap: "0.5rem",
                          }}
                        >
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`tslInput`}
                            onChange={(e) => handleInputChange(e, index, 'tsl', tests.co_param_val_id)}
                            placeholder={"0-100"}
                            className={"tsl-pqt-" + index}
                            value={tests?.['tsl']}
                          />
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`RegulartslInput`}
                            onChange={(e) =>
                              handleInputChange(e, index, `regular_tsl`, tests.co_param_val_id)
                            }
                            placeholder={"0-100"}
                            id={"tsl-regular-" + index}
                            value={tests?.regular_tsl}
                          />
                        </div>
                      </span>
                    </td>
                    <td style={{ minWidth: "100px" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {/* {renderColumn(
                          "tpi",
                          index,
                          tests.co_param_val_id,
                          tests
                        )} */}
                        <div
                          className="d-flex align-items-center"
                          style={{
                            gap: "0.5rem",
                          }}
                        >
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`tpiInput`}
                            onChange={(e) => handleInputChange(e, index, 'tpi', tests.co_param_val_id)}
                            placeholder={"0-100"}
                            className={"tpi-pqt-" + index}
                            value={tests?.['tpi']}
                          />
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`RegulartpiInput`}
                            onChange={(e) =>
                              handleInputChange(e, index, `regular_tpi`, tests.co_param_val_id)
                            }
                            id={"tpi-regular-" + index}
                            placeholder={"0-100"}
                            value={tests?.regular_tpi}
                          />
                        </div>
                      </span>
                    </td>
                    <td style={{ minWidth: "100px" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {/* {renderColumn(
                          "pmc",
                          index,
                          tests.co_param_val_id,
                          tests
                        )} */}

                        <div
                          className="d-flex align-items-center"
                          style={{
                            gap: "0.5rem",
                          }}
                        >
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`pmcInput`}
                            onChange={(e) => handleInputChange(e, index, 'pmc', tests.co_param_val_id)}
                            placeholder={"0-100"}
                            className={"pmc-pqt-" + index}
                            value={tests?.['pmc']}
                          />
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`RegularpmcInput`}
                            onChange={(e) =>
                              handleInputChange(e, index, `regular_pmc`, tests.co_param_val_id)
                            }
                            id={"pmc-regular-" + index}
                            placeholder={"0-100"}
                            value={tests?.regular_pmc}
                          />
                        </div>
                      </span>
                    </td>
                    <td style={{ minWidth: "100px" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {/* {renderColumn(
                          "surveillance",
                          index,
                          tests.co_param_val_id,
                          tests
                        )} */}

                        <div
                          className="d-flex align-items-center"
                          style={{
                            gap: "0.5rem",
                          }}
                        >
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`surveillanceInput`}
                            onChange={(e) => handleInputChange(e, index, 'surveillance', tests.co_param_val_id)}
                            placeholder={"0-100"}
                            className={"surveillance-pqt-" + index}
                            value={tests?.['surveillance']}
                          />
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`RegularsurveillanceInput`}
                            onChange={(e) =>
                              handleInputChange(e, index, `regular_surveillance`, tests.co_param_val_id)
                            }
                            id={"surveillance-regular-" + index}
                            placeholder={"0-100"}
                            value={tests?.regular_surveillance}
                          />
                        </div>
                      </span>
                    </td>
                    <td style={{ minWidth: "100px" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {/* {renderColumn(
                          "client",
                          index,
                          tests.co_param_val_id,
                          tests
                        )} */}
                        <div
                          className="d-flex align-items-center"
                          style={{
                            gap: "0.5rem",
                          }}
                        >
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`clientInput`}
                            onChange={(e) => handleInputChange(e, index, 'client', tests.co_param_val_id)}
                            placeholder={"0-100"}
                            className={"client-pqt-" + index}
                            value={tests?.['client']}
                          />
                          <input
                            type="text"
                            disabled={!tests.chkchecked}
                            name={`RegularclientInput`}
                            onChange={(e) =>
                              handleInputChange(e, index, `regular_client`, tests.co_param_val_id)
                            }
                            placeholder={"0-100"}
                            id={"client-regular-" + index}
                            value={tests?.regular_client}
                          />
                        </div>
                      </span>
                    </td>
                    <td style={{ textAlign: "left", minWidth: "250px" }}>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 0 ? "block" : "none",
                        }}
                      >
                        &nbsp;{" "}
                      </span>
                      <span
                        style={{
                          display: tests.pm_leaf_node === 1 ? "block" : "none",
                        }}
                      >
                        {tests.co_param_val_type}
                      </span>
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
};

const clrBasedOnLvl = (pm_test_level) => {
  switch (pm_test_level) {
    case 1:
      return "#BF3131";
    case 2:
      return "#B06161";
    default:
      return "black";
  }
};

export default TestTable;
