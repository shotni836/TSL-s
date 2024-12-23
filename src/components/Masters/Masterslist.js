import React, { useState, useEffect } from 'react';
import './Masters.css'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from "../../environment";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";


function Masterslist() {

  // DATE FILTER  
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // GET MASTER API

  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const getMasterlist = async () => {
      try {
        const masterresponse = await axios.get(`${Environment.BaseAPIURL}/api/User/GetcoparamtypeData`);
        const getmasterresponse = masterresponse.data;
        const formattedOptions = getmasterresponse.map((data) => ({
          value: data.id,
          label: data.name,
        }));

        setStatusOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching master list data:", error);
      }
    };

    getMasterlist();
  }, []);

  const handleStatusChange = async (selectedmasterOption) => {
    // console.log(selectedmasterOption, 51)
    setSelectedStatus(selectedmasterOption);

    if (true) {
      try {
        const response = await axios.get(
          `${Environment.BaseAPIURL}/api/User/GetcoparamData?coparamtypeid=${selectedmasterOption.value}&compid=1&locationid=1`
        );
        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    } else {
    }
  };

  // LOADING

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, []);

  // ---------------------------------------------------
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
                      <li> <Link to='/dashboard'>Quality Admin (Dashboard)</Link></li>
                      <li><h1>/ &nbsp; Masters List</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='RawmateriallistPageSection MasterslistPageSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='RawmateriallistTables '>
                      <h4>Masters <span>- List page</span></h4>
                      <div className='tableheaderflex'>
                        <div className='tableheaderfilter'>
                          <span><i className="fas fa-filter"></i> Filter Test Data</span>
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
                          <Link style={{ float: 'right' }} to={`/masters?coparamtypeid=${selectedStatus?.value}&coparamtypename=${selectedStatus?.label}`}><i className="fas fa-plus"></i> Add</Link>
                        </div>
                      </div>

                      <div className="fadedIcon" style={{ display: 'block' }}>
                        <div className='MastersFlexBox' style={{ width: '30%' }}>
                          <label htmlFor="">Masters</label>
                          <Select
                            className="select"
                            isSearchable
                            isClearable
                            isMulti={false}
                            placeholder="Search or Select status..."
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={handleStatusChange}
                          />
                        </div>

                        <ul style={{ display: "none" }}>
                          <li><i className="fa-solid fa-eye" style={{ color: "#4caf50" }} ></i>View</li>
                          <li><i className="fa-solid fa-edit" style={{ color: "#3d7edb" }} ></i>Edit</li>
                        </ul>
                      </div>

                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <div className=''>
                          {tableData.length > 0 && (
                            <table>
                              <thead>
                                <tr>
                                  <th style={{ width: '80px' }}>S. No.</th>
                                  <th>Name</th>
                                  <th>Alias Name</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.map((item, index) => (
                                  <tr key={item.co_param_val_id}>
                                    <td>{index + 1}</td>
                                    <td>{item.co_param_val_name}</td>
                                    <td>{item.co_param_val_alias}</td>
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
              </div>
            </section>
            <Footer />
          </>
      }
    </>
  )
}

export default Masterslist
