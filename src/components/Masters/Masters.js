import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Loading from "../Loading";
import "./Masters.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import RegisterEmployeeformimg from "../../assets/images/RegisterEmployeeformimg.jpg";
import { toast } from 'react-toastify';
import axios from 'axios';
import Environment from "../../environment";

function Masters() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const coparamtypeid = params.get("coparamtypeid");
  const coparamtypename = params.get("coparamtypename");

  const [state, setState] = useState({
    loading: true,
    formData: {
      pco_comp_id: 1,
      pco_location_id: 1,
      pco_param_type_id: coparamtypeid || "",
      pco_param_val_name: "",
      pco_param_val_alias: "",
    },
  });

  const { loading, formData } = state;

  useEffect(() => {
    // Simulate a delay to show the loading screen
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, loading: false }));
    }, 2000);
  }, []);

  const handleInputChange = ({ target }) => {
    const { name, value } = target;
    setState((prevState) => ({
      ...prevState,
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(coparamtypeid, formData);
      const response = await axios.post(
        `${Environment.BaseAPIURL}/api/User/InsertcoparamvalueData`,
        formData,
        {
          headers: {
            Authorization: `Bearer YOUR_AUTH_TOKEN`, // Replace YOUR_AUTH_TOKEN with the actual token
          },
        }
      );
      console.log("Response:", response);
      toast.success("Form submitted successfully!");
      navigate("/masterslist");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

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
                    <li><Link to="/hrdashboard">Quality Admin (Dashboard)</Link></li>
                    <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to="/masterslist"> Master List</Link></li>
                    <li><h1>/&nbsp; {coparamtypename} - Masters</h1></li>
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
                      <h4> {coparamtypename} - Masters <span>- Add page</span></h4>
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="pco_param_type_id">Type ID</label>
                      <input
                        type="text"
                        style={{ background: "#ebebeb", cursor: "not-allowed" }}
                        name="pco_param_type_id"
                        value={formData.pco_param_type_id}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="pco_param_val_name">Name</label>
                      <input
                        type="text"
                        name="pco_param_val_name"
                        placeholder="Enter name"
                        value={formData.pco_param_val_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-4 col-sm-4 col-xs-12">
                      <label htmlFor="pco_param_val_alias">Alias </label>
                      <input
                        type="text"
                        name="pco_param_val_alias"
                        placeholder="Enter alias"
                        value={formData.pco_param_val_alias}
                        onChange={handleInputChange}
                        required
                      />
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

export default Masters;
