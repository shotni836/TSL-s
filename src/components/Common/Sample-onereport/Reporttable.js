import React from 'react'

function Reporttable() {
  return (
    <>
      <section className='ReporttableSection'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12 col-sm-12 col-xs-12'>
              <div id='custom-scroll'>
                <table>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Pipe No.</th>
                    <th>Coating Date</th>
                    <th>Reference Standard</th>
                    <th>Operating Temp. (C)</th>
                    <th>Test Duration</th>
                    <th>Acceptance Criteria</th>
                    <th>Result</th>
                    <th>Remarks</th>
                  </tr>

                  <tr>
                    <td>1</td>
                    <td rowSpan={2}>N20064348</td>
                    <td rowSpan={2}>18.04.2023 (PQT)</td>
                    <td rowSpan={2}>ISO 21809-1</td>
                    <td>23</td>
                    <td rowSpan={2}>28 Days</td>
                    <td>Max. radius of disbondment 7.0 mm</td>
                    <td>2.34 mm</td>
                    <td>OK</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>80</td>
                    <td>Max. radius of disbondment 15.0 mm</td>
                    <td>5.09 mm</td>
                    <td>OK</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Reporttable