import React from 'react';
import { useTable } from 'react-table';

// Sample data from your input
const data = [
    // ... your data here ...
];

const DynamicTable = ({ data }) => {
    console.log(data[0]);

    // Prepare column definitions using co_param_val_name for headers
    const columns = React.useMemo(
        () =>
            data[0].map(item => ({
                Header: item.co_param_val_name,
                accessor: item.co_param_val_name, // Use this key to access cell data
            })),
        []
    );

    const rows = React.useMemo(() => data[1], []);

    // Use the useTable hook to create your table instance
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow,
    } = useTable({ columns, data: rows });

    return (
        <table {...getTableProps()} style={{ border: '1px solid black', width: '100%' }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()} style={{ border: '1px solid black' }}>
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()} style={{ border: '1px solid black' }}>
                                    {cell.render('Cell')}
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default DynamicTable;