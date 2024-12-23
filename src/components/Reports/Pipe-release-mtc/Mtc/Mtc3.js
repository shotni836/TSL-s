import React, { useRef } from 'react';
import Mtc4 from './Mtc4';
import Footerdata from './MtcFooterdata';
import { useNavigate } from 'react-router-dom';
import { encryptData } from '../../../Encrypt-decrypt';

const Mtc3 = ({ headerData, tableData, sign3, witness3, pm_Approve_level1, mtcId, onTestPendingChange }) => {

    const contentRef = useRef();
    const navigate = useNavigate()

    const groupDataByPipeCode = (data) => {
        return data.reduce((acc, curr) => {
            // Check if the pipe already exists in the accumulator
            if (!acc[curr.PipeCode]) {
                acc[curr.PipeCode] = {
                    PipeCode: curr.PipeCode,
                    PipeId: curr.pm_pipe_id,
                    pm_thikness_date: curr.pm_thikness_date,
                    testResults: {}  // Initialize testResults object
                };
            }

            // Assign test result remarks to the corresponding TestName
            acc[curr.PipeCode].testResults[curr.TestName] = {
                remarks: curr.pm_test_result_remarks,
                isFinalApproval: curr.pm_isfinalapproval,
                suffix: curr.pm_reqmnt_suffix,
                fend: curr.pm_f_end,
                middle: curr.pm_middle,
                tend: curr.pm_t_end,
                indNormal: curr.pm_result_normal,
                indHot: curr.pm_result_hot,
                TestName: curr.TestName
            };

            return acc;
        }, {});  // Initialize accumulator as an empty object
    };

    const formattedData = Object.values(groupDataByPipeCode(tableData));

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

    const chunkedData = chunkAndPadArray(formattedData, 5);

    // Check for pending tests whenever chunkedData is processed
    const hasPendingTests = chunkedData.some(chunk => {
        return chunk.some(row => {
            const results = row.testResults || {};
            return Object.keys(results).some(key => {
                const result = results[key];
                return result && typeof result === 'object' && result.isFinalApproval === 0;
            });
        });
    });

    onTestPendingChange(hasPendingTests);

    const getSuffix = (data, testName, specific = "") => {
        const normalizedTestName = testName.toLowerCase();

        const result = data.find(item =>
            item.TestName.toLowerCase().includes(normalizedTestName) &&
            (specific ? item.specificField === specific : true)
        );

        if (normalizedTestName.includes("degree of cure") && result?.pm_reqmnt_suffix) {
            return result.pm_reqmnt_suffix.split("&");
        }

        return result ? result.pm_reqmnt_suffix : "-";
    };

    function seeTest(data, pipeCode) {
        // if (data == "impact") {
        //     navigate(`/impact-test-report/${headerData.projectId}&${pipeCode}`)
        // }
        // if (data == "bond strength") {
        //     navigate(`/peel-test-report/${headerData.projectId}&${pipeCode}`)
        // }
    }

    function showList(data, id, type) {
        if (pm_Approve_level1 == "view") {
            navigate(`/rawmateriallist?moduleId=${encryptData(618)}&menuId=${encryptData(24)}&testingtype=${encryptData(type)}&testId=${encryptData(id)}&mtcId=${encryptData(mtcId)}&procSheetId=${encryptData(headerData.psno)}`)
        }
    }

    function seePipeDetails(pipeId) {
        if (pm_Approve_level1 == "view") {
            navigate(`/rawmateriallist?moduleId=${encryptData(618)}&menuId=${encryptData(24)}&testingtype=${encryptData(0)}&testId=${encryptData(0)}&mtcId=${encryptData(0)}&procSheetId=${encryptData(headerData.psno)}&pipeId=${encryptData(pipeId.PipeId)}`)
        }
    }

    function formatNumber(number) {
        const parsedNumber = parseFloat(number);

        // Check if the parsed number is a valid decimal number
        if (!isNaN(parsedNumber) && parsedNumber % 1 !== 0) {
            // If it's a decimal, format to 2 decimal places
            return parsedNumber.toFixed(2);
        } else {
            // return the original (number or string)
            return number;
        }
    }

    const renderBondStrengthCell = (result, key, part, pipeCode) => {
        const isApprovalZero = result && typeof result === 'object' && result.isFinalApproval === 0;
        const value = result && result[part] && parseFloat(result[part]) !== 0 ? parseFloat(result[part]).toFixed(2) : "-";
        const cellColor = value !== "-" && isApprovalZero ? 'red' : 'black'; // Apply red only if there's a non-zero value

        return (
            <td key={`${key}-${part}`} style={{ color: cellColor }} onClick={() => seeTest(key, pipeCode)}>
                {value}
            </td>
        );
    };

    // Extract unique coating dates
    const getUniqueCoatingDates = () => {
        const dates = tableData.map(row => row.pm_thikness_date);
        const uniqueDates = [...new Set(dates)];
        return uniqueDates.join(', ');
    };

    const uniqueCoatingDates = getUniqueCoatingDates();

    console.log("Coating Dates", new Date(uniqueCoatingDates).toLocaleDateString('en-GB'));

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
                                                    <th rowSpan={2} style={{ width: '55px' }}>Sr. No.</th>
                                                    <th rowSpan={2} style={{ width: '75px' }}>Pipe No. / Batch no.</th>
                                                    <th rowSpan={2} style={{ width: '65px' }}>Date of Coating</th>
                                                    <th onClick={() => showList("Bond Strength", 291, 609)} colSpan={6}>Bond Strength Test</th>
                                                    <th onClick={() => showList("Impact Test", 292, 609)} rowSpan={2}>Impact Test</th>
                                                    <th onClick={() => showList("Air Entrapment", 294, 609)} rowSpan={2}>Air Entrapment</th>
                                                    <th onClick={() => showList("24 Hrs Adhesion Test", 285, 608)} rowSpan={2}>24 Hrs Adhesion Test</th>
                                                    <th onClick={() => showList("Porosity Test", 287, 608)} rowSpan={2}>Porosity Test</th>
                                                    <th onClick={() => showList("Product Stability", 305, 608)} rowSpan={2}>Product Stability</th>
                                                    <th onClick={() => showList("Indentation Test")} colSpan={2}>Indentation Test</th>
                                                    <th onClick={() => showList("Degree of Cure", 283, 608)} colSpan={2}>Degree of Cure</th>
                                                    <th onClick={() => showList("48 Hrs Hot Water Immersion")} rowSpan={2}>48 Hrs Hot Water Immersion</th>
                                                    <th onClick={() => showList("Tensile Test", 306, 608)} rowSpan={2}>Tensile Strength Test</th>
                                                    <th onClick={() => showList("Hardness Test", 307, 608)} rowSpan={2}>Hardness Test</th>
                                                    <th onClick={() => showList("Elongation Test", 303, 608)} rowSpan={2}>Elongation Test</th>
                                                    <th onClick={() => showList("CD Test", 297, 608)} rowSpan={2}>CD Test</th>
                                                </tr>
                                                <tr>
                                                    <th colSpan={2}>F-End</th>
                                                    <th colSpan={2}>Middle</th>
                                                    <th colSpan={2}>T-End</th>
                                                    <th>Cold</th>
                                                    <th>Hot</th>
                                                    <th>Delta Tg</th>
                                                    <th>Curing</th>
                                                </tr>
                                                <tr>
                                                    <th rowSpan={2} colSpan={3}>Specific Requirement</th>
                                                    <th>{getSuffix(tableData, "Bond Strength Test - Normal")}</th>
                                                    <th>{getSuffix(tableData, "Bond Strength Test - HOT")}</th>
                                                    <th>{getSuffix(tableData, "Bond Strength Test - Normal")}</th>
                                                    <th>{getSuffix(tableData, "Bond Strength Test - HOT")}</th>
                                                    <th>{getSuffix(tableData, "Bond Strength Test - Normal")}</th>
                                                    <th>{getSuffix(tableData, "Bond Strength Test - HOT")}</th>
                                                    <th>{getSuffix(tableData, "impact")}</th>
                                                    <th>{getSuffix(tableData, "air entrapment")}</th>
                                                    <th>{getSuffix(tableData, "24 hrs adhesion")}</th>
                                                    <th>{getSuffix(tableData, "porosity")}</th>
                                                    <th>{getSuffix(tableData, "stability")}</th>
                                                    <th>{getSuffix(tableData, "Indentation Test (2 samples at each temperature shall be taken from cut back portion &  one in the middle of the pipe for this test) - Normal")}</th>
                                                    <th>{getSuffix(tableData, "Indentation Test (2 samples at each temperature shall be taken from cut back portion &  one in the middle of the pipe for this test) - HOT")}</th>
                                                    <th>{getSuffix(tableData, "Degree Of Cure")[0] || "-"}</th>
                                                    <th>{getSuffix(tableData, "Degree Of Cure")[1] || "-"}</th>
                                                    <th>{getSuffix(tableData, "48 hrs hot")}</th>
                                                    <th>{getSuffix(tableData, "tensile")}</th>
                                                    <th>{getSuffix(tableData, "hardness")}</th>
                                                    <th>{getSuffix(tableData, "elongation")}</th>
                                                    <th>{getSuffix(tableData, "cd")}</th>
                                                </tr>
                                            </thead>
                                            {chunk?.map((row, index) => {
                                                const hasData = Object.values(row).some(value => value !== undefined && value !== null && value !== '-');
                                                const results = row.testResults || {};  // Default to an empty object if results is undefined
                                                const srNo = chunkIndex * 5 + index + 1;
                                                const findTestResult = (approxKey) => {
                                                    return Object.keys(results).find(key => key.toLowerCase().includes(approxKey.toLowerCase())) || "";
                                                };

                                                const testKeys = [
                                                    "impact",
                                                    "air entrapment",
                                                    "24 hrs adhesion",
                                                    "porosity",
                                                    "stability",
                                                    "Indentation Test (2 samples at each temperature shall be taken from cut back portion &  one in the middle of the pipe for this test) - Normal",
                                                    "Indentation Test (2 samples at each temperature shall be taken from cut back portion &  one in the middle of the pipe for this test) - HOT",
                                                    "cure",
                                                    "48 hrs hot",
                                                    "tensile",
                                                    "hardness",
                                                    "elongation",
                                                    "cd"
                                                ];

                                                return (
                                                    <tr key={index}>
                                                        <td>{hasData ? srNo : "-"}</td>
                                                        <td onClick={() => seePipeDetails(row)}>{hasData ? row.PipeCode || "-" : "-"}</td>
                                                        <td>{hasData ? new Date(row.pm_thikness_date).toLocaleDateString('en-GB') || "-" : "-"}</td>
                                                        {/* F-End Columns */}
                                                        {renderBondStrengthCell(results["Bond Strength Test - Normal"], "Bond Strength Test - Normal", 'fend', row.PipeCode)}
                                                        {renderBondStrengthCell(results["Bond Strength Test - HOT"], "Bond Strength Test - HOT", 'fend', row.PipeCode)}

                                                        {/* Middle Columns */}
                                                        {renderBondStrengthCell(results["Bond Strength Test - Normal"], "Bond Strength Test - Normal", 'middle', row.PipeCode)}
                                                        {renderBondStrengthCell(results["Bond Strength Test - HOT"], "Bond Strength Test - HOT", 'middle', row.PipeCode)}

                                                        {/* T-End Columns */}
                                                        {renderBondStrengthCell(results["Bond Strength Test - Normal"], "Bond Strength Test - Normal", 'tend', row.PipeCode)}
                                                        {renderBondStrengthCell(results["Bond Strength Test - HOT"], "Bond Strength Test - HOT", 'tend', row.PipeCode)}

                                                        {testKeys.map((key, idx) => {
                                                            const result = results[findTestResult(key)];
                                                            let isApprovalZero = false;

                                                            // Check if the result exists and if isFinalApproval is 0
                                                            if (result && typeof result === 'object') {
                                                                isApprovalZero = result.isFinalApproval === 0;
                                                            }

                                                            let content;

                                                            if (key === "cure" && typeof result === 'object') {
                                                                const remarks = result.remarks || "-";
                                                                const parts = remarks.split('~');
                                                                content = (
                                                                    <>
                                                                        <td key={`${key}-${idx}`} style={{ color: isApprovalZero ? 'red' : 'inherit' }} onClick={() => seeTest(key, row.PipeCode)}>
                                                                            {parts[0] || "-"}
                                                                        </td>
                                                                        <td key={`${key}-${idx}-extra`} style={{ color: isApprovalZero ? 'red' : 'inherit' }} onClick={() => seeTest(key, row.PipeCode)}>
                                                                            {parts[1] || "-"}
                                                                        </td>
                                                                    </>
                                                                );
                                                            } else if (key === "Indentation Test (2 samples at each temperature shall be taken from cut back portion &  one in the middle of the pipe for this test) - Normal") {
                                                                content = (
                                                                    <td key={`${key}-${idx}`} style={{ color: isApprovalZero ? 'red' : 'inherit' }} onClick={() => seeTest(key, row.PipeCode)}>
                                                                        {result && result.indNormal ? parseFloat(result.indNormal).toFixed(2) : "-"}
                                                                    </td>
                                                                );
                                                            } else if (key === "Indentation Test (2 samples at each temperature shall be taken from cut back portion &  one in the middle of the pipe for this test) - HOT") {
                                                                content = (
                                                                    <td key={`${key}-${idx}`} style={{ color: isApprovalZero ? 'red' : 'inherit' }} onClick={() => seeTest(key, row.PipeCode)}>
                                                                        {result && result.indHot ? parseFloat(result.indHot).toFixed(2) : "-"}
                                                                    </td>
                                                                );
                                                            } else {
                                                                content = (
                                                                    <td key={key} style={{ color: isApprovalZero ? 'red' : 'inherit' }} onClick={() => seeTest(key, row.PipeCode)}>
                                                                        {result && typeof result === 'object' ? formatNumber(result.remarks) : result || "-"}
                                                                    </td>
                                                                );
                                                            }

                                                            // Fill in "-" for the Cure fields if there is no result
                                                            if (key === "cure" && !result) {
                                                                return (
                                                                    <>
                                                                        <td key={`${key}-${idx}`} style={{ color: 'inherit' }}>{"-"}</td>
                                                                        <td key={`${key}-${idx}-extra`} style={{ color: 'inherit' }}>{"-"}</td>
                                                                    </>
                                                                );
                                                            }

                                                            return content;
                                                        })}
                                                    </tr>
                                                );
                                            })}

                                        </table>
                                    </section>

                                    {chunkIndex === chunkedData.length - 1 && (
                                        <section className='ResultPageSection'>
                                            <div className='container-fluid'>
                                                <div className='row'>
                                                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                                        <table>
                                                            <tbody>
                                                                <tr>
                                                                    {/* <td style={{ borderBottom: "none", padding: '2px 12px', border: 'none' }}>Remarks :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{headerData.pm_test_remark.replace(/@\$\@/g, '<br />')}</span></td> */}
                                                                    <td style={{ borderBottom: "none", padding: '2px 12px', border: 'none' }}>
                                                                        Remarks :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{`Above mentioned tests have been covered for External 3 layer polyethylene coating Regular production date ${new Date(uniqueCoatingDates).toLocaleDateString('en-GB')} and found satisfactory.`}<br />
                                                                            We certify that the pipes have been coated externally 3layer polyethylene Coating as per requirement of the mentioned order and comply with client's requirements.</span>
                                                                        {/* <span style={{ fontFamily: 'Myriad Pro Light' }}
                                                                            dangerouslySetInnerHTML={{ __html: headerData.pm_test_remark.replace(/@\$\@/g, '<br />') }} /> */}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <Footerdata data={sign3} witness={witness3} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Mtc3;