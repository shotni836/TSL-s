import React, { useState, useEffect } from 'react';
import './Calibration.css'
import Loading from '../Loading';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../environment";
import Processsheetfooter from '../Common/Process-sheet-footer/Processsheetfooter';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import secureLocalStorage from 'react-secure-storage';

function Calibrationview() {
  const today = new Date();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    // fetchData();
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, []);

  // -----------------------------------------------

  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");
  console.log(Id);
  const [workview, setWorkview] = useState([]);

  let pm_project_id1 = null;
  let pm_processSheet_id1 = null;
  let pm_processtype_id1 = null;
  let pm_approved_by1 = null;
  let test_date1 = null;
  let pm_Approve_level1 = null;
  let menuId1 = null;
  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i].startsWith('id=')) {
      pm_project_id1 = pathSegments[i].substring('pm_project_id='.length);
    }
    if (pathSegments[i].startsWith('pm_Approve_level=')) {
      pm_Approve_level1 = pathSegments[i].substring('pm_Approve_level='.length);
    }
    if (pathSegments[i].startsWith('menuId=')) {
      menuId1 = pathSegments[i].substring('menuId='.length);
    }
  }

  const params = new URLSearchParams(window.location.search);
  // Get the value of the 'pm_Approve_level' parameter
  const level = params.get('pm_Approve_level');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetCalibrationDatabyid?id=${Id}`);
        const data = response.data;

        console.log(data);
        setWorkview(data[0]);
        console.log(pm_Approve_level1);

        if (level == 'first') {
          setShowApprovalSection(true)
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
      );

      const responseBody = await response.text();

      if (responseBody === "100" || responseBody === "200") {
        toast.success("Form data sent successfully!");
        navigate("/processsheetlist?menuId=7")

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

  // SHOW AUTO TEXT
  const [gageList, setgageList] = useState([
    {
      "Gagelistid": "Auto"
    }
  ]);

  const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
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
                      <li> <Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/calibrationlist?menuId=30`}> Calibration List</Link></li>
                      <li><h1>/ &nbsp; Calibration View</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="RegisterEmployeePageSection CalibrationPageSection">
              <div className="container">
                <div className="row">
                  <div className="">
                    <form className="RegisterEmployeeForm row m-0">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Calibration <span>- Add page</span></h4>
                      </div>

                      <div className="accordion" id="accordionExample">
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingOne">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                              Gage Status
                            </button>
                          </h2>
                          <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div className="accordion-body row m-0">
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='status'>Status</label>
                                <input type="text" value={workview?.status} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='pm_calib_last_calib'>Last Calibration</label>
                                <input type="text" value={formatDate(workview?.lastCalib)} />

                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='pm_calib_next_calib'>Next Calibration Due</label>
                                <input type="text" value={formatDate(workview?.nextCalib)} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingTwo">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                              Gage Information
                            </button>
                          </h2>
                          <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                            <div className="accordion-body row m-0">
                              {/* <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">GageList ID</label>
                                <input style={{ pointerEvents: 'none', background: "#f3f3f3" }} type="text" value={gageList[0]["Gagelistid"]} />
                              </div> */}
                              <div className='form-group col-md-4 col-sm-4 col-xs-12 CreatedDateform'>
                                <label htmlFor='currentDate'>GageList ID</label>
                                <input type="text" value="Auto" style={{ background: "#f1f1f1", pointerEvents: "none" }} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12 CreatedDateform'>
                                <label htmlFor='currentDate'>Created Date</label>
                                <input type="text" name="createddate" placeholder="Enter control no." value={formatDate(workview?.createddate)} style={{ background: "#f1f1f1", pointerEvents: "none" }} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Control No.</label>
                                <input type="text" name="calibContrNo" placeholder="Enter control no." value={workview?.calibContrNo} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Serial No.</label>
                                <input type="text" placeholder="Enter serial no." name="calibSerNo" value={workview?.calibSerNo} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Asset No.</label>
                                <input type="text" placeholder="Enter asset no." name="calibAssetNo" value={workview?.calibAssetNo} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Type</label>
                                <input type="text" value={workview?.type} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Model</label>
                                <input type="text" placeholder="Enter model" name="model" value={workview?.model} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Manufacturer</label>
                                <input type="text" value={workview?.manufacturer} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Measurement Types</label>
                                <input type="text" value={workview?.measurementType} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Units Of Measure</label>
                                <input type="text" value={workview?.measurementUnit} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Range or Size</label>
                                <input type="text" placeholder="Enter range or size" name="range" value={workview?.range} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Accuracy</label>
                                <input type="text" placeholder="Enter accuracy" name="accuracy" value={workview?.accuracy} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Reference Standard</label>
                                <input type="text" placeholder="Enter accuracy" name="accuracy" value={workview?.refStd} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='pm_calib_dt_acq'>Date Acquired</label>
                                <input type="text" name="dtAcq" placeholder="Enter control no." value={formatDate(workview?.dtAcq)} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Condition Acquired</label>
                                <input type="text" value={workview?.conditionAcquired} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Source/Vendor</label>
                                <input type="text" placeholder="Enter source/vendor" name="srcVendor" value={workview?.srcVendor} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor="">Gage Cost</label>
                                <input type="text" placeholder="Enter gage cost" name="gageCost" value={workview?.gageCost} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingThree">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                              Gage Assignment
                            </button>
                          </h2>
                          <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                            <div className="accordion-body row m-0">
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Location</label>
                                <input type="text" value={workview?.location} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Area</label>
                                <input type="text" value={workview?.area} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Assignee</label>
                                <input type="text" value={workview?.asignee} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="headingFour">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                              Calibration Information
                            </button>
                          </h2>
                          <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                            <div className="accordion-body row m-0">
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Interval</label>
                                <input type="text" value={workview?.interval} name="" id="" />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Environment</label>
                                <input type="text" value={workview?.environment} />
                              </div>
                              <div className='form-group col-md-4 col-sm-4 col-xs-12'>
                                <label htmlFor='batchno'>Instructions</label>
                                <input type="text" value={workview?.instruction} />
                              </div>
                              <div className='form-group col-md-12 col-sm-12 col-xs-12' style={{ marginTop: '20px' }}>
                                <label htmlFor='batchno'>Attachments</label>
                                <input type="text" value={workview?.instruction} />
                                <table className="AttachmentsTable">
                                  <thead>
                                    <tr>
                                      <th>File Name</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    <tr>
                                      <td>{workview?.attachment}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className='form-group col-md-12 col-sm-12 col-xs-12'>
                                <label htmlFor='batchno'>Other Information</label>
                                <textarea id="" placeholder="Enter other information" name="otherInfo" value={workview?.otherInfo}></textarea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                    <Processsheetfooter data={approvalData} />
                    {ShowApprovalSection && (
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
                    )}
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

export default Calibrationview