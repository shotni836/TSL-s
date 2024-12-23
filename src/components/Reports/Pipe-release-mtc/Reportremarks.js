import React from "react";

function Reportremarks({ data }) {
  return (
    <>
      <section className="ReportremarksSection">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12">
              <p> {data.conformingSpecification || "-"} {data.dated || "-"} & QAP NO.:-{data.qapNo || "-"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Reportremarks;