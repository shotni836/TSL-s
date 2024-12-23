import React, { useState, useEffect } from 'react';
import './Tallytagmappinglist.css';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import InnerHeaderPageSection from "../../components/Common/Header-content/Header-content";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Environment from "../../environment";
import axios from 'axios';
import secureLocalStorage from "react-secure-storage";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import Pagination from '../Common/Pagination/Pagination';
import { encryptData } from '../Encrypt-decrypt';

function Tallytagmappinglist() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const token = secureLocalStorage.getItem('token');

  const userId = secureLocalStorage.getItem("userId");
  const empId = secureLocalStorage.getItem("empId");

  const [loading, setLoading] = useState(true);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [clientFilter, setClientFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetTallyTagMappingLists`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (Array.isArray(response.data)) {
        setRawMaterials(response.data);
        fetchPermissions();
      } else {
        toast.error('Unexpected data format received from the API.');
      }
    } catch (error) {
      toast.error('Failed to load data: ' + error.message);
      console.error('Failed to load data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
        params: { UserId: encryptData(userId), PageId: menuId },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPermissions(response.data[0]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleViewClick = (row) => {
    navigate(`/viewtallytagmapping?moduleId=${moduleId}&menuId=${menuId}&tallySheetId=${encryptData(row.tallySheetId)}`);
  };

  const handleEdit = (row) => {
    navigate(`/edittallytagmapping?moduleId=${moduleId}&menuId=${menuId}&tallySheetId=${encryptData(row.tallySheetId)}`);
  };

  const getUniqueOptions = (data, key) => {
    return [...new Set(data.map(item => item[key]))];
  };

  const renderDropdownFilters = () => {
    const uniqueClients = getUniqueOptions(rawMaterials, 'clientName');

    return (
      <>
        <div className="form-group">
          <label>Client</label>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueClients.map((client, index) => (
              <option key={index} value={client}>{client}</option>
            ))}
          </select>
        </div>

        <i className="fa fa-refresh" onClick={resetFilters}></i>
      </>
    );
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    setClientFilter('');
    setSearchText('');
  };

  const handleDelete = async (row) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await axios.post(`${Environment.BaseAPIURL}/api/User/UpdatePipeDleteStatus`, {
                tallySheetId: parseInt(row.tallySheetId, 10),
                pipeId: parseInt(row.pipeId, 10),
                pipeDeleteStatus: true
              }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              if (response.status === 200) {
                toast.success(response.data.responseMessage);
                getList();
              } else {
                toast.error(response.data.responseMessage);
              }
            } catch (error) {
              console.error('Error deleting data:', error);
              toast.error("Failed to remove");
            }
          }
        },
        { label: 'No' }
      ]
    });
  };

  const filteredRawMaterials = rawMaterials.filter(item => {
    const inspectionDate = new Date(item.importDate);
    return (!fromDate || inspectionDate >= fromDate) &&
      (!toDate || inspectionDate <= toDate) &&
      (!clientFilter || item.clientName === clientFilter) &&
      (!searchText || item.processSheetNo.toLowerCase().includes(searchText.toLowerCase()))
  });

  const displayData = filteredRawMaterials.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const pageCount = Math.ceil(filteredRawMaterials.length / pageSize);

  const handlePageClick = data => {
    setCurrentPage(data.selected);
  };

  return (
    <>
      {loading ? <Loading /> :
        <>
          <Header />
          <InnerHeaderPageSection
            linkTo={`/ppcdashboard?moduleId=${moduleId}`}
            linkText="PPC Module"
            linkText2="Tally Tag Mapping List"
          />
          <section className='TallytagmappinglistPageSection'>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <div className='TallytagmappinglistTables'>
                    <span><i className="fas fa-filter"></i> Filter</span>
                    <div className='tableheaderflex'>
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
                      <div className='tableheaderAddbutton'>
                        {permissions?.createPerm === "1" && (
                          <Link to={`/tallytagmapping?moduleId=${moduleId}&menuId=${menuId}`} target='_blank'>
                            <i className="fas fa-plus"></i> Add
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="fadedIcon">
                      <div className='ProcessSheetNoBox'>
                        <label htmlFor="">Search Process Sheet No.</label>
                        <input
                          type="text"
                          placeholder="Search by Process Sheet No."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>
                      <ul className='Rawmaterialinspectionlistlegend'>
                        <li><i className="fas fa-eye" style={{ color: "#4caf50" }}></i> View</li>
                        <li><i className="fas fa-edit" style={{ color: "#ff9800" }}></i> Edit</li>
                        <li><i className="fas fa-trash-alt" style={{ color: "#ff5252" }} ></i>Delete</li>
                      </ul>
                    </div>
                    <div className='table-responsive' id='custom-scroll'>
                      <table>
                        <thead>
                          <tr style={{ background: 'rgb(90, 36, 90)' }}>
                            <th style={{ minWidth: '60px' }}>Sr. No.</th>
                            <th style={{ minWidth: '130px' }}>Process Sheet No.</th>
                            <th style={{ minWidth: '130px' }}>Client Name</th>
                            <th style={{ minWidth: '50px' }}>Tallysheet No.</th>
                            <th style={{ minWidth: '80px' }}>Date</th>
                            <th style={{ minWidth: '90px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayData.length === 0 ? (
                            <tr><td colSpan="6">No data found.</td></tr>
                          ) : (
                            displayData.map((row, index) => (
                              <tr key={index}>
                                <td>{currentPage * pageSize + index + 1}</td>
                                <td>{row.processSheetNo}</td>
                                <td>{row.clientName}</td>
                                <td>{row.tallySheetNo}</td>
                                <td>{row.importDate}</td>
                                <td>
                                  <div style={{ display: 'flex' }}>
                                    {permissions?.indexPerm === "1" && (
                                      <i className="fas fa-eye" onClick={() => handleViewClick(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.editPerm === "1" && (
                                      <i className="fas fa-edit" onClick={() => handleEdit(row)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                    )}
                                    {permissions?.deletePerm === "1" && (
                                      <i className="fas fa-trash-alt" onClick={() => handleDelete(row)} style={{ color: '#ff5252', cursor: 'pointer', margin: '4px' }}></i>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      }
    </>
  );
}

export default Tallytagmappinglist;