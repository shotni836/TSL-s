import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../Loading";
import "./Workinstruction.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import { toast } from 'react-toastify';
import axios from 'axios';
import Environment from "../../environment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import secureLocalStorage from "react-secure-storage";

function Workinstruction() {
  const token = secureLocalStorage.getItem('token');
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const moduleId = queryParams.get('moduleId');
  const menuId = queryParams.get('menuId');
  const [state, setState] = useState({
    loading: true,
    formData: {
      pm_work_instruction_id: "",
      pm_workinst_doc_title: "",
    },
  });

  const [formData, setFormData] = useState({
    pm_workinst_doc_rev: 0,
    pm_workinst_rev_date: null // Updated to null for DatePicker
  });

  useEffect(() => {
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, loading: false }));
    }, 2000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      pm_workinst_rev_date: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(Environment.BaseAPIURL + "/api/User/InsertWorkinstructionData", formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log("Response:", response); // Debug: Log response to console
      toast.success("Form submitted successfully!");
      navigate(`/workinstructionlist?moduleId=${moduleId}&menuId=${menuId}`); // Navigate to success page
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                    <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/workinstructionlist?moduleId=${moduleId}&menuId=${menuId}`}> Work Instruction List</Link></li>
                    <li><h1>/&nbsp; Work Instruction</h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="RegisterEmployeePageSection">
            <div className="container">
              <div className="row">
                <div className="">
                  <form className="RegisterEmployeeForm row m-0" onSubmit={handleSubmit} >
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h4>Work Instruction <span>- Add page</span></h4>
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Identification No.</label>
                      <input
                        type="number"
                        name="pm_work_instruction_id"
                        placeholder="Enter identification no."
                        value={formData.pm_work_instruction_id}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Document Title</label>
                      <input
                        type="text"
                        name="pm_workinst_doc_title"
                        placeholder="Enter document title"
                        value={formData.pm_workinst_doc_title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Revision No. </label>
                      <input
                        type="number"
                        name="pm_workinst_doc_rev"
                        placeholder="Enter revision no."
                        value={formData.pm_workinst_doc_rev}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formData.pm_workinst_doc_rev === '1' && (
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="">Revision Date </label>
                        <DatePicker
                          selected={formData.pm_workinst_rev_date}
                          onChange={handleDateChange}
                          maxDate={new Date()}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Enter revision date"
                          className="form-control"
                        />
                      </div>
                    )}
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="">Issue No. </label>
                      <input
                        type="number"
                        name="pm_workinst_doc_issue"
                        placeholder="Enter revision no."
                        value={formData.pm_workinst_doc_issue}
                        onChange={handleInputChange} />
                    </div>
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="RegisterEmployeeFooter">
                        <span style={{ color: "#ED2939", fontSize: "12px" }}>
                          *all fields are mandatory
                        </span>
                        <button type="submit" className="SubmitNextbtn">
                          Submit
                        </button>
                      </div>
                    </div>
                  </form>
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

export default Workinstruction;
