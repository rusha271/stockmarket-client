import * as React from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

interface DataTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  onRowClick?: (row: Record<string, unknown>) => void;
  height?: number;
}

const DataTable: React.FC<DataTableProps> = ({ columns, rows, onRowClick, height = 400 }) => (
  <div style={{ height, width: '100%' }}>
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[5, 10, 20]}
      onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
      sx={{ borderRadius: 2, background: 'white' }}
    />
  </div>
);

export default DataTable; 