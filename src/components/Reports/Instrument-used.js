import React, { useEffect } from "react";


function InstrumentusedSection({ reportData }) {
    useEffect(() => {
        console.log(reportData)
        createTable(reportData);
    }, [])

    function createTable(data) {
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');
        tableHead.innerHTML = '';  // Clear previous header
        tableBody.innerHTML = '';  // Clear previous content

        // Create table header
        const headerRow = document.createElement('tr');
        data.forEach(() => {
            const nameHeader = document.createElement('th');
            nameHeader.textContent = 'INSTRUMENT NAME';
            headerRow.appendChild(nameHeader);
            const serialHeader = document.createElement('th');
            serialHeader.textContent = 'INSTRUMENT ID';
            headerRow.appendChild(serialHeader);
        });
        tableHead.appendChild(headerRow);

        // Create table body
        let row = document.createElement('tr');
        data.forEach((item, index) => {
            const nameCell = document.createElement('td');
            nameCell.textContent = item.equip_name;
            row.appendChild(nameCell);

            const serialCell = document.createElement('td');
            serialCell.textContent = item.equip_code;
            row.appendChild(serialCell);

            // Check if we need to start a new row after every 4 pairs
            if ((index + 1) % 4 === 0) {
                tableBody.appendChild(row);
                row = document.createElement('tr');
            }
        });

        // Append the last row if it contains any cells
        if (row.hasChildNodes()) {
            tableBody.appendChild(row);
        }
    }
    return (
        <section className="InstrumentusedSection">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <table id="instrument-table">
                            <thead>
                                <tr>
                                    <th colSpan={reportData.length * 2} style={{ textAlign: 'center', fontSize: '14px' }}>  USED INSTRUMENT</th>
                                </tr>
                            </thead>
                            <thead id="table-head">
                            </thead>
                            <tbody id="table-body">
                            </tbody>
                        </table>
                        {/* <table>
                                <thead>
                                    <tr>
                                        <th colSpan={3} style={{ textAlign: 'center', fontSize: '14px' }}>  USED INSTRUMENT</th>
                                    </tr>
                                    <tr>
                                        <th>SR. NO.</th>
                                        <th>INSTRUMENT NAME</th>
                                        <th>INSTRUMENT ID / SERIAL NO.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((item, index) => (
                                        (item.SrNo || item.equipmentUsed || item.instrumentSerialNo) && (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.equipmentUsed || "-"}</td>
                                                <td>{item.instrumentSerialNo || "-"}</td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table> */}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default InstrumentusedSection;