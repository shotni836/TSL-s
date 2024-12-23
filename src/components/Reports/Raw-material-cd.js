import React from "react";

function RawMaterialCD({ rawMaterialDetails }) {
    // Adhesive,High Density Polyethylene,Fusion Bonded Epoxy
    const materials = ['Fusion Bonded Epoxy', 'Adhesive', 'High Density Polyethylene',];

    const materialNames = materials;
    const manufacturerNames = materials.map(material =>
        rawMaterialDetails.find(item => item.materialName === material)?.manufacturerName || '-'
    );
    const grades = materials.map(material =>
        rawMaterialDetails.find(item => item.materialName === material)?.grade || '-'
    );
    const batchNos = materials.map(material =>
        rawMaterialDetails.find(item => item.materialName === material)?.batch || '-'
    );

    return (
        <>
            <section className="Reportrawmaterialsection">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-xs-12">
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={rawMaterialDetails.length * 2} style={{ textAlign: 'left', padding: '0 12px' }}>RAW MATERIAL USED</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '200px', textAlign: 'left', padding: '0 12px' }}>Material</th>
                                            {materialNames.map((material, index) => (
                                                <td key={index}>{material}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '0 12px' }}>Manufacturer</th>
                                            {manufacturerNames.map((manufacturer, index) => (
                                                <td key={index}>{manufacturer}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '0 12px' }}>Grade</th>
                                            {grades.map((grade, index) => (
                                                <td key={index}>{grade}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '0 12px' }}>Batch No.</th>
                                            {batchNos.map((batchNo, index) => (
                                                <td key={index}>{batchNo}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default RawMaterialCD;