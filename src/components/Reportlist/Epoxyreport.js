import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import './Reportlist.css'
import Sampleonereport from '../../components/Common/Sample-onereport/Sampleonereport'

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import axios from 'axios';
// import Environment from "../../environment";

function Epoxyreport() {
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // axios.get(Environment.BaseAPIURL + "/api/User/reportlist")
    axios.get('https://tempapi.proj.me/api/LeZKGSqrU')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const filterData = () => {
    return data.filter(item => {
      const testDate = new Date(item.testDate);
      return (!fromDate || testDate >= new Date(fromDate)) && (!toDate || testDate <= new Date(toDate));
    });
  };

  const filteredData = filterData();

  const actionCellRenderer = (params) => {
    const { onViewClick, onDownloadClick } = params.colDef.cellRendererParams;

    return (
      <div className="action-icons">
        <i className="fas fa-eye" onClick={() => onViewClick(params.data)} style={{ color: "#4CAF50", marginRight: '8px', cursor: 'pointer' }}></i>
        <i className="fas fa-download" onClick={() => onDownloadClick(params.data)} style={{ color: "#FF9800", cursor: 'pointer' }}></i>
      </div>
    );
  };

  const handleViewClick = (rowData) => {
    navigate(`/Sampleonereport`);
    // navigate(`/Sampleonereport/${rowData.id}`);
  };

  const handleDownloadClick = (rowData) => {
    Sampleonereport.handleDownload(rowData);
  };

  const columnDefs = [
    { headerName: 'S No.', field: 'sno', width: 80 },
    { headerName: 'Client Name', field: 'clientName', width: 190 },
    { headerName: 'Project Name', field: 'projectName', width: 190 },
    { headerName: 'Process Sheet No.', field: 'processSheet', width: 220 },
    { headerName: 'Test Date', field: 'testDate', width: 130 },
    { headerName: 'Test / Inspection No.', field: 'reportNo', width: 180 },
    {
      headerName: "Action",
      cellRenderer: actionCellRenderer,
      cellRendererParams: {
        onViewClick: (rowData) => handleViewClick(rowData),
        onDownloadClick: (rowData) => handleDownloadClick(rowData),
      },
      width: 80,
    },
  ];

  return (
    <>
      {loading ? (<Loading />) : (
        <>
          <Header />
          <section className='InnerHeaderPageSection'>
            <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <ul>
                    <li> <Link to='/dashboard'>Quality Module</Link></li>
                    <b style={{ color: '#fff' }}>/ &nbsp;</b>
                    <li> <Link to='/inspectiontesting'>Report List</Link> <b style={{ color: '#fff' }}></b></li>
                    <li><h1>/ &nbsp; EPOXY </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className='EpoxyreportlistPageSection'>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <div className='EpoxyreportlistTables'>
                    <div className='tableheaderflex'>
                      <div className="tableheaderfilter">
                        <span> <i className="fas fa-filter"></i> Filter Test Date</span>
                        <label> From Date:
                          <DatePicker
                            maxDate={new Date()}
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            dateFormat="dd/MMM/yyyy"
                            placeholderText="DD/MMM/YYYY"
                          />
                        </label>
                        <label> To Date:
                          <DatePicker
                            maxDate={new Date()}
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            dateFormat="dd/MMM/yyyy"
                            placeholderText="DD/MMM/YYYY"
                          />
                        </label>
                      </div>
                    </div>
                    <div className='ag-theme-alpine' style={{ height: '400px', width: '100%' }} >
                      <AgGridReact
                        columnDefs={columnDefs}
                        rowData={filteredData}
                        pagination={true}
                        paginationPageSize={10}
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
      )}
    </>
  );
}

export default Epoxyreport;