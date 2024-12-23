import React, { useState, useEffect } from "react";
import './Role.css';
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import Loading from "../Loading";
import InnerHeaderPageSection from "../../components/Common/Header-content/Header-content";
import Environment from "../../environment";
import axios from 'axios';
import { toast } from 'react-toastify';

const Role = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemDetails, setItemDetails] = useState([]);
    const [initialItemDetails, setInitialItemDetails] = useState([]);
    const [selectAllRows, setSelectAllRows] = useState([]);
    const [selectAllColumns, setSelectAllColumns] = useState({
        indexPerm: false,
        searchPerm: false,
        editPerm: false,
        createPerm: false,
        deletePerm: false,
        isActivePerm: false,
        chgpasswordPerm: false,
        copy: false,
        addStation: false,
        firstLevelApprove: false,
        secondLevelApprove: false
    });

    const fieldNames = {
        indexPerm: 'View',
        searchPerm: 'Search',
        editPerm: 'Edit',
        createPerm: 'Create',
        deletePerm: 'Delete',
        isActivePerm: 'Active / Deactive',
        chgpasswordPerm: 'Change Password',
        copy: 'Copy',
        addStation: 'Add Station',
        firstLevelApprove: '1st Level Approve',
        secondLevelApprove: '2nd Level Approve'
    };

    useEffect(() => {
        const fetchRoleList = async () => {
            try {
                const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetAllRoleList`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchRoleList();
    }, []);

    const fetchRoleDetails = async () => {
        if (selectedItem) {
            try {
                const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetPermissionByRoleId?roleId=${selectedItem}`);
                setItemDetails(response.data);
                setInitialItemDetails(response.data.map(detail => ({ ...detail })));
                setSelectAllRows(response.data.map(detail =>
                    Object.keys(fieldNames).every(field => detail[field] === "1")
                ));
                setSelectAllColumns(
                    Object.keys(fieldNames).reduce((acc, field) => {
                        acc[field] = response.data.every(detail => detail[field] === "1");
                        return acc;
                    }, {})
                );
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchRoleDetails();
    }, [selectedItem]);

    const handleDropdownChange = (event) => {
        setSelectedItem(event.target.value);
    };

    const handleCheckboxChange = (index, field) => {
        const updatedDetails = [...itemDetails];
        updatedDetails[index][field] = updatedDetails[index][field] === "1" ? "0" : "1";
        setItemDetails(updatedDetails);
        checkSelectAllForRow(index, updatedDetails);
        checkSelectAllForColumn(field, updatedDetails);
    };

    const checkSelectAllForRow = (rowIndex, updatedDetails) => {
        const fields = Object.keys(fieldNames);
        const allChecked = fields.every(field => updatedDetails[rowIndex][field] === "1");
        const newSelectAllRows = [...selectAllRows];
        newSelectAllRows[rowIndex] = allChecked;
        setSelectAllRows(newSelectAllRows);
    };

    const checkSelectAllForColumn = (field, updatedDetails) => {
        const allChecked = updatedDetails.every(detail => detail[field] === "1");
        setSelectAllColumns(prev => ({ ...prev, [field]: allChecked }));
    };

    const handleSave = async () => {
        setLoading(true);
        const changes = itemDetails.filter((detail, index) => {
            const initialDetail = initialItemDetails[index];
            return Object.keys(fieldNames).some(field => detail[field] !== initialDetail[field]);
        }).map(detail => ({
            menuId: detail.id,
            ...Object.keys(fieldNames).reduce((acc, field) => {
                acc[field] = detail[field];
                return acc;
            }, {})
        }));

        if (changes.length > 0) {
            try {
                await axios.post(`${Environment.BaseAPIURL}/api/User/SavePermissionByRoleIdNew`, {
                    compid: 0,
                    locationid: 0,
                    roleId: selectedItem,
                    menuDetails: changes
                });
                toast.success('Permissions updated successfully!');
                fetchRoleDetails();
            } catch (error) {
                console.error('Error saving permissions', error);
                toast.error('Failed to update permissions');
            }
            finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            toast.error('No changes to update.');
        }
    };

    const handleSelectAllRow = (index, checked) => {
        const updatedDetails = [...itemDetails];
        const fields = Object.keys(fieldNames);
        fields.forEach(field => {
            updatedDetails[index][field] = checked ? "1" : "0";
        });
        setItemDetails(updatedDetails);
        setSelectAllRows(prev => {
            const newSelectAllRows = [...prev];
            newSelectAllRows[index] = checked;
            return newSelectAllRows;
        });
        fields.forEach(field => {
            checkSelectAllForColumn(field, updatedDetails);
        });
    };

    const handleSelectAllColumn = (field, checked) => {
        const updatedDetails = [...itemDetails];
        updatedDetails.forEach(detail => {
            detail[field] = checked ? "1" : "0";
        });
        setItemDetails(updatedDetails);
        setSelectAllColumns(prev => ({ ...prev, [field]: checked }));
        updatedDetails.forEach((_, index) => {
            checkSelectAllForRow(index, updatedDetails);
        });
    };

    return (
        <>
            {loading ? (<Loading />) : (
                <>
                    <Header />
                    <InnerHeaderPageSection
                        linkTo="/hrdashboard?moduleId=616"
                        linkText="UM Module"
                        linkText2=" Role Permission"
                    />
                    <section className="RoleSectionPage">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <div className="RoleSectionBoxDetails">
                                        <form className="row m-0">
                                            <div className="col-md-12 col-sm-12 col-xs-12">
                                                <h4>Role Permission</h4>
                                            </div>
                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                <div className="form-group">
                                                    {/* <label htmlFor="">Role</label> */}
                                                    <select name="" id="" onChange={handleDropdownChange}>
                                                        <option selected disabled value="">-- Select role --</option>
                                                        {data && data.map((role, index) => (
                                                            <option value={role.id} key={index}>{role.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-12 col-sm-12 col-xs-12">
                                                {itemDetails.length > 0 && (
                                                    <div>
                                                        <table className="RoleTable">
                                                            <thead>
                                                                <tr style={{ background: 'rgb(90, 36, 90)', color: 'rgb(255, 255, 255)' }}>
                                                                    <th style={{ minWidth: "250px" }}>Permission</th>
                                                                    {Object.keys(fieldNames).map((field, i) => (
                                                                        <th key={i}>
                                                                            <input
                                                                                type="checkbox"
                                                                                onChange={(e) => handleSelectAllColumn(field, e.target.checked)}
                                                                                checked={selectAllColumns[field]}
                                                                            /> {fieldNames[field]}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {itemDetails.map((detail, index) => (
                                                                    <tr key={index}>
                                                                        <td className="RolePermissionsTr">
                                                                            <input
                                                                                type="checkbox"
                                                                                onChange={(e) => handleSelectAllRow(index, e.target.checked)}
                                                                                checked={selectAllRows[index]}
                                                                            />
                                                                            {detail.title}
                                                                        </td>
                                                                        {Object.keys(fieldNames).map((field, i) => (
                                                                            <td key={i}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    onChange={(e) => handleCheckboxChange(index, field)}
                                                                                    checked={detail[field] === "1"}
                                                                                />
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        <div className="RoleFooterSavebtn">
                                                            <button type="button" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Update'}</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </div>
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

export default Role;