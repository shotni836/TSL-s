import React, { useState, useEffect } from 'react';
import './Workinstructionlist.css'
import Loading from '../Loading';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../environment";
import { toast } from 'react-toastify';

function Workinstructionview() {
  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");

  const [workview, setWorkview] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/ViewWorkInstructionData?Id=${Id}`);
        const data = response.data[0];

        console.log(data)
        setWorkview(data);

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
                      <li> <Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/workinstructionlist?menuId=29`}> Work Instruction List</Link></li>
                      <li><h1>/ &nbsp; Work Instruction View</h1></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className='WorkinstructionviewSection RegisterEmployeePageSection'>
              <div className='container'>
                <div className='row'>
                  <div className='col-md-12 col-sm-12 col-xs-12'>
                    <form className="RegisterEmployeeForm row m-0">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>Work Instruction <span style={{ color: "#3d7edb" }}>- View page </span></h4>
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="">Identification No.</label>
                        <input
                          type="number"
                          name="pm_work_instruction_id"
                          value={workview.pm_work_instruction_id}
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="">Document Title</label>
                        <input
                          type="text"
                          name="pm_workinst_doc_title"
                          placeholder="Enter document title"
                          value={workview.pm_workinst_doc_title}
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="">Revision No. </label>
                        <input
                          type="number"
                          name="pm_workinst_doc_rev"
                          placeholder="Enter revision no."
                          value={workview.pm_workinst_doc_rev}
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="">Issue No. </label>
                        <input
                          type="number"
                          name="pm_workinst_doc_issue"
                          placeholder="Enter revision no."
                          value={workview.pm_workinst_doc_issue}
                        />
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
  )
}

export default Workinstructionview