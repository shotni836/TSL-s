import React, { useState } from "react";
import "./Blasting.css";
import HeaderData from "./HeaderData.json";
import ReportData from "./ReportData.json";
import InstrumentData from "./InstrumentData.json";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Blasting = () => {
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [clientName, setClientName] = useState("M/S GAIL (India) Limited");
  const [specification, setSpecification] = useState("EIL STANDARD SPECIFICATION No.6-71-0041");
  const [pipeSize, setPipeSize] = useState("457 mm OD X 8.2 mm WT");
  const [coatingType, setCoatingType] = useState("3LPE");
  const [procedureNo, setProcedureNo] = useState("TSL/COAT/QC/WI-18,19,20,21");
  const [reportNo, setReportNo] = useState("PABIR/20230415-3");
  const [productionDate, setProductionDate] = useState("15/Apr/2023");
  const [shift, setShift] = useState("Day");
  const [acceptance, setAcceptance] = useState("TSL/COAT/EXT/3LPE/GAIL/MNJPL/01");
  const [sopono, setSopono] = useState("FOA NO. GAIL/NOIDA/C&P/PROJ/MNJPL-PARTB/PIPE/21-45/13");

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

  // -----------------------------------------------


  return (
    <>
      <Header />
      <section className="InnerHeaderPageSection">
        <div
          className="InnerHeaderPageBg"
          style={{ backgroundImage: `url(${RegisterEmployeebg})` }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12">
              <ul>
                <li>
                  <Link to="/dashboard">Quality Module</Link>
                </li>
                <li>
                  <h1> / &nbsp; Blasting Report </h1>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="BlastingSectionPage">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12">
              <div className="BlastingTables">
                <form action="" className="row m-0">
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <h4>Blasting Report</h4>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group1">
                      <label htmlFor="">Process Sheet</label>
                      <div className="ProcessSheetFlexBox">
                        <input
                          style={{ width: "66%", cursor: "not-allowed" }}
                          value={
                            ProcessSheetFields ? "TSL/PSC/EXT/3LPE/GAIL/MNJPL/" : ""
                          }
                          disabled={ProcessSheetFields}
                          placeholder="Process sheet no."
                          readOnly
                        />
                        <select value={year} onChange={handleYearChange}>
                          <option value=""> Year </option>
                          <option value="2022"> 2022 </option>
                          <option value="2023"> 2023 </option>
                        </select>
                        <b>-</b>
                        <input
                          type="number"
                          placeholder="No."
                          value={type}
                          onChange={handleTypeChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Client Name</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? clientName : ""}
                        title={shouldDisableFields ? clientName : ""}
                        disabled={shouldDisableFields}
                        placeholder="Client name"
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Report No.</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? reportNo : ""}
                        title={shouldDisableFields ? reportNo : ""}
                        disabled={shouldDisableFields}
                        placeholder="Report No."
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Pipe Size</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? pipeSize : ""}
                        title={shouldDisableFields ? pipeSize : ""}
                        disabled={shouldDisableFields}
                        placeholder="Pipe size"
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Type Of Coating</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? coatingType : ""}
                        title={shouldDisableFields ? coatingType : ""}
                        disabled={shouldDisableFields}
                        placeholder="Type of coating"
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Procedure/ WI No.</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? procedureNo : ""}
                        title={shouldDisableFields ? procedureNo : ""}
                        disabled={shouldDisableFields}
                        placeholder="Procedure/ WI No."
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Acceptance Criteria</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? acceptance : ""}
                        disabled={shouldDisableFields}
                        placeholder="Acceptance"
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">S.O/P.O No.</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? sopono : ""}
                        title={sopono}
                        disabled={shouldDisableFields}
                        placeholder="S.O/P.O No."
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-12">
                    <div className="form-group">
                      <label htmlFor="">Specification</label>
                      <input
                        type="text"
                        value={shouldDisableFields ? specification : ""}
                        title={shouldDisableFields ? specification : ""}
                        disabled={shouldDisableFields}
                        placeholder="Specification"
                        style={{ cursor: "not-allowed" }}
                        readOnly
                      />
                    </div>
                  </div>

                  {shouldDisableFields && (
                    <>
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Production Date</label>
                          <DatePicker className="ProductionDateDatePicker"
                            maxDate={Date.now()}
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="dd/MMM/yyyy"
                            placeholderText="DD/MMM/YYYY"
                          />
                        </div>
                      </div>
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Shift</label>
                          <select name="" id="">
                            <option value="">-- Select shift --</option>
                            <option value="d">Day</option>
                            <option value="n">Night</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                            <option value="c">C</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                </form>
                <div className="row m-0">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    {shouldDisableFields && (
                      <div>
                        <div style={{ marginBottom: '20px' }} className="table-responsive" id="custom-scroll">
                          <Table>
                            <thead>
                              <tr style={{ background: "rgb(90, 36, 90)" }}>
                                <th rowSpan={2} style={{ minWidth: '70px' }}>Sr. No.</th>
                                <th rowSpan={2}>Pipe No.</th>
                                <th rowSpan={2} style={{ minWidth: '80px' }}>ASL No.</th>
                                <th rowSpan={2} style={{ minWidth: '130px' }}>
                                  Pipe Temp. Before Blasting(°C)
                                </th>
                                <th rowSpan={2} style={{ minWidth: '130px' }}>
                                  Pipe Temp. Before Acid Wash(°C)
                                </th>
                                <th rowSpan={2}>Dwell Time(Sec.)</th>
                                <th colSpan={2}>pH of Pipe Surface</th>
                                <th rowSpan={2} style={{ minWidth: '180px' }}>
                                  *Visual Inspection After Acid Wash & Inside
                                  Cleaning
                                </th>
                                <th rowSpan={2} style={{ minWidth: '130px' }}>
                                  Pressure Of DM Water Wash (bar)
                                </th>
                                <th colSpan={4}>DIM Water Flow Rate(GPM)</th>
                                <th rowSpan={2} style={{ minWidth: '150px' }}>
                                  Preheating Temp. Of Air After Water Wash (°C)
                                </th>
                                <th rowSpan={2} style={{ minWidth: '70px' }}>RH (%)</th>
                                <th rowSpan={2} style={{ minWidth: '90px' }}>Amb. Temp. (°C)</th>
                                <th rowSpan={2} style={{ minWidth: '80px' }}>Dew Point (°C)</th>
                                <th rowSpan={2} style={{ minWidth: '100px' }}>Pipe Surface Temp. (°C)</th>
                                <th rowSpan={2}>Degree Of Cleanliness</th>
                                <th rowSpan={2}>Roughness (µm - Rz)</th>
                                <th colSpan={2}>Degree Of Dust</th>
                                <th rowSpan={2} style={{ minWidth: '90px' }}>Salt Cont. (µg/cm²)</th>
                                <th rowSpan={2} style={{ minWidth: '130px' }}>Raw Material Used</th>
                                <th rowSpan={2}>Manufacturer</th>
                                <th rowSpan={2}>Grade</th>
                                <th rowSpan={2} style={{ minWidth: '90px' }}>Batch No.</th>
                                <th rowSpan={2}>Remarks</th>
                              </tr>
                              <tr style={{ background: "rgb(90, 36, 90)" }}>
                                <th style={{ minWidth: '100px' }}>Before Water Wash</th>
                                <th style={{ minWidth: '100px' }}>After Water Wash</th>
                                <th>FM1</th>
                                <th>FM2</th>
                                <th>FM3</th>
                                <th>Total</th>
                                <th>Rating</th>
                                <th>Class</th>
                              </tr>
                              <tr style={{ background: "whitesmoke" }}>
                                <td colSpan={2} rowSpan={2}>
                                  Specified Requirement
                                </td>
                                <td>Min</td>
                                <td>65</td>
                                <td>45</td>
                                <td rowSpan={2}>-</td>
                                <td>1</td>
                                <td>6</td>
                                <td rowSpan={2}>-</td>
                                <td>-</td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                                <td>65</td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}>-</td>
                                <td rowSpan={2}>-</td>
                                <td>Dew Point+3°C</td>
                                <td rowSpan={2}>SA 2½</td>
                                <td>75</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                                <td rowSpan={2}></td>
                              </tr>
                              <tr style={{ background: "whitesmoke" }}>
                                <td>Max</td>
                                <td>85</td>
                                <td>75</td>
                                <td>2</td>
                                <td>7</td>
                                <td></td>
                                <td>85</td>
                                <td>-</td>
                                <td>100</td>
                                <td>2</td>
                                <td>2</td>
                                <td>2.0</td>
                              </tr>
                            </thead>

                            <tbody>
                              {ReportData.map((row, index) => (
                                <tr key={index}>
                                  <td>{row.srNo}</td>
                                  <td>{row.pipeNo}</td>
                                  <td>{row.aslNo}</td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td>
                                    <select name="" id="">
                                      <option value="">Ok</option>
                                      <option value="">Not Ok</option>
                                    </select>
                                  </td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td><input type="number" placeholder="-" /></td>
                                  <td>{row.preheatingTempOfAir}</td>
                                  <td>{row.relativeHumidity}</td>
                                  <td>{row.ambientTemp}</td>
                                  <td>{row.dewPoint}</td>
                                  <td>{row.pipeSurfaceTemp}</td>
                                  <td>{row.degreeOfCleanliness}</td>
                                  <td>{row.roughness}</td>
                                  <td>{row.degreeOfDustRating}</td>
                                  <td>{row.degreeOfDustClass}</td>
                                  <td>{row.saltCont}</td>
                                  <td>{row.rawmaterialused}</td>
                                  <td>{row.manufacturer}</td>
                                  <td>{row.grade}</td>
                                  <td>{row.batchno}</td>
                                  <td>{row.remarks}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        <div className="table-responsive" id="custom-scroll">
                          <Table>
                            <thead>
                              <tr style={{ background: "rgb(90, 36, 90)" }}>
                                <th colSpan={3} style={{ textAlign: 'center', fontSize: '14px' }}>Instrument to be Used</th>
                              </tr>
                              <tr style={{ background: "whitesmoke" }}>
                                <td>Sr. No.</td>
                                <td>Instrument Name</td>
                                <td>Instrument ID/Serial No.</td>
                              </tr>
                            </thead>
                            <tbody>
                              {InstrumentData.map((item, index) => (
                                <tr key={index}>
                                  <td>{item["Sr. No."]}</td>
                                  <td>{item["Instrument Name"]}</td>
                                  <td><input type="text" placeholder="Enter instrument ID/serial no." /></td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        {/* <div className="table-responsive" id="custom-scroll">
                          <Table>
                            <tbody>
                              <tr>
                                <td style={{ textAlign: "center" }}>
                                  INSPECTED BY
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  ACCEPTED BY
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{ padding: "60px 0px" }}
                                  colSpan={2}
                                ></td>
                              </tr>
                              <tr>
                                <td style={{ textAlign: "center" }}>
                                  QC ENGINEER
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  TPIA/CLIENT
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </div> */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Blasting;
