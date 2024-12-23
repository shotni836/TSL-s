import React from 'react'

function Reportmasterdata({data}) {
  return (
    <div id="content-to-pdf">
      <section className='Reportmasterdatasection'>
        <div className='container-fluid'>
          <form className='row'>
          <div className='col-md-7 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Client</label>
                <h4>: &nbsp;&nbsp; {data.clientName || "-"}</h4>
              </div>
            </div>
            <div className='col-md-5 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Report No.</label>
                <h4>: &nbsp;&nbsp;{data.reportNo || "-"}</h4>
              </div>
            </div>
            <div className='col-md-7 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">P.O No.</label>
                <h4>: &nbsp;&nbsp;{data.poNo || "-"}</h4>
              </div>
            </div>
            <div className='col-md-5 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Date & Shift</label>
                <h4>: &nbsp;&nbsp;{data.dateShift || "-"}</h4>
              </div>
            </div>
            <div className='col-md-7 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Pipe Size</label>
                <h4>: &nbsp;&nbsp;{data.pipeSize || "-"}</h4>
              </div>
            </div>
            <div className='col-md-5 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Acceptance Criteria</label>
                <h4>: &nbsp;&nbsp;{data.acceptanceCriteria || "-"}</h4>
              </div>
            </div>
            <div className='col-md-7 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Type Of Coating</label>
                <h4>: &nbsp;&nbsp;{data.typeofCoating || "-"}</h4>
              </div>
            </div>
            <div className='col-md-5 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Process Sheet No.</label>
                <h4>: &nbsp;&nbsp;{data.procSheetNo || "-"}</h4>
              </div>
            </div>
            <div className='col-md-7 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Procedure / WI No.</label>
                <h4>: &nbsp;&nbsp;{data.procedureWINo || "-"}</h4>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Reportmasterdata;