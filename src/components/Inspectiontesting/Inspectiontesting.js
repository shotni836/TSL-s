import React, { useState, useEffect } from 'react';
import './Inspectiontesting.css'
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from '../Loading';
import { Link, useLocation } from 'react-router-dom';

function Inspectiontesting() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
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
                                            <li><h1> / &nbsp; Testing</h1></li>
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
                                                <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    Raw Material Testing <i class="fas fa-angle-down"></i>
                                                </a>

                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <Link to={`/rawmaterialinwardlist?menuId=${menuId}`} className='dropdown-item'>
                                                            Raw Material Inward
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`/rawmateriallist?menuId=${menuId}&testingtype=605`} className='dropdown-item'>
                                                            Raw Material Inhouse
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="dropdown">
                                                <Link className="dropdown-toggle" to={`/rawmateriallist?menuId=${menuId}&testingtype=607`}>Before Lab Testing</Link>
                                            </div>

                                            <div className="dropdown">
                                                <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    In Process Lab Testing<i class="fas fa-angle-down"></i>
                                                </a>

                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <Link to={`/assignfieldlabtestlist?menuId=${menuId}&test=Lab`} className='dropdown-item'>
                                                            Assign Lab Test on Pipe
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`/rawmateriallist?menuId=${menuId}&testingtype=608`} className='dropdown-item'>
                                                            Lab Testing
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>


                                            <div className="dropdown">
                                                <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    In Process Field Testing<i class="fas fa-angle-down"></i>
                                                </a>

                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <Link to={`/assignfieldlabtestlist?menuId=${menuId}&test=Field`} className='dropdown-item'>
                                                            Assign Field Test on Pipe
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`/rawmateriallist?menuId=${menuId}&testingtype=609`} className='dropdown-item'>
                                                            Field Testing
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* <div className="dropdown">
                                                <Link className="dropdown-toggle" to='/rawmateriallist?testingtype=608'>In Process Lab Testing</Link>
                                            </div>

                                            <div className="dropdown">
                                                <Link className="dropdown-toggle" to='/rawmateriallist?testingtype=609'>In Process Field Testing</Link>
                                            </div> */}

                                            {/* <div className="dropdown">
                                                <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    Inspection <i class="fas fa-angle-down"></i>
                                                </a>

                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <Link to='/rawmaterialinspectionlist' className='dropdown-item'>
                                                            Raw Material Inspection
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div> */}
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

export default Inspectiontesting