import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';

import Loading from "../Loading";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";

import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import RegisterEmployeeformimg from "../../assets/images/RegisterEmployeeformimg.jpg";
import Environment from "../../environment";
import "./Formatlist.css";

function Formatlist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pm_format_no: "",
    pm_format_desc: "",
    pm_format_revision: 0,
  });

  const handleInputChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(Environment.BaseAPIURL + "/api/User/InsertFormatListData",
        formData, {
        headers: {
          Authorization: `Bearer`
        }
      });
      console.log("Response:", response);
      navigate("/Formatlistlist");
      toast.success("Registration successful");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
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
                    <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                    <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/Formatlistlist?menuId=31`}> Format List</Link></li>
                    <li><h1>/&nbsp; Format </h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="RegisterEmployeePageSection">
            <div className="container">
              <div className="row">
                <div className="">
                  <form className="RegisterEmployeeForm row m-0" onSubmit={handleSubmit}>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <h4>Format <span>- Add page</span></h4>
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="pm_format_no">Format No.</label>
                      <input
                        type="text"
                        name="pm_format_no"
                        placeholder="Enter format no."
                        value={formData.pm_format_no}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="pm_format_desc">Format Description</label>
                      <input
                        type="text"
                        name="pm_format_desc"
                        placeholder="Enter format description"
                        value={formData.pm_format_desc}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="pm_format_revision">Format Revision</label>
                      <input
                        type="number"
                        name="pm_format_revision"
                        placeholder="Enter format revision"
                        value={formData.pm_format_revision}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="RegisterEmployeeFooter">
                        <span style={{ color: "#ED2939", fontSize: "12px" }}>
                          {/* *all fields are mandatory */}
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

export default Formatlist;