import React from 'react';

function ReportRemarks({ reportData, report, testName }) {
    if (!reportData) {
        return (
            <section className="ReportremarksSection">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12 p-0">
                            <table style={{ border: 'none' }}>
                                <tbody>
                                    <tr>
                                        <td>REMARKS : </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const remarksArray = reportData?.split('@#@');

    return (
        <section className="ReportremarksSection">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12 p-0">
                        <table>
                            <tbody>
                                <tr>
                                    <td>REMARKS : <span style={{ fontFamily: 'Myriad Pro Light', display: 'inline-flex', marginLeft: '10px' }}>
                                        {remarksArray.map((remark, index) => (
                                            <>
                                                {remark}
                                                <br />
                                            </>
                                        ))}
                                    </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ReportRemarks;