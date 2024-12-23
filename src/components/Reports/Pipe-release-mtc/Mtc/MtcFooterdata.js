import tatastamp from '../../Stamps.png';
import wsign from '../../../../assets/images/wsign.png';
import Environment from "../../../../environment";

function MtcFooterdata({ data, witness }) {

    function formatDate(dateString) {
        return dateString ? new Date(dateString).toLocaleDateString('en-GB') : "";
    }

    data.forEach(item2 => {
        const matchingEntry = witness?.find(item1 => item1.co_param_val_name === item2.companyName);
        if (matchingEntry) {
            item2.witnessSign = wsign;
        }
    });

    if (!data || !Array.isArray(data)) {
        return <p>No data available</p>;
    }

    return (
        <section className="FooterdataSection">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <table>
                            <tr>
                                <th style={{ width: '30%' }}>REVIEWED BY</th>
                                <th style={{ width: '30%' }}>APPROVED BY</th>
                                <th style={{ width: '40%' }}>CLIENT/TPIA</th>
                            </tr>
                            <tr>
                                <td style={{ borderBottom: 'none' }}>
                                    <div className="FooterDataSignatureSection">
                                        <div className="FooterDataSignBox">
                                            {
                                                // Check if there is any data available, otherwise show "Draft"
                                                data[0]?.employeeSign ? (
                                                    <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data[0]?.employeeSign}`} alt="QC Signature" />
                                                ) : (
                                                    <h3 style={{ margin: '0', padding: '30px' }}>Draft</h3>
                                                )
                                            }
                                            {
                                                data[0]?.employeeSign &&
                                                <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" />
                                            }
                                        </div>

                                        <div className="INSPECTEDBYBoxLabelBox">
                                            <span>{data[0]?.employeeName}</span>
                                            <span>{data[0]?.designation} {data[0]?.department}</span>
                                            <span>{formatDate(data[0]?.date)}</span>
                                            <span style={{ color: data[0]?.status == "Accepted" || data[0]?.status == "Approved" ? '#34B233' : data[0]?.status == "Pending" ? "#FFA100" : "#ED2939" }}>{data[0]?.status}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ borderBottom: 'none' }}>
                                    <div className="FooterDataSignatureSection">
                                        <div className="FooterDataSignBox">
                                            {
                                                // Check if there is any data available, otherwise show "Draft"
                                                data[1]?.employeeSign ? (
                                                    <img className="QCSignatureImg" src={`${Environment.ImageURL}/${data[0]?.employeeSign}`} alt="QC Signature" />
                                                ) : (
                                                    <h3 style={{ margin: '0', padding: '30px' }}>Draft</h3>
                                                )
                                            }
                                            {
                                                data[1]?.employeeSign &&
                                                <img src={tatastamp} className="TATAStampImg" alt="TATA Stamp" />
                                            }
                                        </div>

                                        <div className="INSPECTEDBYBoxLabelBox">
                                            <span>{data[1]?.employeeName}</span>
                                            <span>{data[1]?.designation} {data[1]?.department}</span>
                                            <span>{formatDate(data[1]?.date)}</span>
                                            <span style={{ color: data[1]?.status == "Accepted" || data[1]?.status == "Approved" ? '#34B233' : data[1]?.status == "Pending" ? "#FFA100" : "#ED2939" }}>{data[1]?.status}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ borderBottom: 'none' }}>
                                    <div className="AccceptedBYFlexBox">
                                        {data?.length < 2 || !data ? <h3 style={{ margin: '0' }}>Draft</h3> : ''}
                                        {data?.slice(1)?.map((data, index) => (
                                            <div className="NDDBox" key={index}>
                                                {data?.witnessSign && <img className="TPISignatureimg" src={data.witnessSign} alt={`TPI-${index} Signature`} style={{ width: '40px', maxWidth: '40px', minWidth: 'unset' }} />}
                                                {data?.employeeSign ? (
                                                    <img className="TPISignatureimg" src={`${Environment.ImageURL}/${data?.employeeSign}`} alt={`TPI-${index} Signature`} />
                                                ) : (
                                                    <h3 style={{ margin: '0' }}>Draft</h3>
                                                )}
                                                <div className="AcceptedBoxLabelBox">
                                                    <span>{data?.employeeName} ({data?.designation})</span>
                                                    <span>{data?.companyName}</span>
                                                    <span>{formatDate(data?.date)}</span>
                                                    <span className='Approvedtxt' style={{ color: data?.status == "Approved" ? '#34B233' : "#ED2939" }}>{data?.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default MtcFooterdata;