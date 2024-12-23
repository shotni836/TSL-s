
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from "../Loading";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import "./List.css";
import axios from "axios";
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";

function List() {
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [headerData, setHeaderData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = secureLocalStorage.getItem("empId")

  useEffect(() => {
    fetchDownGradeData();
  }, []);

  const fetchDownGradeData = () => {
    axios
      .get(Environment.BaseAPIURL + `/api/User/Getdowmgradedata`)
      .then((response) => {
        if (response?.data) {
          const data = response.data[0];
          setTableData(data);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const itemName = location.state ? location.state.itemName : null;
  const category = location.state ? location.state.category : null;
  const routePrefix = useParams();

  const handlePipeAction = (params, action) => {
    setLoading(true)
    console.log(params, action);
    axios
      .post(Environment.BaseAPIURL + `/api/User/InsertdowngridData`, {
        pco_comp_id: "1",
        pco_location_id: "1",
        pipeid: params.pm_pipe_id.toString(),
        processheetid: params.pm_procsheet_id.toString(),
        projectid: params.pm_project_id.toString(),
        puserid: userId.toString(),
        stauts: action
      })
      .then((response) => {
        if (response?.data) {
          const data = response.data[0];
          toast.success(`Pipe ${action == "IN" ? "sent to inlet" : "downgraded"} successfully`)
          fetchDownGradeData()
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const handleEyeIconClick = (tstmaterialid) => {
    navigate(`/${category}/${tstmaterialid}`);
  };

  const [searchParams, setSearchParams] = useState("");

  const handleInputSearch = (e) => {
    setSearchParams(e.target.value);
  };

  const filteredData = tableData.filter(
    (item) =>
      (searchParams
        ? item.projectname.toLowerCase().includes(searchParams.toLowerCase())
        : true) ||
      (searchParams
        ? item.proseccsheetno.toLowerCase().includes(searchParams.toLowerCase())
        : true) ||
      (searchParams
        ? item.pipino.toLowerCase().includes(searchParams.toLowerCase())
        : true)
  );

  const dataToDisplay = searchParams ? filteredData : tableData;

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
                      {" "}
                      <Link to="/dashboard">Quality Admin (Dashboard)</Link>
                    </li>
                    <li>
                      <h1>/ &nbsp; Reports &nbsp; / &nbsp; Downgrade or Send to Inlet </h1>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="ReportsPageSection">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="ReportsTableDetails">
                    <h4>{itemName}</h4>

                    <div className="form-group">
                      <div className="SearchBox w-20">
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchParams}
                          onChange={handleInputSearch}
                        />
                      </div>
                    </div>

                    <div className="table-responsive" id="custom-scroll">
                      {showTable && (
                        <table>
                          <thead>
                            <tr style={{ background: "#5A245A" }}>
                              <th style={{ minWidth: "20px" }}> S No. </th>
                              <th style={{ minWidth: "80px" }}>Pipe No.</th>
                              <th style={{ minWidth: "70px" }}>ASL No.</th>
                              <th style={{ minWidth: "80px" }}>Source</th>
                              <th style={{ minWidth: "70px" }}>Date</th>
                              <th style={{ minWidth: "120px" }}>
                                Process Sheet No.
                              </th>
                              <th style={{ minWidth: "160px" }}>Project Name</th>
                              <th style={{ minWidth: "120px" }}>Remarks</th>
                              <th style={{ minWidth: "240px" }}>Actions</th>
                              <th style={{ minWidth: "70px" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataToDisplay.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.pipino || "-"}</td>
                                <td>{item.aslno || "-"}</td>
                                <td>{item.remark || "-"}</td>
                                <td>
                                  {new Date(item.date).toLocaleDateString(
                                    "en-GB"
                                  ) || "-"}
                                </td>
                                <td>{item.proseccsheetno || "-"}</td>
                                <td>{item.projectname || "-"}</td>
                                <td>{item.remarks || "-"}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <div className="ShowtableBox mr-2">
                                      <button
                                        type="button"
                                        disabled={item.pm_pipe_status == "IN" || item.pm_pipe_status == "DG"}
                                        style={{ cursor: item.pm_pipe_status == "IN" || item.pm_pipe_status == "DG" ? 'not-allowed' : "pointer" }}
                                        onClick={() =>
                                          handlePipeAction(item, "IN")
                                        }
                                      >
                                        Send to inlet
                                      </button>
                                    </div>
                                    <div className="ShowtableBox downgraded-button">
                                      <button
                                        type="button"
                                        disabled={item.pm_pipe_status == "IN" || item.pm_pipe_status == "DG"}
                                        style={{ cursor: item.pm_pipe_status == "IN" || item.pm_pipe_status == "DG" ? 'not-allowed' : "pointer" }}
                                        onClick={() =>
                                          handlePipeAction(item, "DG")
                                        }
                                        className="w-full"
                                      >
                                        Downgrade
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td>{item.pm_pipe_status == 'IN' ? "Pipe sent to inlet" : item.pm_pipe_status == 'DG' ? "Pipe downgraded" : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </>
  );
}

export default List;
