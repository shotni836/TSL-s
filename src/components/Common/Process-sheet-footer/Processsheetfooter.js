import React from "react";
import './Processsheetfooter.css';
import Environment from "../../../environment";
import tatastamp from '../../Reports/Stamps.png';

function Processsheetfooter({ data }) {
  console.log(data, "process footer")

  function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString('en-GB') : "";
  }

  return (
    <div className="FooterdataSection ProcessSheetFooterSection row">
      <div className="col-md-12 col-sm-12 col-xs-12">
        <table>
          <tbody>
            <tr>
              <th style={{ textAlign: 'center', borderTop: 'none' }} colSpan={2}>PREPARED BY</th>
              <th style={{ textAlign: 'center', borderTop: 'none' }} colSpan={3}>REVIEWED BY</th>
              <th style={{ textAlign: 'center', borderTop: 'none' }} colSpan={2}>APPROVED BY</th>
            </tr>
            <tr>
              <td style={{ borderBottom: 'none' }} colSpan={2}>
                <div className="FooterDataSignatureSection">
                  <div className="FooterDataSignBox">
                    {
                      // Check if there is any data available, otherwise show "Draft"
                      data[0]?.emp_sign_filename ? (
                        <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data[0]?.emp_sign_filename}`} alt="QC Signature" />
                      ) : (
                        <h3 style={{ margin: '0', fontSize: '20px' }}>Draft</h3>
                      )
                    }
                    {
                      data[0]?.emp_sign_filename &&
                      <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" />
                    }
                  </div>

                  <div className="INSPECTEDBYBoxLabelBox">
                    <span>{data[0]?.EmployeeName}</span>
                    <span>{data[0]?.designation} {data[0]?.Department}</span>
                    <span>{formatDate(data[0]?.ApproveDate)}</span>
                    <span style={{ color: data[0]?.Status == "Accepted" || data[0]?.Status == "Approved" ? '#34B233' : data[0]?.Status == "Pending" ? "#FFA100" : "#ED2939" }}>{data[0]?.Status}</span>
                    {/* <span className="QCFooterText">( QC ENGINEER )</span> */}
                  </div>
                </div>
              </td>
              <td style={{ borderBottom: 'none' }} colSpan={3}>
                <div className="FooterDataSignatureSection">
                  <div className="FooterDataSignBox">
                    {
                      data[1]?.emp_sign_filename &&
                      <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data[1]?.emp_sign_filename}`} alt="QC Signature" />
                    }
                    {data[1]?.emp_sign_filename ? <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" /> : <span style={{ fontSize: '20px' }}>Draft</span>}
                  </div>

                  <div className="INSPECTEDBYBoxLabelBox">
                    <span>{data[1]?.EmployeeName}</span>
                    <span>{data[1]?.designation} {data[1]?.Department}</span>
                    <span>{formatDate(data[1]?.ApproveDate)}</span>
                    <div className="hidethisforprint"><span style={{ color: data[1]?.Status == "Accepted" || data[1]?.Status == "Approved" ? '#34B233' : data[1]?.Status == "Pending" ? "#FFA100" : "#ED2939" }}>{data[1]?.Status}</span></div>
                    {/* <span className="QCFooterText">( QC ENGINEER )</span> */}
                  </div>
                </div>
              </td>
              <td style={{ borderBottom: 'none' }} colSpan={2}>
                <div className="FooterDataSignatureSection">
                  <div className="FooterDataSignBox">
                    {
                      data[2]?.emp_sign_filename &&
                      <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data[2]?.emp_sign_filename}`} alt="QC Signature" />
                    }
                    {data[2]?.emp_sign_filename ? <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" /> : <span style={{ fontSize: '20px' }}>Draft</span>}
                  </div>

                  <div className="INSPECTEDBYBoxLabelBox">
                    <span>{data[2]?.EmployeeName}</span>
                    <span>{data[2]?.designation} {data[2]?.Department}</span>
                    <span>{formatDate(data[2]?.ApproveDate)}</span>
                    <div className="hidethisforprint"><span style={{ color: data[2]?.Status == "Accepted" || data[2]?.Status == "Approved" ? '#34B233' : data[2]?.Status == "Pending" ? "#FFA100" : "#ED2939" }}>{data[2]?.Status}</span></div>
                    {/* <span className="QCFooterText">( QC ENGINEER )</span> */}
                  </div>
                </div>
              </td>
            </tr>
            <tr style={{ textAlign: 'center' }}>
              <td colSpan={2} style={{ borderTop: 'none' }}>
                {/* MITUN PATEL <br /> QA/QC COATING */}
              </td>
              <td colSpan={3} style={{ borderTop: 'none' }}>
                {/* K.M. MAHARAJA <br /> QA/QC COATING */}
              </td>
              <td colSpan={2} style={{ borderTop: 'none' }}>
                {/* AMIT SONVENE <br /> HOD QUALITY COATING */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Processsheetfooter;