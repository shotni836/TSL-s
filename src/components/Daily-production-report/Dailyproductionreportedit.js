import React, { useState, useEffect } from 'react';
import './Dailyproductionreport.css'
import Loading from '../Loading';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import tatasteellogo from "../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../assets/images/tata-blue-logo.png";

function Calibrationedit() {


  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetchData();
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
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
                      <li> <Link to='/ppcdashboard?moduleId=617'>PPC Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/dailyproductionreportlist?menuId=26`}> Daily Production Report List</Link></li>
                      <li><h1>/ &nbsp; Calibration View</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <div className='InspReportSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='InspReportBox'>
                      <section className="HeaderDataSection">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div className="HeaderDataFlexdisplay">
                                <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
                                <img className="tatalogoimg" src={tatalogo} alt="" />
                              </div>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <h1> PIPE COATING DIVISION <br /> RAW MATERIAL INSPECTION REPORT </h1>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div style={{ textAlign: "right" }}>
                                <p>FORMAT NO: TSL/COAT/QC/F-26 REV: 5 DATE: 13/11/2021</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className='Reportmasterdatasection'>
                        <div className='container-fluid'>
                          <form className='row'>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Client</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Report No.</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Project Name</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Date & Shift</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">P.O No.</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Process Sheet No.</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Pipe Size</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Procedure / WI No.</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Type Of Coating</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Production Date</label>
                                <h4>: &nbsp;&nbsp;</h4>
                              </div>
                            </div>
                          </form>
                        </div>
                      </section>

                      <section className='ReporttableSection'>
                        <div className='container-fluid'>
                          <div className='row'>
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                              <div id='custom-scroll'>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Sr. No.</th>
                                      <th>Material Description</th>
                                      <th>Batch No.</th>
                                      <th>Test Description</th>
                                      <th>Test Method</th>
                                      <th>Requirement</th>
                                      <th>Test Result</th>
                                      <th>Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>S. No.</td>
                                      <td>Material Name</td>
                                      <td>Batch</td>
                                      <td>Test Description</td>
                                      <td>Test Method</td>
                                      <td>Requirement</td>
                                      <td>Test Result</td>
                                      <td>Remarks</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="ReportremarksSection">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <p>Remarks Text</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="InstrumentusedSection">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th colSpan={3} style={{ textAlign: 'center', fontSize: '14px' }}>INSTRUMENT USED</th>
                                    </tr>
                                    <tr>
                                      <th>Sr. No.</th>
                                      <th>Instrument Name</th>
                                      <th>Instrument ID / Serial No</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>S. No.</td>
                                      <td>Equipment Used</td>
                                      <td>Instrument Serial No.</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Footer />
          </>
      }
    </>
  )
}

export default Calibrationedit