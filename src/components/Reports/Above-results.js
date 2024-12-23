import React from "react";


function AboveresultsSection({ reportData }) {
    return (
        <section className='ResultPageSection'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>ELAPSE TIME OBSERVED MAXIMUM 1Hr. BETWEEN BLASTING & COATING APPLICATION.</td>
                                </tr>
                                <tr>
                                    <td>ABOVE RESULTS ARE CONFORMING TO SPECIFICATION :- <span style={{ fontFamily: 'Myriad Pro Light' }}>{reportData.current?.specification} & {reportData.current?.acceptanceCriteria} AND FOUND SATISFACTORY.</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboveresultsSection;