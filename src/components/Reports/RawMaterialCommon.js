import React from "react";

function RawMaterialCommon({ rawMaterialDetails }) {
    console.log(rawMaterialDetails, "rawMaterialDetails")
    return (
        <>
            {Array.isArray(rawMaterialDetails) && rawMaterialDetails.length > 0 && (
                <section className="Reportrawmaterialsection">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                <div>
                                    <table>
                                        <thead>
                                            {/* <tr>
                                            <th style={{ paddingLeft: "10px", fontFamily: "Myriad Pro Bold", }} > MATERIAL </th>
                                            <th style={{ paddingLeft: "10px", fontFamily: "Myriad Pro Bold", }} > MANUFACTURER </th>
                                            <th style={{ paddingLeft: "10px", fontFamily: "Myriad Pro Bold", }} > GRADE </th>
                                            <th style={{ paddingLeft: "10px", fontFamily: "Myriad Pro Bold", }} > BATCH NO. </th>
                                        </tr> */}
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>MATERIAL: &nbsp;&nbsp;
                                                    {rawMaterialDetails.map((rawMaterial, index) => (
                                                        <>{rawMaterial.materialName || "-"}{index < rawMaterialDetails.length - 1 ? ',' : ''}&nbsp;</>
                                                        // <td>{rawMaterial.manufacturerName || "-"}</td>
                                                        // <td>{rawMaterial.grade || "-"}</td>
                                                        // <td>{rawMaterial.batch || "-"}</td>
                                                    ))}
                                                </td>
                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>MANUFACTURER: &nbsp;&nbsp;
                                                    {rawMaterialDetails.map((rawMaterial, index) => (
                                                        <>
                                                            {rawMaterial.manufacturerName || "-"}{index < rawMaterialDetails.length - 1 && ", "}&nbsp;
                                                        </>
                                                        // <td>{rawMaterial.grade || "-"}</td>
                                                        // <td>{rawMaterial.batch || "-"}</td>
                                                    ))}</td>
                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>GRADE: &nbsp;&nbsp;
                                                    {rawMaterialDetails.map((rawMaterial, index) => (
                                                        // <>
                                                        //     <td>{rawMaterial.materialName || "-"}</td>
                                                        // </>
                                                        // <td>{rawMaterial.manufacturerName || "-"}</td>
                                                        <>{rawMaterial.grade || "-"}{index < rawMaterialDetails.length - 1 && ", "}&nbsp;</>
                                                        // <td>{rawMaterial.batch || "-"}</td>
                                                    ))}</td>
                                                <td style={{ textAlign: 'left', paddingLeft: '15px', paddingRight: '15px' }}>BATCH: &nbsp;&nbsp;
                                                    {rawMaterialDetails.map((rawMaterial, index) => (
                                                        // <>
                                                        //     <td>{rawMaterial.materialName || "-"}</td>
                                                        // </>
                                                        // <td>{rawMaterial.manufacturerName || "-"}</td>
                                                        // <td>{rawMaterial.grade || "-"}</td>
                                                        <>{rawMaterial.batch || "-"}{index < rawMaterialDetails.length - 1 && ", "}&nbsp;</>
                                                    ))}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default RawMaterialCommon;