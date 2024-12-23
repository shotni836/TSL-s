import React from 'react'
import Headerdata from './Headerdata'
import Reportmasterdata from './Reportmasterdata'
import Reporttable from './Reporttable'
import Reportremarks from './Reportremarks'
import Instrumentused from './Instrumentused'
import Reportrawmaterialsection from './Reportrawmaterialsection'
import Footerdata from './Footerdata'
// import './oldAllreports.css';

function Sampleonereport() {
    return (
        <>
            <div style={{display: 'none'}}>
                <Headerdata />
                <Reportmasterdata />
                <Reporttable />
                <Reportremarks />
                <Instrumentused />
                <Reportrawmaterialsection />
                <Footerdata />
            </div>


            <section className='SampleonereportSection'>
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col-md-12 col-sm-12 col-xs-12'>
                            <div className='sampleonereportBox'>
                                <Headerdata />
                                <Reportmasterdata />
                                <Reporttable />
                                <Reportremarks />
                                <Instrumentused />
                                <Reportrawmaterialsection />
                                <Footerdata />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Sampleonereport