import React, { useState, useEffect } from "react";
import InnerHeaderPageSection from "../../components/Common/Header-content/Header-content";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Environment from "../../environment";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import { decryptData } from "../Encrypt-decrypt";

const UpdateProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const menuId = searchParams.get('menuId');
    const moduleId = searchParams.get('moduleId');
    const userId = searchParams.get('UserId');
    const token = secureLocalStorage.getItem('token');
    const approverId = secureLocalStorage.getItem("empId");

    const [profile, setProfile] = useState({});
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [totalExperience, setTotalExperience] = useState({ years: 0, months: 0 });
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        totalExp();
    }, [experience]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/Get_EmpUpdatedScreenHod?empid=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const datas = response.data[0];
            setProfile(datas._EmpPersonalData[0]);
            setEducation(datas._EmpEducationData);
            setExperience(datas._EmpExperienceData);
        } catch (error) {
            console.error('Error fetching data for HoD:', error);
        }
    };

    const educationLevels = {
        "679": "12th",
        "680": "Graduation/Diploma",
        "681": "Masters/Post-Graduation",
        "682": "Doctorate/PhD"
    };

    const educationGrade = {
        "683": "Scale 10 Grading System",
        "684": "Scale 4 Grading System",
        "685": "% Marks of 100 Maximum",
        "686": "Course Requires a Pass"
    };

    const calculateExp = (startMonth, startYear, endMonth, endYear) => {
        const startDate = new Date(startYear, startMonth - 1);
        const endDate = new Date(endYear, endMonth - 1);
        let totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        return { years, months };
    };

    const totalExp = () => {
        let totalMonths = 0;

        experience.forEach(exp => {
            const { years, months } = calculateExp(exp.emp_start_mon, exp.emp_start_yr, exp.emp_end_mon, exp.emp_end_yr);
            totalMonths += years * 12 + months;
        });

        const totalYears = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;

        setTotalExperience({ years: totalYears, months: remainingMonths });
    };

    const handleRemarksChange = (e) => {
        setRemarks(e.target.value);
    };
    const sendUserId = decryptData(userId)
    const sendApprovalStatus = async (status) => {
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/Proc_HODUpdateApprove`, {
                empusername: sendUserId,
                IsApprove: status,
                ApproverId: approverId,
                HodRemarks: remarks
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
            if (response.status === 200) {
                navigate(`/employeelist?moduleId=${moduleId}&menuId=${menuId}`)
            }
            else {
                console.log('Failed while submitting');
            }
        } catch (error) {
            console.error('Error sending approval status:', error);
        }
    };

    const handleApprove = () => {
        sendApprovalStatus("Y");
    };

    const handleReject = () => {
        sendApprovalStatus("N");
    };

    return (
        <>
            <Header />
            <InnerHeaderPageSection
                linkTo={`/hrdashboard?moduleId=${moduleId}`}
                linkText="UM Module"
                linkText2="Profile Update"
            />
            <section className="CompleteRegistrationPageSection">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12">
                            <form className="CompleteregisterForm row m-0">
                                <div className="formheadingline">
                                    <h2 style={{ color: "#3D7EDB" }}> Personal Details <hr style={{ borderTop: "2px solid #3D7EDB" }} /> </h2>
                                </div>
                                <div className="row m-0">
                                    {[
                                        { label: "TATA User ID", value: profile?.userId },
                                        { label: "First Name", value: profile?.firstName },
                                        { label: "Middle Name", value: profile?.middleName },
                                        { label: "Last Name", value: profile?.lastName },
                                        { label: "Gender", value: profile?.empGender },
                                        { label: "TATA Email Address", value: profile?.empEmail },
                                        { label: "Mobile Number", value: profile?.empMobileNo },
                                        { label: "Alternate Mobile Number", value: profile?.altMobileNo },
                                        { label: "Department", value: profile?.empDept },
                                        { label: "Designation", value: profile?.designation },
                                    ].map((field, idx) => (
                                        <div key={idx} className="form-group col-md-3 col-sm-3 col-xs-12">
                                            <label>{field.label}</label>
                                            <input type="text" style={{ pointerEvents: "none" }} value={field.value} readOnly />
                                        </div>
                                    ))}

                                    <div className="form-group col-md-3 col-sm-3 col-xs-12">
                                        <label>Signature</label>
                                        <a
                                            href={`${Environment.ImageURL}/${profile?.signature}`}
                                            alt="Signature" target="_blank"
                                        >View</a>
                                    </div>
                                </div>
                                <div className="formheadingline">
                                    <h2 style={{ color: "#518ada" }}>Education Details <hr style={{ borderTop: "2px solid #518ada" }} /></h2>
                                </div>
                                <div style={{ overflowX: 'auto' }} id="custom-scroll">
                                    <table>
                                        <thead>
                                            <tr style={{ background: "#5A245A" }}>
                                                <th style={{ minWidth: '220px' }}>Education</th>
                                                <th style={{ minWidth: '60px' }}>Course Start</th>
                                                <th style={{ minWidth: '60px' }}>Course End</th>
                                                <th style={{ minWidth: '220px' }}>Grade System</th>
                                                <th style={{ minWidth: '100px' }}>Marks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {education.map((edu, index) => (
                                                <tr key={index}>
                                                    <td><input style={{ pointerEvents: "none" }} value={educationLevels[edu.emp_degree_id]} /></td>
                                                    <td><input style={{ pointerEvents: "none" }} value={edu.emp_start_yr} /></td>
                                                    <td><input style={{ pointerEvents: "none" }} value={edu.emp_end_yr} /></td>
                                                    <td><input style={{ pointerEvents: "none" }} value={educationGrade[edu.emp_grade_perc]} /></td>
                                                    <td><input style={{ pointerEvents: "none" }} value={edu.emp_type_of_score} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="formheadingline">
                                    <h2 style={{ color: "#518ada" }}>Experience Details <hr style={{ borderTop: "2px solid #518ada" }} /></h2>
                                    <div>
                                        <p>Total Experience : {totalExperience.years} Years {totalExperience.months} Months</p>
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto' }} id="custom-scroll">
                                    <table>
                                        <thead>
                                            <tr style={{ background: "#5A245A" }}>
                                                <th style={{ width: "210px" }}> Company Name</th>
                                                <th style={{ width: "210px" }}> Department Name</th>
                                                <th style={{ width: "210px" }}> Designation Name</th>
                                                <th style={{ width: "170px" }}> Start Month / Year</th>
                                                <th style={{ width: "170px" }}> End Month / Year</th>
                                                <th>Experience</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {experience.map((exp, index) => (
                                                <tr key={index}>
                                                    <td><input style={{ pointerEvents: "none" }} value={exp.emp_exp_company} /></td>
                                                    <td><input style={{ pointerEvents: "none" }} value={exp.emp_exp_dept} /></td>
                                                    <td><input style={{ pointerEvents: "none" }} value={exp.emp_exp_designation} /></td>
                                                    <td>{String(exp.emp_start_mon).padStart(2, '0')}/{exp.emp_start_yr}</td>
                                                    <td>{String(exp.emp_end_mon).padStart(2, '0')}/{exp.emp_end_yr}</td>
                                                    <td>{`${calculateExp(exp.emp_start_mon, exp.emp_start_yr, exp.emp_end_mon, exp.emp_end_yr).years} Yr ${calculateExp(exp.emp_start_mon, exp.emp_start_yr, exp.emp_end_mon, exp.emp_end_yr).months} M`}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="form-group col-md-12 col-sm-12 col-xs-12">
                                    <label>Remarks</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={remarks}
                                        onChange={handleRemarksChange}
                                    >
                                    </input>
                                </div>
                                <div className="form-group col-md-12 col-sm-12 col-xs-12" style={{ textAlign: "right" }}>
                                    <button type="button" className="btn btn-success" onClick={handleApprove}>Approve</button>
                                    <button type="button" className="btn btn-danger" onClick={handleReject} style={{ marginLeft: "10px" }}>Reject</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default UpdateProfile;