import React, { useState, useEffect } from "react";
import "./Beforeprocesslabtesting.css";
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg'
import Beforeprocesslabtestinginstrumentdata from "./Beforeprocesslabtestinginstrumentdata.json";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from '../Loading';
import { Table } from "react-bootstrap";
import { format } from 'date-fns';


import Beforeprocesslabtestingheaderdata from "./Beforeprocesslabtestingheaderdata.json";
import BeforeprocesslabtestingTable from "./BeforeprocesslabtestingTable";
import { Link } from "react-router-dom";

const Beforeprocesslabtestingview = () => {

  // ------------------------------------------------

  // Get the current date
  const currentDate = new Date();

  // Format the date in dd/mm/yyyy format
  const formattedDate = format(currentDate, 'dd/MM/yyyy');

  // -------------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])


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
                      <li> <Link to='/dashboard'>Quality Module</Link></li>
                      <li><h1>/ &nbsp; Before Process Lab Testing </h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
            <section className="RawMaterialReportSectionPage">
              <div className="container">
                <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <div className="RawMaterialReportTables">
                      <form action="" className="row m-0">
                        <div className='col-md-12 col-sm-12 col-xs-12'>
                          <h4>Before Process Lab Testing <span>- View page</span></h4>
                        </div>
                        {Object.entries(Beforeprocesslabtestingheaderdata)
                          .slice(0, 20)
                          .map(([label, value]) => (
                            <>
                              <div class="col-md-4 col-sm-4 col-xs-12">
                                <div class="form-group">
                                  <label for="">{label}</label>
                                  <input type="text" value={value} readonly />
                                </div>
                              </div>
                            </>
                          ))}

                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div className='form-group'>
                            <label htmlFor="">Test Date</label>
                            <input className='formattedDateTestDate' type="text" value={formattedDate} />
                          </div>
                        </div>

                        <div className='col-md-4 col-sm-4 col-xs-12'>
                          <div class="form-group">
                            <label for="">Shift</label>
                            <input type="text" value="Day" readonly />
                          </div>
                        </div>
                      </form>

                      <div className="row m-0">
                        <div className="col-md-12 col-sm-12 col-xs-12">
                          <Table>
                            <thead>
                              <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                <th>Sr. No.</th>
                                <th>Batch No.</th>
                                <th>Test</th>
                                <th>Test Method</th>
                                <th>Requirement</th>
                                <th>Test Result</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {BeforeprocesslabtestingTable.map((item, index) => (
                                <tr key={index}>
                                  <td>{item["Sr. No."]}</td>
                                  <td>{item["Batch No."]}</td>
                                  <td>{item["Test"]}</td>
                                  <td>{item["Test Method"]}</td>
                                  <td>{item["Requirement"]}</td>
                                  <td>{item["Test Result"]}</td>
                                  <td>{item["Remarks"]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>

                          <Table>
                            <thead>
                              <tr style={{ background: 'rgb(90, 36, 90)', textAlign: 'center' }}>
                                <th colSpan={3} style={{ fontSize: '16px' }}>
                                  Instrument to be Used
                                </th>
                              </tr>
                              <tr>
                                <td style={{ background: 'whitesmoke' }}>Sr. No.</td>
                                <td style={{ background: 'whitesmoke' }}>Instrument Name</td>
                                <td style={{ background: 'whitesmoke' }}>Instrument ID/Serial No.</td>
                              </tr>
                            </thead>
                            <tbody>
                              {Beforeprocesslabtestinginstrumentdata.map((item, index) => (
                                <tr key={index}>
                                  <td>{item["Sr. No."]}</td>
                                  <td>{item["Instrument Name"]}</td>
                                  <td>{item["Instrument ID/Serial No."]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>

                          {/* <table className="SignatureTable">
                            <thead>
                              <tr>
                                <th>INSPECTED BY</th>
                                <th>ACCCEPTED BY</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td></td>
                                <td></td>
                              </tr>
                              <tr>
                                <th>QC ENGINEER</th>
                                <th>QC ENGINEER</th>
                              </tr>
                            </tbody>
                          </table> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <Footer />
          </>
      }
    </>
  );
};

export default Beforeprocesslabtestingview;