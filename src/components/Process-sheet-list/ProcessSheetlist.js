import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import secureLocalStorage from "react-secure-storage";

function ProcessSheetlist() {
  const [formData, setFormData] = useState({
    pm_comp_id: "1",
    pm_location_id: "1",
    pm_project_id: "",
    pm_processsheet_id: "",
    pm_approver_type: "",
    pm_editable: "",
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const menuId = queryParams.get('menuId');
  const userId = secureLocalStorage.getItem('userId');
  const [permissions, setPermissions] = useState([])
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId?UserId=${userId}&PageId=${menuId}`);
        setPermissions(response.data[0] || {});
        if (response.data[0]) {
          fetchData();
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, menuId]);

  const fetchData = () => {
    axios.get(Environment.BaseAPIURL + "/api/User/getallpslist")
      .then((response) => {
        setTableData(response.data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  tableData.forEach(function (value, i) {
    value["sno"] = i + 1;
  });

  const [coatingTypeFilter, setCoatingTypeFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  const getUniqueOptions = (data, key) => {
    return [...new Set(data.map(item => item[key]))];
  };

  const filterData = () => {
    return tableData
      .filter((item) => {
        const testDate = new Date(item.ProcSheetDate).setHours(0, 0, 0, 0);
        const fromDateValue = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
        const toDateValue = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;

        return (
          (!fromDateValue || testDate >= fromDateValue) &&
          (!toDateValue || testDate <= toDateValue) &&
          (!coatingTypeFilter || item.Coatingtype === coatingTypeFilter) &&
          (!clientFilter || item.Client === clientFilter) &&
          (!searchText || item.ProcSheetNo.toLowerCase().includes(searchText.toLowerCase()))
        );
      })
  };

  const resetFilter = () => {
    setFromDate(null);
    setToDate(null);
    setCoatingTypeFilter('');
    setClientFilter('');
    setSearchText('');
  };

  const renderDropdownFilters = () => {
    const uniqueCoatingTypes = getUniqueOptions(tableData, 'Coatingtype');
    const uniqueClients = getUniqueOptions(tableData, 'Client');

    return (
      <>
        <div className="form-group">
          <label>Coating Type</label>
          <select value={coatingTypeFilter} onChange={(e) => setCoatingTypeFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueCoatingTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Client</label>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueClients.map((client, index) => (
              <option key={index} value={client}>{client}</option>
            ))}
          </select></div>
        <i className="fa fa-refresh" onClick={resetFilter}></i>
      </>
    );
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
        {(permissions?.indexPerm == 1) ?
          <i
            className="fas fa-eye"
            title="View"
            onClick={() => onViewClick(params.data)}
            style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
          ></i> : ''}
        {(permissions?.copy == 1 && !params.data.ProcSheetNo.includes('-')) ? <i
          className="fas fa-copy"
          title="Copy"
          onClick={() => onCopyProcessSheet(params.data)}
          style={{ color: "#14aee1", margin: "4", "padding-right": "5px" }}
        ></i> : ''}
        {(permissions?.editPerm == 1 && (params.data.IsUpdated == 0 || params.data.IsSubmit == 0)) ? <i
          className="fas fa-edit"
          title="Edit"
          onClick={() => onEditClick(params.data)}
          style={{ color: "#FF9800", margin: "4", "padding-right": "5px" }}
        ></i> : ''}
        {(permissions?.deletePerm == 1) ? <i
          className="fas fa-trash-alt"
          title="Delete"
          onClick={() => onDeleteClick(params.data, params.node.ProcSheetNo)}
          style={{ color: "#FF5252", margin: "4", "padding-right": "5px" }}
        ></i> : ''}
        {/* {(permissions?.addStation == 1) ? <i
          className="fas fa-plus"
          title="Add Station"
          onClick={() => onAddStationClick(params.data)}
          style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
        ></i> : ''} */}
        {(permissions?.firstLevelApprove === '1' && params.data.Approval_status == 0 && params.data.IsUpdated == 1 && params.data.IsSubmit == 1) ? (
          <i
            className="fas fa-check"
            title="Approve"
            onClick={() => onApproveClick(params.data)}
            style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
          ></i>) : null}
        {(permissions?.secondLevelApprove === '1' && params.data.Approval_status == 1 && params.data.IsSubmit == 1) ? (
          <i
            className="fas fa-check-double"
            title="Approve"
            onClick={() => onSecondApproveClick(params.data)}
            style={{ color: "#4CAF50", margin: "4", "padding-right": "5px" }}
          ></i>
        ) : null}
      </div>
    );
  };

  const handleViewClick = (rowData) => {
    console.log(rowData)
    navigate(`/processsheetview?id=${rowData.project_id}&procSheetId=${rowData.pm_procsheet_id}&ViewType=View&menuId=${menuId}&Proc_type=${rowData.Proc_Type}`);
  };

  const handleEditClick = (rowData) => {
    navigate(`/coating?id=${rowData.project_id}&menuId=${menuId}&Proc_type=${rowData.Proc_Type}`);
  };

  const handleCopyClick = (rowData) => {
    navigate(`/coating?id=${rowData.project_id}&isProcessSheetCopy=true&menuId=${menuId}&Proc_type=${rowData.Proc_Type}`);
  };

  const handleDeleteClick = (rowData, index) => {
    const CustomToastBody = ({ closeToast }) => (
      <div className="wanttodeleteModal">
        <p>Are you sure you want to delete this item?</p>
        <i className="fas fa-check" onClick={() => handleDeleteConfirmation(rowData, index, closeToast)}></i>
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

    axios.get(Environment.BaseAPIURL + `/api/User/Delete?project_id=${rowData.project_id}&proc_type=${rowData.Proc_Type}`)
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
    navigate(`/addstation?menuId=${menuId}&id=${rowData.pm_procsheet_id}&proc_type=${rowData.Proc_Type}&coatingType=${rowData.Coatingtype}&processSheet=${rowData.ProcSheetNo}&client=${rowData.Client}&LOIPOFOA=${rowData["LOI/PO/FOA No"]}&coatingDate=${rowData.ProcSheetDate}`);
  };

  const [ShowTestDate, setShowTestDate] = useState("");
  const onhandleApproveClick = (rowData) => {
    navigate(
      `/processsheetview?id=${rowData.project_id}&pm_processsheet_id=${rowData.pm_procsheet_id}&ViewType=onhandleApproveClick&Proc_type=${rowData.Proc_Type}`
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
    navigate(`/processsheetview?id=${rowData.project_id}&pm_processsheet_id=${rowData.pm_procsheet_id}&ViewType=onhandleSecondApproveClick&Proc_type=${rowData.Proc_Type}`);
    // setShowTestDate('Yes');
    // setFormData({
    //   ...formData, pm_project_id: rowData.project_id == null ? "0" : rowData.project_id + '',
    //   pm_processsheet_id: rowData.pm_procsheet_id == null ? "0" : rowData.pm_procsheet_id + '',
    //   pm_approver_type: "2",
    // });
    // actionHandleShow();
  };

  const getRowStyleScheduled = (params) => {
    if (params.data.Approval_status === 1) {
      return {
        'background-color': '#afffd7',
        'color': '#000'
      }
    } else if (params.data.Approval_status === 2) {
      return {
        'background-color': '#6bcf5f',
        'color': '#000'
      };
    }
    else if (params.data.Approval_status === 0 && params.data.IsUpdated === 0) {
      return {
        'background-color': '#bce8ff',
        'color': '#000'
      };
    }
    else if (params.data.IsUpdated === 1) {
      return {
        'background-color': '#ffe6c1',
        'color': '#000'
      };
    }
    return null;
  };

  const processSheetNoCellRenderer = (params) => {
    const fullProcessSheetNo = params.data.ProcSheetNo;
    const parts = fullProcessSheetNo.split('/');
    const lastPart = parts.slice(-2).join('/');

    return lastPart;
  };

  const dateCellRenderer = (params) => {
    const isRevisionZero = params.data.pm_procsheet_revision === 0;

    return isRevisionZero ?
      new Date(params.data.ProcSheetDate).toLocaleDateString("en-GB").replace(/\//g, "-") :
      new Date(params.data.pm_ps_revision_date).toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const columnDefs = [
    {
      headerName: "S No.",
      getColId: (params) => 1,
      field: "sno",
      width: 70,
      headerClass: "custom-header",
    },
    {
      headerName: "Coating Type",
      field: "Coatingtype",
      width: 110,
      headerClass: "custom-header",
      suppressSizeToFit: true,
    },
    {
      headerName: "Process Sheet No.",
      field: "ProcSheetNo",
      cellRenderer: processSheetNoCellRenderer,
      width: 135,
      headerClass: "custom-header",
    },
    {
      headerName: "Revision No.",
      field: "pm_procsheet_revision",
      width: 110,
      headerClass: "custom-header",
    },
    {
      headerName: "Client",
      field: "Client",
      width: 290,
      headerClass: "custom-header",
    },
    {
      headerName: "LOI/PO/FOA No.",
      field: "LOI/PO/FOA No",
      width: 130,
      headerClass: "custom-header",
    },
    {
      headerName: "Date",
      field: "ProcSheetDate",
      cellRenderer: dateCellRenderer,
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
      width: 180,
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
      const response = await fetch(Environment.BaseAPIURL + "/api/User/ProcessSheetApproval",
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
        console.error("Failed to send form data to the server. Status code:", response.status);
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
      const response = await fetch(Environment.BaseAPIURL + "/api/User/ProcessSheetApproval",
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
        console.error("Failed to send form data to the server. Status code:", response.status);
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

    console.log("Column Headers:", headers);
    console.log("Column Fields:", fields);

    data.forEach((item, index) => {
      console.log(`Row ${index + 1}:`, fields.map((field) => item[field]), "okays");
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;  // If it's not a valid date, return the original string
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return date.toLocaleDateString('en-US', options);  // Format to MM/DD/YYYY
    };

    const worksheetData = [
      headers,
      ...data.map((item) => fields.map((field) => {
        const value = item[field];
        // If the value is a date, format it
        if (value && !isNaN(new Date(value).getTime())) {
          return formatDate(value);  // Format the date
        }
        return value;  // Return the value as is if it's not a date
      })),
    ];
    // const worksheetData = [
    //   headers,
    //   ...data.map((item) => fields.map((field) => item[field])),
    // ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const colWidths = columnDefs.map((col) => ({ wpx: col.width }));
    worksheet["!cols"] = colWidths;

    console.log(data, "checks")

    XLSX.writeFile(workbook, "process-sheet-list.xlsx");
  };

  const generateExcel = () => {
    const filteredData = filterData();
    console.log(filteredData, "check")
    createExcel(filteredData);
  };


  const gridRef = useRef(null);

  const onGridReady = params => {
    gridRef.current = params.api;
    autoSizeAll();
  };

  const autoSizeAll = () => {
    const allColumnIds = [];
    gridRef.current.columnApi.getAllColumns().forEach(column => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds);
  };

  return (
    <>
      {loading ? (<Loading />
      ) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                    <li><h1>/&nbsp; Process Sheet List </h1></li>
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
                    <h4 className="FilterText"><i className="fas fa-filter"></i> Filter </h4>
                    <div className="tableheaderflex">
                      <div className="tableheaderfilter">
                        <form className="DateFilterBox">
                          <div className="form-group">
                            <label>From Date</label>
                            <DatePicker
                              maxDate={new Date()}
                              selected={fromDate}
                              onChange={(date) => setFromDate(date)}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="DD-MM-YYYY"
                            />
                          </div>
                          <div className="form-group">
                            <label>To Date</label>
                            <DatePicker
                              maxDate={new Date()}
                              selected={toDate}
                              onChange={(date) => setToDate(date)}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="DD-MM-YYYY"
                            />
                          </div>
                          {renderDropdownFilters()}
                        </form>
                      </div>
                      <div className="tableheaderAddbutton">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "end", }}></div>
                        {permissions?.createPerm ? <Link style={{ float: "right" }} to={"/coating?menuId=" + menuId} target="_blank">
                          <i className="fas fa-plus"></i> Add
                        </Link> : ''}
                      </div>
                    </div>
                    <ul className="DownloadExcelUl">
                      <div className="ProcessSheetNoBox">
                        <label htmlFor="">Search Process Sheet No.</label>
                        <input
                          type="text"
                          placeholder="Search by Process Sheet No."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>
                      <li>
                        <i title="Download Excel" onClick={generateExcel} className="fa-solid fa-file-excel"></i>
                      </li>
                    </ul>
                    <ul className="fadedIcon">
                      <li><i className="fa-solid fa-eye" style={{ color: "#4caf50" }}></i>View</li>
                      <li><i className="fa-solid fa-copy" style={{ color: "#14aee1" }}></i>Copy</li>
                      <li><i className="fa-solid fa-edit" style={{ color: "#ff9800" }}></i>Edit</li>
                      <li><i className="fa-solid fa-trash-can" style={{ color: "#ff5252" }}></i>Delete</li>
                      <li><i className="fa-solid fa-plus" style={{ color: "#4caf50" }}></i>Add Station</li>
                      <li><i className="fa-solid fa-check" style={{ color: "#4caf50" }}></i>Single level Approval</li>
                      <li><i className="fa-solid fa-check-double" style={{ color: "#4caf50" }}></i>Double level Approval</li>
                      <li><i className="fa fa-circle" style={{ color: "#bce8ff" }}></i>Created</li>
                      <li><i className="fa fa-circle" style={{ color: "#ffe6c1" }}></i>Edited</li>
                      <li><i className="fa fa-circle" style={{ color: "#afffd7" }}></i>Reviewed</li>
                      <li><i className="fa fa-circle" style={{ color: "#6bcf5f" }}></i>Approved</li>
                    </ul>
                    {/* <div className="table-responsive" id="custom-scroll"> */}
                    <div className="ag-theme-alpine">
                      <AgGridReact
                        columnDefs={columnDefs}
                        rowData={filteredData}
                        pagination={true}
                        paginationPageSize={10}
                        domLayout="autoHeight"
                        getRowStyle={getRowStyleScheduled}
                        suppressMovableColumns
                      />
                    </div>
                    {/* </div> */}
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
            <h2>Process Sheet Approval/Rejection<i style={{ cursor: "pointer" }} onClick={actionHandleClose} className="fa fa-times"></i></h2>
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
              <Button className="ApproveBtnFooter" type="submit" onClick={handleSubmit}>Approve</Button>
              <Button className="RejectBtnFooter" type="submit" onClick={handleReject}>Reject</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
}

export default ProcessSheetlist;