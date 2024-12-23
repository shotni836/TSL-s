import React from 'react';
import Mtc4 from './Mtc4';
import Footerdata from './MtcFooterdata';

const Mtc5 = ({ headerData, tableData, sign1, witness1 }) => {

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
                                            <th colspan="2">Cummulative Release Qty (Mtrs.)</th>
                                            <td>{tableData[0]?.CurrentPCS}</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <th colspan="2">Balance Qty (Mtrs.)</th>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </thead>
                                </table>
                            </section>
                            <section className='MTCFirstTableSection'>
                                <table border="1" cellspacing="0" cellpadding="5">
                                    <thead>
                                        <tr>
                                            <th>Item No.</th>
                                            <th>Destination</th>
                                            <th>Order Qty (Mtrs.)</th>
                                            <th>Cumm Release Qty (Nos.)</th>
                                            <th>Cumm Release Qty (Mtrs.)</th>
                                            <th>Balance Release Qty (Mtrs.)</th>
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
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={2}>Total :- </td>
                                            <td>{tableData[0]?.orderQuatity || '-'}</td>
                                            <td>{tableData[0]?.CurrentPCS || '-'}</td>
                                            <td>{tableData[0]?.CurrentPCSLength || '-'}</td>
                                            <td>{tableData[0]?.TotalPCS || '-'}</td>
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

export default Mtc5;