import React from 'react'

function Reportrawmaterialsection() {
  return (
    <>
      <section className='Reportrawmaterialsection'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12 col-sm-12 col-xs-12'>
              <div>
                <table>
                  <tr>
                    <th colSpan={4} style={{textAlign: 'left', paddingLeft: '10px'}}>RAW MATERIAL USED :-</th>
                  </tr>
                  <tr>
                    <td style={{textAlign: 'left', paddingLeft: '10px', fontFamily: 'Myriad Pro Bold'}}>MATERIAL</td>
                    <td>EPOXY</td>
                    <td>ADHESIVE</td>
                    <td>POLYETHYLENE</td>
                  </tr>

                  <tr>
                    <td style={{textAlign: 'left', paddingLeft: '10px', fontFamily: 'Myriad Pro Bold'}}>MANUFACTURER</td>
                    <td>3M INDIA LTD.</td>
                    <td>BOREALIS</td>
                    <td>BOROUGE</td>
                  </tr>
                  <tr>
                    <td style={{textAlign: 'left', paddingLeft: '10px', fontFamily: 'Myriad Pro Bold'}}>GRADE</td>
                    <td>226N 8G GREEN</td>
                    <td>ME0420</td>
                    <td>HE 3450 H</td>
                  </tr>
                  <tr>
                    <td style={{textAlign: 'left', paddingLeft: '10px', fontFamily: 'Myriad Pro Bold'}}>BATCH NO.</td>
                    <td>IN-3D03A-1</td>
                    <td>225419</td>
                    <td>4122319</td>
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

export default Reportrawmaterialsection