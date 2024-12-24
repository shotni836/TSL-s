import React, { useState, useEffect } from 'react';
import './Workinstructionlist.css'
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
import * as XLSX from "xlsx";
import { AgGridReact } from "ag-grid-react";
<<<<<<< HEAD
import secureLocalStorage from 'react-secure-storage';
import { encryptData } from '../Encrypt-decrypt';

function Workinstructionlist() {
  const token = secureLocalStorage.getItem('token')
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get('moduleId');
  const menuId = queryParams.get('menuId');
=======

function Workinstructionlist() {

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
    GeWorkinstructiontList();
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
  let testingtypeval = "Work Instruction";
  let addscreenurl = "";

  addscreenurl = "/Workinstruction";


  const filteredData = filterData();

  // -------------------------------------------------

  const GeWorkinstructiontList = async () => {
    try {
      const params = new URLSearchParams();

<<<<<<< HEAD
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWorkinstructionData`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
=======
      const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetWorkinstructionData`);
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
      if (Array.isArray(response.data)) { // Check if response.data is an array
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
    // window.open('/workinstructionview', '_blank');
<<<<<<< HEAD
    navigate(`/Workinstructionview?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(data.data.pm_workinst_detail_id)}`, '_blank')
=======
    navigate(`/Workinstructionview?id=${data.data.pm_workinst_detail_id}`, '_blank')
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
  };


  const handleListClick = (data) => {
    console.log(data)
<<<<<<< HEAD
    navigate(`/Workinstructionedit?moduleId=${moduleId}&menuId=${menuId}&id=${encryptData(data.data.pm_workinst_detail_id)}`, '_blank')
=======
    navigate(`/Workinstructionedit?id=${data.data.pm_workinst_detail_id}`, '_blank')
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
  };

  const actionCellRenderer = (params) => (
    <div className="action-icons">
      <i className="fas fa-eye" onClick={() => handleViewClick(params)} style={{ color: "#4CAF50", margin: '4', paddingRight: "10px", cursor: "pointer", borderRight: "1px solid #afafaf", marginRight: "10px" }}></i>

      <i className="fas fa-edit" onClick={() => handleListClick(params)} style={{ color: "#4CAF50", margin: '4', paddingRight: "10px", cursor: "pointer" }}></i>
    </div>
  );

  const columnDefs = [
    { headerName: 'S No.', field: 'sno', width: 70, headerClass: 'custom-header', resizable: true },
    { headerName: "Document Title", field: "pm_workinst_doc_title", width: 400, headerClass: 'custom-header', resizable: true },
    { headerName: "Revision No.", field: "pm_workinst_doc_rev", width: 180, headerClass: 'custom-header align-center', resizable: true },
    {
      headerName: "Revision Date",
      field: "pm_workinst_rev_date",
      width: 200,
      headerClass: 'custom-header align-center',
      resizable: true,
      valueFormatter: (params) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString('en-GB');
        }
        return '';
      }
    },
    { headerName: "Issue No.", field: "pm_workinst_doc_issue", width: 100, headerClass: 'custom-header align-center', resizable: true },
    {
      headerName: "Action",
      cellRenderer: actionCellRenderer,
      width: 100, headerClass: 'custom-header'
    },
  ];

  const navigate = useNavigate();

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

<<<<<<< HEAD
=======
    console.log("Column Headers:", headers);
    console.log("Column Fields:", fields);

>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
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

    XLSX.writeFile(workbook, "Work-instruction-list.xlsx");
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
                      <li><h1>/ &nbsp; Work Instruction List</h1></li>
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
<<<<<<< HEAD
                          <span><i className="fas fa-filter"></i> Filter Data</span>
=======
                          <span><i className="fas fa-filter"></i> Filter Test Data</span>
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
                          <label>
                            From Date:
                            {/* <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /> */}
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
                            {/* <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /> */}
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
                          <Link style={{ float: 'right' }} to={addscreenurl}><i className="fas fa-plus"></i> Add</Link>
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

export default Workinstructionlist