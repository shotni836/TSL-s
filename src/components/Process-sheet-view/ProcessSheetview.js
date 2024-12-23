import React, { useState, useEffect, useRef } from "react";
import "./ProcessSheetview.css";
import tatasteellogo from "../../assets/images/tsl-blue-logo.png";
import tatalogo from "../../assets/images/tata-blue-logo.png";
import Environment from "../../environment";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Processsheetfooter from '../Common/Process-sheet-footer/Processsheetfooter';
import secureLocalStorage from "react-secure-storage";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";
import Loading from "../Loading";
import Loader from "../Loader";

function ProcessSheetview() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const empId = secureLocalStorage.getItem("empId")
  const navigate = useNavigate()
  const printRef = useRef();

  const today = new Date();

  // Format the date to YYYY-MM-DD
  const formattedDate = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  const [formData, setFormData] = useState({
    pm_comp_id: "1",
    pm_location_id: "1",
    pm_project_id: "",
    pm_processsheet_id: "",
    pm_approver_type: "",
    pm_remarks: "",
    pm_testdate: formattedDate,
    pm_approver_status: "",
    pm_approved_by: empId.toString(),
  });

  const searchParams = new URLSearchParams(document.location.search);
  let projectid = searchParams.get("id");
  let proc_type = searchParams.get("Proc_type");
  let procSheetId = searchParams.get("procSheetId");
  const [ShowTestDate, setShowTestDate] = useState("");
  const [ShowApprovalSection, setShowApprovalSection] = useState("");
  const [FirstSectionViewData, setFirstSectionViewData] = useState([]);
  const [SecondSectionViewData, setSecondSectionViewData] = useState([]);
  const [poQty, setPoQty] = useState([]);
  const [totalPo, setTotalPo] = useState([]);
  const [ThirdSectionViewData, setThirdSectionViewData] = useState();
  const [InspectionAgency, setInspectionAgency] = useState("");
  const [showWitness, setShowWitness] = useState(false)
  const [headName, setHeadName] = useState([])
  const [testData, setTestData] = useState([])
  const [po, setPo] = useState([])
  const [approvalData, setApprovalData] = useState([])
  const [pqt, setPqt] = useState('')
  var names = []

  function convertDate(date) {
    const date1 = new Date(date);
    // Format the date as dd/mm/yyyy
    const formattedDate = date1.toLocaleDateString('en-GB');
    return formattedDate
  }

  useEffect(() => {
    fetchData();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let pm_processsheet_id = searchParams.get("pm_processsheet_id");
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/ViewProcessSheet?project_id=${projectid}&proc_type=${proc_type}`)
      let ViewType = searchParams.get("ViewType");
      if (ViewType === "onhandleApproveClick") {
        setShowTestDate("");
        setShowApprovalSection("Yes");
        setFormData({
          ...formData,
          pm_project_id: projectid,
          pm_processsheet_id: pm_processsheet_id,
          pm_approver_type: "1",
        });
      }
      if (ViewType === "onhandleSecondApproveClick") {
        setShowTestDate("Yes");
        setShowApprovalSection("Yes");
        setFormData({
          ...formData,
          pm_project_id: projectid,
          pm_processsheet_id: pm_processsheet_id,
          pm_approver_type: "2",
        });
      }
      if (ViewType === "View") {
        setShowTestDate("");
        setShowApprovalSection("");
      }
      setFirstSectionViewData(response.data[0][0]);
      setPo(response.data[0]);
      setPoQty(response.data[0]);
      let total = 0
      response.data[0]?.map((data) => {
        total = total + parseInt(data.pm_po_item_qty)
        setTotalPo(total)
      })
      setInspectionAgency(response.data[1][0]);
      setSecondSectionViewData(response.data[2]);

      setTestData(response.data[3])
      const groupedData = response.data[3].reduce((acc, item) => {
        const key = `${item.ParentName}|${item.MainHeadName}`;

        if (!acc[key]) {
          acc[key] = {
            ParentName: item.ParentName,
            MainHeadName: item.MainHeadName,
            Tests: []
          };
        }

        acc[key].Tests.push({
          TEST_DESCRIPTION_ID: item.TEST_DESCRIPTION_ID,
          TEST_DESCRIPTION: item.TEST_DESCRIPTION,
          PQT: item.PQT,
          REGULAR_PRODUCTION: item.REGULAR_PRODUCTION,
          ACCEPTATION_CRITERIA: item.ACCEPTATION_CRITERIA,
          TestLevel: item.TestLevel,
          IsLeafNode: item.IsLeafNode,
          ParentId: item.ParentId,
          SeqNum: item.SeqNum
        });

        return acc;
      }, {});

      const result = Object.values(groupedData);
      let testTable = generateTable(result);
      setPqt(response.data[0][0].pm_pqt_notes)
      setThirdSectionViewData(testTable);
      setHeadName(names);
      setLoading(false);
      const response1 = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcsheetApprovalStatus?processsheetno=${procSheetId ? procSheetId : pm_processsheet_id}&proctype=${proc_type}`)

      setApprovalData(response1.data[0])
    }
    catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const generateTable = (data, pqt) => {
    return (
      <React.Fragment>
        <table>
          <thead>
            <tr id="repeat-header" className="repeat-header">
              <th style={{ width: '60px', borderTop: 'none', textAlign: 'center' }}>SR. NO.</th>
              <th style={{ width: '260px', borderTop: 'none', textAlign: 'center' }}>TEST DESCRIPTION</th>
              <th colSpan="2" style={{ minWidth: '100px', borderTop: 'none', textAlign: 'center' }}>PQT</th>
              <th colSpan="1" style={{ minWidth: '160px', borderTop: 'none', textAlign: 'center' }}>REGULAR PRODUCTION</th>
              <th colSpan="2" style={{ minWidth: '260px', borderTop: 'none', textAlign: 'center' }}>ACCEPTATION CRITERIA</th>
            </tr>
          </thead>

          <tbody>
            {data.map((section, parentIndex) => {
              const isRawMaterial = parentIndex != "1" && parentIndex != "2"
              const parentNumber = parentIndex == 0 ? `${2}.0` : `${parentIndex}.0`;
              // parentIndex = isRawMaterial ? parentIndex - 1 : parentIndex
              return (
                <React.Fragment key={parentIndex}>
                  {isRawMaterial ? <tr>
                    <th style={{ fontSize: '14px' }}>{parentNumber}</th>
                    <th colSpan="6" style={{ textAlign: 'left', fontSize: '14px' }}>{section.MainHeadName}</th>
                  </tr> : ''}

                  {section.Tests.map((test, testIndex) => {
                    // parentIndex = isRawMaterial ? parentIndex - 1 : parentIndex
                    const mainHeaderNumber = isRawMaterial && parentIndex != 0 ? `${parentIndex}.${testIndex + 1}` : section.MainHeadName == "Raw Material Inspection & Testing" && parentIndex == "1" ? `${parentIndex + 1}.${testIndex + 2}` : section.MainHeadName == "Raw Material Inspection & Testing" && parentIndex == "2" ? `${parentIndex}.${testIndex + 3}` : section.MainHeadName == "Raw Material Inspection & Testing" && parentIndex == "0" ? `${parentIndex + 2}.${testIndex + 1}` : `${parentIndex + 1}.${testIndex + 1}`;
                    return (
                      <React.Fragment key={testIndex}>
                        {testIndex === 0 && (
                          <tr>
                            <th>{mainHeaderNumber}</th>
                            <th colSpan="6" style={{ textAlign: 'left' }}>{section.ParentName}</th>
                          </tr>
                        )}
                        <tr className="additional-padding">
                          <td>{isRawMaterial && parentIndex != 0 ? `${parentIndex}.${Math.floor(testIndex / 10) + 1}.${(testIndex % 10) + 1}` : section.MainHeadName == "Raw Material Inspection & Testing" && parentIndex == "1" ? `${2}.${Math.floor(testIndex / 10) + 2}.${(testIndex % 10) + 1}` : section.MainHeadName == "Raw Material Inspection & Testing" && parentIndex == "2" ? `${parentIndex}.${Math.floor(testIndex / 10) + 3}.${(testIndex % 10) + 1}` : `${2}.${Math.floor(testIndex / 10) + 1}.${(testIndex % 10) + 1}`}</td>
                          <td style={{ textAlign: 'left' }}>{test.TEST_DESCRIPTION}</td>
                          <td style={{ textAlign: 'left' }} colSpan="2">{test.PQT}</td>
                          <td style={{ textAlign: 'left' }} colSpan="1">{test.REGULAR_PRODUCTION}</td>
                          <td style={{ textAlign: 'left' }} colSpan="2">{test.ACCEPTATION_CRITERIA}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </React.Fragment>
    );
  };

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true)
    try {
      const response = await fetch(Environment.BaseAPIURL + "/api/User/ProcessSheetApproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
      );

      const responseBody = await response.text();

      if (responseBody === "100" || responseBody === "200") {
        toast.success("Data saved successfully!");
        navigate("/processsheetlist?menuId=7")

      } else {
        toast.error("Fail to submit. Please try again.");
        console.error("Failed to send form data to the server. Status code:", response.status);
        console.error("Server response:", responseBody);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    } finally {
      setLoader(false)
    }
  };

  const handleStatusChange = (value) => {
    if (value === "A") {
      setFormData({ ...formData, pm_approver_status: "A" });
      setShowWitness(true)
    }
    if (value === "R") {
      setFormData({ ...formData, pm_approver_status: "R" });
      setShowWitness(false)
    }
  };

  const handlePrint = () => { window.print(); };

  const downloadPDF = async () => {
    const element = document.querySelector(".ProcessSheetViewPageSection");
    const header = document.querySelector("#repeat-header");

    // Select the specific text elements you want to hide
    const textsToHide = document.querySelectorAll(".hidethisforprint"); // Change selector to match your text elements

    // Hide the specific text elements
    textsToHide.forEach(text => {
      text.style.display = "none";
    });

    // Apply styles to the header (this will help in ensuring widths are respected)
    const columnWidths = [60, 2000, 200, 100]; // Example widths in pixels
    Array.from(header.querySelectorAll('th')).forEach((th, index) => {
      th.style.width = `${columnWidths[index]}px`;
    });

    // Use html2pdf to generate the PDF
    html2pdf().from(element).set({
      filename: `ProcessSheet-${projectid}`,
      jsPDF: { format: 'a4', orientation: 'portrait' },
      html2canvas: { scale: 2, useCORS: true },
      margin: [30, 5, 5, 10], // Adjust margin as needed
      pagebreak: { avoid: 'tr' }
    }).toPdf().get('pdf').then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10); // Adjust as needed
        pdf.setTextColor(40); // Adjust as needed

        if (i > 1) { // Add header only on pages beyond the first one
          const headerText = header.innerText;
          const x = 8.5; // X position of the header
          const y = 18; // Y position of the header
          const padding = 5; // Padding around the text
          const textWidth = 178;
          const textHeight = 2; // Approximate height of the text

          // Set the border color
          pdf.setDrawColor(153, 153, 153); // Set color to #999999 (RGB)

          // Draw the header text
          pdf.text(headerText, x + padding, y + padding);

          // Draw the border around the text
          pdf.rect(x, y, textWidth + padding * 2, textHeight + padding * 2); // Adjust the dimensions as needed
        }
      }

      // Save the PDF
      pdf.save(`${FirstSectionViewData.pm_procsheet_code}.pdf`);
    }).finally(() => {
      // Show the text elements again after generating the PDF
      textsToHide.forEach(text => {
        text.style.display = "";
      });
    });
  }

  const generateExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Process Sheet");

      const loadImage = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return await blob.arrayBuffer();
      };

      const tataSteelLogoImg = await loadImage(tatasteellogo);
      const tataLogoImg = await loadImage(tatalogo);

      const imageId1 = workbook.addImage({
        buffer: tataSteelLogoImg,
        extension: "png",
      });

      const imageId2 = workbook.addImage({
        buffer: tataLogoImg,
        extension: "png",
      });

      // Add the first image in A1:B1 with scaling
      worksheet.addImage(imageId1, {
        tl: { col: 0, row: 0 },
        ext: { width: 100, height: 20 } // Set desired width and height in pixels
      });

      // Add the second image in E1:F1 with scaling
      worksheet.addImage(imageId2, {
        tl: { col: 5, row: 0 }, // Column E is index 4 (0-based indexing)
        ext: { width: 50, height: 40 } // Set desired width and height in pixels
      });

      // Adjust row height if needed for both images
      worksheet.getRow(1).height = 40;


      worksheet.mergeCells("A1:F1");
      worksheet.getCell("A1").value = "";
      worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

      // Merge a separate row for the title
      worksheet.mergeCells("A2:F2");
      worksheet.getCell("A2").value = "";
      worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A3:F3");
      worksheet.getCell("A3").value = "PIPE COATING DIVISION";
      worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getCell("A3").font = { bold: true };

      worksheet.mergeCells("A4:F4");
      worksheet.getCell("A4").value = "PROCESS SHEET FOR COATING";
      worksheet.getCell("A4").alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getCell("A4").font = { bold: true };

      worksheet.mergeCells("A5:F5");
      worksheet.getCell("A5").value = "TSL/COAT/QC/F-02 REV: 05 DATE: 13.11.2021";
      worksheet.getCell("A5").alignment = { vertical: "middle", horizontal: "right" };
      worksheet.getCell("A5").font = { bold: true };

      const coatingMaterialData = [
        ["Client Name", FirstSectionViewData.clientname],
        ["Coating Type", FirstSectionViewData.coating_type],
        ["Pipe Size", FirstSectionViewData.pipesize],
        ["P.O. No.", FirstSectionViewData.pm_loi_po_foa_no],
        ["Process Sheet No.", FirstSectionViewData.pm_procsheet_code],
        ["Date", FirstSectionViewData.pm_procsheet_date],
        ["QAP No.", FirstSectionViewData.ps_qap_no],
        ["Technical Specification", FirstSectionViewData.pm_technical_spec],
        ["Inspection Agency", InspectionAgency.clientname],
        [],
        ["3LPE Coating Raw Material"],
        ["Sr. No.", "Material", "Manufacturer", "Grade"],
        ...SecondSectionViewData.map((data, index) => [
          index + 1,
          data.Material,
          data.Manfacturer,
          data.Grade,
        ]),
        [],
        ["RAW MATERIAL INSPECTION & TESTING"],
        [
          "SR. NO.",
          "TEST DESCRIPTION",
          "PQT",
          "REGULAR PRODUCTION",
          "ACCEPTANCE CRITERIA",
        ],
        ...testData.map((data, index) => [
          index + 1,
          data.TEST_DESCRIPTION,
          data.PQT,
          data.REGULAR_PRODUCTION,
          data.ACCEPTATION_CRITERIA,
        ]),
      ];

      worksheet.getColumn(6).width = 30;

      coatingMaterialData.forEach((row, rowIndex) => {
        const worksheetRow = worksheet.addRow(row);

        if (row[0] === "Client Name") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "Coating Type") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "Pipe Size") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "P.O. No.") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "Process Sheet No.") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "Date") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "QAP No.") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "Technical Specification") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "Inspection Agency") {
          worksheetRow.getCell(1).font = { bold: true };
        }

        if (row[0] === "3LPE Coating Raw Material") {
          worksheetRow.getCell(1).font = { bold: true };
        }
      });

      worksheet.columns = [
        { width: 25 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Process-Sheet-${FirstSectionViewData.procsheet_id}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel:", error);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : loader ? (
        <Loader />
      ) : (
        <>
          <div className="ProcessSheetView ProcessSheetPrintOnly">
            <div className="DownloadPrintFlexSection" style={{ textAlign: 'right', paddingRight: '14px', paddingTop: '10px' }}>
              {/* <h4 className='DownloadPDFBtn' onClick={downloadPDF}>
                <i className="fas fa-download"> </i> Download PDF
              </h4> */}
              <h4 className='PrintBtn' onClick={generateExcel}>
                <i className="fas fa-file"></i> Download Excel
              </h4>
              <h4 className='PrintBtn' onClick={handlePrint}>
                <i className="fas fa-print"></i> Print
              </h4>
            </div>

            <div className="ProcessSheetViewPageSection NewReportPageSection">
              <div className="container-fluid" ref={printRef}>
                <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <div className="CustomBarePipeWitnessFlex" style={{ display: 'block' }}>
                      <section className="HeaderDataSection" style={{ borderTop: '1px solid #999999' }}>
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div className="HeaderDataFlexdisplay">
                                <img className="tatasteellogoimg" src={tatasteellogo} alt="" />
                                <img className="tatalogoimg" src={tatalogo} alt="" />
                              </div>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <h1>TATA STEEL LIMITED <br /> PIPE COATING DIVISION <br /> PROCESS SHEET FOR COATING{" "}</h1>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div style={{ textAlign: "right" }}><p>TSL/COAT/QC/F-02 REV: 05 DATE: 13.11.2021</p></div>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="ProcessSheetViewHeaderDetails ReporttableSection ReportDetailsSection">
                        <table>
                          <tbody>
                            <tr>
                              <th colSpan={2}>CLIENT NAME</th>
                              <td colSpan={5} style={{ textTransform: 'uppercase', borderRight: 'none' }}>{FirstSectionViewData?.clientname}</td>
                            </tr>
                            <tr>
                              <th colSpan={2}>COATING TYPE</th>
                              <td colSpan={5} style={{ borderRight: 'none' }}>{FirstSectionViewData?.coating_type}</td>
                            </tr>
                            <tr>
                              <th colSpan={2}>PIPE SIZE</th>
                              <td colSpan={5} style={{ borderRight: 'none' }}>{FirstSectionViewData?.pipesize}</td>
                            </tr>
                            <tr>
                              <th colSpan={2}>P. O. NO.</th>
                              <td colSpan={5} style={{ borderRight: 'none' }}>{FirstSectionViewData?.pm_loi_po_foa_no}</td>
                            </tr>
                            <tr>
                              <th colSpan={2}>PROCESS SHEET NO.</th>
                              <td colSpan={3}>{FirstSectionViewData?.pm_procsheet_code} Rev. {FirstSectionViewData?.pm_procsheet_revision == null ? '0' : FirstSectionViewData?.pm_procsheet_revision} {FirstSectionViewData?.pm_ps_revision_date != "" ? 'Dated. ' + convertDate(FirstSectionViewData?.pm_ps_revision_date) : ''} </td>
                              <td colSpan={2} style={{ borderLeft: '1px solid #999999', borderRight: 'none' }}><b style={{ fontFamily: 'Myriad Pro Regular' }}>DATE:</b> {FirstSectionViewData?.pm_procsheet_date}</td>
                            </tr>
                            <tr>
                              <th colSpan={2}>QAP NO.</th>
                              <td colSpan={5} style={{ borderRight: 'none' }}>{FirstSectionViewData?.ps_qap_no}</td>
                            </tr>
                            <tr>
                              <th colSpan={2}>TECHNICAL SPECIFICATION</th>
                              <td colSpan={5} style={{ borderRight: 'none' }}>{FirstSectionViewData?.pm_technical_spec}</td>
                            </tr>
                            <tr>
                              <th rowSpan={po.length + 2} colSpan={2}>P. O Quantity</th>
                              <th className="poquantitytd" style={{ textAlign: 'center' }} colSpan={2}>PIPE SIZE</th>
                              <th className="poquantitytd" style={{ textAlign: 'center' }} colSpan={1}>QUANTITY (NOS.) <br /> APPROX</th>
                              <th className="poquantitytd" colSpan={2} style={{ borderRight: 'none', textAlign: 'center' }}>ORDER QUANTITY (MTRS.)</th>
                            </tr>
                            {po.map((data) => {
                              return (
                                <tr>
                                  <td style={{ textAlign: 'center' }} colSpan={2}>{data?.pipesize}</td>
                                  <td style={{ textAlign: 'center' }} colSpan={1}>{Math.ceil(Number(data?.pm_po_item_qty) / 12)}</td>
                                  <td style={{ textAlign: 'center', borderRight: 'none' }} colSpan={2}>{data?.pm_po_item_qty}</td>
                                </tr>
                              )
                            })}
                            <tr>
                              <th className="poquantitytd" colSpan={2} style={{ textAlign: 'center' }}>TOTAL</th>
                              <th className="poquantitytd" colSpan={1} style={{ textAlign: 'center' }}>{Math.ceil(totalPo / 12)}</th>
                              <th className="poquantitytd" colSpan={2} style={{ borderRight: 'none', textAlign: 'center' }}>{totalPo}</th>
                            </tr>
                            <tr>
                              <th colSpan={2} style={{ borderBottom: 'none' }}>INSPECTION AGENCY </th>
                              <td colSpan={5} style={{ borderRight: 'none', borderBottom: 'none' }}>{InspectionAgency?.clientname}</td>
                            </tr>
                          </tbody>
                        </table>
                      </section>
                      <section class="ReporttableSection ProcessSheetViewTableDetails">
                        <div class="container-fluid">
                          <div class="row">
                            <div class="col-md-12 col-sm-12 col-xs-12">
                              <div id="custom-scroll">
                                <table>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '60px' }}>SR. NO.</th>
                                      <th style={{ width: '260px' }}>MATERIAL</th>
                                      <th colspan="2">MANUFACTURER</th>
                                      <th colspan="3">GRADE</th>
                                    </tr>
                                    <tr>
                                      <th colSpan={1}>1.0 </th>
                                      <th colSpan={6} style={{ textAlign: 'left' }}>{FirstSectionViewData?.coating_type} COATING RAW MATERIAL</th>
                                    </tr>
                                    {SecondSectionViewData.map((matdata, index) => (
                                      <tr>
                                        <td>1.{index + 1}</td>
                                        <td style={{ textAlign: 'center' }}>{matdata.Material}</td>
                                        <td style={{ textAlign: 'center' }} colSpan={2}>{matdata.Manfacturer}</td>
                                        <td style={{ textAlign: 'center' }} colSpan={3}>{matdata.Grade}</td>
                                      </tr>
                                    ))}
                                  </thead>
                                  {/* {ThirdSectionViewData} */}
                                </table>
                                {ThirdSectionViewData}
                                <table>
                                  <tr>
                                    <td colSpan={7} style={{ textAlign: 'left', borderTop: 'none' }}>{pqt}</td>
                                  </tr>
                                </table>
                              </div>
                            </div>
                          </div>
                          <Processsheetfooter data={approvalData} />
                          {ShowApprovalSection && (
                            <>
                              <div class="row mt-4">
                                <div className="col-md-4 col-sm-4 col-xs-12">
                                  <div className="form-group Remarksform-group">
                                    <label htmlFor="">Remarks <b>*</b></label>
                                    <input
                                      name="pm_remarks"
                                      class="form-control"
                                      value={formData.pm_remarks}
                                      onChange={handleChange}
                                      type="text"
                                      placeholder="Enter Approval/Rejection Remarks...."
                                      autoComplete="off"
                                    />
                                  </div>
                                  <label className="custom-radio">
                                    <input
                                      type="radio"
                                      className="Approveinput"
                                      name="pm_approver_status"
                                      id="btnaprv"
                                      onChange={() => handleStatusChange("A")}
                                    />
                                    <span className="radio-btn"><i class="fas fa-check"></i>Approve</span>
                                  </label>
                                  <label className="custom-radio">
                                    <input
                                      type="radio"
                                      className="Rejectinput"
                                      name="pm_approver_status"
                                      id="btnreject"
                                      onChange={() => handleStatusChange("R")}
                                    />
                                    <span className="radio-btn"><i class="fas fa-times"></i>Reject</span>
                                  </label>
                                </div>
                                <div className="col-md-5 col-sm-5 col-xs-12">
                                  <div style={{ display: 'flex' }}>
                                    {ShowTestDate && (
                                      <div className="form-group Remarksform-group EffectiveDateDiv">
                                        <label htmlFor="">Effective Date <b>*</b></label>
                                        <input
                                          type="date"
                                          class="form-control"
                                          autoComplete="off"
                                          name="pm_testdate"
                                          max={new Date().toISOString().split("T")[0]}
                                          value={formData.pm_testdate}
                                          onChange={handleChange}
                                          placeholder="Enter Effective Date...."
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="col-md-3 col-sm-3 col-xs-12">
                                  <button type="button" className="SubmitBtn btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div >
            </div >
          </div>
        </>
      )
      }
    </>
  );
}

export default ProcessSheetview;