import React, { useState, useEffect } from 'react';
import './Dailyproductionreport.css';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import Loading from "../Loading";
import Loader from "../Loader";

function Dailyproductionreport() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = secureLocalStorage.getItem("userId");
  const empId = secureLocalStorage.getItem("empId");
  const menuId = queryParams.get('menuId');
  const action = queryParams.get('action');
  const pm_procSheet_id = queryParams.get('procsheetID');
  const id = queryParams.get('id');
  const [ddlYear, setddlYear] = useState([]);
  const roleId = secureLocalStorage.getItem("roleId");
  const [visible, setVisible] = useState(false);
  const [shift, setShift] = useState([]);
  const pathSegments = location.pathname.split(/[\/&]/);
  const [dprDetail, setDprDetail] = useState([]);
  const [enteredData, setEnteredData] = useState({
    releasedDay: 0,
    releasedPreviousDay: 0,
    releasedCummulative: 0,
    releasedLengthDay: 0,
    releasedLengthPreviousDay: 0,
    releasedLengthCummulative: 0,

    dispatchedDay: 0,
    dispatchedPreviousDay: 0,
    dispatchedCummulative: 0,
    dispatchedLengthDay: 0,
    dispatchedLengthPreviousDay: 0,
    dispatchedLengthCummulative: 0,

    balanceDispatch: 0,
    balanceCoating: 0,
    remarks: ""
  })

  let pm_project_id1 = null;
  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].startsWith('procsheetID=')) {
      pm_project_id1 = pathSegments[i].substring('procsheetID='.length);
    }
  }

  console.log(pm_project_id1, "Kshitiz");


  const [formData, setFormData] = useState({
    comp_id: 1,
    loc_id: 1,
    dpR_id: 0,
    procsheet_id: 0,
    proj_id: 0,
    userid: userId,
    issubit: true,
    roleID: 0,
    productiondate: "",
    bprFortheday: 0,
    bprPreviousDay: 0,
    bprCummulative: 0,
    bprLengthPreviousDay: 0,
    bprLengthFortheday: 0,
    bprLengthCummulative: 0,
    nopProcessesFortheday: 0,
    nopProcessesPreviousDay: 0,
    nopProcessesCummulative: 0,
    bareForTheDay: 0,
    barePreviousDay: 0,
    bareCummulative: 0,
    ntcForTheDay: 0,
    ntcPreviousDay: 0,
    ntcCummulative: 0,
    hcscForTheDay: 0,
    hcscPreviousDay: 0,
    hcscCummulative: 0,
    pipes3lpeCoatedPreviousDay: 0,
    pipes3lpeCoatedForTheDay: 0,
    pipes3lpeCoatedCummulative: 0,
    pipes3lpeCoatedRejectionPreviousDay: 0,
    pipes3lpeCoatedRejectionForTheDay: 0,
    pipes3lpeCoatedRejectionCummulative: 0,
    pipes3lpeCoatedOkPreviousDay: 0,
    pipes3lpeCoatedOkForTheDay: 0,
    pipes3lpeCoatedOkCummulative: 0,
    bfiac: 0,
    tpiAcceptedPreviousDay: 0,
    tpiAcceptedForTheDay: 0,
    tpiAcceptedCummulative: 0,
    tpiAcceptedLengthPreviousDay: 0,
    tpiAcceptedLengthFortheDay: 0,
    tpiAcceptedLengthCummulative: 0,
    pReleasedNoPreviousDay: 0,
    pReleasedNoForTheDay: 0,
    pReleasedNoCummulative: 0,
    pReleasedLengthPreviousDay: 0,
    pReleasedLengthForTheDay: 0,
    pReleasedLengthCummulative: 0,
    pipedispatchedForTheDay: 0,
    pipedispatchedPreviousDay: 0,
    pipedispatchedCummulative: 0,
    pipedispatchedLengthForTheDay: 0,
    pipedispatchedLengthPreviousDay: 0,
    pipedispatchedLengthCummulative: 0,
    balanceForDispatch: 0,
    balanceForCoating: 0,
    remarks: ""
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
        getHeaderData()
      }
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEnteredData((prev) => ({
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
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/getEPOXYProcessSheetDetails?processsheetno=${action != 'edit' ? formData.psSeqNo : pm_procSheet_id}&year=${action != 'edit' ? formData.psYear : '2024'}`);
      if (response.data) {
        setVisible(true)
      }
      setFormData(response.data.Table[0])
      setShift(response?.data.Table5[0])

      const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GetDPRDataByID?p_procsheet_id=${response.data.Table[0].processsheetid}&p_dpr_id=${id}`);
      const data = response1.data[0];
      setDprDetail(data || []);

    } catch (error) {
      console.error('Error fetching process sheet details:', error);
    }
  };

  const dataToSend = {
    comp_id: 1,
    loc_id: 1,
    dpR_id: dprDetail?.dpr_data_id,
    daily_prod_data_id: dprDetail?.daily_prod_data_id,
    procsheet_id: formData?.processsheetid,
    proj_id: formData?.projectid,
    userid: userId,
    issubit: true,
    roleID: roleId,
    productiondate: formData?.testdate,
    bprFortheday: dprDetail?.BPRFortheday,
    bprPreviousDay: dprDetail?.BPRPreviousDay,
    bprCummulative: dprDetail?.BPRCummulative,
    bprLengthPreviousDay: dprDetail?.BPRLengthPreviousDay,
    bprLengthFortheday: dprDetail?.BPRLengthFortheday,
    bprLengthCummulative: dprDetail?.BPRLengthCummulative,
    nopProcessesFortheday: dprDetail?.NOPprocessesfortheday,
    nopProcessesPreviousDay: dprDetail?.NOPprocessesPreviousDay,
    nopProcessesCummulative: dprDetail?.NOPprocessescummulative,
    bareForTheDay: dprDetail?.BAREForTheDay,
    barePreviousDay: dprDetail?.BAREPreviousDay,
    bareCummulative: dprDetail?.BARECummulative,
    ntcForTheDay: dprDetail?.NTCForTheDay,
    ntcPreviousDay: dprDetail?.NTCPreviousDay,
    ntcCummulative: dprDetail?.NTCCummulative,
    hcscForTheDay: dprDetail?.HCSCForTheDay,
    hcscPreviousDay: dprDetail?.HCSCPreviousDay,
    hcscCummulative: dprDetail?.HCSCCummulative,
    pipes3lpeCoatedPreviousDay: dprDetail?.LPEPreviousDay,
    pipes3lpeCoatedForTheDay: dprDetail?.LPEForTheDay,
    pipes3lpeCoatedCummulative: dprDetail?.LPECummulative,
    pipes3lpeCoatedRejectionPreviousDay: dprDetail?.PipesRejectedPreviousDay,
    pipes3lpeCoatedRejectionForTheDay: dprDetail?.PipesRejectedForTheDay,
    pipes3lpeCoatedRejectionCummulative: dprDetail?.PipesRejectedCummulative,
    pipes3lpeCoatedOkPreviousDay: dprDetail?.LPECoatedOKPreviousDay,
    pipes3lpeCoatedOkForTheDay: dprDetail?.LPECoatedOKForTheDay,
    pipes3lpeCoatedOkCummulative: dprDetail?.LPECoatedOKCummulative,
    bfiac: dprDetail?.BFIAC,
    tpiAcceptedPreviousDay: dprDetail?.TPIAcceptedPreviousDay,
    tpiAcceptedForTheDay: dprDetail?.TPIAcceptedForTheDay,
    tpiAcceptedCummulative: dprDetail?.TPIAcceptedCummulative,
    tpiAcceptedLengthPreviousDay: dprDetail?.TPIAcceptedLengthPreviousDay,
    tpiAcceptedLengthFortheDay: dprDetail?.TPIAcceptedLengthForTheDay,
    tpiAcceptedLengthCummulative: dprDetail?.TPIAcceptedLengthCummulative,
    pReleasedNoPreviousDay: dprDetail?.PipeReleasedPreviousDay,
    pReleasedNoForTheDay: enteredData?.releasedDay,
    pReleasedNoCummulative: dprDetail?.PipeReleasedCummulative,
    pReleasedLengthPreviousDay: dprDetail?.PipeReleasedLengthPreviousDay,
    pReleasedLengthForTheDay: enteredData?.releasedLengthDay,
    pReleasedLengthCummulative: dprDetail?.PipeReleasedLengthCummulative,
    pipedispatchedForTheDay: enteredData?.pipedispatchedForTheDay,
    pipedispatchedPreviousDay: dprDetail?.PipeDispatchedPreviousDay,
    pipedispatchedCummulative: dprDetail?.PipeDispatchedCummulative,
    pipedispatchedLengthForTheDay: enteredData?.pipedispatchedLengthForTheDay,
    pipedispatchedLengthPreviousDay: dprDetail?.PipeDispatchedLengthPreviousDay,
    pipedispatchedLengthCummulative: dprDetail?.PipeDispatchedLengthCummulative,
    balanceForDispatch: enteredData?.balanceDispatch,
    balanceForCoating: enteredData?.balanceCoating,
    remarks: enteredData?.remarks
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoader(true);
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/SaveDPRdata`, dataToSend);
      if (response.data) {
        toast.success("Form data saved successfully")
        navigate("/dailyproductionreportlist?menuId=26")
        setVisible(true)
      }
    } catch (error) {
      console.error('Error fetching process sheet details:', error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {
        loading ? (
          <Loading />
        ) : loader ? (
          <Loader />
        ) : (
          <>
            <Header />
            <section className='InnerHeaderPageSection'>
              <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <ul>
                      <li> <Link to='/ppcdashboard?moduleId=617'>PPC Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/dailyproductionreportlist?menuId=${menuId}`}>Daily Production Report List</Link></li>
                      <li><h1>/ &nbsp; Daily Production Report</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='WorkinstructionviewSection RegisterEmployeePageSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <form className="RegisterEmployeeForm row m-0">
                      {/* onSubmit={handleSubmit}> */}
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Daily Production Report <span style={{ color: "#34B233" }}>- Add page </span></h4>
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
                        { id: 'typeofcoating', label: 'Type of Coating', value: formData?.typeofcoating },
                        { id: 'PONo', label: 'LOI /PO /FOA /LOA No.', value: formData?.PONo },
                        { id: 'testdate', label: 'Date', value: new Date(formData?.testdate).toLocaleDateString('en-GB') },
                        { id: 'shift', label: 'Shift', value: action === 'edit' ? shift.pm_shiftvalue : shift.pm_shiftvalue },
                      ].map(field => (
                        <div key={field.id} className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor={field.id}>{field.label}</label>
                            <input
                              id={field.id}
                              type='text'
                              value={field.value}
                              placeholder={field.label}
                              readOnly
                              style={{ cursor: 'not-allowed' }}
                            />
                          </div>
                        </div>
                      ))}

                      {visible &&
                        <>
                          {/* <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>BARE PIPE RECEIVED</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.BPRFortheday}
                                placeholder='BARE PIPE RECEIVED'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>BARE PIPE RECEIVED LENGTH (Mtrs)</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.BPRLengthFortheday}
                                placeholder='BARE PIPE RECEIVED LENGTH (Mtrs)'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>NO. OF PIPES PROCESSED</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.NOPprocessesfortheday}
                                placeholder='NO. OF PIPES PROCESSED'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>BARE</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.BAREForTheDay}
                                placeholder='BARE'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>NTC</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.NTCForTheDay}
                                placeholder='NTC'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>H/C & S/C</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.HCSCForTheDay}
                                placeholder='H/C & S/C'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>3LPE PIPES COATED</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.PIPES3LPECOATEDForTheDay}
                                placeholder='3LPE PIPES COATED'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>3LPE COATING PROCESS REJECTION</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.PIPES3LPECOATEDREJECTIONNTCForTheDay}
                                placeholder='3LPE COATING PROCESS REJECTION'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>3LPE COATING OK</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.PIPES3LPECOATEDOKForTheDay}
                                placeholder='3LPE COATING OK'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>BALANCE FOR INSPECTION AFTER COATING</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.BFIAC}
                                placeholder='BALANCE FOR INSPECTION AFTER COATING'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>TPI ACCEPTED (NOS)</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.TPIACCEPTEDForTheDay}
                                placeholder='TPI ACCEPTED (NOS)'
                                disabled
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>ACCEPTED LENGTH ( MTR. )</label>
                              <input
                                type='text'
                                name=''
                                value={dprDetail?.TPIACCEPTEDLENGTHForTheDay}
                                placeholder='ACCEPTED LENGTH ( MTR. )'
                                disabled
                              />
                            </div>
                          </div> */}
                          <div className='col-md-3 col-sm-3 col-xs-12' style={{ visibility: 'hidden' }}>
                            <div className='form-group'>
                              <label>PIPE RELEASED (NOS)</label>
                              <input
                                type='text'
                                name=''
                                placeholder='PIPE RELEASED (NOS)'
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12 mt-4'>
                            <div className='form-group'>
                              <label>PIPE RELEASED (NOS)</label>
                              <input
                                type='text'
                                name='releasedDay'
                                value={enteredData?.releasedDay}
                                onChange={handleInputChange}
                                placeholder='PIPE RELEASED (NOS)'
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12 mt-4'>
                            <div className='form-group'>
                              <label>PIPE RELEASE (IN MTR)</label>
                              <input
                                type='text'
                                name='releasedLengthDay'
                                value={enteredData?.releasedLengthDay}
                                onChange={handleInputChange}
                                placeholder='PIPE RELEASE (IN MTR)'
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12 mt-4'>
                            <div className='form-group'>
                              <label>PIPE DISPATCHED (PCS)</label>
                              <input
                                type='text'
                                name='pipedispatchedForTheDay'
                                value={enteredData?.pipedispatchedForTheDay}
                                onChange={handleInputChange}
                                placeholder='PIPE DISPATCHED (PCS)'
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12 mt-4'>
                            <div className='form-group'>
                              <label>PIPE DISPATCHED (MTR)</label>
                              <input
                                type='text'
                                name='pipedispatchedLengthForTheDay'
                                value={enteredData?.pipedispatchedLengthForTheDay}
                                onChange={handleInputChange}
                                placeholder='PIPE DISPATCHED (MTR)'
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>PIPE BALANCE FOR DISPATCH (MTR)</label>
                              <input
                                type='text'
                                name='balanceDispatch'
                                value={enteredData?.balanceDispatch}
                                onChange={handleInputChange}
                                placeholder='PIPE BALANCE FOR DISPATCH (MTR)'
                              />
                            </div>
                          </div>
                          <div className='col-md-3 col-sm-3 col-xs-12'>
                            <div className='form-group'>
                              <label>BALANCE PIPES FOR COATING APPROX. (NOS.)</label>
                              <input
                                type='text'
                                name='balanceCoating'
                                value={enteredData?.balanceCoating}
                                onChange={handleInputChange}
                                placeholder='BALANCE PIPES FOR COATING APPROX. (NOS.)'
                              />
                            </div>
                          </div>
                          <div className='col-md-12 col-sm-12 col-xs-12'>
                            <div className='form-group'>
                              <label>Remarks</label>
                              <textarea
                                cols={100}
                                rows={5}
                                name='remarks'
                                value={enteredData?.remarks}
                                onChange={handleInputChange}
                                placeholder='Remarks'
                              />
                            </div>
                          </div>
                          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'end' }}>
                            <button className='btn btn-primary' onClick={(e) => handleSubmit(e)} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
                          </div>
                        </>}
                    </form>
                  </div>
                </div>
              </div>
            </section >
            <Footer />
          </>
        )
      }
    </>
  );
}

export default Dailyproductionreport;
