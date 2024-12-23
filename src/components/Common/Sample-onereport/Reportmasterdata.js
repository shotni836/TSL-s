import React from 'react'
// import html2pdf from 'html2pdf.js';

function Reportmasterdata() {

  // const handlePrint = () => {
  //   const content = document.getElementById('content-to-pdf');
  //   const options = {
  //     margin: 10,
  //     filename: 'generated-document.pdf',
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  //   };

  //   html2pdf().from(content).set(options).outputPdf(pdf => {
  //     const blob = new Blob([pdf], { type: 'application/pdf' });
  //     const link = document.createElement('a');
  //     link.href = window.URL.createObjectURL(blob);
  //     link.download = options.filename;
  //     link.click();
  //   });
  // };


  return (
    <div id="content-to-pdf">
      <section className='Reportmasterdatasection'>
        <div className='container-fluid'>
          <form className='row'>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Client</label>
                <h4>: &nbsp;&nbsp; M/S HINDUSTAN PETROLEUM CORPORATION  LIMITED</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Report No.</label>
                <h4>: &nbsp;&nbsp; CDT/20230517-01</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">P.O No.</label>
                <h4>: &nbsp;&nbsp; 22001053-OQ-10157</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Date & Shift</label>
                <h4>: &nbsp;&nbsp; 17.05.2023 & DAY</h4>
              </div>
            </div>

            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Pipe Size</label>
                <h4>: &nbsp;&nbsp; 168.3 mm OD X 6.40 mm WT.</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Process Sheet No.</label>
                <h4>: &nbsp;&nbsp; TSL/PSC/EXT./3LPE/HPCL/2023-01 Rev.00 DATE: 09.02.2023</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Type Of Coating</label>
                <h4>: &nbsp;&nbsp; 3LPE</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Procedure / WI No.</label>
                <h4>: &nbsp;&nbsp; TSL/COAT/QC/WI-35</h4>
              </div>
            </div>

            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Test Start Date</label>
                <h4>: &nbsp;&nbsp; 19.04.2023</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Test Start Time</label>
                <h4>: &nbsp;&nbsp; 3:00 PM</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Test Finish Date</label>
                <h4>: &nbsp;&nbsp; 17.05.2023</h4>
              </div>
            </div>
            <div className='col-md-6 col-sm-6 col-xs-12'>
              <div className='form-group'>
                <label htmlFor="">Test Finish Time</label>
                <h4>: &nbsp;&nbsp; 3:00 PM</h4>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* <button onClick={handlePrint}>Generate PDF</button> */}
    </div>
  )
}

export default Reportmasterdata