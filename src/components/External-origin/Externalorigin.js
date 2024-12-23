import React, { useState, useEffect } from 'react';
import './Externalorigin.css';

import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';


function Externalorigin() {
  const token = secureLocalStorage.getItem('token')
  const searchParams = new URLSearchParams(window.location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pm_tm_name: "",
    pm_tm_description: "",
    pm_tm_doc_type: "",
    pm_tm_item_type: "",
    pm_tm_revision: 0,
    pm_tm_doc_path: "",
  });

  const [data, setData] = useState([
    { id: 1, location: 'New Delhi' },
  ]);

  const handleInputChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? (checked ? value : '') : value,
    }));
  };

  const addTableRow = (e) => {
    e.preventDefault();
    const newRow = {
      id: data.length + 1,
      location: 'New Delhi'
    };

    setData([...data, newRow]);
  };

  const deleteTableRow = (id) => {
    const updatedData = data.filter((row) => row.id !== id);
    setData(updatedData);
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(Environment.BaseAPIURL + "/api/User/InsertExternalOriginData",
        formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Response:", response);
      navigate("/externaloriginlist");
      toast.success("Registration successful");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  const validateUserId = (userId, selectedOption) => {
    let isValid = false;

    if (selectedOption === "519" || selectedOption === "520") { // Tata & Subsidiary employees : 6-digit numeric value
      isValid = /^\d{6}$/.test(userId);
    } else if (selectedOption === "521") { // Contractual: 10-digit alphanumeric value
      isValid = /^\w{10}$/.test(userId);
    } else if (selectedOption === "522") { // TPI employees: PAN card number
      isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(userId);
    }
    return isValid;
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
                      <li> <Link to={`/dashboard?moduleId=${moduleId}`}> Quality Module </Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/externaloriginlist?moduleId=${moduleId}&menuId=${menuId}`}> External Origin List</Link></li>
                      <li><h1> / &nbsp; External Origin  </h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='ExternaloriginSectionPage'>
              <div className='container'>
                <div className='row'>

                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='ExternaloriginListBox'>
                      <h4>External Origin <span>- Add Page</span></h4>
                      <form className="row m-0" onSubmit={handleSubmit} >
                        <div className='ExternaloriginTable' id='custom-scroll'>
                          <table>
                            <thead>
                              <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                <th style={{ minWidth: '60px' }}>S No.</th>
                                <th style={{ minWidth: '160px' }}>Standard / Specification</th>
                                <th style={{ minWidth: '200px' }}>Document Description</th>
                                <th style={{ minWidth: '100px' }}>Revision No.</th>
                                <th style={{ minWidth: '140px' }}>Document Type</th>
                                <th style={{ minWidth: '100px' }}>Item Type</th>
                                <th style={{ minWidth: '380px' }}>Path</th>
                                <th style={{ minWidth: '90px' }}>Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {data.map((row) => (
                                <tr key={row.id}>
                                  <td>{row.id}</td>
                                  <td><input
                                    type="text"
                                    name="pm_tm_name"
                                    placeholder="Enter standard / specification"
                                    value={formData.pm_tm_name}
                                    onChange={handleInputChange}
                                    required /></td>
                                  <td>
                                    <input
                                      type="text"
                                      name="pm_tm_description"
                                      placeholder="Enter document description"
                                      value={formData.pm_tm_description}
                                      onChange={handleInputChange}
                                      required />
                                  </td>
                                  <td>
                                    <input type="number"
                                      name="pm_tm_revision"
                                      placeholder='Enter revision no.'
                                      onChange={handleInputChange}
                                      value={formData.pm_tm_revision} />
                                  </td>
                                  <td>
                                    <div className='Doctypeflex'>
                                      <label htmlFor="Hard">
                                        <input type="radio" id="Hard" name="pm_tm_doc_type" value="H" checked={formData.pm_tm_doc_type === 'H'} onChange={handleInputChange} />Hard
                                      </label>

                                      <label htmlFor="Soft">
                                        <input type="radio" id="Soft" name="pm_tm_doc_type" value="S" checked={formData.pm_tm_doc_type === 'S'} onChange={handleInputChange} />
                                        Soft
                                      </label>
                                    </div>
                                  </td>
                                  <td>
                                    <div className='Doctypeflex'>
                                      <label htmlFor="Item">
                                        <input type="checkbox" id="Item" name="pm_tm_item_type" value="Item" checked={formData.pm_tm_item_type === 'Item'} onChange={handleInputChange} />Item
                                      </label>
                                    </div>
                                  </td>
                                  <td>
                                    <input type="text" name="pm_tm_doc_path" onChange={handleInputChange} value={formData.pm_tm_doc_path} />
                                  </td>
                                  <td><i className='fa fa-trash' onClick={() => deleteTableRow(row.id)} style={{ color: '#ED2939' }}></i></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className='AddRowBtn'>
                          <button onClick={addTableRow}><i className='fa fa-plus'></i> Add Row</button>
                        </div>

                        <div className="SubmitFlexBx" >
                          <button type="submit" className="SubmitNextbtn"> Submit </button>
                        </div>

                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Footer />
          </>
      }
    </>
  );
}

export default Externalorigin;
