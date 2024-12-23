import React, { useState, useEffect, useCallback } from 'react';
import './Rawmateriallist.css';
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import RegisterEmployeebg from '../../assets/images/RegisterEmployeebg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../Common/Pagination/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Environment from "../../environment";
import secureLocalStorage from 'react-secure-storage';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { encryptData } from '../Encrypt-decrypt';

function RawMaterialInwardList() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = secureLocalStorage.getItem("userId");
    const empId = secureLocalStorage.getItem("empId");
    const moduleId = queryParams.get('moduleId');
    const menuId = queryParams.get('menuId');
    const token = secureLocalStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [toDate, setToDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [coatingTypeFilter, setCoatingTypeFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [materialFilter, setMaterialFilter] = useState('');

    useEffect(() => {
        fetchRawMaterials();
    }, []);

    const fetchRawMaterials = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetRMInspectionDataList`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (Array.isArray(response.data)) {
                setRawMaterials(response.data);
                fetchPermissions();
            } else {
                toast.error('Unexpected data format received from the API.');
            }
        } catch (error) {
            toast.error('Failed to load data: ' + error.message);
            console.error('Failed to load data', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionDetailsByPageId`, {
                params: { UserId: encryptData(userId), PageId: menuId },
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setPermissions(response.data[0]);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleViewClick = (material) => {
        navigate(`/inspection-test/menuId=${menuId}&action=view&id=${encryptData(material.pm_inspection_id)}`);
    };

    const handleFirstLevelApproval = (material) => {
        navigate(`/inspection-test/menuId=${menuId}&pm_Approve_level=first&id=${encryptData(material.pm_inspection_id)}`);
    };

    const handleEdit = (material) => {
        navigate(`/rawmaterialinspection?moduleId=${moduleId}&menuId=${menuId}&action=edit&id=${encryptData(material.pm_inspection_id)}`);
    };

    const getUniqueOptions = (data, key) => {
        return [...new Set(data.map(item => item[key]))];
    };

    const renderDropdownFilters = () => {
        const uniqueCoatingTypes = getUniqueOptions(rawMaterials, 'Coat_type');
        const uniqueClients = getUniqueOptions(rawMaterials, 'Client_name');
        const uniqueMaterial = getUniqueOptions(rawMaterials, 'rawmaterial');

        return (
            <>
                <div className="form-group">
                    <label>Material</label>
                    <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}>
                        <option value="">All</option>
                        {uniqueMaterial.map((material, index) => (
                            <option key={index} value={material}>{material}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Coating Type</label>
                    <select value={coatingTypeFilter} onChange={(e) => setCoatingTypeFilter(e.target.value)}>
                        <option value="">All</option>
                        {uniqueCoatingTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Client</label>
                    <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                        <option value="">All</option>
                        {uniqueClients.map((client, index) => (
                            <option key={index} value={client}>{client}</option>
                        ))}
                    </select>
                </div>

                <i className="fa fa-refresh" onClick={resetFilters}></i>
            </>
        );
    };

    const resetFilters = () => {
        setFromDate(null);
        setToDate(null);
        setCoatingTypeFilter('');
        setClientFilter('');
        setMaterialFilter('');
    };

    const handleDelete = async (material) => {
        const { tallySheetId, pipeId } = material;

        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            const response = await axios.post(`${Environment.BaseAPIURL}/api/User/rawMaterialDelete`, {
                                tallySheetId: parseInt(tallySheetId),
                                pipeId: parseInt(pipeId),
                                pipeDeleteStatus: true
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                }
                            });
                            if (response.status === 200) {
                                setRawMaterials(prevMaterials => prevMaterials.filter(row => row.tallySheetId !== tallySheetId));
                                toast.success('Data deleted successfully.');
                            } else {
                                toast.error('Error deleting data: ' + response.statusText);
                            }
                        } catch (error) {
                            toast.error('Error deleting data: ' + error.message);
                        }
                    }
                },
                { label: 'No' }
            ]
        });
    };

    const filteredRawMaterials = rawMaterials.filter(item => {
        const inspectionDate = new Date(item.pm_insp_date);
        return (!fromDate || inspectionDate >= fromDate) &&
            (!toDate || inspectionDate <= toDate) &&
            (!coatingTypeFilter || item.Coat_type === coatingTypeFilter) &&
            (!clientFilter || item.Client_name === clientFilter) &&
            (!materialFilter || item.rawmaterial === materialFilter)
    });

    const displayData = filteredRawMaterials.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const pageCount = Math.ceil(filteredRawMaterials.length / pageSize);

    const handlePageClick = data => {
        setCurrentPage(data.selected);
    };

    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [reportName, setReportName] = useState()
    const [reportPath, setReportPath] = useState()
    const [images, setImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const onDrop = useCallback((acceptedFiles) => {
        // Function to read a file and return its base64 representation
        const readFileAsBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 data part
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        // Process each file, read its base64 value, and then update the state
        const processFiles = async () => {
            const newImages = await Promise.all(
                acceptedFiles.map(async (file) => {
                    const base64 = await readFileAsBase64(file); // Wait for the base64 conversion
                    return {
                        id: Math.random(),
                        file,
                        preview: URL.createObjectURL(file),
                        base64, // Set the base64 value
                    };
                })
            );

            setImages((prevImages) => [...prevImages, ...newImages]); // Update state with new images
        };

        processFiles(); // Call the async function to process files
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fileData = images.map((item, index) => ({
            file_name: item.file.path,
            file_data: item.base64,
            seq_no: index + 1,
        }));

        const dataToSend = {
            comp_id: 1,
            loc_id: 1,
            insp_id: selectedRow.pm_inspection_id,
            userid: empId,
            filedata: fileData
        }
        try {
            const response = await axios.post(Environment.BaseAPIURL + "/api/User/UploadInspAttachment", dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.data == "1000") {
                toast.success("Data submitted successfully");
                setIsModalOpen(false);
                setIsFileUploaded(false);
                setReportPath('');
                setReportName('');
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            toast.error("Failed to submit");
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [] },
        multiple: true,
    });

    const removeImage = (id) => {
        setImages(images.filter((image) => image.id !== id));
    };

    const moveImageUp = (index) => {
        if (index === 0) return;
        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index - 1];
        newImages[index - 1] = temp;
        setImages(newImages);
    };

    const moveImageDown = (index) => {
        if (index === images.length - 1) return;
        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index + 1];
        newImages[index + 1] = temp;
        setImages(newImages);
    };

    return (
        <>
            {loading ? <Loading /> :
                <>
                    <Header />
                    <section className='InnerHeaderPageSection'>
                        <div className='InnerHeaderPageBg' style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    <ul>
                                        <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                                        <b style={{ color: '#fff' }}>/ &nbsp;</b>
                                        <li><Link to={`/inspectiontesting?moduleId=${moduleId}&menuId=${menuId}`}>Raw Material Test & Inspection</Link></li>
                                        <li><h1>/ &nbsp; Raw Material Inward List</h1></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className='RawmateriallistPageSection'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12 col-sm-12 col-xs-12'>
                                    <div className='RawmateriallistTables'>
                                        <span><i className="fas fa-filter"></i> Filter</span>
                                        <div className='tableheaderflex'>
                                            <div className="tableheaderfilter">
                                                <form className="DateFilterBox">
                                                    <div className="form-group">
                                                        <label>From Date</label>
                                                        <DatePicker
                                                            maxDate={new Date()}
                                                            selected={fromDate}
                                                            onChange={(date) => setFromDate(date)}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="DD-MM-YYYY"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>To Date</label>
                                                        <DatePicker
                                                            maxDate={new Date()}
                                                            selected={toDate}
                                                            onChange={(date) => setToDate(date)}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="DD-MM-YYYY"
                                                        />
                                                    </div>
                                                    {renderDropdownFilters()}
                                                </form>
                                            </div>
                                            <div className='tableheaderAddbutton'>
                                                <Link to={`/rawmaterialinspection?moduleId=${moduleId}&menuId=${menuId}`} style={{ float: 'right' }}>
                                                    <i className="fas fa-plus"></i> Add
                                                </Link>
                                            </div>
                                        </div>
                                        <ul className='Rawmaterialinspectionlistlegend'>
                                            <li><i className="fas fa-eye" style={{ color: "#4caf50" }}></i> View</li>
                                            <li><i className="fas fa-edit" style={{ color: "#ff9800" }}></i> Edit</li>
                                            <li><i className="fas fa-check" style={{ color: "#4caf50" }}></i> Single Level Approval</li>
                                            <li><i className="fas fa-upload" style={{ color: "#14aee1" }} ></i>Upload File</li>
                                        </ul>
                                        <div className='table-responsive' id='custom-scroll'>
                                            <table>
                                                <thead>
                                                    <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                        <th style={{ minWidth: '60px' }}>Sr. No.</th>
                                                        <th style={{ minWidth: '130px' }}>Material</th>
                                                        <th style={{ minWidth: '130px' }}>Type Of Coating</th>
                                                        <th style={{ minWidth: '130px' }}>Client Name</th>
                                                        <th style={{ minWidth: '50px' }}>No. Of Entries</th>
                                                        <th style={{ minWidth: '80px' }}>Inspection Date</th>
                                                        <th style={{ minWidth: '60px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayData.length === 0 ? (
                                                        <tr><td colSpan="6">Data not available.</td></tr>
                                                    ) : (
                                                        displayData.map((row, index) => (
                                                            <tr key={index}>
                                                                <td>{currentPage * pageSize + index + 1}</td>
                                                                <td>{row.rawmaterial}</td>
                                                                <td>{row.Coat_type}</td>
                                                                <td>{row.Client_name}</td>
                                                                <td>{row.Entity}</td>
                                                                <td>{new Date(row.pm_insp_date).toLocaleDateString('en-GB').replace(/\//g, "-")}</td>
                                                                <td>
                                                                    <div style={{ display: 'flex' }}>
                                                                        {permissions?.indexPerm === "1" && (
                                                                            <i className="fas fa-eye" onClick={() => handleViewClick(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.firstLevelApprove === "1" && row.IsShowForFirstLevelApproval === 1 && row.IsSubmitted === 1 && (
                                                                            <i className="fas fa-check" onClick={() => handleFirstLevelApproval(row)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {permissions?.editPerm === "1" && row.IsSubmitted === 0 && row.pm_isapproved === 0 && (
                                                                            <i className="fas fa-edit" onClick={() => handleEdit(row)} style={{ color: "#ff9800", margin: '4px', cursor: "pointer" }}></i>
                                                                        )}
                                                                        {row.pm_insp_emp_id === empId ? <>
                                                                            <i title="Upload" className="fa-solid fa-upload" style={{ color: "#14aee1", margin: '4px', cursor: "pointer", marginLeft: '10px' }} onClick={() => { setIsModalOpen(true); setSelectedRow(row); setImages([]) }} ></i>

                                                                            <Modal
                                                                                isOpen={isModalOpen}
                                                                                onRequestClose={() => setIsModalOpen(false)}
                                                                                contentLabel="Image Upload Modal"
                                                                                style={{
                                                                                    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                                                                                    content: { width: '40%', margin: 'auto', padding: '20px', borderRadius: '10px' }
                                                                                }}
                                                                            >
                                                                                <h2>
                                                                                    Upload Images
                                                                                    <i onClick={() => setIsModalOpen(false)} className='fas fa-times'></i>
                                                                                </h2>
                                                                                <div {...getRootProps({ className: 'dropzone' })}>
                                                                                    <input {...getInputProps()} />
                                                                                    <FontAwesomeIcon icon={faUpload} size="2x" />
                                                                                    <p>Drag & drop or click to select images (JPEG/PNG only)</p>
                                                                                </div>
                                                                                <div className="image-preview-container" style={{ marginTop: '20px' }}>
                                                                                    <div className='LegendUploadModalBox'>
                                                                                        <span><FontAwesomeIcon icon={faTrash} /> Delete</span>
                                                                                        <span><FontAwesomeIcon icon={faArrowUp} /> Drag Up</span>
                                                                                        <span><FontAwesomeIcon icon={faArrowDown} /> Drag Down</span>
                                                                                    </div>
                                                                                    {images.map((image, index) => (
                                                                                        <>
                                                                                            <div key={image.id} className="image-preview" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                    <p style={{ marginRight: '10px' }}>{index + 1}</p>
                                                                                                    <img src={image.preview} alt={`Preview ${index + 1}`} style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <FontAwesomeIcon title='Delete' onClick={() => removeImage(image.id)} icon={faTrash} />
                                                                                                    <FontAwesomeIcon title='Drag Up' onClick={() => moveImageUp(index)} icon={faArrowUp} />
                                                                                                    <FontAwesomeIcon title='Drag Down' onClick={() => moveImageDown(index)} icon={faArrowDown} />
                                                                                                </div>
                                                                                            </div>
                                                                                        </>

                                                                                    ))}
                                                                                </div>
                                                                                <div style={{ display: 'flex', justifyContent: 'end' }}>
                                                                                    {images.length ? <button type="submit" onClick={handleSubmit} className="submit-button">Submit</button> : ''}
                                                                                </div>
                                                                            </Modal>
                                                                        </> : ""}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
                                    </div>
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

export default RawMaterialInwardList;