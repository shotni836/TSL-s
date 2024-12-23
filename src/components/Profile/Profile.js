import React, { useState, useEffect } from "react";
import axios from 'axios';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from '../Loading';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Environment from "../../environment";
import './Profile.css';
import PersonalDetails from './PersonalDetails';
import EducationDetails from './EducationDetails';
import ExperienceDetails from './ExperienceDetails';
import { toast } from 'react-toastify';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('UserId');
    const [loading, setLoading] = useState(false);
    const isEdit = location.search.includes('edit');
    const [editing, setEditing] = useState(Boolean(isEdit));
    const [profileData, setProfileData] = useState({});
    const [departmentsType, setDepartmentsType] = useState([]);
    const [designationsType, setDesignationsType] = useState([]);
    const [degreeOptions, setDegreeOptions] = useState([]);
    const [gradeOptions, setGradeOptions] = useState([]);
    const [educationRows, setEducationRows] = useState([{ emp_edu_id: '', emp_degree_id: '', EduStartYear: '', EduEndYear: '', emp_grade_perc: '', marks: '' }]);
    const [experienceRows, setExperienceRows] = useState([{ emp_exp_id: '', emp_exp_company: '', emp_exp_dept: '', emp_exp_designation: '', emp_exp_role: '', ExpStartDate: '', ExpEndDate: '', exp: '' }]);
    const [dropdownsFetched, setDropdownsFetched] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchEmpData();
    }, []);

    const fetchEmpData = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmpByID?UserId=${userId}`);
            const { Table, Table1, Table2 } = response.data;
            if (response.data) {
                fetchDropdownOptions();
            }
            setProfileData(Table[0] || {});
            setEducationRows(Table1 || []);
            setExperienceRows(Table2 || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownOptions = async () => {
        try {
            const ddresponse = await axios.get(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeReg`);
            const { Department, Designation, DegreeCategory, MarksCategory } = ddresponse.data;
            setDepartmentsType(Department || []);
            setDesignationsType(Designation || []);
            setDegreeOptions(DegreeCategory || []);
            setGradeOptions(MarksCategory || []);
            setDropdownsFetched(true);
        } catch (error) {
            console.error('Error fetching dropdown options:', error);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleChange = async (e, fieldName) => {
        let value = e.target.value;
        if (fieldName === 'Uploadsign' && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== "image/png") {
                toast.error("Only .png files are allowed ");
                e.target.value = '';
                return;
            }

            if (file.size > 2048 ** 2) {
                toast.error("Upload file less than 2 MB");
                e.target.value = '';
                return;
            }

            if (file) {
                const base64Value = await fileToBase64(file);
                setProfileData(prevData => ({
                    ...prevData,
                    [fieldName]: base64Value,
                    signName: file.name
                }));
                return;
            }
        }

        setProfileData(prevData => ({ ...prevData, [fieldName]: value }));
    };

    const handleEducationChange = (e, emp_edu_id, fieldName) => {
        let updatedValue;

        if (e !== null) {
            if (fieldName === 'EduStartYear' || fieldName === 'EduEndYear') {
                updatedValue = e instanceof Date ? e.toISOString() : e.target.value;
            } else {
                updatedValue = e.target.value;
            }
        } else {
            updatedValue = null;
        }

        setEducationRows(prevRows =>
            prevRows.map(row => {
                if (row.emp_edu_id === emp_edu_id) {
                    return { ...row, [fieldName]: updatedValue, isEdited: true };
                }
                return row;
            })
        );
    };

    const handleExperienceChange = (e, emp_exp_id, fieldName, flag) => {
        let updatedValue;
        let companyId;
        let companyName;

        if (fieldName === 'ExpStartDate' || fieldName === 'ExpEndDate') {
            updatedValue = e instanceof Date ? e.toISOString() : e?.target?.value.trim();
        } else if (fieldName === 'currentlyWorking') {
            updatedValue = e.target.checked;
        } else if (fieldName === 'emp_exp_company') {
            if (flag == 0) {
                companyId = e.value;
                companyName = e.label;
            }
            else {
                updatedValue = e.target.value;
            }

            setExperienceRows(prevRows =>
                prevRows.map(row => {
                    if (row.emp_exp_id === emp_exp_id) {
                        return { ...row, [fieldName]: e.label, currentCompanyId: companyId == undefined ? 0 : companyId, emp_exp_company: updatedValue == undefined || updatedValue == "" ? companyName : updatedValue, isEdited: true };
                    }
                    return row;
                })
            );
            return;
        } else {
            updatedValue = e.target.value.trim();
        }

        setExperienceRows(prevRows =>
            prevRows.map(row => {
                if (row.emp_exp_id === emp_exp_id) {
                    return { ...row, [fieldName]: updatedValue, isEdited: true };
                }
                return row;
            })
        );
    }

    const addEducationRow = () => {
        const lastIndex = educationRows.length - 1;
        const newRow = {
            emp_edu_id: educationRows[lastIndex]?.emp_edu_id + 1 || 1,
            emp_degree_id: '',
            EduStartYear: '',
            EduEndYear: '',
            emp_grade_perc: '',
            marks: ''
        };
        setEducationRows([...educationRows, newRow]);
    };

    const deleteEducationRow = (emp_edu_id) => {
        setEducationRows(educationRows.filter(row => row.emp_edu_id !== emp_edu_id));
    };

    const addExperienceRow = () => {
        const lastIndex = experienceRows.length - 1;
        const newRow = {
            emp_exp_id: experienceRows[lastIndex]?.emp_exp_id + 1 || 1,
            emp_exp_company: '',
            emp_exp_dept: '',
            emp_exp_designation: '',
            ExpStartDate: '',
            ExpEndDate: '',
            exp: ''
        };
        setExperienceRows([...experienceRows, newRow]);
    };

    const deleteExperienceRow = (emp_exp_id) => {
        setExperienceRows(experienceRows.filter(row => row.emp_exp_id !== emp_exp_id));
    };

    const updatePersonaldetails = async () => {
        try {
            let personalDetailsPayload = {
                userid: profileData.emp_user_id,
                empFname: profileData.emp_fname,
                empMname: profileData.emp_mname,
                empLname: profileData.emp_lname,
                empMobNo: profileData.MobNo,
                empAltMobNo: profileData.Altmono,
                empDeptNo: profileData.departmentId,
                empDesignation: profileData.designationId,
                emp_signature: profileData.Uploadsign,
                emp_signatureName: profileData.signName,
            };
            await axios.post(`${Environment.BaseAPIURL}/api/User/InsertEmployeUpdateDetails`, personalDetailsPayload);
        } catch (error) {
            console.error('Error updating personal details:', error);
        }
    };

    const updateEduDetails = async () => {
        try {
            const empEduDetailsCh = educationRows.map(row => ({
                degreeId: row.emp_degree_id,
                startYear: row.EduStartYear ? new Date(row.EduStartYear).getFullYear().toString().padStart(4, '0') : null,
                endYear: row.EduEndYear ? new Date(row.EduEndYear).getFullYear().toString().padStart(4, '0') : null,
                grade: row.emp_grade_perc || 0,
                marks: row.emp_degree_marks || 0,
            }));

            const payload = {
                userId: userId,
                empEduDetailsCh: empEduDetailsCh
            };

            await axios.post(`${Environment.BaseAPIURL}/api/User/InsertEmpEduUpdateValuesNew`, payload);
        } catch (error) {
            console.error('Error updating education details:', error);
        }
    };

    const updateExpDetails = async () => {
        try {
            const lastIndex = experienceRows.length - 1;
            const empExpDetails = experienceRows.map((row, index) => ({
                company: row.emp_exp_company,
                currentCompanyId: row.currentCompanyId || row.emp_current_comp_id,
                department: row.emp_exp_dept,
                designation: row.emp_exp_designation,
                startMonth: formatDate(row.ExpStartDate).month.toString(),
                startYear: formatDate(row.ExpStartDate).year.toString(),
                endMonth: formatDate(row.ExpEndDate).month.toString(),
                endYear: formatDate(row.ExpEndDate).year.toString(),
                isCurrentCompany: index == lastIndex ? 1 : 0,
            }));

            const payload = {
                userId: userId,
                empExpDetailsCh: empExpDetails
            };

            await axios.post(`${Environment.BaseAPIURL}/api/User/InsertEmpExpUpdateDetailsNew`, payload);
        } catch (error) {
            console.error('Error updating education details:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return { month: null, year: null };
        const date = new Date(dateString);
        return { month: date.getMonth() + 1, year: date.getFullYear() };
    };

    const handleSubmission = async (e) => {
        e.preventDefault();

        // Validate education data
        for (const edu of educationRows) {
            if (!edu.emp_degree_id || !edu.EduStartYear || !edu.EduEndYear || !edu.emp_grade_perc || !edu.emp_degree_marks) {
                toast.error('Please fill out all fields in the education details.');
                return;
            }
        }
        // Validate experience data
        for (const exp of experienceRows) {
            console.log(exp)
            if (!exp.emp_exp_company || !exp.emp_exp_dept || !exp.emp_exp_designation || !exp.ExpStartDate || !exp.ExpEndDate) {
                toast.error('Please fill out all fields in the experience details.');
                return;
            }
        }

        try {
            const confirmed = window.confirm("Are you sure you want to update?");
            if (!confirmed) return;

            setLoading(true);

            await updatePersonaldetails();
            await updateEduDetails();
            await updateExpDetails();

            navigate('/employeelist?menuId=3');
            setEditing(false);
        } catch (error) {
            console.error('Error submitting data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (<Loading />
            ) : (
                <>
                    <Header />
                    <section className='InnerHeaderPageSection'>
                        <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    <ul>
                                        <li><Link to="/hrdashboard?moduleId=616">UM Module</Link></li>
                                        <li><h1> &nbsp; / &nbsp; Profile </h1></li>
                                        {location.search.includes('edit') && <li><h1>&nbsp; Edit</h1></li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="ProfilePageSection">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <form className="ProfileSectionForm row m-0" onSubmit={handleSubmission}>
                                        <PersonalDetails
                                            profileData={profileData}
                                            editing={editing}
                                            handleChange={handleChange}
                                            departmentsType={departmentsType}
                                            designationsType={designationsType}
                                        />
                                        <EducationDetails
                                            educationRows={educationRows}
                                            editing={editing}
                                            handleEducationChange={handleEducationChange}
                                            addEducationRow={addEducationRow}
                                            deleteEducationRow={deleteEducationRow}
                                            degreeOptions={degreeOptions}
                                            gradeOptions={gradeOptions}
                                        />
                                        <ExperienceDetails
                                            experienceRows={experienceRows}
                                            editing={editing}
                                            handleExperienceChange={handleExperienceChange}
                                            addExperienceRow={addExperienceRow}
                                            deleteExperienceRow={deleteExperienceRow}
                                            dropdownsFetched={dropdownsFetched}
                                        />
                                        {editing && (
                                            <div className="ProfileSectionFooter" >
                                                <button type="submit" className="btn btn-primary updatebtn">Update</button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </>
            )}
        </>
    );
}

export default Profile;