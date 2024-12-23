import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import "./ExportData.css"

const ExportData = ({ data, columns, fileName }) => {
    const exportToExcel = () => {
        const visibleData = data.map(row =>
            columns.reduce((acc, col) => {
                acc[col.accessor] = row[col.accessor];
                return acc;
            }, {})
        );

        const worksheet = XLSX.utils.json_to_sheet(visibleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = columns.map(col => col.header);
        const tableRows = data.map(row => columns.map(col => row[col.accessor]));
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
        });
        doc.save(`${fileName}.pdf`);
    };

    return (
        <div className="export-buttons">
            <i className='fas fa-file-excel' onClick={exportToExcel}></i>
            <i className="fas fa-file-pdf" onClick={exportToPDF}></i>
        </div>
    );
};

export default ExportData;