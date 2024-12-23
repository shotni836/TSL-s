import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import './Edittallytagmapping.css';
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import Header from '../Common/Header/Header';
import Footer from '../Common/Footer/Footer';
import Loading from '../Loading';
import axios from 'axios';
import Environment from "../../environment";
import secureLocalStorage from "react-secure-storage";

function Viewtallytagmapping() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const moduleId = searchParams.get('moduleId');
    const menuId = searchParams.get('menuId');
    const token = secureLocalStorage.getItem('token');
    const tallySheetId = searchParams.get('tallySheetId');

    const [fileData, setFileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get(`${Environment.BaseAPIURL}/api/User/GetTallyTagInfoDetails?tallySheetId=${tallySheetId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setFileData(response.data || []);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            });
    }, [tallySheetId]);

    const filteredPipeDetails = fileData.pipeDetails?.filter(pipe =>
        pipe.pipeASLNumber.includes(searchQuery) || pipe.pipeNumber.includes(searchQuery)
    );

    return (
        <>
            {isLoading ? <Loading /> :
                <>
                    <Header />
                    <section className="InnerHeaderPageSection">
                        <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <ul>
                                        <li><Link to={`/ppcdashboard?moduleId=${moduleId}`}>PPC Module</Link></li>
                                        <li><h1>/&nbsp;</h1></li>
                                        <li>&nbsp;<Link to={`/tallytagmappinglist?moduleId=${moduleId}&menuId=${menuId}`}>&nbsp;Tally Tag Mapping List</Link></li>
                                        <li><h1>/&nbsp; Tally Tag Mapping View</h1></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className='TallytagmappingPageSection'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='PipeTallySheetDetails'>
                                        <form className='row m-0'>
                                            <div className='col-md-12'>
                                                <h5>Tally Tag Mapping <span>- View page</span></h5>
                                            </div>
                                            {[
                                                { id: 'processSheet', label: 'Process Sheet', value: fileData?.processsheetcode },
                                                { id: 'clientName', label: 'Client Name', value: fileData.clientname },
                                                { id: 'projectName', label: 'Project Name', value: fileData.projectname },
                                                { id: 'pipeSize', label: 'Pipe Size', value: fileData.pipesize },
                                                { id: 'specification', label: 'Specification', value: fileData.specification },
                                                { id: 'poNo', label: 'PO.NO/LOA.NO', value: fileData.poNo },
                                                { id: 'dated', label: 'Date', value: new Date(fileData.testdate).toLocaleDateString('en-GB').replace(/\//g, "-") },
                                                { id: 'shift', label: 'Shift', value: fileData.pm_shiftvalue },
                                            ].map(field => (
                                                <div key={field.id} className='col-md-4'>
                                                    <div className='form-group'>
                                                        <label htmlFor={field.id}>{field.label}</label>
                                                        <input
                                                            id={field.id}
                                                            value={field.value}
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="row m-0">
                                                {[
                                                    { id: 'soNumber', label: 'Sr No.', value: fileData?.soNumber },
                                                    { id: 'tallySheetNo', label: 'Tally Sheet No.', value: fileData?.tallySheetNo },
                                                    { id: 'mtcNo', label: 'MTC No.', value: fileData?.mtcNo },
                                                    { id: 'pipeRecievDate', label: 'Date', value: new Date(fileData?.pipeDetails?.[0]?.pipeRecievDate).toLocaleDateString('en-GB') },
                                                ].map(field => (
                                                    <div key={field.id} className='col-md-3'>
                                                        <div className='form-group'>
                                                            <label htmlFor={field.id}>{field.label}</label>
                                                            <input
                                                                id={field.id}
                                                                value={field.value}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='col-md-12'>
                                                <div className="DragDropUploadDivBox">
                                                    <div className='Tallytagmappingtable'>
                                                        <div className='NumberrowsSubmitFlexBox'>
                                                            <p className='NumberrowsTxt'>Number of rows in the Excel file / Total Pipe Numbers: <b>{fileData.pipeDetails?.length || 0}</b></p>
                                                            <label htmlFor="totalPipeLength" style={{ margin: '0', fontSize: '14px' }}>Total Pipe Length(MTR.):
                                                                <span style={{ padding: '0.5em', color: '#518ada' }} id="totalPipeLength" readOnly>
                                                                    {fileData.pipeDetails ? fileData.pipeDetails.reduce((total, pipe) => total + parseFloat(pipe.pipeLength), 0).toFixed(2) : 0}
                                                                </span>
                                                            </label>
                                                        </div>

                                                        <div className='SearchBox'>
                                                            <input
                                                                style={{ width: "250px" }}
                                                                type="text"
                                                                placeholder="Search by ASL number or Pipe number"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                        </div>
                                                        <ul className="fadedIcon tally-tag-legends" style={{ display: 'flex', justifyContent: 'end' }}>
                                                            <li style={{ color: '#6bcf5f' }}><span style={{ border: '1px solid', borderRadius: '50%', padding: '0 3px', marginRight: '2px', fontSize: '10px' }}>A</span>Active</li>
                                                            <li style={{ color: '#ff5252' }}><span style={{ margin: '0 10px', border: '1px solid', borderRadius: '50%', padding: '0 3px', marginRight: '2px', fontSize: '10px' }}>D</span>Deactive</li>
                                                            <li style={{ color: '#ff9800' }}><span style={{ margin: '0 10px', border: '1px solid', borderRadius: '50%', padding: '0 3px', marginRight: '2px', fontSize: '10px' }}>H</span>Hold</li>
                                                        </ul>
                                                        <Table striped bordered className='tallytagmappingExcelfileTable'>
                                                            <thead>
                                                                <tr style={{ background: 'rgb(90, 36, 90)', color: '#fff' }}>
                                                                    <th style={{ width: '50px' }}>S. No.</th>
                                                                    <th style={{ width: '50px' }}>PIPE No.</th>
                                                                    <th style={{ width: '100px' }}>HEAT No.</th>
                                                                    <th style={{ width: '100px' }}>LENGTH (MTR.)</th>
                                                                    <th style={{ width: '100px' }}>WEIGHT (MT.)</th>
                                                                    <th style={{ width: '100px' }}>REMARKS (ASL No.)</th>
                                                                    <th style={{ width: '100px' }}>STATUS</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {filteredPipeDetails?.map((pipe, index) => (
                                                                    <tr key={index}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{pipe.pipeNumber}</td>
                                                                        <td>{pipe.pipeHeatNumber}</td>
                                                                        <td>{pipe.pipeLength}</td>
                                                                        <td>{pipe.pipeWeight}</td>
                                                                        <td>{pipe.pipeASLNumber}</td>
                                                                        <td className='action-radio-buttons'>
                                                                            <div><input type="radio" checked={pipe.pipeStatus === 'A'} readOnly title='Active' /> A</div>
                                                                            <div><input type="radio" checked={pipe.pipeStatus === 'D'} readOnly title='De-active' /> D</div>
                                                                            <div><input type="radio" checked={pipe.pipeStatus === 'H'} readOnly title='Hold' /> H</div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                        <div className='NumberrowsSubmitFlexBox'>
                                                            <p className='NumberrowsTxt'>Number of rows in the Excel file / Total Pipe Numbers: <b>{fileData.pipeDetails?.length || 0}</b></p>
                                                            <label htmlFor="totalPipeLength" style={{ margin: '0', fontSize: '14px' }}>Total Pipe Length:
                                                                <span style={{ padding: '0.5em', color: '#518ada' }} id="totalPipeLength" readOnly>
                                                                    {fileData.pipeDetails ? fileData.pipeDetails.reduce((total, pipe) => total + parseFloat(pipe.pipeLength), 0).toFixed(2) : 0}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
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

export default Viewtallytagmapping;