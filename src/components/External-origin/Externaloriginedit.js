import React, { useState, useEffect } from 'react';
import './Externalorigin.css'

import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import Environment from "../../environment";
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import secureLocalStorage from 'react-secure-storage';

function Externaloriginedit() {
  const token = secureLocalStorage.getItem('token')
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get("menuId");
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    pm_tm_name: "",
    pm_tm_description: "",
    pm_tm_revision: "",
    publication_yr: "",
    reaffirmed_yr: "",
  });

  // --------------------------------------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // --------------------------------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }, [])

  async function handleSubmit() {
    try {
      const response = await axios.post(Environment.BaseAPIURL + `/api/User/InsertExternalOriginData`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.data) {
        toast.success("Data saved successfully!");
        navigate(`/externaloriginlist?moduleId=${moduleId}&menuId=${menuId}`);
      }
    }
    catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Fail to submit. Please try again.");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/ViewExternalOriginData?Id=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = response.data[0];
        setFormData(data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
                      <li><h1> / &nbsp; External Origin Edit </h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='ExternaloriginSectionPage ExternaloriginEditSectionPage'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <div className='ExternaloriginListBox'>
                      <h4>External Origin <span>- Edit Page</span></h4>
                      <div className='ExternaloriginTable' id='custom-scroll'>
                        <table>
                          <thead>
                            <tr style={{ background: 'rgb(90, 36, 90)' }}>
                              <th style={{ minWidth: '160px' }}>Standard / Specification</th>
                              <th style={{ minWidth: '400px' }}>Document Description</th>
                              <th style={{ minWidth: '100px' }}>Revision No.</th>
                              <th style={{ minWidth: '120px' }}>Publication Year</th>
                              <th style={{ minWidth: '120px' }}>Reaffirmed Year</th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr>
                              <td><input onChange={handleInputChange} name="pm_tm_name" type="text" value={formData?.pm_tm_name} /></td>
                              <td><textarea onChange={handleInputChange} name="pm_tm_description" value={formData?.pm_tm_description}></textarea></td>
                              <td>
                                <input onChange={handleInputChange} name='pm_tm_revision' type="text" value={formData?.pm_tm_revision} />
                              </td>
                              <td>
                                <input type="text" onChange={handleInputChange} name='publication_yr' value={formData?.pm_tm_publication_yr} />
                              </td>
                              <td>
                                <input type="text" onChange={handleInputChange} name='reaffirmed_yr' value={formData?.pm_tm_pub_reaffirmed_yr} />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="SubmitFlexBx">
                        <button className='btn btn-primary' onClick={handleSubmit}>Update</button>
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

export default Externaloriginedit