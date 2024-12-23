import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import './Module.css';
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";
import { encryptData } from '../Encrypt-decrypt';

function Module() {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const userId = secureLocalStorage.getItem('userId');
    const token = secureLocalStorage.getItem('token');

    useEffect(() => {
        const fetchModules = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetModuleByRoleWise?UserId=${encryptData(userId)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                setModules(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching modules:', error);
                setLoading(false);
            }
        };

        fetchModules();
    }, [userId]);

    return (
        <div>
            <section className="ModulePageSection">
                <div className="ModuleTopSection">
                    <Header />
                    <div className="ModuledetailsSection">
                        <div className="container">
                            <div className="row">
                                {loading ? (
                                    Array(4).fill().map((_, index) => (
                                        <div key={index} className="col-md-2 col-sm-2 col-xs-6">
                                            <div className="ModuledetailsBoxs">
                                                <h3><Skeleton height={40} width={160} style={{ borderTopRightRadius: "20px", borderTopLeftRadius: "20px" }} /></h3>
                                                <Skeleton circle={true} height={70} width={75} style={{ marginBottom: "10px" }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    modules.map((module, index) => (
                                        <div key={index} className="col-md-2 col-sm-2 col-xs-6">
                                            <Link to={`${module.link}?moduleId=${encryptData(module.moduleId)}`} style={module.disabled ? { pointerEvents: 'none', cursor: 'default' } : {}} >
                                                <div className="ModuledetailsBox">
                                                    <h3>{module.moduleName}</h3>
                                                    <img src={module.icon} alt={`${module.moduleName} Icon`} />
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </section>
        </div>
    );
}

export default Module;