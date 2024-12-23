import React from "react";
import "./LineFooter.css";
import Environment from "../../environment";
import tatastamp from "../Reports/Stamps.png";

function LineFooter({ data }) {
    const approveLevel0 = data?.find(item => item.approveLevel === "0");
    const approveLevel1 = data?.find(item => item.approveLevel === "1");

    function formatDate(dateString) {
        return dateString ? new Date(dateString).toLocaleDateString('en-GB') : "";
    }

    return (
        <div className="FooterdataSection LineFooterSection row">
            <div className="col-md-12 col-sm-12 col-xs-12">
                <table style={{ borderBottom: '1px solid #999999' }}>
                    <tbody>
                        <tr style={{ textAlign: 'center' }}>
                            <th colSpan={2}>PREPARED BY</th>
                            <th colSpan={3}>REVIEWED BY</th>
                            <th colSpan={2}>APPROVED BY</th>
                        </tr>
                        <tr style={{ textAlign: 'center' }}>
                            <td colSpan={2} style={{ fontSize: '12px' }}>
                                <div className="FooterDataSignatureSection">
                                    <div className="FooterDataSignBox">
                                        {approveLevel0 && approveLevel0.employeeSign && (
                                            <img className="QCSignatureImg" src={`${Environment.ImageURL}/${approveLevel0.employeeSign}`} alt="QC Signature" />
                                        )}
                                        {approveLevel0 && <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" />}
                                    </div>
                                    <div className="INSPECTEDBYBoxLabelBox">
                                        <span>{approveLevel0?.employeeName}</span>
                                        <span>{approveLevel0?.designation} {approveLevel0 ? '/' : ''}  {approveLevel0?.department}</span>
                                        <span>{formatDate(approveLevel0?.date)}</span>
                                        <span style={{ color: approveLevel0?.status == "Accepted" || approveLevel0?.status == "Approved" ? '#34B233' : approveLevel0?.status == "Pending" ? "#FFA100" : "#ED2939" }}>{approveLevel0?.status}</span>
                                    </div>
                                </div>
                            </td>
                            <td colSpan={3} style={{ fontSize: '12px' }}>
                                <div className="FooterDataSignatureSection">
                                    <div className="FooterDataSignBox">
                                        {approveLevel1 && approveLevel1.employeeSign && (
                                            <img className="QCSignatureImg" src={`${Environment.ImageURL}/${approveLevel1.employeeSign}`} alt="QC Signature" />
                                        )}
                                        {approveLevel1 && <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" />}
                                    </div>
                                    <div className="INSPECTEDBYBoxLabelBox">
                                        <span>{approveLevel1?.employeeName}</span>
                                        <span>{approveLevel1?.designation} {approveLevel1 ? '/' : ''} {approveLevel1?.department}</span>
                                        <span>{formatDate(approveLevel1?.date)}</span>
                                        <div className="hidethisforprint"><span style={{ color: approveLevel1?.status == "Accepted" || approveLevel1?.status == "Approved" ? '#34B233' : approveLevel1?.status == "Pending" ? "#FFA100" : "#ED2939" }}>{approveLevel1?.status}</span></div>
                                    </div>
                                </div>
                            </td>
                            <td colSpan={2} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', border: 'none' }}>
                                {data?.slice(2)?.map((data) => {
                                    return (
                                        <div className="FooterDataSignatureSection" >
                                            <div className="FooterDataSignBox">
                                                {data && data.employeeSign && (
                                                    <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data.employeeSign}`} alt="QC Signature" />
                                                )}
                                            </div>
                                            <div className="INSPECTEDBYBoxLabelBox">
                                                <span>{data?.employeeName}</span>
                                                <span>{data?.designation} {data ? '/' : ''} {data?.department}</span>
                                                <span>{data?.companyName} </span>
                                                <span>{formatDate(data?.date)}</span>
                                                <div className="hidethisforprint"><span style={{ color: data?.status == "Accepted" || data?.status == "Approved" ? '#34B233' : data?.status == "Pending" ? "#FFA100" : "#ED2939" }}>{data?.status}</span></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </td>
                        </tr>
                        {/* <tr style={{ textAlign: 'center' }}>
                            <td colSpan={2} style={{ borderTop: 'none' }}></td>
                            <td colSpan={3} style={{ borderTop: 'none' }}></td>
                            <td colSpan={2} style={{ borderTop: 'none' }}></td>
                        </tr> */}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LineFooter;