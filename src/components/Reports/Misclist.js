import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from "../Loading";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import "./List.css";
import axios from "axios";
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import Pagination from '../Common/Pagination/Pagination';

function List() {
  const token = secureLocalStorage.getItem('token');
  const [loading, setLoading] = useState(true);  // Initial loading state set to true
  const [showTable, setShowTable] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [searchParams, setSearchParams] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;  // Define page size for pagination
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get('moduleId');
  const menuId = queryParams.get('menuId');
  const navigate = useNavigate();
  const userId = secureLocalStorage.getItem("empId");

  const itemName = location.state ? location.state.itemName : null;
  const category = location.state ? location.state.category : null;

  // Fetching data when component mounts
  useEffect(() => {
    fetchDownGradeData();
  }, []);

  const fetchDownGradeData = () => {
    axios.get(Environment.BaseAPIURL + `/api/User/Getdowmgradedata`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then((response) => {
        if (response?.data) {
          const data = response?.data[0];
          setTableData(data);
        }
        setLoading(false);
      }).catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const handlePipeAction = (params, action) => {
    setLoading(true);
    axios.post(Environment.BaseAPIURL + `/api/User/InsertdowngridData`, {
      pco_comp_id: "1",
      pco_location_id: "1",
      pipeid: params.pm_pipe_id.toString(),
      processheetid: params.pm_procsheet_id.toString(),
      projectid: params.pm_project_id.toString(),
      puserid: userId.toString(),
      stauts: action
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then((response) => {
        if (response?.data) {
          const data = response?.data[0];
          toast.success(`Pipe ${action == "IN" ? "sent to inlet" : "downgraded"} successfully`);
          fetchDownGradeData();
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

  // Handling search input
  const handleInputSearch = (e) => {
    setSearchParams(e.target.value);
  };

  // Filtering data based on the search query
  const filteredData = tableData.filter((item) =>
    (searchParams ? item.projectname.toLowerCase().includes(searchParams.toLowerCase()) : true) ||
    (searchParams ? item.proseccsheetno.toLowerCase().includes(searchParams.toLowerCase()) : true) ||
    (searchParams ? item.pipino.toLowerCase().includes(searchParams.toLowerCase()) : true)
  );

  const dataToDisplay = searchParams ? filteredData : tableData;

  // Pagination logic
  const pageCount = Math.ceil(dataToDisplay.length / pageSize);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <>
      {loading ? (
        <Loading />) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li> <Link to={`/blastingsheetlist?moduleId=${moduleId}&menuId=${menuId}`}>Process Data Entry List</Link></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li><h1>Downgrade or Send to Inlet</h1></li>
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
                    {showTable && (
                      <div className='table-responsive' id='custom-scroll'>
                        <table>
                          <thead>
                            <tr style={{ background: "#5A245A" }}>
                              <th style={{ minWidth: "80px" }}>Sr. No. </th>
                              <th style={{ minWidth: "80px" }}>Pipe No.</th>
                              <th style={{ minWidth: "90px" }}>ASL No.</th>
                              <th style={{ minWidth: "90px" }}>Source</th>
                              <th style={{ minWidth: "70px" }}>Date</th>
                              <th style={{ minWidth: "150px" }}>Process Sheet No.</th>
                              <th style={{ minWidth: "200px" }}>Project Name</th>
                              <th style={{ minWidth: "120px" }}>Remarks</th>
                              <th style={{ minWidth: "240px" }}>Actions</th>
                              <th style={{ minWidth: "70px" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataToDisplay.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((item, index) => (
                              <tr key={index}>
                                <td>{(currentPage * pageSize) + index + 1}</td>
                                <td>{item.pipino || "-"}</td>
                                <td>{item.aslno || "-"}</td>
                                <td>{item.remark || "-"}</td>
                                <td>{new Date(item.date).toLocaleDateString("en-GB") || "-"}</td>
                                <td>{item.proseccsheetno.split('/').slice(-2).join('/') || "-"}</td>
                                <td>{item.projectname || "-"}</td>
                                <td>{item.remarks || "-"}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <div className="ShowtableBox mr-2">
                                      <button
                                        type="button"
                                        disabled={item.pm_pipe_status === "IN" || item.pm_pipe_status === "DG"}
                                        onClick={() => handlePipeAction(item, "IN")}
                                      >
                                        Send to inlet
                                      </button>
                                    </div>
                                    <div className="ShowtableBox downgraded-button">
                                      <button
                                        type="button"
                                        disabled={item.pm_pipe_status === "IN" || item.pm_pipe_status === "DG"}
                                        onClick={() => handlePipeAction(item, "DG")}
                                      >
                                        Downgrade
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td>{item.pm_pipe_status === 'IN' ? "Pipe sent to inlet" : item.pm_pipe_status === 'DG' ? "Pipe downgraded" : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
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