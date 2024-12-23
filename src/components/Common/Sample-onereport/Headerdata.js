import React from 'react'
import tatasteellogo from '../../../assets/images/tsl-white-logo.png'
import tatalogo from '../../../assets/images/tata-white-logo.png'
// import './oldAllreports.css';

function Headerdata() {
    return (
        <>
            <section className='HeaderDataSection'>
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col-md-4 col-sm-4 col-xs-12'>
                            <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
                        </div>

                        <div className='col-md-4 col-sm-4 col-xs-12'>
                            <h1>PIPE COATING DIVISION <br /> CATHODIC DISBONDMENT TEST REPORT</h1>
                        </div>

                        <div className='col-md-4 col-sm-4 col-xs-12'>
                            <div style={{ textAlign: 'right' }}>
                                <img className="tatalogoimg" src={tatalogo} alt="" />
                                <p>FORMAT NO: TSL/COAT/QC/F-17/ REV:06 DATE: 13.11.2021</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Headerdata