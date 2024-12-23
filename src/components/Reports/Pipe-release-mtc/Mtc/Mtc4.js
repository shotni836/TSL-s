import React from 'react';
import HeaderDataSection from "../../Headerdata";

const Mtc4 = ({ headerData }) => {

    return (
        <div>
            <HeaderDataSection reportData={headerData} />

            <section className='Reportmasterdatasection'>
                <div className='container-fluid'>
                    <form className='row'>
                        <div className='col-md-7 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Customer Name</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.ClientName || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-5 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">MTC No.</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.MTC_no || '-'}
                                </h4>
                            </div>
                        </div>
                        <div className='col-md-7 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Project</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.ProjectName || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-5 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Coated Pipe Release List</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.CPR_no || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-7 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Specification</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.specification || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-5 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Date</label>
                                <span>: &nbsp;</span>
                                <h4>{new Date(headerData?.Date).toLocaleDateString('en-GB') || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-7 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">QAP No.</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.ps_qap_no || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-5 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Pipe Size</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.PipeSize || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-7 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Type of Coating</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.TypeofCoating || '-'}</h4>
                            </div>
                        </div>

                        <div className='col-md-5 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">Sales Order No.</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.pm_salesord_no || '-'}</h4>
                            </div>
                        </div>
                        <div className='col-md-7 col-sm-6 col-xs-12'>
                            <div className='form-group'>
                                <label htmlFor="">P.O No.</label>
                                <span>: &nbsp;</span>
                                <h4>{headerData?.psno || '-'}</h4>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    )
}

export default Mtc4;