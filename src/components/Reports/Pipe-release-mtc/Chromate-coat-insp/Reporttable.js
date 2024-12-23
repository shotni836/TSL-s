import React from 'react';

function Reporttable({ data }) {
  return (
    <>
      <section className='ReporttableSection'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12 col-sm-12 col-xs-12'>
              <div id='custom-scroll'>
                <table>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Instrument Name</th>
                      <th>Make</th>
                      <th>Standard Reading</th>
                      <th>Accuracy of Reading</th>
                      <th>Actual Reading of The Instrument</th>
                      <th>Error</th>
                      <th>Time</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reportTableList.map((item, index) => (
                      <tr key={index + 1}>
                        <td>{item.srNo}</td>
                        <td>{item.instName || "-"}</td>
                        <td>{item.make || "-"}</td>
                        <td>{item.strdRead || "-"}</td>
                        <td>{item.accRead || "-"}</td>
                        <td>{item.actReadInst || "-"}</td>
                        <td>{item.error || "-"}</td>
                        <td>{item.time || "-"}</td>
                        <td>{item.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Reporttable;