import React, { useRef, useState, useEffect } from 'react'
import Loading from '../../../Loading';
import '../../Allreports.css';
import "./Pqt.css"
import 'react-toastify/dist/ReactToastify.css';
import tatasteellogo from "../../../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../../../assets/images/tata-blue-logo.png";

function Pqt() {

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
                                <div className='InspReportSection PQTPageSection' style={{ pageBreakAfter: 'always' }}>
                                    <div className='container-fluid'>
                                        <div className='row'>
                                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                                <div className='CustomBarePipeWitnessFlex'>
                                                    <div className='InspReportBox' style={{ width: '100%' }}>
                                                        <section className="HeaderDataSection" style={{ paddingBottom: '20px' }}>
                                                            <div className="container-fluid">
                                                                <div className="row">
                                                                    <div className="col-md-12 col-sm-12 col-xs-12">
                                                                        <div className="HeaderDataFlexdisplay">
                                                                            <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
                                                                            <img className="tatalogoimg" src={tatalogo} alt="" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </section>

                                                        <div className='PipeCatingTable'>
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <td>PIPE COATING DIVISION <br /> PROCEDURE QUALIFICATION TEST REPORT</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ProcedureQualificationBox'>
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <td colSpan={2} style={{ borderLeft: '1px solid #999999' }}>
                                                                            <h2>PROCEDURE <br /> QUALIFICATION TEST REPORT <br /> For <br /> 3-Layer Polyethylene Coating (NORMAL)</h2>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>PIPE SIZE</th>
                                                                        <td>: 168.3 mm OD X 6.4 mm WT.</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>COATING DATE</th>
                                                                        <td>: 02.04.2022</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox'>
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <th style={{ textAlign: 'center' }}>
                                                                            <h3>CLIENT:- M/S INDIAN OIL CORPORATION LIMITED.</h3>
                                                                        </th>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox2'>
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <th>
                                                                            PROJECT NAME:- <span>CITY GAS DISTRIBUTION PROJECT</span>
                                                                        </th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            P.O.NO.- PLMCGDRD10/27588719 Date. 17.02.2022
                                                                        </th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            CLIENT SPEC. NO.- <span>Client spec - IOCL-MECH-COAT-3LPE-027 REV. 03 DATE: 19.09.2017</span>
                                                                        </th>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox3'>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th></th>
                                                                        <th>Prepared By</th>
                                                                        <th>Reviewed By</th>
                                                                        <th colSpan={2} rowSpan={2}>Approved By</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Org.</th>
                                                                        <th colSpan={2}>Tata Steel Ltd.</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <th style={{ padding: '60px 0' }}>Sign.</th>
                                                                        <td>Signature</td>
                                                                        <td>Signature</td>
                                                                        <td>Signature</td>
                                                                        <td>Signature</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            Name <br /> Designation
                                                                        </th>
                                                                        <td>MITUN PATEL <br />
                                                                            SR. ASSOCIATE, <br />
                                                                            QA/QC
                                                                        </td>
                                                                        <td>
                                                                            AMIT SONVENE <br />
                                                                            Sr. MANAGER, <br />
                                                                            QA/QC
                                                                        </td>
                                                                        <td>
                                                                            SK MISHRA <br />
                                                                            EDLISPE-TPI
                                                                        </td>
                                                                        <td>
                                                                            SHUBHAM SINGH <br />
                                                                            IOCL
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox4'>
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <th>This report contains PQT results for the following pipe size coated as per - </th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>QAP No.: <span>QAP Name</span></th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>PIPE SIZE: <span>Pipe Size</span></th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>PQT TEST carried out form: <span>02.04.2022 to 05.04.2022.</span></th>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox5'>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th colSpan={3} style={{ borderTop: 'none', borderBottom: 'none' }}>Accepted process parameter is below:-</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th colSpan={3} style={{ textAlign: 'center' }}>BLASTING PARAMETER</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th style={{ width: '10px' }}>SR NO.</th>
                                                                        <th>PARAMETER</th>
                                                                        <th>OBSERVED</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    <tr>
                                                                        <td>1</td>
                                                                        <td>Blasting Line Speed</td>
                                                                        <td>5.5 Mtr./Min.</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox6'>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th colSpan={4} style={{ borderTop: 'none', borderBottom: 'none', textAlign: 'center' }}>INDEX</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th style={{ width: '10px', textAlign: 'center' }}>Sr. No.</th>
                                                                        <th style={{ textAlign: 'center' }}>Clause No.</th>
                                                                        <th>Description</th>
                                                                        <th>Remarks</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    <tr>
                                                                        <th style={{ textAlign: 'center' }}>1</th>
                                                                        <th style={{ textAlign: 'center' }}>1.0</th>
                                                                        <th style={{ textAlign: 'left' }}>Qualification Of Procedure</th>
                                                                        <th style={{ textAlign: 'left' }}>-</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ textAlign: 'center' }}>2</td>
                                                                        <td style={{ textAlign: 'center' }}>1.1</td>
                                                                        <td>Raw material testing</td>
                                                                        <td>-</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox7'>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th colSpan={5} style={{ borderTop: 'none', borderBottom: 'none', textAlign: 'left' }}>1.1 Raw material testing:-</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Material</th>
                                                                        <th>Batch No.</th>
                                                                        <th>Test</th>
                                                                        <th>Requirement</th>
                                                                        <th>Result</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    <tr>
                                                                        <td rowSpan={6}>Epoxy Powder</td>
                                                                        <td rowSpan={6}>IN-2C218-1</td>
                                                                        <td>GEL TIME 205 C 3 C</td>
                                                                        <td>16-24 Sec.</td>
                                                                        <td>19.46 sec.</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>GEL TIME 205 C 3 C</td>
                                                                        <td>16-24 Sec.</td>
                                                                        <td>19.46 sec.</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>GEL TIME 205 C 3 C</td>
                                                                        <td>16-24 Sec.</td>
                                                                        <td>19.46 sec.</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>GEL TIME 205 C 3 C</td>
                                                                        <td>16-24 Sec.</td>
                                                                        <td>19.46 sec.</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>GEL TIME 205 C 3 C</td>
                                                                        <td>16-24 Sec.</td>
                                                                        <td>19.46 sec.</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>GEL TIME 205 C 3 C</td>
                                                                        <td>16-24 Sec.</td>
                                                                        <td>19.46 sec.</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className='ClientDetailsBox8'>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th colSpan={5} style={{ borderTop: 'none', borderBottom: 'none', textAlign: 'left' }}>1.2: Bare pipe inspection (25 Pipes):</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colSpan={5} style={{ textAlign: 'left' }}>Verification of pipe no., Heat no., Length, Wall Thickness was.........</td>
                                                                    </tr>
                                                                </thead>
                                                            </table>
                                                            <div className='ClientDetailsBox8Flex'>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th colSpan={2} style={{ padding: '16px 0' }}>Pipe Temp. before blasting</th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        <tr>
                                                                            <th>Requirement</th>
                                                                            <th>Result</th>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>55 C to 85 C</td>
                                                                            <td>68 C to 74 C</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th colSpan={2}>Visual Inspection of Abrasive</th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        <tr>
                                                                            <th>Required</th>
                                                                            <th>Result</th>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Size, shape shall comply with manufacturing certificate/procedure.</td>
                                                                            <td>Found Satisfactory</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        <div className='FooterPqtSection'>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>TATA STEEL LIMITED KHOPOLI</th>
                                                                        <td>Doc. No. TSL/PQT/COAT/IOCL</td>
                                                                        <td>Page 24 of 24</td>
                                                                    </tr>
                                                                </thead>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
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

export default Pqt