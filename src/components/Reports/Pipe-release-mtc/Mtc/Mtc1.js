import React from 'react';
import Mtc4 from './Mtc4';
import Footerdata from './MtcFooterdata';

const Mtc1 = ({ headerData, tableData, sign1, witness1 }) => {

    return (
        <div className='InspReportSection'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12'>
                        <div className='InspReportBox'>
                            <Mtc4 headerData={headerData} />

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
                                        {tableData?.map((item, index) => (
                                            <tr>
                                                <td>{item?.pono || '-'}</td>
                                                <td>{item?.destination || '-'}</td>
                                                <td>{item?.orderQuatity || '-'}</td>
                                                <td>{item?.CurrentPCS || '-'}</td>
                                                <td>{item?.CurrentPCSLength || '-'}</td>
                                                <td>{item?.TotalPCS || '-'}</td>
                                                <td>{item?.TotalPCSLength || '-'}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className='Aboutdetailstext' colSpan={7}>We here by certify that the Material described herein as per Coated Pipe Release list no.TSL/COAT/CPRL/2024-25/00617 dated 07.10.2024 has been tested in accordance with client specification & Approved QAP No. TSL/COAT/ 3LPE/GGL/01 REV.02 DATE.17.08.2024 requirements &
                                                the results comply with the requirements.</td>
                                        </tr>
                                        <tr>
                                            <td className='LPECOATINGREGULARText' colSpan={7}>
                                                <b>3LPE COATING REGULAR PRODUCTION ACTIVITY: </b>
                                                1. Storage of raw material has been verified as per manufacturer recommendation and found satisfactory.<br />
                                                2. Raw Material tested and used, EPOXY - (Make- 3M Ahmedabad, India) , Scotchkote 226 N 8G Green Fusion Bonded Epoxy, Batch No.IN24H03B1<br />
                                                3. Raw Material tested and used, ADHESIVE - (Make- Borouge/Borealis, Finland), BOREALIS ME0420, Batch No.225712<br />
                                                4. Raw Material tested and used, HDPE - (Make- Borouge UAE) : Borouge HE3450 Batch No.4123558<br />
                                                5. Verification of Bare pipe,Visual appearance, Preheating temperature Before Abrasive Blasting, Recording of Environment details has been checked and & found satisfactory.<br />
                                                6. Phosphoric acid treatment , Phosphoric acid concentration,Pipe temp. before acid wash, pH after acid Wash ,pH after water wash checked and & found satisfactory.<br />
                                                7. DM Water Testing, Elapsed time after blasting, Degree of dust, Degree of Cleanliness checked and & found satisfactory.<br />
                                                8. Surface Roughness Profile, Salt Contamination Test, Visual inspection before coating checked and & found satisfactory.<br />
                                                9. Concentration of Chromate solution, Preheating prior to Chromate treatment, Chromate application checked & & found satisfactory.<br />
                                                10. Recoding of batch no., Pipe heating before Fusion Bonded Epoxy ( FBE ) Application, Adhesive & HDPE film Temp., Dew point of Compressed air checked and & found satisfactory.<br />
                                                11. Epoxy & Adhesive layer thickness, Total coating thickness, Visual inspection of coated pipes has been checked and & found satisfactory.<br />
                                                12. Holiday test for FBE Coated pipe (5V/Micron), Dry Adhesion test , Degree of cure, 24 hrs. Hot Water Adhesion test, Flexibility test and Porosity test has been checked & found satisfactory.<br />
                                                13. Bond Strength Test (Peel test) , Impact test , Indentationtest, Elongation test, Degree of cure, Air entrapment test has been checked & found satisfactory.<br />
                                                14. 24 hrs. Cathodic Disbondment test , 48 hrs Hot Water immersion test & Flexibility test has been checked & found satisfactory.<br />
                                                15. Holiday test @25 KV, Visual inspection, Cut Back, Bevel Angle, Green color band applied one end at OD checked & found satisfactory.<br />
                                                16. Cyclic test after 3LPE Coating has been completed and No disbnodment observed in the coating & found satisfactory.<br />
                                                17. Each pipe 03 labels has been fixed.02 on the external & 01 in the internal surface at end of the pipe.<br />
                                                18. 3LPE stencil and Marking has been provided on each external coated pipe at one end.<br />
                                                19. Repair of middle peel test pipe has been checked and & found satisfactory.<br />
                                                20. Plastic end protector shall be provided at both ends at the time of dispatch.<br />
                                                21. Inhouse Lab - 28 Days Cathodic Disbondment Test from Pipe No.O20068516 for 28 days of PQT has been completed on 21.09.2024 & found satisfactory.<br />
                                                22. NABL Approved External Lab - 28 Days Cathodic Disbondment Test of PQT is under progress and it will be completed on 10.10.2024.<br />
                                                23. Summary of Test Results has been Attached as Annexure A.<br />
                                                <center>Following 3LPE stencil and Marking has been provided on each external coated pipe at another end by white Paint :</center>
                                                <center>TATA STEEL LIMITED CLIENT NAME # #. MATERIAL GRADE: #. PIPE SIZE #. MM OD- #. MM WT PIPE NO. - ## HEAT NO## LENGTH: XX.XX MTR. COATING NO. XXXX PO No#.</center>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </section>
                            <Footerdata data={sign1} witness={witness1} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Mtc1;