import React, { useRef } from 'react';
import Mtc4 from './Mtc4';
import Footerdata from './MtcFooterdata';

const Mtc2 = ({ headerData, tableData, sign2, witness2 }) => {
    const contentRef = useRef();
    const chunkAndPadArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            const chunk = array.slice(i, i + chunkSize);
            while (chunk.length < chunkSize) {
                chunk.push({ someData: "-" });
            }
            chunks.push(chunk);
        }
        return chunks;
    };

    const chunkedData = chunkAndPadArray(tableData, 15);

    return (
        <div ref={contentRef}>
            {chunkedData.map((chunk, chunkIndex) => (
                <div key={chunkIndex} className='InspReportSection' ref={contentRef}>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-md-12 col-sm-12 col-xs-12'>
                                <div className='InspReportBox'>

                                    <Mtc4 headerData={headerData} />
                                    <section className='MTCSecondTableSection'>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px' }}>Sr. No.</th>
                                                    <th style={{ width: '65px' }}>Batch No.</th>
                                                    <th style={{ width: '110px' }}>Material</th>
                                                    <th style={{ width: '120px' }}>Raw Material Manufacturer</th>
                                                    <th style={{ width: '100px' }}>Raw Material Grade</th>
                                                    <th style={{ width: '80px' }}>Testing Date</th>
                                                    <th style={{ width: '130px' }}>Test Description</th>
                                                    <th style={{ width: '210px' }}>Acceptance Criteria</th>
                                                    <th style={{ width: '70px' }}>Result</th>
                                                    <th style={{ width: '70px' }}>Remark</th>
                                                </tr>
                                            </thead>
                                            {chunk?.map((row, index) => {
                                                const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');
                                                const srNo = chunkIndex * 15 + index + 1;
                                                return (
                                                    <tr key={index}>
                                                        {hasData ? <td> {srNo || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.pm_rm_batch || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.MaterialName || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.ManufacturerName || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.GradeName || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {new Date(row.pm_test_date).toLocaleDateString('en-GB') || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.Test_Description || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.pm_reqmnt_suffix || "-"}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.pm_test_result_remarks || "-"}{row.Unit == 'NA' ? '' : ' ' + row.Unit}</td> : <td>-</td>}
                                                        {hasData ? <td> {row.pm_test_result_suffix || "-"}</td> : <td>-</td>}
                                                    </tr>
                                                );
                                            })}
                                        </table>
                                    </section>
                                    <Footerdata data={sign2} witness={witness2} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Mtc2;