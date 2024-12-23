import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Modal } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import axios from "axios";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from "../Loading";
import Pagination from '../Common/Pagination/Pagination';
import Environment from "../../environment";
import InnerHeaderPageSection from "../../components/Common/Header-content/Header-content";
import Nocontract from "../../assets/images/nocontract.png";
import "./Employeelist.css";
import ExportData from "../../components/Common/Export-data/ExportData";
import secureLocalStorage from "react-secure-storage";
import { toast } from 'react-toastify';
import { encryptData } from '../Encrypt-decrypt';

function Employeelist() {
  const userId = secureLocalStorage.getItem('userId');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [viewComplete, setViewComplete] = useState(null);
  const [toggleValue, setToggleValue] = useState("Y");
  const [showUpdated, setShowUpdated] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [permissions, setPermissions] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);
  const userDepartment = secureLocalStorage.getItem('userDepartment');
  const userRole = secureLocalStorage.getItem('userRole');
  const token = secureLocalStorage.getItem('token');

  const hasMounted = useRef(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId?UserId=${encryptData(userId)}&PageId=${menuId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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

  const fetchData = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/getallemp?EMProle=${encryptData(toggleValue)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const employeeList = response.data.EmployeeList || [];
      const updateInfo = response.data.UpdateInfo || [];
      const updatedUsers = updateInfo
        .filter(info => info.RequestRaised === 1)
        .map(info => info.UserId);
      const updatedEmployeeList = employeeList.map(user => ({
        ...user,
        update: updatedUsers.includes(user.UserId) ? '1' : '0'
      }));
      setTableData(updatedEmployeeList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchDataAndRoles = async () => {
      if (hasMounted.current) {
        await fetchData();
        if (toggleValue === "N") {
          fetchRoleList();
        }
      } else {
        hasMounted.current = true;
      }
    };

    fetchDataAndRoles();
  }, [toggleValue]);

  const fetchRoleList = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetAllRoleList`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRoleTypes(response.data);
    } catch (error) {
      console.error("Error fetching role types:", error);
    }
  };

  const handleToggle = () => {
    setToggleValue(prev => (prev === "N" ? "Y" : "N"));
  };

  const handleUpdateCheckboxChange = () => {
    setShowUpdated(!showUpdated);
  };

  const handleViewNotCompleteClick = () => {
    setViewComplete(prev => (prev === false ? null : false));
    setSearchName("");
    setFilterValue("");
  };

  const handleViewCompleteClick = () => {
    setViewComplete(prev => (prev === true ? null : true));
    setSearchName("");
    setFilterValue("");
  };

  const resetFilter = () => {
    setSearchName('');
    setFilterValue('');
    setViewComplete(null);
    setSelectedRoles({});
  };

  const filteredData = tableData.filter(row => {
    const isAdmin = userRole === 'Admin';
    const departmentMatch = isAdmin || row.Department === userDepartment;
    // const departmentMatch = row.Department === userDepartment;
    const searchLowerCase = searchName.toLowerCase();
    const anyFieldMatch = ["UserId", "FullName", "MobileNo", "MailId"].some(key =>
      row[key]?.toLowerCase().includes(searchLowerCase)
    );
    const filterMatch = !filterValue || row.EmployeeType.toLowerCase() === filterValue.toLowerCase();
    const viewCompleteMatch = viewComplete !== null ? (row.Gender && row.EmpStatus !== 0) === viewComplete : true;
    const updateMatch = showUpdated ? row.update === "1" : true;
    return departmentMatch && anyFieldMatch && filterMatch && viewCompleteMatch && updateMatch;
  });

  const handleSuggestionClick = suggestion => {
    setSearchName(suggestion.FullName);
    setSuggestions([]);
    setSelectedRoles({});
  };

  const handleRoleUpdate = async userId => {
    const roleId = selectedRoles[userId];
    if (!roleId) {
      toast.error("Please select a role.");
      return;
    }
    if (window.confirm("Are you sure you want to update the role?")) {
      try {
        await axios.post(`${Environment.BaseAPIURL}/api/User/roleassingemplyee?empiduserid=${encryptData(userId)}&empyeeroleid=${encryptData(roleId)}`,
          {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchData();
      } catch (error) {
        console.error("Error updating role:", error);
      }
    }
  };

  const handleRoleSelectChange = (userId, role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  const handlePageClick = data => {
    setCurrentPage(data.selected);
  };

  const openModal = UserId => {
    setSelectedUserId(UserId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedUserId(null);
  };

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const handleSwitchToggle = async (UserId, newStatus) => {
    const updatedTableData = tableData.map(row => {
      if (row.UserId === UserId) {
        return { ...row, EmpStatus: newStatus };
      }
      return row;
    });
    setTableData(updatedTableData);
    const statusVal = newStatus === 1 ? "A" : "D";
    try {
      await axios.post(`${Environment.BaseAPIURL}/api/User/modifyuserstatus?P_statusVal=${encryptData(statusVal)}&userid=${encryptData(UserId)}`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    } catch (error) {
      console.error("Error toggling employee status:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedDate) {
      toast.error("Please select a user and fill in the date field before submitting.");
      return;
    }
    const formattedDate = selectedDate.toISOString().split('T')[0];
    try {
      await axios.post(`${Environment.BaseAPIURL}/api/User/modifyuserstatus?P_statusVal=${encryptData('NC')}&userid=${encryptData(selectedUserId)}`, {
        UserId: selectedUserId,
        Date: formattedDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTableData(prev =>
        prev.map(row =>
          row.UserId === selectedUserId
            ? { ...row, textColor: "Updated Successfully", EmpStatus: 0 }
            : row
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const displayedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const pageCount = Math.ceil(filteredData.length / pageSize);

  // displaying suggestions
  const renderSuggestions = () => {
    return (
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleSuggestionClick(suggestion)}> {suggestion.FullName}</li>
        ))}
      </ul>
    );
  };

  // To export PDF & EXCEL
  const columns = [
    { header: 'TATA / User Id', accessor: 'UserId' },
    { header: 'Full Name', accessor: 'FullName' },
    { header: 'Mobile No.', accessor: 'MobileNo' },
    { header: 'Email Id', accessor: 'MailId' },
    { header: 'Employee Type', accessor: 'EmployeeType' },
    { header: 'Role', accessor: 'Role' },
  ];

  return (
    <>
      {loading ? (<Loading />) : (
        <>
          <Header />
          <InnerHeaderPageSection
            linkTo={`/hrdashboard?moduleId=${moduleId}`}
            linkText="UM Module"
            linkText2="Employee List"
          />
          <section className="EmployeeListSectionPage">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ExportData data={filteredData} columns={columns} fileName="EmployeeList" />
                  {permissions.searchPerm === "1" && (
                    <ul className="IndicatorsUllist">
                      <div className="search-container">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchName}
                          onChange={(e) => {
                            setSearchName(e.target.value);
                            setSuggestions(
                              tableData.filter(row => ["UserId", "FullName", "MobileNo", "MailId"]
                                .some(key => row[key]?.toLowerCase().includes(e.target.value.toLowerCase()))
                              )
                            );
                          }}
                        />
                        {suggestions.length > 0 && searchName !== '' && renderSuggestions()}
                        <select
                          style={{ marginRight: '20px' }}
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="contractual">Contractual</option>
                          <option value="permanent">Permanent</option>
                          <option value="subsidiary">Subsidiary</option>
                          <option value="tpi">TPI</option>
                        </select>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={toggleValue === "Y"}
                          onChange={handleToggle}
                        />
                        <label>Role Assign</label>
                        <div className="form-check" style={{ marginLeft: "20px" }}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={showUpdated}
                            onChange={handleUpdateCheckboxChange}
                          />
                          <label>Update Request</label>
                        </div>
                        <i className="fa fa-refresh" onClick={resetFilter}></i>
                      </div>
                      <li onClick={handleViewNotCompleteClick}><i className="fa-solid fa-eye"></i>View (Not Complete)</li>
                      <li style={{ color: "green" }} onClick={handleViewCompleteClick}><i className="fa-solid fa-eye"></i>View (Complete)</li>
                      <li><div className="form-check form-switch"><input className="form-check-input" disabled />Inactive</div></li>
                      <li><div className="form-check form-switch" style={{ color: "#000" }}><input className="form-check-input" type="checkbox" checked disabled />Active</div></li>
                      <li style={{ color: "black" }}> <img src={Nocontract} alt="" /> No Contract</li>
                    </ul>
                  )}
                  <div style={{ overflowX: 'auto' }} id="custom-scroll">
                    <table className="EmployeeListTable">
                      <thead>
                        <tr>
                          <th style={{ maxWidth: "70px" }}>TATA / User Id</th>
                          <th>Full Name</th>
                          <th>Mobile No.</th>
                          <th>Email Id</th>
                          <th>Employee Type</th>
                          <th style={{ width: toggleValue === "Y" ? undefined : "250px" }}>Role</th>
                          <th style={{ width: "165px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedData.length === 0 ? (
                          <tr> <td colSpan="7">No record found.</td></tr>
                        ) : (
                          displayedData.map((row, index) => (
                            <tr key={index} style={{ backgroundColor: row.update === "1" ? "#ffebed" : "transparent" }}>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>{row.UserId}</td>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>{row.FullName}</td>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>{row.MobileNo}</td>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>{row.MailId}</td>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>{row.EmployeeType}</td>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>
                                {toggleValue === "Y" ? (
                                  row.Role
                                ) : (
                                  <div>
                                    <select
                                      style={{ cursor: 'pointer' }}
                                      name="role"
                                      value={selectedRoles[row.UserId] || ""}
                                      onChange={e => handleRoleSelectChange(row.UserId, e.target.value)}
                                      className="roleTypeSelect"
                                      disabled={row.Gender === null}
                                    >
                                      <option selected disabled value="">-- Select role type --</option>
                                      {roleTypes.map(roleType => (
                                        <option key={roleType.id} value={roleType.id}>{roleType.name}</option>
                                      ))}
                                    </select>
                                    {row.Gender === null && (
                                      <span onClick={() => toast.error("Employee should complete registration to assign a role")} style={{ cursor: 'pointer', marginLeft: '5px' }}>⚠️</span>
                                    )}
                                    {selectedRoles[row.UserId] && (
                                      <span>
                                        <span style={{ cursor: 'pointer' }} onClick={() => handleRoleUpdate(row.UserId)}>✔️</span>
                                        <span style={{ cursor: 'pointer' }} onClick={() => handleRoleSelectChange(row.UserId, "")}>❌</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{ color: row.EmpStatus === 0 ? "grey" : row.textColor }}>
                                {permissions.indexPerm === "1" && (
                                  <Link
                                    // to={showUpdated && row.update === "1" ? `/updateProfile?UserId=${row.UserId}` : `/profile?view&UserId=${row.UserId}`}
                                    to={row.update === "1" ? `/updateProfile?moduleId=${moduleId}&menuId=${menuId}&UserId=${encryptData(row.UserId)}` : `/profile?moduleId=${moduleId}&menuId=${menuId}&action=view)}&UserId=${encryptData(row.UserId)}`}
                                    style={{ color: row.Gender !== "" ? "green" : "grey" }} >
                                    <i className="fa-solid fa-eye" style={{ color: row.Gender !== null && row.EmpStatus !== 0 ? "green" : "grey" }} />
                                  </Link>
                                )}
                                {permissions.editPerm === "1" && (<Link to={`/profile?moduleId=${moduleId}&menuId=${menuId}&action=edit&UserId=${encryptData(row.UserId)}`}> <i className="fa-solid fa-edit" /></Link>)}
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={row.EmpStatus === 1}
                                    onChange={() => handleSwitchToggle(row.UserId, row.EmpStatus === 1 ? 0 : 1)}
                                    id={`toggleActiveSwitch${row.UserId}`}
                                  />
                                </div>
                                {permissions.deletePerm === "1" && (<img
                                  src={Nocontract}
                                  alt="NocontractImg"
                                  className={`${isModalOpen && selectedUserId === row?.UserId ? "grayscale" : ""} ${row.EmpStatus === 0 ? "grayscale" : ""}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (row && row.UserId) openModal(row.UserId);
                                  }}
                                />)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <Pagination pageCount={pageCount} onPageChange={handlePageClick} />

                  <Modal show={isModalOpen} onHide={closeModal}>
                    <Modal.Body className="EmployeeListModalBox">
                      <div className="EmployeeListModalHeader">
                        <img src={Nocontract} alt="Nocontractimg" />
                        <h2>No Contract</h2>
                      </div>
                      <div className="EmployeeListModalSection">
                        {selectedUserId !== null && (
                          <div className="form row m-0">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div className="form-group">
                                <label htmlFor="">User ID</label>
                                : <input type="text" value={tableData.find(user => user.UserId === selectedUserId)?.UserId} readOnly />
                              </div>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div className="form-group">
                                <label htmlFor="">Full Name</label>
                                : <input type="text" value={tableData.find(user => user.UserId === selectedUserId)?.FullName} readOnly />
                              </div>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <label htmlFor="">Last Working Date</label>
                              : <DatePicker
                                dateFormat="dd/MM/yyyy"
                                placeholderText="DD/MM/YYYY"
                                selected={selectedDate}
                                onChange={handleDateChange}
                                maxDate={new Date()}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="EmployeeListModalFooter">
                        <button className="CloseButton" onClick={closeModal}>Close</button>
                        <button className="SubmitButton" onClick={handleSubmit}>Submit</button>
                      </div>
                    </Modal.Body>
                  </Modal>
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

export default Employeelist;