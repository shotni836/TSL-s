import React, { useState, useEffect } from 'react';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import { Link, useLocation } from 'react-router-dom';

function Mtc() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const moduleId = queryParams.get('moduleId');
    const menuId = queryParams.get('menuId');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    return (
        <>
            {
                loading ? <Loading /> :
                    <>
                        <Header />
                        <section className='InnerHeaderPageSection'>
                            <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <ul>
                                            <li> <Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                            <li><h1> / &nbsp; QA</h1></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className='InspectiontestingPageSection'>
                            <div className='container'>
                                <div className='row'>
                                    <div className='col-md-12 col-sm-12 col-xs-12'>
                                        <div className='InspectiontestingDrowpdown'>
                                            <div className="dropdown">
                                                <Link className="dropdown-toggle" to={`/packinglist?moduleId=${moduleId}&menuId=${menuId}`}>Create Packing List</Link>
                                            </div>
                                            <div className="dropdown">
                                                <Link className="dropdown-toggle" to={`/mtclist?moduleId=${moduleId}&menuId=${menuId}`}>Create MTC</Link>
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

export default Mtc;