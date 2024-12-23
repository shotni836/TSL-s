import React, { useState, useEffect } from 'react';
import './Formatlist.css'
import Loading from '../Loading';
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';

function Formatlistview() {
  const token = secureLocalStorage.getItem('token')
  const searchParams = new URLSearchParams(window.location.search);
  const Id = searchParams.get("id");
  const moduleId = searchParams.get('moduleId');
  const menuId = searchParams.get('menuId');

  const [workview, setWorkview] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/ViewFormatListData?Id=${Id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
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
                      <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                      <li><b style={{ color: '#fff' }}>/&nbsp;</b> <Link to={`/formatlistlist?moduleId=${moduleId}&menuId=${menuId}`}> Format List</Link></li>
                      <li><h1>/ &nbsp; Format View</h1></li>
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
                        <h4>Format List <span>- View page</span></h4>
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="pm_format_no">Format No.</label>
                        <input
                          type="text"
                          name="Format No"
                          value={workview.pm_format_no}
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="Format Description">Format Description</label>
                        <input
                          type="text"
                          name="Format Description"
                          value={workview.pm_format_desc}
                        />
                      </div>
                      <div className="form-group col-md-4 col-sm-4 col-xs-12">
                        <label htmlFor="Revision No">Revision No.</label>
                        <input
                          type="text"
                          name="Revision No"
                          value={workview.pm_format_revision}
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

export default Formatlistview