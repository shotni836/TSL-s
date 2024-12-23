import React, { useEffect, useState } from "react";
import qcsignature from './qc.png';
import tatastamp from './Stamps.png';
import wsign from '../../assets/images/wsign.png'
import axios from "axios";
import Environment from "../../environment";

function Footerdata({ data, witness }) {

  function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString('en-GB') : "-";
  }
  console.log(witness, 14)
  console.log(data, 16)


  data.forEach(item2 => {
    const matchingEntry = witness?.find(item1 => item1.co_param_val_name === item2.companyName);
    if (matchingEntry) {
      item2.witnessSign = wsign;
    }
  });
  console.log(data)

  if (!data || !Array.isArray(data)) {
    return <p>No data available</p>; // Or handle differently based on your UI/UX needs
  }
  return (
    <section className="FooterdataSection">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="InspectedAcceptedTableFlex">
              <div className="InspectedBox">
                <h2>INSPECTED BY</h2>
                <div className="INSPECTEDBYTdTable">
                  <div className="INSPECTEDBYBox">
                    {data[0]?.employeeSign &&
                      <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data[0]?.employeeSign}`} alt="QC Signature" />}
                    <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" />


                    <div className="INSPECTEDBYBoxLabelBox">
                      <span>{data[0]?.employeeName}</span>
                      <span>{data[0]?.designation} {data[0]?.department}</span>
                      <span>{formatDate(data[0]?.date)}</span>
                      <span style={{ color: data[0]?.status == "Accepted" || data[0]?.status == "Approved" ? '#34B233' : data[0]?.status == "Pending" ? "#FFA100" : "#ED2939" }}>{data[0]?.status}</span>
                      {/* <span className="QCFooterText">( QC ENGINEER )</span> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="AcceptedBox">
                <h2>ACCEPTED BY</h2>
                <div className="AccceptedBYFlexBox">
                  {data?.length < 2 || !data ? <h3 style={{ padding: '2em 0', margin: '0' }}>Draft</h3> : ''}
                  {data?.slice(1)?.map((data, index) => (
                    <div className="NDDBox" key={index}>
                      {data?.witnessSign && <img className="TPISignatureimg" src={data.witnessSign} alt={`TPI-${index} Signature`} style={{ width: '40px' }} />}
                      {data?.employeeSign && <img className="TPISignatureimg" src={`${Environment.ImageURL}/${data?.employeeSign}`} alt={`TPI-${index} Signature`} />}
                      <div className="AcceptedBoxLabelBox">
                        <span>{data?.employeeName}</span>
                        <span>{data?.designation}</span>
                        <span>{data?.companyName}</span>
                        <span>{formatDate(data?.date)}</span>
                        <span style={{ color: data?.status == "Approved" ? '#34B233' : "#ED2939" }}>{data?.status}</span>
                      </div>
                    </div>
                  ))}
                  <h4>TPIA / CLIENT</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footerdata;