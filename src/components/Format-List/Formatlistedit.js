import React, { useState, useEffect } from 'react';
import './Formatlist.css';
import Loading from '../Loading';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Environment from "../../environment";

function Formatlistedit() {
  const token = secureLocalStorage.getItem('token')
  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pm_format_id: '',
    pm_format_master_id: '',
    pm_format_no: '',
    pm_format_desc: '',
    pm_format_isactive: '',
    pm_format_revision: '',
    pm_format_deleted: '',
    userid: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userId = secureLocalStorage.getItem('userId');
    setFormData((prevFormData) => ({
      ...prevFormData,
      userid: userId
    }));

    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/ViewFormatListData?Id=${Id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = response.data[0];
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [Id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/InsertFormatListData`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        toast.success('Work Instruction updated successfully!');
        navigate(`/formatlistlist?moduleId=${moduleId}&menuId=${menuId}`);
      } else {
        toast.error('Failed to update Work Instruction');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Error updating Work Instruction');
    }
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
                      <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/formatlistlist?moduleId=${moduleId}&menuId=${menuId}`}> Format List</Link></li>
                      <li><h1>/ &nbsp; Format List Edit</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='WorkinstructionviewSection RegisterEmployeePageSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <form className="RegisterEmployeeForm row m-0" onSubmit={handleSubmit}>
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Format List <span style={{ color: "#3d7edb" }}>- Edit page</span></h4>
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_format_no">Format No.</label>
                        <input
                          type="text"
                          name="pm_format_no"
                          placeholder="Enter format no."
                          value={formData.pm_format_no}
                          onChange={handleInputChange}
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
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_format_desc">Revision No.</label>
                        <input
                          type="number"
                          name="pm_format_revision"
                          placeholder="Enter revision no."
                          value={formData.pm_format_revision}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group col-md-12 col-sm-12 col-xs-12">
                        <div className="RegisterEmployeeFooter">
                          <span style={{ color: "#ED2939", fontSize: "12px" }}>
                            {/* *all fields are mandatory */}
                          </span>
                          <button type="submit" className="SubmitNextbtn">
                            Update
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section >
            <Footer />
          </>
      }
    </>
  );
}

export default Formatlistedit;