import React, { useState, useEffect } from "react";
import './Blastingline.css';
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage";
import Loading from "../Loading";

function AddBlastingline() {

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  const menuId = searchParams.get('menuId');
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [ddlYear, setddlYear] = useState([]);
  const roleId = secureLocalStorage.getItem("roleId");
  const empId = secureLocalStorage.getItem("empId");
  const [visible, setVisible] = useState(false);
  const [shift, setShift] = useState([]);

  const [formData, setFormData] = useState({
    psYear: "",
    psSeqNo: "",
    processsheetcode: "",
    clientname: "",
    projectname: "",
    pipesize: "",
    PONo: "",
    blastedLineSpeed: "",
    blastingLoad1: "",
    blastingLoad2: "",
    disPhosToWater: "",
    noOfPhosNozzle: "",
    noOfWaterNozzle: "",
    gauge1: "",
    gauge2: "",
    gauge3: "",
    gauge123: "",
    gpm: "",
    gaugeInLpm: "",
    travelArea: "",
    waterWash: "",
    waterFlowrate: "",
    dwellTime: "",
    issubmit: false,
  });

  useEffect(() => {
    setLoading(true)
    fetchYear();
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])

  const fetchYear = async () => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
      const sortedYears = response?.data.sort((a, b) => b.year - a.year);
      setddlYear(sortedYears);
      if (action === 'edit') {
        editDetails();
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

  const handlePsSeqNoBlur = () => {
    if (formData.psSeqNo) {
      getHeaderData();
    }
  };

  const getHeaderData = async () => {
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?processsheetno=${formData.psSeqNo}&year=${formData.psYear}`);
      if (response.data) {
        setVisible(true)
      }
      setFormData(response.data.Table[0])
      setShift(response?.data.Table5[0])
      // setFormData(prev => ({
      //   ...prev,
      //   ...headerData,
      //   shift: response?.data.Table5[0]
      // }));

    } catch (error) {
      console.error('Error fetching process sheet details:', error);
    }
  };

  const handleSubmit = async (e, value) => {
    e.preventDefault();
    setLoading(true)
    try {
      const dataToSend = {
        coCompId: 1,
        coLocationId: 1,
        procsheetId: action === 'edit' ? formData.psSeqNo : formData.processsheetid,
        prodBlastingId: action === 'edit' ? parseInt(id) : 0,
        flowMeter: "0",
        phosphoricAcidHeader: "0",
        blastedLinePipe: "0",
        blastedLineSpeed: formData.blastedLineSpeed.toString(),
        blastingmc1: formData.blastingLoad1.toString(),
        blastingmc2: formData.blastingLoad2.toString(),
        pm_distancephosphoric_start_dmwater: formData.disPhosToWater.toString(),
        nosOfPhosphoricNozzle: formData.noOfPhosNozzle.toString(),
        nosOfWaterNozzle: formData.noOfWaterNozzle.toString(),
        pm_waterflowrate_guage01: formData.gauge1.toString(),
        pm_waterflowrate_guage02: formData.gauge2.toString(),
        pm_waterflowrate_guage03: formData.gauge3.toString(),
        pm_totalwaterflowrate_guage: formData.gauge123.toString(),
        pm_gpmwaterflow_equals: formData.gpm.toString(),
        pm_totalwaterflowrate_guagelpm: formData.gaugeInLpm.toString(),
        pm_totalpipetravel_speed: formData.travelArea.toString(),
        pm_calculatewaterwashflow_rate: formData.waterWash.toString(),
        pm_waterwashflowrate_required: formData.waterFlowrate.toString(),
        pm_dwelltime_linespeed: formData.dwellTime.toString(),
        userid: empId.toString(),
        shiftId: action === 'edit' ? shift.ShiftId.toString() : shift.pm_shift_id.toString(),
        roleId: parseInt(roleId),
        issubmit: value,
      }
      const response = await axios.post(Environment.BaseAPIURL + "/api/User/Insertprodblastingdata", dataToSend);
      if (response.data.responseCode == "1000" || response.data.responseCode == "100") {
        toast.success("Data saved successfully!");
        navigate(`/listblastingline?menuId=${menuId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Fail to submit. Please try again.");
    } finally {
      setLoading(false)
    }
  };

  const editDetails = async () => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProdBlastingdatabyid?id=${id}`);
      const data = response.data[0];
      if (data) {
        setVisible(true)
        setFormData({
          psYear: data.Year || "",
          psSeqNo: data.ProcsheetId || "",
          processsheetcode: data.ProcsheetCode || "",
          clientname: data.ClientName || "",
          projectname: data.ProjectName || "",
          pipesize: data.PipeSize || "",
          PONo: data.Loi_No || "",
          testdate: new Date(data?.ImportDate).toLocaleDateString('en-GB'),
          blastedLineSpeed: data.BlastedLineSpeed || "",
          blastingLoad1: data.blastingmc1 || "",
          blastingLoad2: data.blastingmc2 || "",
          disPhosToWater: data.pm_distancephosphoric_start_dmwater || "",
          noOfPhosNozzle: data.PhNozzleNo || "",
          noOfWaterNozzle: data.WaterNozzleNo || "",
          gauge1: data.pm_waterflowrate_guage01 || "",
          gauge2: data.pm_waterflowrate_guage02 || "",
          gauge3: data.pm_waterflowrate_guage03 || "",
          gauge123: data.pm_totalwaterflowrate_guage || "",
          gpm: data.pm_gpmwaterflow_equals || "",
          gaugeInLpm: data.pm_totalwaterflowrate_guagelpm || "",
          travelArea: data.pm_totalpipetravel_speed || "",
          waterWash: data.pm_waterwashflowrate_required || "",
          waterFlowrate: data.pm_calculatewaterwashflow_rate || "",
          dwellTime: data.pm_dwelltime_linespeed || "",
          issubmit: false,
        });
        setShift(data)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
                    <li><Link to="/productiondashboard?moduleId=619">Production Module</Link></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li> <Link to={`/listblastingline?menuId=${menuId}`}> Blasting Line List </Link> <b style={{ color: '#fff' }}></b></li>
                    <li><h1>/&nbsp; Blasting Line </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="RawmaterialPageSection">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="PipeTallySheetDetails">
                    <form className="form row m-0" onSubmit={handleSubmit}>
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Blasting Line <span>- Add page</span></h4>
                      </div>
                      <div className='col-md-4 col-sm-4 col-xs-12'>
                        <div className='form-group'>
                          <label htmlFor="">Process Sheet</label>
                          <div className='ProcessSheetFlexBox'>
                            <input
                              name="processsheetcode"
                              placeholder='Process sheet'
                              value={formData?.processsheetcode}
                              onChange={handleInputChange}
                              style={{ width: '66%', cursor: 'not-allowed' }}
                            />
                            <select name="psYear" value={formData?.psYear} onChange={handleInputChange} >
                              <option value=""> Year </option>
                              {ddlYear.map((yearOption, i) => (
                                <option key={i} value={yearOption.year}> {yearOption.year} </option>
                              ))}
                            </select>
                            <b>-</b>
                            <input
                              type="number"
                              name="psSeqNo"
                              value={formData?.psSeqNo}
                              onChange={handleInputChange}
                              placeholder='No.'
                              onBlur={handlePsSeqNoBlur}
                            />
                          </div>
                        </div>
                      </div>

                      {[
                        { id: 'clientname', label: 'Client Name', value: formData?.clientname },
                        { id: 'projectname', label: 'Project Name', value: formData?.projectname },
                        { id: 'pipesize', label: 'Pipe Size', value: formData?.pipesize },
                        { id: 'PONo', label: 'LOI /PO /FOA /LOA No.', value: formData?.PONo },
                        { id: 'testdate', label: 'Date', value: new Date(formData?.testdate).toLocaleDateString('en-GB') },
                        { id: 'shift', label: 'Shift', value: action === 'edit' ? shift.ShiftName : shift.pm_shiftvalue },
                      ].map(field => (
                        <div key={field.id} className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor={field.id}>{field.label}</label>
                            <input
                              id={field.id}
                              type='text'
                              value={field.value}
                              placeholder={field.label}
                              style={{ cursor: 'not-allowed' }}
                              readOnly
                            />
                          </div>
                        </div>
                      ))}

                      <div className="col-md-12 col-sm-12 col-xs-12"><hr /></div>
                      {visible &&
                        <>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="blastedLineSpeed">Blasted Line Pipe</label>
                              <input
                                required
                                type="text"
                                id="blastedLineSpeed"
                                name="blastedLineSpeed"
                                placeholder="Enter blasted line pipe"
                                value={formData.blastedLineSpeed}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="blastingLoad1">Blasting Load 1</label>
                              <input
                                required
                                type="text"
                                id="blastingLoad1"
                                name="blastingLoad1"
                                placeholder="Enter blasted line pipe"
                                value={formData.blastingLoad1}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="blastingLoad2">Blasting Load 2</label>
                              <input
                                required
                                type="text"
                                id="blastingLoad2"
                                name="blastingLoad2"
                                placeholder="Enter blasted line pipe"
                                value={formData.blastingLoad2}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="disPhosToWater">Distance between Phosphoric Start to DM Water</label>
                              <input
                                required
                                type="number"
                                id="disPhosToWater"
                                name="disPhosToWater"
                                placeholder="Enter distance between Phosphoric start to DM water"
                                value={formData.disPhosToWater}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="noOfPhosNozzle">Total Nos. of Phosphoric Nozzle Operate</label>
                              <input
                                required
                                type="number"
                                id="noOfPhosNozzle"
                                name="noOfPhosNozzle"
                                placeholder="Enter total nos. of phosphoric nozzle operate"
                                value={formData.noOfPhosNozzle}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="noOfWaterNozzle">Total Nos. of Water Nozzle Operate</label>
                              <input
                                required
                                type="number"
                                id="noOfWaterNozzle"
                                name="noOfWaterNozzle"
                                placeholder="Enter total nos. of water nozzle operate"
                                value={formData.noOfWaterNozzle}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="gauge1">Water Flow Rate in Gauge - 01</label>
                              <input
                                required
                                type="number"
                                id="gauge1"
                                name="gauge1"
                                placeholder="Enter water flow rate in Gauge - 01"
                                value={formData.gauge1}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="gauge2">Water Flow Rate in Gauge - 02</label>
                              <input
                                required
                                type="number"
                                id="gauge2"
                                name="gauge2"
                                placeholder="Enter water flow rate in Gauge - 02"
                                value={formData.gauge2}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="gauge3">Water Flow Rate in Gauge - 03</label>
                              <input
                                required
                                type="number"
                                id="gauge3"
                                name="gauge3"
                                placeholder="Enter water flow rate in Gauge - 03"
                                value={formData.gauge3}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="gauge123">Total Water Flow Rate Gauge (1+2+3)</label>
                              <input
                                required
                                type="number"
                                id="gauge123"
                                name="gauge123"
                                placeholder="Enter total water flow rate Gauge(1+2+3)"
                                value={formData.gauge123}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="gpm">1 GPM of Water Flow Equals to</label>
                              <input
                                required
                                type="number"
                                id="gpm"
                                name="gpm"
                                placeholder="Enter 1 GPM of water flow equals to"
                                value={formData.gpm}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="gaugeInLpm">Total Water Flow Rate Gauge (1+2+3) in LPM</label>
                              <input
                                required
                                type="number"
                                id="gaugeInLpm"
                                name="gaugeInLpm"
                                placeholder="Enter total water flow rate Gauge(1+2+3) in LPM"
                                value={formData.gaugeInLpm}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="travelArea">Total Pipe Travel Area at The Speed of 5.0 m/min</label>
                              <input
                                required
                                type="text"
                                id="travelArea"
                                name="travelArea"
                                placeholder="Enter total pipe travel area at the speed of 5.0 m/min"
                                value={formData.travelArea}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="waterWash">Calculated Water Wash Flow Rate</label>
                              <input
                                required
                                type="number"
                                id="waterWash"
                                name="waterWash"
                                placeholder="Enter calculated water wash flow rate"
                                value={formData.waterWash}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="waterFlowrate">Water Flow Rate Required</label>
                              <input
                                required
                                type="number"
                                id="waterFlowrate"
                                name="waterFlowrate"
                                placeholder="Enter water flow rate required"
                                value={formData.waterFlowrate}
                                onChange={handleInputChange}
                                pattern="\d{1,2}"
                                minLength={1}
                                maxLength={10}
                              />
                            </div>
                          </div>
                          <div className="col-md-3 col-sm-3 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="dwellTime">Dwell Time @ Min 20 Sec Observed at Line Speed</label>
                              <input
                                required
                                type="text"
                                id="dwellTime"
                                name="dwellTime"
                                placeholder="Enter dwell time @ min. 20 sec. observed at line speed"
                                value={formData.dwellTime}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-12 col-sm-12 col-xs-12 mt-4">
                            {/* <button type="submit" className="SubmitNextbtn" onClick={(e) => handleSubmit(e, false)} disabled={loading}>{loading ? 'Saving...' : 'Draft Save'}</button> */}
                            <button type="submit" className="SubmitNextbtn" style={{ float: "right" }} onClick={(e) => handleSubmit(e, true)} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
                          </div>
                        </>
                      }
                    </form>
                  </div>
                </div>
              </div>
            </div >
          </section >
          <Footer />
        </>
      )}
    </>
  );
}

export default AddBlastingline;