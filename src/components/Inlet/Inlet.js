import React, { useState } from "react";
import inletData from "./InletData.json";
import InstrumentData from "./InstrumentData.json";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import "./Inlet.css";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Inlet = () => {
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [clientName, setClientName] = useState("M/S GAIL (India) Limited");
  const [specification, setSpecification] = useState("EIL STANDARD SPECIFICATION No.6-71-0041");
  const [pipeSize, setPipeSize] = useState("457 mm OD X 8.2 mm WT");
  const [coatingType, setCoatingType] = useState("3LPE");
  const [procedureNo, setProcedureNo] = useState("TSL/COAT/QC/WI-17");
  const [reportNo, setReportNo] = useState("BPIR/20230415-3");
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
                  <h1>/&nbsp; Inlet Report </h1>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="InletSectionPage">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12">
              <div className="InletTables">
                <form action="" className="row m-0">
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <h4>Inlet Report  <span>Approve / Reject</span></h4>
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
                        disabled={shouldDisableFields} title={sopono}
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
                </form>
                <div className="row m-0">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    {shouldDisableFields && (
                      <>
                        <Table>
                          <thead>
                            <tr style={{ background: "rgb(90, 36, 90)" }}>
                              <th>Sr. No.</th>
                              <th>Pipe No.</th>
                              <th>Heat No.</th>
                              <th>Length</th>
                              <th>Visual Inspection</th>
                              <th>Remarks (ASL No.)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inletData.map((item, index) => (
                              <tr key={index}>
                                <td>{item["Sr. No."]}</td>
                                <td>{item["Pipe No."]}</td>
                                <td>{item["Heat No."]}</td>
                                <td>{item["Length"]}</td>
                                <td>{item["Visual Inspection"]}</td>
                                <td>{item["Remarks (ASL No.)"]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Table className="INSTRUMENTUSEDTable">
                          <thead>
                            <tr style={{ background: "rgb(90, 36, 90)" }}>
                              <th colSpan={3}> Instrument to be Used</th>
                            </tr>
                            <tr style={{ background: 'whitesmoke' }}>
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
                                <td>{item["Instrument ID/Serial No."]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        {/* <Table>
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
                        </Table> */}
                      </>
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

export default Inlet;
