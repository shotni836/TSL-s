import React, { useRef, useState, useEffect } from 'react';
import Loading from '../../../Loading';
import '../../Allreports.css';
import "./Mtc.css"
import 'react-toastify/dist/ReactToastify.css';
import tatasteellogo from "../../../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../../../assets/images/tata-blue-logo.png";

function Mtc() {

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 3000);
    }, []);

    return (
        <>
            {
                loading ?
                    <Loading />
                    :
                    <>
                        <div style={{ backgroundColor: '#fff' }}>
                            {/* <div className="DownloadPrintFlexSection">
                                <h4 onClick={handleDownloadPDF}>
                                    <i className="fas fa-download"> </i> Download PDF
                                </h4>
                                <h4 onClick={handlePrint}>
                                    <i className="fas fa-print"></i> Print
                                </h4>
                            </div> */}
                            <div>
                                <div className='InspReportSection' style={{ pageBreakAfter: 'always' }}>
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
                                                                    <h1> PIPE COATING DIVISION <br /> CERTIFICATE OF QUALITY <br /> WORKS:- Vill-Savroli Tal-Khalapur Khapoli Maharashtra - 410 203 <br /> MATERIAL TEST CERTIFICATE OF COATED PIPE (AS PER EN 10024 TYPE - 3.1/3.2)</h1>
                                                                </div>
                                                                <div className="col-md-12 col-sm-12 col-xs-12">
                                                                    <div style={{ textAlign: "right" }}>
                                                                        <p>TSL/COAT/QC/F-39 REV. 06 dated 13.11.2021</p>
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
                                                                        <label htmlFor="">CUSTOMER NAME</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4 style={{ textTransform: 'uppercase' }}>M/S INDIAN OIL CORPORATION LIMITED </h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">MTC NO.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>TSL/COAT/3LPE/IOCL/MTC/2022/01</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">PROJECT</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>CITY GAS DISTRIBUTION PROJECT</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">COATED PIPE RELEASE LIST NO.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4 style={{ textTransform: 'uppercase' }}>TSL/COAT/3LPE/IOCL/CPRL</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">SPECIFICATION (CLIENT)</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>IOCL-MECH-COAT-3LPE-027 REV.03 DATE: 19.09.2017 and PO SPECIFICATION</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">DATE</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>08.04.2022</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">QAP NO.</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>TSL/COAT/EXT./3LPE/IOCL/01 REV. 00 DATED: 29.01.2022</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">PIPE SIZE</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>168.3mm OD X 6.4mm WT</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-7 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">TYPE OF COATING</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>NORMAL TYPE 3LPE COATING </h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">SALES ORDER NO. (TSL).</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>9516069617/1</h4>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-5 col-sm-6 col-xs-12'>
                                                                    <div className='form-group'>
                                                                        <label htmlFor="">PO NO.:</label>
                                                                        <span>: &nbsp;</span>
                                                                        <h4>PLMCGDRD10/27588719 Date. 17.02.2022</h4>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </section>
                                                    <section className='MTCFirstTableSection'>
                                                        <table border="1" cellspacing="0" cellpadding="5">
                                                            <thead>
                                                                <tr>
                                                                    <th rowspan="2">PO Item No.</th>
                                                                    <th rowspan="2">Destination</th>
                                                                    <th rowspan="2">Order Quantity <br /> (Mtrs.)</th>
                                                                    <th colspan="2">Current Release Quantity</th>
                                                                    <th colspan="2">Cumulative Release Quantity</th>
                                                                </tr>
                                                                <tr>
                                                                    <th>PCS</th>
                                                                    <th>Length (Mtrs.)</th>
                                                                    <th>PCS</th>
                                                                    <th>Length (Mtrs.)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>00020</td>
                                                                    <td>CGD COIMBATORE</td>
                                                                    <td>10000</td>
                                                                    <td>828</td>
                                                                    <td>10000.53</td>
                                                                    <td>828</td>
                                                                    <td>10000.53</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>00040</td>
                                                                    <td>CGD CHHAPRA</td>
                                                                    <td>6300</td>
                                                                    <td>0</td>
                                                                    <td>0.00</td>
                                                                    <td>0</td>
                                                                    <td>0.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>00070</td>
                                                                    <td>CGD MADHEPURA</td>
                                                                    <td>20000</td>
                                                                    <td>0</td>
                                                                    <td>0.00</td>
                                                                    <td>0</td>
                                                                    <td>0.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className='Aboutdetailstext' colSpan={7}>We here by certify that the Material described herein as per Coated Pipe Release list no. TSL/COAT/3LPE/IOCL/CPRL/2022/01 dated 08.04.2022 has been tested in accordance with client specification & Approved QAP No. TSL/COAT/EXT./3LPE/IOCL/01 REV. 00 DATED : 29.01.2022 requirements & the results comply with the requirements.
                                                                        <b>Cathodic Disbodment test from Pipe No. M20026197 for Temp. 20+-C & 80+-C for 28 days of PQT under program </b>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className='LPECOATINGREGULARText' colSpan={7}>
                                                                        <b>3LPE COATING REGULAR PRODUCTION ACTIVITY: </b>
                                                                        <ul>
                                                                            <li>Storage of raw material has been verified and found satisfactory as per Raw Material manufacture recommendation .</li>
                                                                            <li>Raw Material test certificate has been reviewed and found satisfactory.</li>
                                                                            <li>Calibration of measuring and testing instrument has been checked during regular production and found satisfactory.</li>
                                                                        </ul>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </section>

                                                    <section className='MTCSecondTableSection'>
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ minWidth: '40px' }}>Sr. No.</th>
                                                                    <th style={{ minWidth: '40px' }}>MATERIAL</th>
                                                                    <th style={{ minWidth: '40px' }}>RAW MATERIAL MANUFACTURER</th>
                                                                    <th style={{ minWidth: '40px' }}>RAW MATERIAL GRADE</th>
                                                                    <th style={{ minWidth: '100px' }}>TESTING DATE</th>
                                                                    <th style={{ minWidth: '300px' }}>TEST DESCRIPTION</th>
                                                                    <th style={{ minWidth: '100px' }}>ACCEPTANCE CRITERIA</th>
                                                                    <th style={{ minWidth: '100px' }}>RESULT</th>
                                                                    <th style={{ minWidth: '100px' }}>REMARKS</th>
                                                                </tr>
                                                                <tr>
                                                                    <th style={{ textAlign: 'left' }} colSpan={9}>BATCH NO: IN-2C21B-1</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                <tr>
                                                                    <td>1</td>
                                                                    <td rowSpan={8}>FUSION BONDED EPOXY</td>
                                                                    <td rowSpan={8}>3M INDIA</td>
                                                                    <td rowSpan={8}>226N 8G GREEN</td>
                                                                    <td rowSpan={8}>01.04.2022</td>
                                                                    <td>GEL TIME</td>
                                                                    <td>16-24 SEC.</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>2</td>
                                                                    <td rowSpan={3}>THERMAL CHARACTERISTICS</td>
                                                                    <td>Tg1 55 to 67 c</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>3</td>
                                                                    <td>Tg2 102 to 114 c</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>4</td>
                                                                    <td>16-24 SEC.</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>5</td>
                                                                    <td>MOISTURE CONTENT</td>
                                                                    <td>16-24 SEC.</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>6</td>
                                                                    <td>CURE TIME</td>
                                                                    <td>16-24 SEC.</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>7</td>
                                                                    <td>Delta Tg</td>
                                                                    <td>16-24 SEC.</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>8</td>
                                                                    <td>DENSITY</td>
                                                                    <td>16-24 SEC.</td>
                                                                    <td>19.46 Sec.</td>
                                                                    <td>OK</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </section>

                                                    <section className='MTCThirdTableSection'>
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th rowSpan={3}>Sr. No.</th>
                                                                    <th rowSpan={3}>Pipe No/Batch no.</th>
                                                                    <th rowSpan={3}>Date of Coating</th>
                                                                    <th colSpan={6}>BOND STRENGTH TEST</th>
                                                                    <th>IMPACT TEST</th>
                                                                    <th>AIR ENTRAPMENT</th>
                                                                    <th>24 Hrs. ADHESION TEST</th>
                                                                    <th>POROSITY TEST (CROSS SECTION & INTERFACE POROSITY)</th>
                                                                    <th>PRODUCT STABILITY</th>
                                                                    <th colSpan={2}>INDENTATION TEST</th>
                                                                    <th colSpan={2}>DEGREE OF CURE</th>
                                                                    <th>48 .Hrs HOT WATER IMMERSION</th>
                                                                    <th>ELONGATION TEST</th>
                                                                    <th>CD TEST</th>
                                                                </tr>
                                                                <tr>
                                                                    <th colSpan={2}>F-End</th>
                                                                    <th colSpan={2}>Middle</th>
                                                                    <th colSpan={2}>T-End</th>
                                                                    <th rowSpan={2}>Req. value 30 Impact @7 J/mm and No Holiday shall be observed when tested at 25 KV.</th>
                                                                    <th rowSpan={2}>Req. value 10% Of AREA & THICKNESS</th>
                                                                    <th rowSpan={2}>Req. value Rating 1 To 2</th>
                                                                    <th rowSpan={2}>Req. value Max. allowable porosity as per ISO 21809-2 CL. NO A 12</th>
                                                                    <th rowSpan={2}>Req. value MFR max. 20% between raw material amd applied material</th>
                                                                    <th rowSpan={2}>Req. value 0.2 mm Max. @ 23+- 2 C</th>
                                                                    <th rowSpan={2}>Req. value Min 95%</th>
                                                                    <th>Delta Tg</th>
                                                                    <th>Curing</th>
                                                                    <th rowSpan={2}>Req. value Average 2 and maximum 3 mm</th>
                                                                    <th rowSpan={2}>Req. value - min. 400%</th>
                                                                    <th rowSpan={2}>Req. value Max. radius of Disbodment</th>
                                                                </tr>
                                                                <tr>
                                                                    <th>Req. value minimum 15 N/mm @23+- C</th>
                                                                    <th>Req. value minimum 15 N/mm @23+- C</th>
                                                                    <th>Req. value minimum 15 N/mm @23+- C</th>
                                                                    <th>Req. value minimum 15 N/mm @23+- C</th>
                                                                    <th>Req. value minimum 15 N/mm @23+- C</th>
                                                                    <th>Req. value minimum 15 N/mm @23+- C</th>
                                                                    <th>Req. value 5 C</th>
                                                                    <th>Req. value Min 95%</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </section>

                                                    <section className='MTCFourthTableSection'>
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>SR. NO.</th>
                                                                    <th>FIELD NO./COAT NO.</th>
                                                                    <th>HEAT NO.</th>
                                                                    <th>LENGTH (MTR)</th>
                                                                    <th>DATE OF COATING</th>
                                                                    <th>REMARKS</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan={3}></td>
                                                                    <th style={{ textAlign: 'left' }} colSpan={3}>10000.530 MTR</th>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </section>

                                                    <section className='MTCFifthTableSection'>
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th colspan={3}>Release Summary</th>
                                                                </tr>
                                                                <tr>
                                                                    <th>Description:</th>
                                                                    <th>NOS</th>
                                                                    <th>Length (MTRS)</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                <tr>
                                                                    <td>Order Qty :-</td>
                                                                    <td>3012</td>
                                                                    <td>36300</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Bare Pipe Received Quantity</td>
                                                                    <td>3046</td>
                                                                    <td>36796.710</td>
                                                                </tr>
                                                                <tr>
                                                                    <th>Current Release Qty.</th>
                                                                    <th>828</th>
                                                                    <th>10000.530</th>
                                                                </tr>
                                                                <tr>
                                                                    <td>Cumulative Release Qty.</td>
                                                                    <td>828</td>
                                                                    <td>10000.530</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Balance Qty.</td>
                                                                    <td>2184</td>
                                                                    <td>26299.470</td>
                                                                </tr>

                                                                <tr className='NotesTxt'>
                                                                    <td style={{ textAlign: 'left' }} colSpan={3}>Note: Above coated Pipe Release list is based on the Bare pipe Tally sheet No. TSL/TS/2022/API/000212 Dated.31.03.2022. TSL/TS/2022/API/0001 Dated.04.04.2022.</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </section>
                                                </div>
                                                <section className='MTCFooterSignSection'>
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ textAlign: 'left' }}>Draft</td>
                                                                <td>Draft</td>
                                                                <td style={{ textAlign: 'right' }}>Draft</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </section>
                                            </div>
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

export default Mtc