import React, { useState, useEffect } from 'react';
import './Workinstructionlist.css';
import Loading from '../Loading';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from "react-secure-storage";

function Workinstructionedit() {
<<<<<<< HEAD
  const token = secureLocalStorage.getItem('token')
  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');
=======
  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");

>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pm_work_instruction_id: 0,
    pm_workinst_doc_id: 0,
    pm_workinst_doc_title: '',
    pm_workinst_doc_rev: '',
    pm_workinst_doc_issue: '',
    pm_workinst_rev_date: '',
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
<<<<<<< HEAD
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/ViewWorkInstructionData?Id=${Id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
=======
        const response = await axios.get(`${Environment.BaseAPIURL}/api/User/ViewWorkInstructionData?Id=${Id}`);
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
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
<<<<<<< HEAD
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/InsertWorkinstructionData`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        toast.success('Work Instruction updated successfully!');
        navigate(`/workinstructionlist?moduleId=${moduleId}&menuId=${menuId}`);
=======
    console.log(formData)
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/api/User/InsertWorkinstructionData`, formData);
      if (response.status === 200) {
        toast.success('Work Instruction updated successfully!');
        navigate('/workinstructionlist');
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
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
<<<<<<< HEAD
                      <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/workinstructionlist?moduleId=${moduleId}&menuId=${menuId}`}> Work Instruction List</Link></li>
=======
                      <li><Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/workinstructionlist?menuId=29`}> Work Instruction List</Link></li>
>>>>>>> 0a85340d990666d57c1dc8f53a7afcf047357ac9
                      <li><h1>/ &nbsp; Work Instruction Edit</h1></li>
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
                        <h4>Work Instruction <span style={{ color: "#3d7edb" }}>- Edit page</span></h4>
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_work_instruction_id">Identification No.</label>
                        <input
                          type="number"
                          name="pm_work_instruction_id"
                          placeholder="Enter identification no."
                          value={formData.pm_work_instruction_id}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_workinst_doc_title">Document Title</label>
                        <input
                          type="text"
                          name="pm_workinst_doc_title"
                          placeholder="Enter document title"
                          value={formData.pm_workinst_doc_title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_workinst_doc_rev">Revision No.</label>
                        <input
                          type="number"
                          name="pm_workinst_doc_rev"
                          placeholder="Enter revision no."
                          value={formData.pm_workinst_doc_rev}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_workinst_doc_issue">Issue No.</label>
                        <input
                          type="number"
                          name="pm_workinst_doc_issue"
                          placeholder="Enter issue no."
                          value={formData.pm_workinst_doc_issue}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_workinst_rev_date">Revision Date</label>
                        <input
                          type="date"
                          name="pm_workinst_rev_date"
                          placeholder="Enter issue no."
                          value={formData.pm_workinst_rev_date.split("T")[0]}
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
                            Update
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
      }
    </>
  );
}

export default Workinstructionedit;
