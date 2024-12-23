import React, { useState, useEffect } from "react";
import './Pipe-details.css';
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import axios from 'axios';
import Environment from "../../environment";
import Loading from "../Loading";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import secureLocalStorage from "react-secure-storage";
import Select from 'react-select';

const Pipe = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const menuId = searchParams.get('menuId');
    const userId = secureLocalStorage.getItem('userId');
    const [loading, setLoading] = useState(false);
    const [ddlYear, setddlYear] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [pipeData, setPipeData] = useState([]);
    const [visible, setVisible] = useState(false);

    const [formData, setFormData] = useState({
        psYear: "",
        psSeqNo: "",
        pipeNo: "",
        tallySheetNo: "",
        poNo: "",
        soNo: "",
    });

    useEffect(() => {
        setLoading(true)
        // fetchYear();
        setTimeout(() => {
            setLoading(false)
        }, 2000);
    }, [])

    // const fetchYear = async () => {
    //     try {
    //         const response = await axios.get(Environment.BaseAPIURL + "/api/User/getprocsheetyear")
    //         const sortedYears = response?.data.sort((a, b) => b.year - a.year);
    //         setddlYear(sortedYears);
    //     }
    //     catch (error) {
    //         console.error("Error fetching data:", error);
    //     }
    // };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const isPsSeqNoDisabled = !!formData.pipeNo || !!formData.tallySheetNo;
    const isPipeNoDisabled = !!formData.psSeqNo || !!formData.tallySheetNo;
    const isTallySheetNoDisabled = !!formData.psSeqNo || !!formData.pipeNo;

    const handleSearch = async (e) => {
        e.preventDefault();
        const formattedDates = selectedDates.map(date => date.toLocaleDateString('fr-CA'));
        const effectiveFromDate = fromDate ? new Date(fromDate).toLocaleDateString('fr-CA') : '0001-01-01';
        const effectiveToDate = toDate ? new Date(toDate).toLocaleDateString('fr-CA') : new Date().toLocaleDateString('fr-CA');
        try {
            const type = formData.psSeqNo ? 1 : formData.pipeNo ? 2 : formData.tallySheetNo ? 3 : 0;
            const runid = formData.psSeqNo || formData.pipeNo || formData.tallySheetNo;
            const test = (formData.poNo)
            console.log(test, "test")
            // if (type && runid) {
            const response = await axios.get(`${Environment.BaseAPIURL}/api/User/GetTestDetails?runid=${runid || 0}&type=${type || 0}&pono=${formData.poNo || 0}&sono=${formData.soNo || 0}&fromdate=${effectiveFromDate}&todate=${effectiveToDate}`);

            // const uniqueData = {};

            // response?.data.forEach(entry => {
            //     const key = `${entry.pm_pipe_code}_${entry.Stationid}_${entry.StationTravelled}`; // Create a unique key
            //     if (!uniqueData[key]) {
            //         uniqueData[key] = {
            //             pm_pipe_code: entry.pm_pipe_code,
            //             pm_procsheet_id: entry.pm_procsheet_id,
            //             pm_project_id: entry.pm_project_id,
            //             pm_test_run_id: entry.pm_test_run_id,
            //             Stationid: entry.Stationid,
            //             StationTravelled: entry.StationTravelled,
            //             TestDate: entry.TestDate,
            //             // You can choose which properties to keep or combine here
            //             pm_test_id: entry.pm_test_id, // keeping the last test_id or choose the first if needed
            //             Testname: entry.Testname, // or combine Testnames if needed
            //             pm_reqmnt_suffix: entry.pm_reqmnt_suffix,
            //             pm_test_value1: entry.pm_test_value1,
            //             pm_test_value2: entry.pm_test_value2,
            //             pm_test_result_remarks: entry.pm_test_result_remarks,
            //             pm_test_result_suffix: entry.pm_test_result_suffix,
            //             pm_result_normal: entry.pm_result_normal,
            //             pm_result_hot: entry.pm_result_hot,
            //             pm_f_end: entry.pm_f_end,
            //             pm_middle: entry.pm_middle,
            //             pm_t_end: entry.pm_t_end
            //         };
            //     }
            // });

            // // Convert back to an array if needed
            // const filteredData = Object.values(uniqueData);

            // Log the filtered data
            setPipeData(response?.data);
            setFilteredData(response?.data);
            extractUniqueValues(response?.data);
            setVisible(true);
            // } else {
            //     console.warn("Please fill at least one input.");
            // }
        } catch (error) {
            console.error('Error fetching process sheet details:', error);
        }
    };

    const [filteredData, setFilteredData] = useState([]);
    const initialFilterOptions = {
        pipeNo: "",
        station: "",
        test: "",
        testDate: "",
    };

    const [filterOptions, setFilterOptions] = useState(initialFilterOptions);
    const [uniquePipeNos, setUniquePipeNos] = useState([]);
    const [uniqueStations, setUniqueStations] = useState([]);
    const [uniqueTests, setUniqueTests] = useState([]);
    const [uniqueTestDate, setUniqueTestDate] = useState([]);

    const extractUniqueValues = (data) => {
        const pipeNos = [...new Set(data.map(item => item.pm_pipe_code))].sort();
        const stations = [...new Set(data.map(item => item.StationTravelled))].sort();
        const tests = [...new Set(data.map(item => item.Testname))].sort();
        const testDate = new Set();
        data.forEach(item => {
            const date = new Date(item.TestDate);
            const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            testDate.add(dateString);
        });

        const sortedTestDates = [...testDate].sort((a, b) => new Date(a) - new Date(b));

        setUniquePipeNos(pipeNos);
        setUniqueStations(stations);
        setUniqueTests(tests);
        setUniqueTestDate(sortedTestDates);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterOptions((prev) => ({
            ...prev,
            [name]: value
        }));
        applyFilters({ ...filterOptions, [name]: value });
    };

    const applyFilters = (filters) => {
        let filtered = pipeData;

        if (filters.pipeNo) {
            filtered = filtered.filter(item => item.pm_pipe_code === filters.pipeNo);
        }
        if (filters.station) {
            filtered = filtered.filter(item => item.StationTravelled === filters.station);
        }
        if (filters.test) {
            filtered = filtered.filter(item => item.Testname === filters.test);
        }
        if (filters.testDate) {
            filtered = filtered.filter(item => new Date(item.TestDate).toLocaleDateString('en-GB') === filters.testDate);
        }

        setFilteredData(filtered);
    };

    const resetFilter = () => {
        setFilteredData(pipeData);
        setFilterOptions(initialFilterOptions);
    };

    const basePath = {
        523: "/bare-pipe-inspection/222",
        524: "/phos-blast-insp/677",
        525: "/chromate-coat-insp/670",
        526: "/Thickness-insp/671",
        528: "/final-inspection/673",
        608: "/porosity-test",
        609: "/field-test"
    };

    const handleViewClick = (data) => {
        const path = basePath[data.Stationid];
        if (path) {
            const url = data.Stationid !== 608 && data.Stationid !== 609 ? `${path}&${data.pm_test_run_id}&pm_Approve_level=view&pm_project_id=${data.pm_project_id}&pm_processSheet_id=${data.pm_procsheet_id}&pm_processtype_id=${data.Stationid}&pm_test_id=${data.pm_test_id}&pm_approved_by=${userId}&test_date=${new Date(data?.TestDate).toLocaleDateString('fr-CA')}&menuId=${menuId}`
                : data.Stationid == 608 && (data.pm_test_id == 297 || data.pm_test_id == 298 || data.pm_test_id == 299 || data.pm_test_id == 300 || data.pm_test_id == 301 || data.pm_test_id == 302 || data.pm_test_id == 303) ? `cd-test/${data.pm_procsheet_id}&${data.pm_test_run_id}&${data.Stationid}&${data.pm_test_id}&pm_Approve_level=view&pm_project_id=${data.pm_project_id}&pm_processSheet_id=${data.pm_procsheet_id}&pm_processtype_id=${data.Stationid}&pm_test_id=${data.pm_test_id}&pm_approved_by=${userId}&test_date=${new Date(data?.TestDate).toLocaleDateString('fr-CA')}&menuId=${menuId}`
                    : data.Stationid == 608 && (data.pm_test_id == 293 || data.pm_test_id == 986) ? `indentation-test/${data.pm_procsheet_id}&${data.pm_test_run_id}&${data.Stationid}&${data.pm_test_id}&pm_Approve_level=view&pm_project_id=${data.pm_project_id}&pm_processSheet_id=${data.pm_procsheet_id}&pm_processtype_id=${data.Stationid}&pm_test_id=${data.pm_test_id}&pm_approved_by=${userId}&test_date=${new Date(data?.TestDate).toLocaleDateString('fr-CA')}&menuId=${menuId}`
                        : data.Stationid == 609 && (data.pm_test_id == 284 || data.pm_test_id == 303 || data.pm_test_id == 304) ? `field-test/${data.pm_procsheet_id}&${data.pm_test_run_id}&${data.Stationid}&${data.pm_test_id}&pm_Approve_level=view&pm_project_id=${data.pm_project_id}&pm_processSheet_id=${data.pm_procsheet_id}&pm_processtype_id=${data.Stationid}&pm_test_id=${data.pm_test_id}&pm_approved_by=${userId}&test_date=${new Date(data?.TestDate).toLocaleDateString('fr-CA')}&menuId=${menuId}`
                            : data.Stationid == 609 && (data.pm_test_id == 987 || data.pm_test_id == 1433 || data.pm_test_id == 291) ? `peel-test/${data.pm_procsheet_id}&${data.pm_test_run_id}&${data.Stationid}&${data.pm_test_id}&pm_Approve_level=view&pm_project_id=${data.pm_project_id}&pm_processSheet_id=${data.pm_procsheet_id}&pm_processtype_id=${data.Stationid}&pm_test_id=${data.pm_test_id}&pm_approved_by=${userId}&test_date=${new Date(data?.TestDate).toLocaleDateString('fr-CA')}&menuId=${menuId}`
                                : `${path}/${data.pm_procsheet_id}&${data.pm_test_run_id}&${data.Stationid}&${data.pm_test_id}&pm_Approve_level=view&pm_project_id=${data.pm_project_id}&pm_processSheet_id=${data.pm_procsheet_id}&pm_processtype_id=${data.Stationid}&pm_test_id=${data.pm_test_id}&pm_approved_by=${userId}&test_date=${new Date(data?.TestDate).toLocaleDateString('fr-CA')}&menuId=${menuId}`
            window.open(url, '_blank');
        } else {
            console.error('Invalid Station ID');
        }
    };

    const [selectedDates, setSelectedDates] = useState([]);
    const handleDateChange = (date) => {
        // Toggle date selection
        setSelectedDates(prevDates => {
            const isDateSelected = prevDates.some(selectedDate => selectedDate.getTime() === date.getTime());
            return isDateSelected ? prevDates.filter(d => d.getTime() !== date.getTime()) : [...prevDates, date];
        });
        // Clear From and To Date fields if a date is selected in Select Date
        if (date) {
            setFromDate(null);
            setToDate(null);
        }
    };

    const formattedDates = selectedDates.map(date => date.toLocaleDateString('en-GB')).join(", ");

    return (
        <>
            {loading ? (<Loading />) : (
                <>
                    <Header />
                    <section className="InnerHeaderPageSection">
                        <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <ul>
                                        <li><Link to='/dashboard?moduleId=618'>Quality Module</Link></li>
                                        <li><h1>/&nbsp; Pipe Details </h1></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="RawmaterialPageSection">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <div className="PipeTallySheetDetails">
                                        <form className="form row m-0" >
                                            <div className="col-md-12 col-sm-12 col-xs-12">
                                            </div>
                                            <div className='col-md-2 col-sm-3 col-xs-12'>
                                                <div className='form-group'>
                                                    <label htmlFor="">Process Sheet No.</label>
                                                    {/* <div className='ProcessSheetFlexNo'>
                                                        <select name="psYear" value={formData?.psYear} onChange={handleInputChange} >
                                                            <option value=""> Year </option>
                                                            {ddlYear.map((yearOption, i) => (
                                                                <option key={i} value={yearOption.year} disabled={isPsSeqNoDisabled}> {yearOption.year} </option>
                                                            ))}
                                                        </select>
                                                        <b>-</b> */}
                                                    <input
                                                        type="number"
                                                        name="psSeqNo"
                                                        value={formData?.psSeqNo}
                                                        onChange={handleInputChange}
                                                        placeholder='Enter process sheet no.'
                                                        disabled={isPsSeqNoDisabled}
                                                    />
                                                    {/* </div> */}
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-sm-3 col-xs-12">
                                                <div className="form-group">
                                                    <label htmlFor="pipeNo">Pipe No.</label>
                                                    <input
                                                        type="text"
                                                        id="pipeNo"
                                                        name="pipeNo"
                                                        placeholder="Enter pipe no."
                                                        value={formData.pipeNo}
                                                        onChange={handleInputChange}
                                                        disabled={isPipeNoDisabled}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-sm-3 col-xs-12">
                                                <div className="form-group">
                                                    <label htmlFor="tallySheetNo">Tally Sheet No.</label>
                                                    <input
                                                        type="text"
                                                        id="tallySheetNo"
                                                        name="tallySheetNo"
                                                        placeholder="Enter tally sheet no."
                                                        value={formData.tallySheetNo}
                                                        onChange={handleInputChange}
                                                        disabled={isTallySheetNoDisabled}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-sm-3 col-xs-12">
                                                <div className="form-group">
                                                    <label htmlFor="poNo">PO No.</label>
                                                    <input
                                                        type="text"
                                                        id="poNo"
                                                        name="poNo"
                                                        placeholder="Enter PO no."
                                                        value={formData.poNo}
                                                        onChange={handleInputChange}
                                                    // disabled={isTallySheetNoDisabled}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2 col-sm-3 col-xs-12">
                                                <div className="form-group">
                                                    <label htmlFor="soNo">SO No.</label>
                                                    <input
                                                        type="text"
                                                        id="soNo"
                                                        name="soNo"
                                                        placeholder="Enter SO no."
                                                        value={formData.soNo}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            {/* {(!fromDate && !toDate) &&
                                                <div className="col-md-2 col-sm-3 col-xs-12">
                                                    <div className="form-group">
                                                        <label>Select Dates</label>
                                                        <DatePicker
                                                            id="select-date-picker"
                                                            selected={null}
                                                            onChange={handleDateChange}
                                                            maxDate={new Date()}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="DD-MM-YYYY"
                                                            shouldCloseOnSelect={false}
                                                            highlightDates={selectedDates}
                                                            disabled={fromDate || toDate}
                                                        />
                                                    </div>
                                                </div>} */}
                                            {selectedDates.length > 0 &&
                                                <div className="col-md-2 col-sm-3 col-xs-12">
                                                    <div className="form-group">
                                                        <label>Selected Dates</label>
                                                        <input
                                                            type="text"
                                                            value={formattedDates}
                                                            placeholder="DD-MM-YYYY"
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>}
                                            {selectedDates.length < 1 && <>
                                                <div className="col-md-2 col-sm-3 col-xs-12">
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
                                                </div>
                                                <div className="col-md-2 col-sm-3 col-xs-12">
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
                                                </div>
                                            </>}
                                            <div className="col-md-2 col-sm-3 col-xs-12 mt-4" style={{ marginTop: "1.8rem" }}>
                                                <button type="submit" className="SubmitNextbtn" onClick={handleSearch}>Search</button>
                                            </div>
                                        </form>

                                        {visible && <><div className="col-md-12 col-sm-12 col-xs-12"><hr /></div>

                                            <div className="row m-0" style={{ alignItems: 'center' }}>
                                                <div className="col-md-3 col-sm-3 col-xs-12">
                                                    <div className="form-group">
                                                        <label htmlFor="filterPipeNo">Filter by Pipe No.</label>
                                                        <Select
                                                            options={uniquePipeNos.map(pipeNo => ({ value: pipeNo, label: pipeNo }))}
                                                            onChange={(selectedOption) => handleFilterChange({ target: { name: 'pipeNo', value: selectedOption?.value } })}
                                                            isSearchable
                                                            isClearable
                                                            placeholder="Filter by pipe no."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-sm-3 col-xs-12">
                                                    <div className="form-group">
                                                        <label htmlFor="filterStation">Filter by Station</label>
                                                        <Select
                                                            options={uniqueStations.map(station => ({ value: station, label: station }))}
                                                            onChange={(selectedOption) => handleFilterChange({ target: { name: 'station', value: selectedOption?.value } })}
                                                            isSearchable
                                                            isClearable
                                                            placeholder="Filter by station"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-sm-3 col-xs-12">
                                                    <div className="form-group">
                                                        <label htmlFor="filterTest">Filter by Test</label>
                                                        <Select
                                                            options={uniqueTests.map(test => ({ value: test, label: test }))}
                                                            onChange={(selectedOption) => handleFilterChange({ target: { name: 'test', value: selectedOption?.value } })}
                                                            isSearchable
                                                            isClearable
                                                            placeholder="Filter by test"
                                                        />
                                                        {/* <select name="test" value={filterOptions.test} onChange={handleFilterChange}>
                                                            <option value="">All</option>
                                                            {uniqueTests.map((test, index) => (
                                                                <option key={index} value={test}>{test}</option>
                                                            ))}
                                                        </select> */}
                                                    </div>
                                                </div>
                                                <div className="col-md-2 col-sm-3 col-xs-12">
                                                    <div className="form-group">
                                                        <label htmlFor="filterTest">Filter by Test Date</label>
                                                        <Select
                                                            options={uniqueTestDate.map(testDate => ({ value: new Date(testDate).toLocaleDateString('en-GB'), label: new Date(testDate).toLocaleDateString('en-GB') }))}
                                                            onChange={(selectedOption) => handleFilterChange({ target: { name: 'testDate', value: selectedOption?.value } })}
                                                            isSearchable
                                                            isClearable
                                                            placeholder="Filter by date"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-1 col-sm-3 col-xs-12">
                                                    <i className="fa fa-refresh" style={{ cursor: 'pointer' }} onClick={resetFilter}></i>
                                                </div>
                                            </div>

                                            <section className='ReporttableSection'>
                                                <div className='container-fluid'>
                                                    <div className='row'>
                                                        <div className='col-md-12 col-sm-12 col-xs-12'>
                                                            <div id='custom-scroll'>
                                                                <table>
                                                                    <thead>
                                                                        <tr style={{ background: 'rgb(90, 36, 90)' }}>
                                                                            <th style={{ width: '60px' }}>Process Sheet No.</th>
                                                                            <th style={{ width: '40px' }}>Pipe No.</th>
                                                                            <th style={{ width: '60px' }}>Station</th>
                                                                            <th style={{ width: '90px' }}>Test</th>
                                                                            <th style={{ width: '40px' }}>Test Date</th>
                                                                            <th style={{ width: '70px' }}>Requirement</th>
                                                                            <th style={{ width: '40px' }}>Remarks</th>
                                                                            <th style={{ width: '25px' }}>Report</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {filteredData.map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td>{item.pm_procsheet_id || "-"}</td>
                                                                                <td>{item.pm_pipe_code || "-"}</td>
                                                                                <td>{item.StationTravelled || "-"}</td>
                                                                                <td>{item.Testname || "-"}</td>
                                                                                <td>{new Date(item.TestDate).toLocaleDateString('en-GB') || "-"}</td>
                                                                                <td>{item.pm_reqmnt_suffix || "-"}</td>
                                                                                {/* <td>
                                                                                    {isNaN(item.pm_test_value1) || isNaN(item.pm_test_value2)
                                                                                        ? item.pm_test_value1 || item.pm_test_value2
                                                                                        : !isNaN(item.pm_test_value1) || (item.pm_test_value1 !== null || item.pm_test_value1 !== '')
                                                                                            ? Number(item.pm_test_value1).toFixed(2)
                                                                                            : !isNaN(item.pm_test_value2) || (item.pm_test_value2 !== null || item.pm_test_value2 !== '')
                                                                                                ? Number(item.pm_test_value2).toFixed(2)
                                                                                                : '-'}
                                                                                </td> */}
                                                                                {/* <td>{item.pm_test_result_remarks}</td> */}
                                                                                {/* <td>
                                                                                    {isNaN(item.pm_test_value1)
                                                                                        ? item.pm_test_value1
                                                                                        : Number(item.pm_test_value1) === 0
                                                                                            ? '-'
                                                                                            : Number(item.pm_test_value1).toFixed(2)}
                                                                                </td> */}
                                                                                <td>{item.pm_test_result_remarks || "-"}</td>
                                                                                <td><i className="fas fa-eye" onClick={() => handleViewClick(item)} style={{ color: "#4CAF50", margin: '4px', cursor: "pointer" }}></i></td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section></>}
                                    </div>
                                </div>
                            </div>
                        </div >
                    </section >
                    <Footer />
                </>
            )}
        </>
    );
}

export default Pipe;