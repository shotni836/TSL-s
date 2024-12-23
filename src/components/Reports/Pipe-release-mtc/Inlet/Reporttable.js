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
                      <th>Pipe No.</th>
                      <th>Heat No.</th>
                      <th>Length (mtrs.)</th>
                      <th>*Visual Inspection</th>
                      <th>Remarks (ASL No)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reportTableList.map((item, index) => (
                      <tr key={index + 1}>
                        <td>{item.srNo}</td>
                        <td>{item.pipeNo || "-"}</td>
                        <td>{item.heatNo || "-"}</td>
                        <td>{item.length || "-"}</td>
                        <td>{item.visualInsp || "-"}</td>
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