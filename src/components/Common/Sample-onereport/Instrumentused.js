import React from 'react'

function Instrumentused() {
  return (
    <>
      <section className='InstrumentusedSection'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12 col-sm-12 col-xs-12'>
              <div>
                <table>
                  <tr>
                    <th colSpan={3} style={{textAlign: 'center', fontSize: '14px'}}>Instrument to be Used</th>
                  </tr>
                  <tr>
                    <td style={{fontFamily: 'Myriad Pro Bold'}}>Sr. No.</td>
                    <td style={{fontFamily: 'Myriad Pro Bold'}}>Instrument Name</td>
                    <td style={{fontFamily: 'Myriad Pro Bold'}}>Instrument ID / Serial No.</td>
                  </tr>

                  <tr>
                    <td>01</td>
                    <td>Cathodic Disbondment Tester (Coed)</td>
                    <td>123410</td>
                  </tr>
                  <tr>
                    <td>02</td>
                    <td>HOT PLATE</td>
                    <td>151253</td>
                  </tr>
                  <tr>
                    <td>03</td>
                    <td>UTILITY KNIFE</td>
                    <td>------</td>
                  </tr>
                  <tr>
                    <td>04</td>
                    <td>DIGITAL VERNIER CALIPER</td>
                    <td>7482/1262</td>
                  </tr>
                  <tr>
                    <td>05</td>
                    <td>TEMPERATURE GAUGE</td>
                    <td>210957948</td>
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

export default Instrumentused