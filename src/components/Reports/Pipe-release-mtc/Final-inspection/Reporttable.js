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
                      <th rowSpan={2}>Sr. No.</th>
                      <th rowSpan={2}>Coating No. / Field No.</th>
                      <th rowSpan={2}>Pipe No.</th>
                      <th rowSpan={2}>Heat No.</th>
                      <th rowSpan={2}>Length (mtr)</th>
                      <th rowSpan={2}>ASL No.</th>
                      <th colSpan={2}>Cut Back</th>
                      <th colSpan={2}>Epoxy Band</th>
                      <th colSpan={2}>Cut Back Angle</th>
                      <th rowSpan={2}>Holiday (kV)</th>
                      <th rowSpan={2}>Residual Magnetism</th>
                      <th rowSpan={2}>Visual</th>
                      <th rowSpan={2}>Date of Coating</th>
                      <th rowSpan={2}>Remarks</th>
                    </tr>
                    <tr>
                      <th>F End</th>
                      <th>T End</th>
                      <th>F End</th>
                      <th>T End</th>
                      <th>F End</th>
                      <th>T End</th>
                    </tr>
                    <tr>
                      <th colSpan={5} rowSpan={2}>Specified Requirement</th>
                      <th>Min.</th>
                      <th colSpan={2}>150 MM</th>
                      <th colSpan={2}>15 MM</th>
                      <th colSpan={2}>30</th>
                      <th rowSpan={2}>25</th>
                      <th rowSpan={2}>Max. 30 Gauss</th>
                      <th rowSpan={2}>-</th>
                      <th rowSpan={2}>-</th>
                      <th rowSpan={2}>-</th>
                    </tr>
                    <tr>
                      <th>Max.</th>
                      <th colSpan={2}>175 MM</th>
                      <th colSpan={2}>25 MM</th>
                      <th colSpan={2}>-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reportTableList.map((item, index) => (
                      <tr key={index + 1}>
                        <td>{item.srNo}</td>
                        <td>{item.coatFieldNo || "-"}</td>
                        <td>{item.pipeNo || "-"}</td>
                        <td>{item.heatNo || "-"}</td>
                        <td>{item.length || "-"}</td>
                        <td>{item.aslNo || "-"}</td>
                        <td>{item.cbf || "-"}</td>
                        <td>{item.cbt || "-"}</td>
                        <td>{item.ebf || "-"}</td>
                        <td>{item.ebt || "-"}</td>
                        <td>{item.cbaf || "-"}</td>
                        <td>{item.cbat || "-"}</td>
                        <td>{item.holiday || "-"}</td>
                        <td>{item.resMagn || "-"}</td>
                        <td>{item.visual || "-"}</td>
                        <td>{item.coatDate || "-"}</td>
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