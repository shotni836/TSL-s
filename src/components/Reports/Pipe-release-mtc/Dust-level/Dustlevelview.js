import React, { useState, useEffect, useRef } from 'react';
import '../../Allreports.css';
import Loading from '../../../Loading';
import tatasteellogo from "../../../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../../../assets/images/tata-blue-logo.png";
import axios from 'axios';
import Environment from "../../../../environment";
import html2pdf from 'html2pdf.js';
import { useLocation, useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { decryptData, encryptData } from '../../../Encrypt-decrypt';

function Dustlevelview() {
  const token = secureLocalStorage.getItem('token');
  const [workview, setWorkview] = useState({});
  const [images, setImages] = useState([]);
  const contentRef = useRef();

  const location = useLocation();
  const pathSegments = location.pathname.split(/[\/&]/);

  const { tstmaterialid } = useParams();

  const [id1,] = tstmaterialid.split('&');
  let ID1 = decryptData(id1)

  let pm_processSheet_id1 = null;

  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].startsWith('pm_processSheet_id=')) {
      pm_processSheet_id1 = pathSegments[i].substring('pm_processSheet_id='.length);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetDustLevelReport?dustid=${ID1 != 'undefined' ? id1 : encryptData(0)}&procsheet_id=${pm_processSheet_id1}&test_id=${encryptData(237)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = response.data[0][0];
        const data1 = response.data[1];
        setWorkview(data);
        setImages(data1);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, []);

  function formatDate(dateString) {
    const date = new Date(dateString).toLocaleDateString('en-GB').replace(/-/g, '.')
    return dateString.replace(/-/g, '.') ? date : "-";
  }

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Dust-Level-report-${workview?.projectId}-${new Date().toLocaleDateString('en-GB').replace(/\//g, "-")}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => { window.print(); };

  return (
    <>
      {
        loading ? <Loading /> :
          <>
            <div style={{ textAlign: 'right', paddingRight: '14px', paddingTop: '10px' }}>
              <div className="DownloadPrintFlexSection">
                <h4 className='DownloadPDFBtn' onClick={handleDownloadPDF}>
                  <i className="fas fa-download"> </i> Download PDF
                </h4>
                <h4 className='PrintBtn' onClick={handlePrint}>
                  <i className="fas fa-print"></i> Print
                </h4>
              </div>
            </div>
            <div className='InspReportSection' ref={contentRef}>
              <div className='container-fluid'>
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
                              <h1> PIPE COATING DIVISION <br /> {workview?.formatDesc || 'Loading...'} </h1>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div style={{ textAlign: "right" }}>
                                <p>{`FORMAT NO.: ${workview.formatno} REV: ${workview.Revision} DATE: ${formatDate(workview.Formatdate ? workview.Formatdate : workview.Formatdate ? workview.Formatdate : '-')}`}</p>
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
                                <span>: &nbsp;</span>
                                <h4 style={{ textTransform: 'uppercase' }}>
                                  {workview.ClientName}
                                </h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Report No.</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.ReportAlias}/ {workview?.ReportTestDate?.split("T")[0].replace(/-/g, '')} - 01 {workview.ReportPqt == '' ? '' : (
                                  <> ({workview.ReportPqt})</>
                                )} </h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">P.O. NO.</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.PONo}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Date & Shift</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.DateShift}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Pipe Size</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.PipeSize}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Acceptance Criteria</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.AcceptanceCriteria}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Specification</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.specification}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Process Sheet No.</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.ProcSheetNo}</h4>
                              </div>
                            </div>
                            <div className='col-md-7 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Type Of Coating</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.TypeofCoating}</h4>
                              </div>
                            </div>
                            <div className='col-md-5 col-sm-6 col-xs-12'>
                              <div className='form-group'>
                                <label htmlFor="">Procedure / WI No.</label>
                                <span>: &nbsp;</span>
                                <h4>{workview.WINO || "TSL/COAT/QC/WI-18"}</h4>
                              </div>
                            </div>
                          </form>
                        </div>
                      </section>

                      <section className='DustlevelDetailsSection'>
                        <div className='container-fluid'>
                          <form className='row'>
                            <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                              <div className='table-responsive' id='custom-scroll'>
                                <table>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '1px' }}>Sr. No.</th>
                                      <th style={{ width: '10px' }}>Pipe No.</th>
                                      <th>Tape Application</th>
                                      <th style={{ width: '10px' }}>Dust Level</th>
                                    </tr>
                                  </thead>
                                  {Array(6).fill(null).map((data) => {
                                    return (
                                      <tbody>
                                        <tr>
                                          <td></td>
                                          <td></td>
                                          <td style={{ width: '160mm', height: '30mm' }}></td>
                                          <td></td>
                                        </tr>
                                      </tbody>
                                    )
                                  })}
                                </table>
                              </div>
                            </div>
                          </form>
                        </div>
                      </section>

                      <section class="ResultPageSection">
                        <div class="container-fluid">
                          <div class="row">
                            <div class="col-md-12 col-sm-12 col-xs-12 p-0">
                              <table>
                                <tbody>
                                  <tr>
                                    <td style={{ borderTop: 'none', padding: '2px 12px' }}>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{workview.specification} & {workview.AcceptanceCriteria} AND FOUND SATISFACTORY.</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="FooterdataSection">
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <table>
                                <tr>
                                  <th style={{ borderTop: 'none', width: '20%' }}>INSPECTED BY</th>
                                  <th style={{ borderTop: 'none', width: '100%' }}>ACCEPTED BY</th>
                                </tr>
                                <tr>
                                  <td style={{ borderBottom: 'none', padding: "50px" }}>
                                    <div className="FooterDataSignatureSection">
                                    </div>
                                  </td>
                                  <td style={{ borderBottom: 'none' }}>
                                    <div className="AccceptedBYFlexBox">
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <th style={{ borderBottom: 'none', borderRight: 'none', borderTop: 'none', width: '20%' }}>QC ENGINEER</th>
                                  <th style={{ borderBottom: 'none', width: '100%', borderTop: 'none' }}>TPIA / CLIENT</th>
                                </tr>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div>
                          {images?.map((data) => {
                            return (
                              <img src={`${Environment.ImageURL}/${data.pm_file_name}`} style={{ width: '100%' }} />
                            )
                          })}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
      }
    </>
  );
}

export default Dustlevelview;