import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProcessSheetlist.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from "../Loading";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Environment from "../../environment";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import * as XLSX from "xlsx";

function ProcessSheetlist() {
  const [formData, setFormData] = useState({
    pm_comp_id: "1",
    pm_location_id: "1",
    pm_project_id: "",
    pm_processsheet_id: "",
    pm_approver_type: "",
    pm_remarks: "",
    pm_testdate: "",
    pm_approver_status: "A",
    pm_approved_by: "1",
  });

  const [tableData, setTableData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [actionShow, setActionShow] = useState(false);
  const actionHandleClose = () => setActionShow(false);
  const actionHandleShow = () => setActionShow(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get(Environment.BaseAPIURL + "/api/User/getallpslist")
      .then((response) => {
        setTableData(response.data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const searchParams = new URLSearchParams(window.location.search);
  let id = searchParams.get('id');

  tableData.forEach(function (value, i) {
    value["sno"] = i + 1;
  });

  const filterData = () => {
    const filteredData = tableData.filter((item) => {
      const testDate = new Date(item.ProcSheetDate).setHours(0, 0, 0, 0);
      const fromDateValue = fromDate
        ? new Date(fromDate).setHours(0, 0, 0, 0)
        : null;
      const toDateValue = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;

      return (
        (!fromDateValue || testDate >= fromDateValue) &&
        (!toDateValue || testDate <= toDateValue)
      );
    });

    const formattedData = filteredData.map((item) => {
      return {
        ...item,
        ProcSheetDate: new Date(item.ProcSheetDate).toLocaleDateString("en-IN"),
      };
    });

    return formattedData;
  };

  const filteredData = filterData();

  const actionCellRenderer = (params) => {
    const {
      onViewClick,
      onDeleteClick,
      onEditClick,
      onCopyProcessSheet,
      onAddStationClick,
      onApproveClick,
      onSecondApproveClick,
    } = params.colDef.cellRendererParams;

    return (
      <div className="action-icons">
        <i
          className="fas fa-eye"
          onClick={() => onViewClick(params.data)}
          style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
        ></i>
        <i
          className="fas fa-copy"
          title="Copy"
          onClick={() => onCopyProcessSheet(params.data)}
          style={{ color: "#14aee1", margin: "4", "padding-right": "5px" }}
        ></i>
        <i
          className="fas fa-edit"
          onClick={() => onEditClick(params.data)}
          style={{ color: "#FF9800", margin: "4", "padding-right": "5px" }}
        ></i>
        <i
          className="fas fa-trash-alt"
          onClick={() => onDeleteClick(params.data, params.node.ProcSheetNo)}
          style={{ color: "#FF5252", margin: "4", "padding-right": "5px" }}
        ></i>
        <i
          className="fas fa-plus"
          title="Add Station"
          onClick={() => onAddStationClick(params.data)}
          style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
        ></i>
        <i
          className="fas fa-check"
          title="Approve"
          onClick={() => onApproveClick(params.data)}
          style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
        ></i>
        <i
          className="fas fa-check-double"
          title="Approve"
          onClick={() => onSecondApproveClick(params.data)}
          style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
        ></i>
      </div>
    );
  };

  const handleViewClick = (rowData) => {
    navigate(`/processsheetview?id=${rowData.project_id}&ViewType=View`);
  };

  const handleEditClick = (rowData) => {
    navigate(`/coating?id=${rowData.project_id}`);
  };

  const handleCopyClick = (rowData) => {
    navigate(`/coating?id=${rowData.project_id}&isProcessSheetCopy=true`);
  };

  const handleDeleteClick = (rowData, index) => {
    const CustomToastBody = ({ closeToast }) => (
      <div className="wanttodeleteModal">
        <p>Are you sure you want to delete this item?</p>
        <i
          className="fas fa-check"
          onClick={() => handleDeleteConfirmation(rowData, index, closeToast)}
        ></i>
        <i className="fas fa-times" onClick={closeToast}></i>
      </div>
    );

    toast.info(<CustomToastBody />, {
      position: "top-center",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      className: "custom-toast",
      bodyClassName: "custom-toast-body",
    });
  };

  const handleDeleteConfirmation = (rowData, index, closeToast) => {
    closeToast();
    // setTableData((prevData) => {
    //   if (rowData.ProcSheetNo) return prevData.filter((item) => item.ProcSheetNo !== rowData.ProcSheetNo);
    //   else return prevData.filter((item, i) => i !== index);
    // });

    axios
      .get(
        Environment.BaseAPIURL +
        `/api/User/Delete?project_id=${rowData.project_id}`
      )
      .then((response) => {
        if (response.data === 1000) {
          fetchData();
          toast.success("Processsheet Deleted");
        }
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        toast.error("Error deleting item");
      });
  };

  const onhandleAddStationClick = (rowData) => {
    navigate(`/addstation?id=${rowData.project_id}`);
  };

  const [ShowTestDate, setShowTestDate] = useState("");
  const onhandleApproveClick = (rowData) => {
    navigate(
      `/processsheetview?id=${rowData.project_id}&pm_processsheet_id=${rowData.pm_procsheet_id}&ViewType=onhandleApproveClick`
    );
    // setShowTestDate('');
    // setFormData({
    //   ...formData, pm_project_id: rowData.project_id == null ? "0" : rowData.project_id + '',
    //   pm_processsheet_id: rowData.pm_procsheet_id == null ? "0" : rowData.pm_procsheet_id + '',
    //   pm_approver_type: "1",
    // });
    // actionHandleShow();
  };

  const onhandleSecondApproveClick = (rowData) => {
    navigate(
      `/processsheetview?id=${rowData.project_id}&pm_processsheet_id=${rowData.pm_procsheet_id}&ViewType=onhandleSecondApproveClick`
    );
    // setShowTestDate('Yes');
    // setFormData({
    //   ...formData, pm_project_id: rowData.project_id == null ? "0" : rowData.project_id + '',
    //   pm_processsheet_id: rowData.pm_procsheet_id == null ? "0" : rowData.pm_procsheet_id + '',
    //   pm_approver_type: "2",
    // });
    // actionHandleShow();
  };

  const columnDefs = [
    {
      headerName: "S No.",
      field: "sno",
      width: 80,
      headerClass: "custom-header",
    },
    {
      headerName: "Coating Type",
      field: "Coatingtype",
      width: 220,
      headerClass: "custom-header",
    },
    {
      headerName: "Process Sheet No.",
      field: "ProcSheetNo",
      width: 220,
      headerClass: "custom-header",
    },
    {
      headerName: "Client",
      field: "Client",
      width: 310,
      headerClass: "custom-header",
    },
    {
      headerName: "LOI/PO/FOA No",
      field: "LOI/PO/FOA No",
      width: 130,
      headerClass: "custom-header",
    },
    {
      headerName: "Date",
      field: "ProcSheetDate",
      width: 110,
      headerClass: "custom-header",
    },
    {
      headerName: "Action",
      cellRenderer: actionCellRenderer,
      cellRendererParams: {
        onViewClick: (rowData) => handleViewClick(rowData),
        onDeleteClick: (rowData) => handleDeleteClick(rowData),
        onEditClick: (rowData) => handleEditClick(rowData),
        onCopyProcessSheet: (rowData) => handleCopyClick(rowData),
        onAddStationClick: (rowData) => onhandleAddStationClick(rowData),
        onApproveClick: (rowData) => onhandleApproveClick(rowData),
        onSecondApproveClick: (rowData) => onhandleSecondApproveClick(rowData),
      },
      width: 160,
      headerClass: "custom-header",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    actionHandleClose();
    setFormData({
      ...formData,
      pm_approver_status: "A",
    });
    try {
      const response = await fetch(
        Environment.BaseAPIURL + "/api/User/ProcessSheetApproval",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const responseBody = await response.text();

      if (responseBody === "100" || responseBody === "200") {
        toast.success("Form data sent successfully!");
        console.log("Form data sent successfully!");
      } else {
        console.error(
          "Failed to send form data to the server. Status code:",
          response.status
        );
        console.error("Server response:", responseBody);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    actionHandleClose();
    setFormData({
      ...formData,
      pm_approver_status: "R",
    });

    try {
      const response = await fetch(
        Environment.BaseAPIURL + "/api/User/ProcessSheetApproval",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const responseBody = await response.text();

      if (responseBody === "100" || responseBody === "200") {
        toast.success("Form data sent successfully!");
        console.log("Form data sent successfully!");
      } else {
        console.error(
          "Failed to send form data to the server. Status code:",
          response.status
        );
        console.error("Server response:", responseBody);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    }
  };

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const createExcel = (data) => {
    const { headers, fields } = columnDefs
      .filter((col) => col.headerName !== "Action")
      .reduce(
        (acc, col) => {
          acc.headers.push(col.headerName);
          acc.fields.push(col.field);
          return acc;
        },
        { headers: [], fields: [] }
      );

    const worksheetData = [
      headers,
      ...data.map((item) => fields.map((field) => item[field])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const colWidths = columnDefs.map((col) => ({ wpx: col.width }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "process-sheet-list.xlsx");
  };

  const generateExcel = () => {
    const filteredData = filterData();
    createExcel(filteredData);
  };

  // -----------------------------------------------------------

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div
              className="InnerHeaderPageBg"
              style={{ backgroundImage: `url(${RegisterEmployeebg})` }}
            ></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li>
                      <Link to="/dashboard?moduleId=618">Quality Module</Link>
                    </li>
                    <li>
                      <h1>/&nbsp; Process Sheet List </h1>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="ProcessSheetlistSectionPage">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="ProcessSheetlistTable">
                    <div className="tableheaderflex">
                      <div className="tableheaderfilter">
                        <span>
                          {" "}
                          <i className="fas fa-filter"></i> Filter Test Date{" "}
                        </span>
                        <label>
                          {" "}
                          From Date:
                          <DatePicker
                            maxDate={new Date()}
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            dateFormat="dd/MMM/yyyy"
                            placeholderText="DD/MMM/YYYY"
                          />
                        </label>
                        <label>
                          {" "}
                          To Date:
                          <DatePicker
                            maxDate={new Date()}
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            dateFormat="dd/MMM/yyyy"
                            placeholderText="DD/MMM/YYYY"
                          />
                        </label>
                        <i className="fa fa-refresh"></i>
                      </div>
                      <div className="tableheaderAddbutton">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "end",
                          }}
                        >
                          {" "}
                        </div>
                        <Link
                          style={{ float: "right" }}
                          to="/coating"
                          target="_blank"
                        >
                          <i className="fas fa-plus"></i> Add
                        </Link>
                      </div>
                    </div>

                    <div className="fadedIcon">
                      <li>
                        <i
                          onClick={generateExcel}
                          className="fa-solid fa-file-excel h4"
                          style={{ color: "#209E62" }}
                        ></i>
                        <p className="h6" style={{ cursor: "pointer" }}> Download Excel</p>
                      </li>
                    </div>

                    <div className="fadedIcon">
                      <li>
                        <i
                          className="fa-solid fa-eye"
                          style={{ color: "#4caf50" }}
                        ></i>
                        View
                      </li>
                      <li>
                        <i
                          className="fa-solid fa-copy"
                          style={{ color: "#14aee1" }}
                        ></i>
                        Copy
                      </li>
                      <li>
                        <i
                          className="fa-solid fa-edit"
                          style={{ color: "#ff9800" }}
                        ></i>{" "}
                        Edit
                      </li>
                      <li>
                        <i
                          className="fa-solid fa-trash-can"
                          style={{ color: "#ff5252" }}
                        ></i>{" "}
                        Delete
                      </li>
                      <li>
                        <i
                          className="fa-solid fa-plus"
                          style={{ color: "#4caf50" }}
                        ></i>
                        Add Station
                      </li>
                      <li>
                        <i
                          className="fa-solid fa-check"
                          style={{ color: "#4caf50" }}
                        ></i>{" "}
                        Single level Approval
                      </li>
                      <li>
                        <i
                          className="fa-solid fa-check-double"
                          style={{ color: "#4caf50" }}
                        ></i>
                        Double level Approval
                      </li>
                    </div>
                    <div className="table-responsive" id="custom-scroll">
                      <div
                        className="ag-theme-alpine"
                        style={{ height: "400px", width: "100%" }}
                      >
                        <AgGridReact
                          columnDefs={columnDefs}
                          rowData={filteredData}
                          pagination={true}
                          paginationPageSize={100}
                          suppressDragLeaveHidesColumns="true"
                          domLayout="autoHeight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
          <Modal
            className="ProcessApprovalRejectionModal"
            show={actionShow}
            onHide={actionHandleClose}
            size="md"
            scrollable={"true"}
            backdrop="static"
            animation={"false"}
            aria-labelledby="title-terms"
          >
            <h2>
              {" "}
              Process Sheet Approval/Rejection{" "}
              <i
                style={{ cursor: "pointer" }}
                onClick={actionHandleClose}
                className="fa fa-times"
              ></i>
            </h2>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    name="pm_remarks"
                    value={formData.pm_remarks}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter Approval/Rejection Remarks...."
                  />
                </Form.Group>
                {ShowTestDate && (
                  <Form.Group controlId="fprTestDate">
                    <Form.Label>Effective Date</Form.Label>
                    <Form.Control
                      name="pm_testdate"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.pm_testdate}
                      onChange={handleChange}
                      type="date"
                      placeholder="Enter Effective Date...."
                    />
                  </Form.Group>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="ApproveBtnFooter"
                type="submit"
                onClick={handleSubmit}
              >
                Approve
              </Button>
              <Button
                className="RejectBtnFooter"
                type="submit"
                onClick={handleReject}
              >
                Reject
              </Button>
              {/* <Button variant="light" type="submit" onClick={actionHandleClose}>
                Cancel
              </Button> */}
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
}

export default ProcessSheetlist;
