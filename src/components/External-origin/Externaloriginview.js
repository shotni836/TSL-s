import React, { useState, useEffect } from 'react';
import './Externalorigin.css'

import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Processsheetfooter from '../Common/Process-sheet-footer/Processsheetfooter';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import axios from 'axios';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';

function Externaloriginview() {
  const token = secureLocalStorage.getItem('token')
  const searchParams = new URLSearchParams(window.location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const Id = searchParams.get("id");
  const today = new Date();
  const navigate = useNavigate()
  const empId = secureLocalStorage.getItem("empId")
  const formattedDate = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  const [formData, setFormData] = useState({
    pm_comp_id: "1",
    pm_location_id: "1",
    pm_project_id: "",
    pm_processsheet_id: "",
    pm_approver_type: "",
    pm_remarks: "",
    pm_testdate: formattedDate,
    pm_approver_status: "",
    pm_approved_by: empId.toString(),
  });
  const [ShowTestDate, setShowTestDate] = useState("");
  const [ShowApprovalSection, setShowApprovalSection] = useState("");
  const [approvalData, setApprovalData] = useState([])
  const [InspectionAgency, setInspectionAgency] = useState("");
  const [showWitness, setShowWitness] = useState(false)
  const location = useLocation();
  const pathSegments = location.pathname.split(/[\/&]/);
  const [workview, setWorkview] = useState([]);

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(Environment.BaseAPIURL + "/api/User/ProcessSheetApproval", {
        method: "POST",
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
      );

      const responseBody = await response.text();

      if (responseBody === "100" || responseBody === "200") {
        toast.success("Form data sent successfully!");
        navigate(`/externaloriginlist?moduleId=${moduleId}&menuId=${menuId}`)

      } else {
        console.error("Failed to send form data to the server. Status code:", response.status);
        console.error("Server response:", responseBody);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    }
  };

  const handleStatusChange = (value) => {
    if (value === "A") {
      setFormData({ ...formData, pm_approver_status: "A" });
      setShowWitness(true)
    }
    if (value === "R") {
      setFormData({ ...formData, pm_approver_status: "R" });
      setShowWitness(false)
    }
  };

  const params = new URLSearchParams(window.location.search);
  // Get the value of the 'pm_Approve_level' parameter
  const level = params.get('pm_Approve_level');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/ViewExternalOriginData?Id=${Id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = response.data[0];

        console.log(data)
        setWorkview(data);
        if (level == 'first') {
          setShowApprovalSection(true)
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetchData();
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, []);

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
                      <li> <Link to={`/dashboard?moduleId=${moduleId}`}> Quality Module </Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/externaloriginlist?moduleId=${moduleId}&menuId=${menuId}`}> External Origin List</Link></li>
                      <li><h1> / &nbsp; External Origin View  </h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='ExternaloriginSectionPage ExternaloriginViewSectionPage'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='ExternaloriginListBox'>
                      <h4>External Origin <span>- View Page</span></h4>
                      <div className='ExternaloriginTable' id='custom-scroll'>
                        <table>
                          <thead>
                            <tr style={{ background: 'rgb(90, 36, 90)' }}>
                              <th style={{ minWidth: '60px' }}>S No.</th>
                              <th style={{ minWidth: '160px' }}>Standard / Specification</th>
                              <th style={{ minWidth: '400px' }}>Document Description</th>
                              <th style={{ minWidth: '100px' }}>Revision No.</th>
                              <th style={{ minWidth: '140px' }}>Document Type</th>
                              <th style={{ minWidth: '100px' }}>Item Type</th>
                              <th style={{ minWidth: '200px' }}>Path</th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>{workview?.pm_tm_name}</td>
                              <td>{workview?.pm_tm_description}</td>
                              <td>{workview?.pm_tm_revision}</td>
                              <td>{workview?.pm_tm_doc_type}</td>
                              <td>{workview?.pm_tm_item_type}</td>
                              <td>{workview?.pm_tm_doc_path}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* <Processsheetfooter data={approvalData} /> */}
                      {/* {ShowApprovalSection && (
                        <>
                          <div class="row mt-4">
                            <div className="col-md-4 col-sm-4 col-xs-12">
                              <div className="form-group Remarksform-group">
                                <label htmlFor="">Remarks <b>*</b></label>
                                <input
                                  name="pm_remarks"
                                  class="form-control"
                                  value={formData.pm_remarks}
                                  onChange={handleChange}
                                  type="text"
                                  placeholder="Enter Approval/Rejection Remarks...."
                                  autoComplete="off"
                                />
                              </div>
                              <label className="custom-radio">
                                <input
                                  type="radio"
                                  className="Approveinput"
                                  name="pm_approver_status"
                                  id="btnaprv"
                                  onChange={() => handleStatusChange("A")}
                                />
                                <span className="radio-btn"><i class="fas fa-check"></i>Approve</span>
                              </label>
                              <label className="custom-radio">
                                <input
                                  type="radio"
                                  className="Rejectinput"
                                  name="pm_approver_status"
                                  id="btnreject"
                                  onChange={() => handleStatusChange("R")}
                                />
                                <span className="radio-btn"><i class="fas fa-times"></i>Reject</span>
                              </label>
                            </div>
                            <div className="col-md-5 col-sm-5 col-xs-12">
                              <div style={{ display: 'flex' }}>
                                {ShowTestDate && (
                                  <div className="form-group Remarksform-group EffectiveDateDiv">
                                    <label htmlFor="">Effective Date <b>*</b></label>
                                    <input
                                      type="date"
                                      class="form-control"
                                      autoComplete="off"
                                      name="pm_testdate"
                                      max={new Date().toISOString().split("T")[0]}
                                      value={formData.pm_testdate}
                                      onChange={handleChange}
                                      placeholder="Enter Effective Date...."
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-3 col-sm-3 col-xs-12">
                              <button type="button" className="SubmitBtn" onClick={handleSubmit}>Submit</button>
                            </div>
                          </div>
                        </>
                      )} */}
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

export default Externaloriginview