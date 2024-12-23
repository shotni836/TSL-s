import React from "react";
import tatasteellogo from "../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../assets/images/tata-blue-logo.png";

function formatDate(dateString) {
  const date = new Date(dateString).toLocaleDateString('en-GB').replace(/-/g, '.')
  return dateString.replace(/-/g, '.') ? date : "-";
}

function HeaderDataSection({ reportData }) {
  return (
    <section className="HeaderDataSection">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="HeaderDataFlexdisplay">
              <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
              <img className="tatalogoimg" src={tatalogo} alt="" />
            </div>
          </div>
          <div className="col-md-12 col-sm-12 col-xs-12">
            <h1> PIPE COATING DIVISION <br /> {reportData.formatDesc} </h1>
          </div>
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div style={{ textAlign: "right" }}>
              <p>{`FORMAT NO.: ${reportData.formatno} REV: ${reportData.revision ? reportData?.revision?.toString().padStart(2, '0') : reportData.Revision ? reportData?.Revision?.toString().padStart(2, '0') : '-'} DATE: ${formatDate(reportData.formatdate ? reportData.formatdate : reportData.Formatdate ? reportData.Formatdate : '-')}`}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeaderDataSection;