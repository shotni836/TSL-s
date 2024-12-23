import React, { useState, useEffect } from 'react';
import './Externalorigin.css'

import Loading from '../Loading';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'

import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from "../../environment";
import { AgGridReact } from "ag-grid-react";
import secureLocalStorage from 'react-secure-storage';

function Externaloriginlist() {

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const menuId = queryParams.get('menuId');
  const userId = secureLocalStorage.getItem('userId');
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [permissions, setPermissions] = useState({});

  const filterData = () => {
    const filteredData = data.filter(item => {
      const reportDate = new Date(item.reportDate);
      return (!fromDate || reportDate >= new Date(fromDate)) && (!toDate || reportDate <= new Date(toDate));
    });

    return filteredData;
  };

  const getProcessUrl = (data, action) => {
    return `/externaloriginview?id=${data.data.pm_test_method_id}&pm_Approve_level=${action}&menuId=${menuId}`;
  };

  const handleApproval = (data, action) => {
    navigate(getProcessUrl(data, action));
  };

  const filteredData = filterData();

  // --------------------------------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    GeWorkinstructiontList();
  }, [])

  const GeWorkinstructiontList = async () => {
    try {
      const params = new URLSearchParams();

      const response = await axios.get(Environment.BaseAPIURL + '/api/User/GetExternaloriginlistData');
      if (Array.isArray(response.data)) { // Check if response.data is an array
        setData(response.data);
        fetchPermissions()
      } else {
        toast.error('Data received from the API is not in the expected format.');
      }
    } catch (error) {
      toast.error('Failed' + error.message);
      console.error('Failed', error.message);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
        params: { UserId: userId, PageId: menuId }
      });
      setPermissions(response?.data[0]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  }

  const handleViewClick = (data) => {
    console.log(data)
    // window.open('/Formatlistview', '_blank');
    navigate(`/externaloriginview?id=${data.data.pm_test_method_id}`, '_blank')
  };

  const handleListClick = (data) => {
    navigate(`/externaloriginedit?menuId=${menuId}&id=${data.data.pm_test_method_id}`, '_blank');
  };

  const actionCellRenderer = (params) => (
    <div className="action-icons">
      <i className="fas fa-eye" onClick={() => handleViewClick(params)} style={{ color: "#4caf50", margin: '4', paddingRight: "10px", cursor: "pointer", borderRight: "1px solid #afafaf", marginRight: "10px" }}></i>
      <i className="fa-solid fa-edit" onClick={() => handleListClick(params)} style={{ color: "#4caf50", margin: '4', paddingRight: "10px", cursor: "pointer" }}></i>
      {permissions?.firstLevelApprove === "1" && (
        <i className="fas fa-check" onClick={() => handleApproval(params, "first")} style={{ color: "#4CAF50", borderLeft: '2px solid #a9a9a9', margin: '4', paddingLeft: "10px", cursor: "pointer", marginLeft: "10px" }}></i>
      )}
      {permissions?.secondLevelApprove === "1" && (
        <i className="fas fa-check-double" style={{ color: "#4CAF50", borderLeft: '2px solid #a9a9a9', margin: '4', paddingLeft: "10px", cursor: "pointer", marginLeft: "10px" }} onClick={() => handleApproval(params, "second")}></i>
      )}
    </div>
  );

  const columnDefs = [
    { headerName: 'S No.', field: 'pm_test_method_id', width: 65, headerClass: 'custom-header' },
    // { headerName: "Workinst Doc", field: "pm_workinst_detail_id", width: 150, headerClass: 'custom-header' },
    { headerName: "Standard / Specification", field: "pm_tm_name", width: 200, headerClass: 'custom-header' },
    { headerName: "Document Description", field: "pm_tm_description", width: 250, headerClass: 'custom-header' },
    { headerName: "Revision No.", field: "pm_tm_revision", width: 110, headerClass: 'custom-header align-center' },
    {
      headerName: "Revision Date", field: "pm_tm_rev_date", width: 120, headerClass: 'custom-header align-center',
      valueFormatter: (params) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString('en-GB');
        }
        return '';
      }
    },
    { headerName: "Publication Year", field: "pm_tm_publication_yr", width: 140, headerClass: 'custom-header align-center' },
    // { headerName: "Reaffirmed Year", field: "pm_tm_pub_reaffirmed_yr", width: 140, headerClass: 'custom-header align-center' },
    { headerName: "Location", field: "pm_tm_location", width: 100, headerClass: 'custom-header align-center' },
    { headerName: "Document Type", field: "pm_tm_doc_type", width: 140, headerClass: 'custom-header align-center' },
    { headerName: "Item Type", field: "pm_tm_item_type", width: 140, headerClass: 'custom-header align-center' },
    { headerName: "Path", field: "pm_tm_doc_path", width: 100, headerClass: 'custom-header align-center' },
    {
      headerName: "Action",
      cellRenderer: actionCellRenderer,
      width: 160, headerClass: 'custom-header'
    },
  ];

  return (
    <>
      {
        loading ?
          <Loading />
          :
          <>
            <Header />

            <section className='InnerHeaderPageSection'>
              <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <ul>
                      <li> <Link to='/dashboard?moduleId=618'> Quality Module </Link></li>
                      <li><h1> / &nbsp; External Origin List </h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='ExternaloriginListSectionPage'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='ExternaloriginListBox'>
                      <h4>External Origin <span>- List Page</span></h4>

                      <div className='tableheaderflex'>
                        <div className='tableheaderfilter'>
                          <span><i class="fas fa-filter"></i> Filter Test Data</span>
                          <label>
                            From Date:
                            <DatePicker
                              maxDate={Date.now()}
                              selected={fromDate}
                              onChange={setFromDate}
                              dateFormat="dd/MMM/yyyy"
                              placeholderText="DD/MMM/YYYY"
                            />
                          </label>
                          <label>
                            To Date:
                            <DatePicker
                              maxDate={Date.now()}
                              selected={toDate}
                              onChange={setToDate}
                              dateFormat="dd/MMM/yyyy"
                              placeholderText="DD/MMM/YYYY"
                            />
                          </label>
                        </div>
                        <div className='tableheaderAddbutton'>
                          <Link style={{ float: 'right' }} to='/externalorigin'><i class="fas fa-plus"></i> Add</Link>
                        </div>
                      </div>

                      <ul className='Rawmaterialinspectionlistlegend'>
                        <li>
                          <i class="fas fa-eye qcapp" style={{ color: '#4caf50' }}></i> View
                        </li>
                        <li>
                          <i class="fa-solid fa-edit rjct" style={{ color: '#3d7edb' }}></i> Edit
                        </li>
                      </ul>

                      <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }} >
                        <div className='DownloadExcelFlexBox'>
                          <ul>
                            <li><i className="fa-solid fa-eye" style={{ color: "#4caf50" }} ></i>View</li>
                            <li><i className="fa-solid fa-edit" style={{ color: "#4caf50" }} ></i>Edit</li>
                          </ul>

                          <a href="/assets/excel-files/calibration-list.xlsx" download>
                            <button className='DownloadExcelBtn'>
                              Download Excel
                            </button>
                          </a>
                        </div>
                        <AgGridReact
                          columnDefs={columnDefs}
                          rowData={filteredData}
                          pagination={true}
                          paginationPageSize={50}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Footer />
          </>
      }
    </>
  )
}

export default Externaloriginlist