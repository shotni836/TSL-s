import React from "react";
import "./BlastingHeader.css";
import tatasteellogo from "../../assets/images/tsl-white-logo.png";
import tatalogo from "../../assets/images/tata-white-logo.png";
import HeaderData from "./HeaderData.json";

const BlastingHeader = () => {
  return (
    <header className="Headerpages">
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="Headerpageheader">
              <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
              <img className="tatalogoimg" src={tatalogo} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="para">
        <p>PIPE COATING DIVISION</p>
        <p>PHOSPHATE APPLICATION AND BLASTING INSPECTION REPORT</p>
      </div>
      <p className="btext">
        {Object.entries(HeaderData)
          .slice(0, 1)
          .map(([label, value]) => (
            <tr key={label}>
              <td>
                <label>{label}</label>
              </td>
              <td>{value}</td>
            </tr>
          ))}
      </p>
    </header>
  );
};

export default BlastingHeader;