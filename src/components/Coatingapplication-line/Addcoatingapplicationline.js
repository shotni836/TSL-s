import React, { useState, useEffect } from "react";
import './Coatingapplicationline.css';
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage";
import Loading from "../Loading";
import 'react-toastify/dist/ReactToastify.css';
import { encryptData } from '../Encrypt-decrypt';

function Addcoatingapplicationline() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const token = secureLocalStorage.getItem('token');
  const action = searchParams.get('action');
  const id = searchParams.get('id');

  const [ddlYear, setddlYear] = useState([]);
  const userId = secureLocalStorage.getItem("userId");
  const roleId = secureLocalStorage.getItem("roleId");
  const empId = secureLocalStorage.getItem("empId");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [formDataHdpe, setFormDataHdpe] = useState({
    hpdescrew1: '',
    hpdescrew2: '',
  })
  const [shift, setShift] = useState([]);
  const [formData, setFormData] = useState({
    psYear: "",
    psSeqNo: "",
    epoxyBooth: "1",
    adhesiveDie: "1",
    peDie: "1",
    waterQuenching: "1",
    linePipe: "1",
    trgtPipeTemp: "",
    appWindow: "",
    lineSpeed: "",
    distBwEpoxyToAdhesive: "",
    distBwEpoxyToWaterquenching: "",
    dewPtTemp: "",
    noOfEpoxyGunsOperate: "",
    minAirpressOfEpoxySpray: "",
    reqCoatingThicknessEpoxypowder: "",
    reqCoatingThicknessAdhesive: "",
    totalCoatingThickness: "",
    adhesiveFilmTemp: "",
    peFilmTemperature: "",
    hpdescrew: '',
    adhesivescrew: '',
    flowrate: '',
    airpressure: '',
    epoxygun: '',
    roleId: 0,
    issubmit: "",
    shiftId: ""
  });

  const editDetails = async () => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProdApplicationdatabyid?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data[0][0];
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
          trgtPipeTemp: data.TargetPipeTemp || "",
          lineSpeed: data.LineSpeed || "",
          appWindow: data.AppWindow || "",
          distBwEpoxyToAdhesive: data.EpoxyToAdhesive || "",
          distBwEpoxyToWaterquenching: data.EpoxyToWaterQuench || "",
          dewPtTemp: data.DewPoint || "",
          noOfEpoxyGunsOperate: data.noOfEpoxyGunsOperate || "",
          minAirpressOfEpoxySpray: data.minAirpressOfEpoxySpray || "",
          reqCoatingThicknessEpoxypowder: data.ReqCoatingEpoxyPwdr || "",
          reqCoatingThicknessAdhesive: data.ReqCoatingAdhesive || "",
          totalCoatingThickness: data.TotalCoatingThiknes || "",
          adhesiveFilmTemp: data.AdhesiveFilmTemp || "",
          peFilmTemperature: data.PeFilmTemp || "",
          adhesivescrew: data.adhesivescrew || "",
          issubmit: false,
        });
        setShift(data)
        const hpdescrewArray = data.hpdescrew.split(",").map(value => parseInt(value));
        setFormDataHdpe({
          hpdescrew1: hpdescrewArray[0],
          hpdescrew2: hpdescrewArray[1]
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setLoading(true)
    fetchYear();
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])

  const fetchYear = async () => {
    try {
      const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
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
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?processsheetno=${encryptData(formData.psSeqNo)}&year=${encryptData(formData.psYear)}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data) {
        setVisible(true)
      }
      setFormData(response.data.Table[0])
      setShift(response?.data.Table5[0])
    } catch (error) {
      console.error('Error fetching process sheet details:', error);
    }
  };

  const handleHdpeChange = ({ target }) => {
    const { name, value } = target;
    setFormDataHdpe((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, value) => {
    e.preventDefault();
    setLoading(true)
    try {
      const dataToSend = {
        coCompId: 1,
        coLocationId: 1,
        procsheetId: action === 'edit' ? formData.psSeqNo : formData.processsheetid,
        shiftId: action === 'edit' ? shift.ShiftId.toString() : shift.pm_shift_id.toString(),
        prodAppID: action === 'edit' ? parseInt(id) : 0,
        epoxyBooth: formData.epoxyBooth,
        adhesiveDie: formData.adhesiveDie,
        peDie: formData.peDie,
        waterQuenching: formData.waterQuenching,
        linePipe: formData.linePipe,
        trgtPipeTemp: formData.trgtPipeTemp,
        appWindow: formData.appWindow,
        lineSpeed: formData.lineSpeed,
        distBwEpoxyToAdhesive: formData.distBwEpoxyToAdhesive,
        distBwEpoxyToWaterquenching: formData.distBwEpoxyToWaterquenching,
        dewPtTemp: formData.dewPtTemp,
        noOfEpoxyGunsOperate: formData.noOfEpoxyGunsOperate,
        minAirpressOfEpoxySpray: formData.minAirpressOfEpoxySpray,
        reqCoatingThicknessEpoxypowder: formData.reqCoatingThicknessEpoxypowder,
        reqCoatingThicknessAdhesive: formData.reqCoatingThicknessAdhesive,
        totalCoatingThickness: formData.totalCoatingThickness,
        adhesiveFilmTemp: formData.adhesiveFilmTemp,
        peFilmTemperature: formData.peFilmTemperature,
        adhesivescrew: formData.adhesivescrew,
        flowrate: formData.flowrate,
        airpressure: formData.airpressure,
        epoxygun: formData.epoxygun,
        hpdescrew: `${formDataHdpe.hpdescrew1}, ${formDataHdpe.hpdescrew2}`,
        userid: empId.toString(),
        roleId: parseInt(roleId),
        issubmit: value,
      }
      const response = await axios.post(Environment.BaseAPIURL + "/api/User/InsertprodApplicationdata", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.responseMessage === "Already Inserted") {
        toast.error("This Process Sheet Already Inserted!");
        return;
      }
      toast.success("Data saved successfully!");
      navigate(`/listcoatingapplicationline?moduleId=${moduleId}&menuId=${menuId}`);
    } catch (error) {
      toast.error("Fail to submit. Please try again.");
    } finally {
      setLoading(false)
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
                    <li><Link to={`/productiondashboard?moduleId=${moduleId}`}>Production Module</Link></li>
                    <b style={{ color: '#fff' }}>/&nbsp;</b>
                    <li><Link to={`/listcoatingapplicationline?moduleId=${moduleId}&menuId=${menuId}`}> Coating Application Line List</Link><b style={{ color: '#fff' }}></b></li>
                    <li><h1>/&nbsp; Coating Application Line </h1></li>
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
                    <form className="form row m-0">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Coating Application Line <span>- Add page</span></h4>
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
                      {visible && (
                        <>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Targeted Pipe Temperature</label>
                              <input
                                type="text"
                                placeholder="Enter targeted pipe temperature"
                                name="trgtPipeTemp"
                                value={formData.trgtPipeTemp}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Line Speed</label>
                              <input
                                type="text"
                                placeholder="Enter line speed"
                                name="lineSpeed"
                                value={formData.lineSpeed}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Application Window</label>
                              <input
                                type="text"
                                placeholder="Enter application window"
                                name="appWindow"
                                value={formData.appWindow}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Distance Between Epoxy Last Spray To Adhesive</label>
                              <input
                                type="number"
                                placeholder="Enter distance between epoxy last spray to adhesive"
                                name="distBwEpoxyToAdhesive"
                                value={formData.distBwEpoxyToAdhesive}
                                onChange={handleInputChange}
                                required
                                pattern="\d{1,60}"
                                minLength={1}
                                maxLength="60"
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Distance Between Epoxy Last Spray To Water Quenching</label>
                              <input
                                type="number"
                                placeholder="Enter distance between epoxy last spray to water quenching"
                                name="distBwEpoxyToWaterquenching"
                                value={formData.distBwEpoxyToWaterquenching}
                                onChange={handleInputChange}
                                required
                                pattern="\d{1,60}"
                                minLength={1}
                                maxLength={60}
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Cure time in second</label>
                              <input
                                type="text"
                                placeholder="Enter cure time in second"
                                name="dewPtTemp"
                                value={formData.dewPtTemp}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">No. Of Epoxy Guns Operate</label>
                              <input
                                type="number"
                                placeholder="No. Of Epoxy Guns Operate"
                                name="noOfEpoxyGunsOperate"
                                value={formData.noOfEpoxyGunsOperate}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Required Coating Thickeness Epoxy Spray (On Display 6 kg/cm² observe) </label>
                              <input
                                type="text"
                                placeholder="Enter coating thickeness epoxy spray"
                                name="minAirpressOfEpoxySpray"
                                value={formData.minAirpressOfEpoxySpray}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Required Coating Thickeness Epoxy Powder</label>
                              <input
                                type="text"
                                placeholder="Enter coating thickeness epoxy powder"
                                name="reqCoatingThicknessEpoxypowder"
                                value={formData.reqCoatingThicknessEpoxypowder}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Required Coating Thickeness Adhesive</label>
                              <input
                                type="text"
                                placeholder="Enter coating thickeness adhesive"
                                name="reqCoatingThicknessAdhesive"
                                value={formData.reqCoatingThicknessAdhesive}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Total Coating Thickness</label>
                              <input
                                type="text"
                                placeholder="Enter total coating thickness"
                                name="totalCoatingThickness"
                                value={formData.totalCoatingThickness}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Adhesive Film Temperature</label>
                              <input
                                type="text"
                                placeholder="Enter adhesive film temperature"
                                name="adhesiveFilmTemp"
                                value={formData.adhesiveFilmTemp}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">PE Film Temperature</label>
                              <input
                                type="text"
                                placeholder="Enter PE film temperature"
                                name="peFilmTemperature"
                                value={formData.peFilmTemperature}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">HDPE Screw RPM</label>
                              <div style={{ display: 'flex' }}>
                                <input
                                  type="number"
                                  placeholder="Enter HDPE Screw 1"
                                  name="hpdescrew1"
                                  value={formDataHdpe.hpdescrew1}
                                  onChange={handleHdpeChange}
                                  required
                                />
                                <input
                                  style={{ marginLeft: '10px' }}
                                  type="number"
                                  placeholder="Enter HDPE Screw 2"
                                  name="hpdescrew2"
                                  value={formDataHdpe.hpdescrew2}
                                  onChange={handleHdpeChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Adhesive Screw RPM</label>
                              <input
                                type="number"
                                placeholder="Enter Adhesive Screw RPM"
                                name="adhesivescrew"
                                value={formData.adhesivescrew}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group col-md-12 col-sm-12 col-xs-12">
                            <div className="RegisterEmployeeFooter">
                              <span></span>
                              {/* <button type="submit" className="SubmitNextbtn" onClick={(e) => handleSubmit(e, '0')}>Save Draft</button> */}
                              <button type="submit" className="SubmitNextbtn" onClick={(e) => handleSubmit(e, '1')} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
                            </div>
                          </div>
                        </>
                      )}
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
export default Addcoatingapplicationline;