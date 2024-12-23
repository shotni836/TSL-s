import React, { useState, useEffect } from "react";
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg'
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import './Beforeprocesslabtesting.css';
import Loading from '../Loading';
import { Table } from "react-bootstrap";
import { format } from 'date-fns';
import { Link } from 'react-router-dom'
import QCofficerData from "../Raw-material/QCofficer.json";
import QCofficerReport from "../Raw-material/QCofficerReport.json";
import InstrumentData from "../Raw-material-test-report/InstrumentData.json";

function Beforeprocesslabtestingtpiapproved() {

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
                                            <li><h1> / &nbsp; Before Process Lab Testing (TPI) (Approve / Reject) </h1></li>
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
                                                    <h4 className="QCApprovedBox">
                                                        <span className="TestReportTxt">
                                                            PIPE COATING DIVISION <br />
                                                            <b>BEFORE PROCESS LAB TESTING</b>
                                                        </span>
                                                        <span className="FormatNo">FORMAT NO: TSL/COAT/QC/F-25 REV: 04 DATE: 13.11.2021</span>
                                                    </h4>
                                                </div>
                                                {Object.entries(QCofficerData)
                                                    .slice(0, 20)
                                                    .map(([label, value]) => (
                                                        <>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                <div className="form-group">
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
                                                    <div className='form-group'>
                                                        <label htmlFor="">Shift</label>
                                                        <input className='formattedDateTestDate' type="text" value="Day" />
                                                    </div>
                                                </div>
                                            </form>

                                            <div className="row m-0">
                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                    <Table>
                                                        <thead>
                                                            <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                <th>Sr. No.</th>
                                                                <th>Test</th>
                                                                <th>Test Method</th>
                                                                <th>Requirement</th>
                                                                <th>Test Result</th>
                                                                <th>Remarks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {QCofficerReport.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{item["Sr. No."]}</td>
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
                                                            {InstrumentData.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{item["Sr. No."]}</td>
                                                                    <td>{item["Instrument Name"]}</td>
                                                                    <td>{item["Instrument ID/Serial No."]}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>

                                                    <div className="InspectedAcceptedTableFlex">
                                                        <div className="InspectedBox">
                                                            <h2>INSPECTED BY</h2>
                                                            <div className="INSPECTEDBYTdTable">
                                                                <label>Name</label>
                                                                <label>Company Name <br /> Department</label>
                                                                <label>Date</label>
                                                            </div>
                                                            <h6>QC ENGINEER</h6>
                                                        </div>
                                                        <div className="AcceptedBox">
                                                            <h2>ACCEPTED BY</h2>
                                                            <div className="AccceptedBYFlexBox">
                                                                <div className="NDDBox">
                                                                    <label>Name</label>
                                                                    <label>Symbol</label>
                                                                    <label>Company Name</label>
                                                                    <label>Date</label>
                                                                </div>
                                                                <div className="NDDBox">
                                                                    <label>Name</label>
                                                                    <label>Symbol</label>
                                                                    <label>Company Name</label>
                                                                    <label>Date</label>
                                                                </div>
                                                                <div className="NDDBox">
                                                                    <label>Name</label>
                                                                    <label>Symbol</label>
                                                                    <label>Company Name</label>
                                                                    <label>Date</label>
                                                                </div>
                                                                <div className="NDDBox">
                                                                    <label>Name</label>
                                                                    <label>Symbol</label>
                                                                    <label>Company Name</label>
                                                                    <label>Date</label>
                                                                </div>
                                                            </div>
                                                            <h6>TPIA/CLIENT</h6>
                                                        </div>
                                                    </div>

                                                    <div className="radio-buttons">
                                                        <div>
                                                            <label className="custom-radio">
                                                                <input type="radio" className="Approveinput" name="radio" />
                                                                <span className="radio-btn">
                                                                    <i class="fas fa-check"></i>Approve
                                                                </span>
                                                            </label>
                                                            <label className="custom-radio">
                                                                <input type="radio" className="Rejectinput" name="radio" />
                                                                <span className="radio-btn">
                                                                    <i class="fas fa-times"></i>Return
                                                                </span>
                                                            </label>
                                                        </div>
                                                        <div className='form-group Remarksform-group' style={{ width: '18%' }}>
                                                            <label htmlFor="">Approved Type <b>*</b></label>
                                                            <select name="" id="">
                                                                <option value="">-- Select approved type --</option>
                                                                <option value="">(W) Witness</option>
                                                                <option value="">(RW) Random Witness</option>
                                                                <option value="">(R) Review</option>
                                                            </select>
                                                        </div>
                                                        <div className='form-group Remarksform-group'>
                                                            <label htmlFor="">Remarks <b>*</b></label>
                                                            <input type="text" />
                                                        </div>
                                                        <Link to='/beforeprocesslabtestingtpilist' className="SubmitBtn">Submit</Link>
                                                    </div>
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
}

export default Beforeprocesslabtestingtpiapproved