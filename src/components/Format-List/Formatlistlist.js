import React, { useState, useEffect } from 'react';
import './Formatlistlist.css'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
<<<<<<< HEAD
import { Link, useNavigate, useLocation } from 'react-router-dom';
=======
import { Link, useNavigate } from 'react-router-dom';
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from "../../environment";
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";
<<<<<<< HEAD
import secureLocalStorage from 'react-secure-storage';
import { encryptData } from '../Encrypt-decrypt';

function Formatlistlist() {
  const navigate = useNavigate();
  const token = secureLocalStorage.getItem('token')
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get('moduleId');
  const menuId = queryParams.get('menuId');
=======

function Formatlistlist() {

  const navigate = useNavigate();

>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [testingType, setTestingType] = useState('');

  useEffect(() => {
    // fetchData();
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, []);

  useEffect(() => {
    GetFormatlistlistData();
  }, []);

  const filterData = () => {
    try {
      const filteredData = data.filter(item => {
        const testDate = new Date(item.testDate);
        return (!fromDate || testDate >= new Date(fromDate)) && (!toDate || testDate <= new Date(toDate) &&
          (!testingType || item.testType === testingType));
      });
      return filteredData;
    } catch (ex) {
      console.log(ex);
    }
  };

  const searchParams = new URLSearchParams(document.location.search);
  let testingtype = searchParams.get('testingtype');
  let testingtypeval = "Format List";

  const filteredData = filterData();

  // -------------------------------------------------

  const GetFormatlistlistData = async () => {
    try {
      const params = new URLSearchParams();
      params.append('pm_process_type_id', testingtype);
<<<<<<< HEAD
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetFormatlistlistData`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
=======
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetFormatlistlistData`);
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        toast.error('Data received from the API is not in the expected format.');
      }
    } catch (error) {
      toast.error('Failed' + error.message);
      console.error('Failed', error.message);
    }
  };

  let sno = 0;
  data.forEach(function (value, i) {
    ++sno;
    value['sno'] = sno;
  });

  const handleViewClick = (data) => {
    console.log(data)
<<<<<<< HEAD
    navigate(`/formatlistview?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(data.data.pm_format_id)}`)
  };

  const handleListClick = (data) => {
    navigate(`/formatlistedit?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(data.data.pm_format_id)}`)
=======
    navigate(`/formatlistview?id=${data.data.pm_format_id}`)
  };

  const handleListClick = (data) => {
    navigate(`/formatlistedit?id=${data.data.pm_format_id}`)
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
  };

  const actionCellRenderer = (params) => (
    <div className="action-icons">
<<<<<<< HEAD
      <Link to={`/formatlistview?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(params.data.pm_format_id)}`} className="fas fa-eye" style={{ color: "#4CAF50", margin: '4', paddingRight: "10px", cursor: "pointer", borderRight: "1px solid #afafaf", marginRight: "10px" }}></Link>

      <Link to={`/formatlistedit?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(params.data.pm_format_id)}`} className="fas fa-edit" style={{ color: "#4CAF50", margin: '4', paddingRight: "10px", cursor: "pointer" }}></Link>
=======
      <Link to={`/formatlistview?id=${params.data.pm_format_id}`} className="fas fa-eye" style={{ color: "#4CAF50", margin: '4', paddingRight: "10px", cursor: "pointer", borderRight: "1px solid #afafaf", marginRight: "10px" }}></Link>

      <Link to={`/formatlistedit?id=${params.data.pm_format_id}`} className="fas fa-edit" style={{ color: "#4CAF50", margin: '4', paddingRight: "10px", cursor: "pointer" }}></Link>
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
    </div>
  );

  const columnDefs = [
    { headerName: 'S No.', field: 'sno', width: 65, headerClass: 'custom-header' },
    { headerName: "Format Description", field: "pm_format_desc", width: 450, headerClass: 'custom-header' },
    { headerName: "Format No.", field: "pm_format_no", width: 200, headerClass: 'custom-header' },
    { headerName: "Revision No.", field: "pm_format_revision", width: 140, headerClass: 'custom-header align-center' },
    {
      headerName: "Date",
      field: "pm_format_rev_date",
      width: 180,
      headerClass: 'custom-header align-center',
      valueFormatter: (params) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString('en-GB');
        }
        return '';
      }
    },
    {
      headerName: "Action",
      cellRenderer: actionCellRenderer,
      width: 90,
      headerClass: 'custom-header'
    },
  ];


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
      ...data.map((item) => fields.map((field) => item[field])),
    ];
    // const worksheetData = [
    //   headers,
    //   ...data.map((item) => fields.map((field) => item[field])),
    // ];
    console.log(worksheetData, "worksheetData")
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const colWidths = columnDefs.map((col) => ({ wpx: col.width }));
    worksheet["!cols"] = colWidths;

    console.log(data, "checks")

    XLSX.writeFile(workbook, "format-list.xlsx");
  };

  const generateExcel = () => {
    const filteredData = filterData();
    console.log(filteredData, "check")
    createExcel(filteredData);
  };

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
<<<<<<< HEAD
                      <li> <Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
=======
                      <li> <Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
                      <li><h1>/ &nbsp; {testingtypeval}</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='RawmateriallistPageSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='RawmateriallistTables'>
                      <h4>{testingtypeval} <span>- List page</span></h4>
                      <div className='tableheaderflex'>
                        <div className='tableheaderfilter'>
                          <span><i className="fas fa-filter"></i> Filter Test Data</span>
                          <label>
                            From Date:
                            <DatePicker
                              maxDate={Date.now()}
                              selected={fromDate}
                              onChange={date => setFromDate(date)}
                              dateFormat="dd/MMM/yyyy"
                              placeholderText="DD/MMM/YYYY"
                            />
                          </label>
                          <label>
                            To Date:
                            <DatePicker
                              maxDate={Date.now()}
                              selected={toDate}
                              onChange={date => setToDate(date)}
                              dateFormat="dd/MMM/yyyy"
                              placeholderText="DD/MMM/YYYY"
                            />
                          </label>
                        </div>
                        <div className='tableheaderAddbutton'>
                          <Link style={{ float: 'right' }} to='/Formatlist'><i className="fas fa-plus"></i> Add</Link>
                        </div>
                      </div>

                      <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }} >
                        <div className='DownloadExcelFlexBox'>
                          <ul>
                            <li><i className="fa-solid fa-eye" style={{ color: "#4caf50" }} ></i>View</li>
                            <li><i className="fa-solid fa-edit" style={{ color: "#4caf50" }} ></i>Edit</li>
                          </ul>
                          <div>
                            <button onClick={generateExcel} className="btn btn-secondary">Download Excel</button>
                          </div>
                        </div>
                        <AgGridReact
                          columnDefs={columnDefs}
                          rowData={filteredData}
                          pagination={true}
                          paginationPageSize={50}
                          suppressDragLeaveHidesColumns="true"
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

export default Formatlistlist;
