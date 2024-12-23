import React, { useState, useEffect } from "react";
import Loading from "../Loading";
import "./Coating.css";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import axios from "axios";
import Environment from "../../environment";

function AddStation() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(document.location.search);
  let projectid = searchParams.get("id");
  const coatingType = searchParams.get("coatingType");
  const processSheet = searchParams.get("processSheet");
  const client = searchParams.get("client");
  const LOIPOFOA = searchParams.get("LOIPOFOA");
  const coatingDate = searchParams.get("coatingDate");
  const menuId = searchParams.get('menuId');
  const proc_type = searchParams.get('proc_type');

  let [processgridrowdata, setApiResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    axios.get(`${Environment.BaseAPIURL}/api/User/GetStationType?project_id=${projectid}&proc_type=${proc_type}`)
      .then((response) => {
        if (isMounted) {
          const data = response.data.map((item) => ({
            ...item,
            M_projectid: projectid,
            co_param_val_id: item.co_param_val_id + "",
            Remarks: item.Remarks?.replace(/@\$\@/g, "\n") || "",
          }));
          setApiResponse(data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Error fetching API data:", error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [projectid]);

  const processcolumnDefs = [
    {
      headerName: "Process",
      field: "co_param_val_name",
      headerClass: "custom-header",
      width: 350,
      sortable: false,
      editable: false,
      suppressMovable: true,
    },
    {
      headerName: "Remarks / Notes",
      field: "Remarks",
      headerClass: "custom-header",
      width: 940,
      sortable: false,
      editable: true,
      valueSetter: ProcessGridValueSetter,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      suppressMovable: true,
      cellEditorParams: {
        rows: 10,
        cols: 100,
      },
      cellRenderer: (params) => <div style={{ whiteSpace: 'pre-wrap' }}>{params.value}</div>,
    },
  ];

  function ProcessGridValueSetter(params) {
    try {
      if (params.colDef.field === "Remarks" && params.newValue !== undefined) {
        params.data[params.colDef.field] = params.newValue;
      } else {
        params.data[params.colDef.field] = params.oldValue;
      }
      return true;
    } catch (error) {
      console.error("Error setting process grid value:", error);
      return false;
    }
  }

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const completeFormData = {
        stationGriddata: processgridrowdata.map((item) => ({
          ...item,
          proc_type: parseInt(proc_type),
          Remarks: item.Remarks ? item.Remarks.replace(/\n/g, "@$@") : "",
        })),
      };

      const response = await fetch(Environment.BaseAPIURL + "/api/User/InsertUpdateStationDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeFormData),
      });
      const responseBody = await response.text();
      if (responseBody !== "") {
        toast.success("Data saved successfully!");
        navigate(`/processsheetlist?menuId=${menuId}`)
      } else {
        toast.error("Failed to save data");
        console.error("Login failed with status:", response.status);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    }
  };

  const isFormVisible = coatingType && processSheet && client && LOIPOFOA && coatingDate;

  return (
    <>
      {loading ? (<Loading />) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                    {isFormVisible && (<><li><span style={{ color: "#fff" }}>/ &nbsp;</span></li>
                      <li><Link to={`/processsheetlist?menuId=${menuId}`}>Process Sheet List</Link></li></>)}
                    <li><h1>/&nbsp; Add Station </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <form onSubmit={handleSubmit}>
            <section className="AddStationPageSection">
              <div className="container">
                <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <div className="AddStationDetails">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Add Station <span>- Add Remarks</span></h4>
                      </div>
                      {isFormVisible && (
                        <form className="row m-0">
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Coating Type</label>
                              <h4>{coatingType}</h4>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Process Sheet No.</label>
                              <h4>{processSheet}</h4>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Client Name</label>
                              <h4>{client}</h4>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">LOI/PO/FOA No</label>
                              <h4>{LOIPOFOA}</h4>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-4 col-xs-12">
                            <div className="form-group">
                              <label htmlFor="">Date</label>
                              <h4>{new Date(coatingDate).toLocaleDateString('en-GB')}</h4>
                            </div>
                          </div>
                        </form>
                      )}
                      <div className="row m-0">
                        <div className="col-md-12 col-sm-12 col-xs-12">
                          <div className="ag-theme-alpine RemarksLabelTable">
                            <AgGridReact
                              columnDefs={processcolumnDefs}
                              rowData={processgridrowdata}
                              suppressRowClickSelection="true"
                              domLayout="autoHeight"
                              suppressMovable="true"
                              suppressDragLeaveHidesColumns="true"
                              rowHeight={40}
                            />
                          </div>
                          <br />
                        </div>
                        <div className="FlexSubmitFlex">
                          <button type="submit" className="subBtn">Submit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </form>
          <Footer />
        </>
      )}
    </>
  );
}

export default AddStation;