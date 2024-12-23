import React, { useRef, useState } from 'react';
import '../../Allreports.css';

import Headerdata from '../../Headerdata';
import HeaderDetails from '../HeaderDetails';
import Reporttable from './Reporttable';
import Reportremarks from '../Reportremarks';
import Instrumentused from '../../Instrument-used';
import Footerdata from '../../Footerdata';

import Headerdatajson from './JSON/Headerdata.json';
import ReportHeaderDetails from './JSON/ReportHeaderDetails.json';
import Reporttablejson from './JSON/Reporttable.json';
import Reportremarksjson from './JSON/Reportmarks.json';
import Instrumentjson from './JSON/Instrumentlist.json';
import Footerdatajson from './JSON/Footerdata.json';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function InspReport() {
  
  const contentRef = useRef();
  const [printMode, setPrintMode] = useState(false);

  const handleDownload = () => {
    setPrintMode(false);

    const content = contentRef.current;

    const options = {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    };

    // table borders for PDF generation
    const tableElements = content.querySelectorAll('table');
    tableElements.forEach(table => {
      table.style.border = '1px solid #999999';

      // borders from table cells
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.border = '1px solid #999999';
      });
    });

    html2canvas(content, options)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = canvas.height * imgWidth / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save('ihtHdpe_report.pdf');
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please try again later.');
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section>
      {!printMode && (
        <div style={{ textAlign: 'right', paddingRight: '14px', paddingTop: '10px' }}>
          <h4 className='DownloadPDFBtn' onClick={handleDownload}>
            <i className="fas fa-download"> </i> Download PDF
          </h4>
          <h4 className='PrintBtn' onClick={handlePrint}>
            <i className="fas fa-print"></i> Print
          </h4>
        </div>
      )}
      <div className='InspReportSection' ref={contentRef}>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12 col-sm-12 col-xs-12'>
              <div className='InspReportBox'>
                <Headerdata data={Headerdatajson.headerData} />
                <HeaderDetails data={ReportHeaderDetails.reportHeaderDetails} />
                <Reporttable data={Reporttablejson.reportTableData} />
                <Reportremarks data={Reportremarksjson.remarksData} />
                <Instrumentused data={Instrumentjson.instrumentUsedData} />
                <Footerdata data={Footerdatajson.footerData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InspReport;

// ----------------------------Through API----------------------------
// import React, { useState, useEffect } from 'react';
// import '../../Allreports.css';

// import Headerdata from '../../Headerdata';
// import HeaderDetails from './HeaderDetails';
// import Reporttable from './Reporttable';
// import Footerdata from '../../Footerdata';

// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// function Sampleonereport() {

// const contentRef = useRef();
// const [buttonVisible, setButtonVisible] = useState(true);
// const handleDownload = () => {
//   setButtonVisible(false);
//   const content = contentRef.current;
//   html2canvas(content, { scale: 2 })
//     .then((canvas) => {
//       const imgData = canvas.toDataURL('image/jpeg', 0.9);
//       const pdf = new jsPDF('landscape', 'mm', 'a4');
//       pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
//       pdf.save('epoxy_report.pdf');
//       setButtonVisible(true);
//     });
// };

//   const [headerData, setHeaderData] = useState({});
//   const [headerDetail, setHeaderDetail] = useState({});
//   const [reportTableData, setReportTableData] = useState({});
//   const [footerData, setFooterData] = useState({});

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const headerResponse = await fetch('API_HEADER');
//         const headerJson = await headerResponse.json();
//         setHeaderData(headerJson);

//         const headerDetailResponse = await fetch('API_REPORTMASTER');
//         const headerDetailJson = await headerDetailResponse.json();
//         setHeaderDetail(headerDetailJson);

//         const reportTableResponse = await fetch('API_REPORTTABLE');
//         const reportTableJson = await reportTableResponse.json();
//         setReportTableData(reportTableJson);

//         const footerResponse = await fetch('API_FOOTER');
//         const footerJson = await footerResponse.json();
//         setFooterData(footerJson);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <section className='SampleonereportSection'>
//      {buttonVisible && ( <i className="fas fa-download" onClick={handleDownload}> Download PDF </i> )}
//       <div className='container-fluid'>
//         <div className='row'>
//           <div className='col-md-12 col-sm-12 col-xs-12'>
//             <div className='sampleonereportBox'>
//               <Headerdata data={headerData} />
//               <HeaderDetail data={headerDetail} />
//               <Reporttable data={reportTableData} />
//               <Footerdata data={footerData} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default Sampleonereport;