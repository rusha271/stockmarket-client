import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Stock } from '@/types/stock';
import { useTheme } from '@mui/material';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface PrimeStockTableProps {
  stocks: Stock[];
}

const PrimeStockTable: React.FC<PrimeStockTableProps> = ({ stocks }) => {
  const theme = useTheme();
  
  // Custom CSS for theme-aware styling
  const customStyles = `
    .modern-datatable {
      background: transparent !important;
      color: ${theme.palette.text.primary} !important;
    }
    .modern-datatable .p-datatable-header {
      background: ${theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' 
        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'} !important;
      color: ${theme.palette.text.primary} !important;
      border: 1px solid ${theme.palette.primary.main}20 !important;
      border-radius: 8px 8px 0 0 !important;
      font-weight: 700 !important;
      font-size: 0.9rem !important;
    }
    .modern-datatable .p-datatable-thead > tr > th {
      background: ${theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' 
        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'} !important;
      color: ${theme.palette.text.primary} !important;
      border: none !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      padding: 16px 12px !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 100 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      backdrop-filter: blur(10px) !important;
    }
    .modern-datatable .p-datatable-tbody > tr {
      background: transparent !important;
      border: none !important;
    }
    .modern-datatable .p-datatable-tbody > tr:nth-child(even) {
      background: ${theme.palette.mode === 'light' 
        ? 'rgba(99, 102, 241, 0.02)' 
        : 'rgba(99, 102, 241, 0.05)'} !important;
    }
    .modern-datatable .p-datatable-tbody > tr:hover {
      background: ${theme.palette.mode === 'light' 
        ? 'rgba(99, 102, 241, 0.08)' 
        : 'rgba(99, 102, 241, 0.15)'} !important;
      transform: translateY(-1px) !important;
      box-shadow: ${theme.palette.mode === 'light' 
        ? '0 4px 12px rgba(99, 102, 241, 0.1)' 
        : '0 4px 12px rgba(99, 102, 241, 0.2)'} !important;
    }
    .modern-datatable .p-datatable-tbody > tr > td {
      background: transparent !important;
      color: ${theme.palette.text.primary} !important;
      border: none !important;
      padding: 16px 12px !important;
      font-size: 0.9rem !important;
      white-space: nowrap !important;
      overflow: visible !important;
      text-overflow: ellipsis !important;
      max-width: 200px !important;
      position: relative !important;
      z-index: 1 !important;
    }
    .modern-datatable .p-datatable-tbody > tr > td > div {
      color: ${theme.palette.text.primary} !important;
    }
    .modern-datatable .p-datatable-scrollable-wrapper {
      border-radius: 0 0 8px 8px !important;
    }
    .modern-datatable .p-datatable-scrollable-body {
      overflow-x: auto !important;
    }
    .modern-datatable .p-datatable-scrollable-header {
      background: ${theme.palette.mode === 'light' 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(30, 41, 59, 0.95)'} !important;
      backdrop-filter: blur(10px) !important;
    }
    .modern-datatable .p-datatable-scrollable-body::-webkit-scrollbar {
      height: 8px !important;
    }
    .modern-datatable .p-datatable-scrollable-body::-webkit-scrollbar-track {
      background: ${theme.palette.mode === 'light' 
        ? 'rgba(0, 0, 0, 0.05)' 
        : 'rgba(255, 255, 255, 0.05)'} !important;
      border-radius: 4px !important;
    }
    .modern-datatable .p-datatable-scrollable-body::-webkit-scrollbar-thumb {
      background: ${theme.palette.primary.main} !important;
      border-radius: 4px !important;
    }
    .modern-datatable .p-datatable-scrollable-body::-webkit-scrollbar-thumb:hover {
      background: ${theme.palette.primary.dark} !important;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ 
        width: '100%', 
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
        borderRadius: 12, 
        boxShadow: theme.palette.mode === 'light' 
          ? '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: 24,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        border: theme.palette.mode === 'light' 
          ? '1px solid rgba(255, 255, 255, 0.3)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <DataTable 
          value={stocks} 
          responsiveLayout="scroll" 
          stripedRows 
          style={{ 
            background: 'transparent',
            width: '100%',
            color: theme.palette.text.primary,
          }}
          scrollable
          scrollHeight="400px"
          className="modern-datatable"
        >
        <Column 
          field="name" 
          header="Name" 
          style={{ width: '200px', minWidth: '200px' }} 
          body={(row) => (
            <div style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              width: '180px',
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.95rem',
              padding: '4px 0'
            }}>
              {row.name}
            </div>
          )}
        />
        <Column 
          field="symbol" 
          header="Symbol" 
          style={{ width: '140px', minWidth: '140px' }} 
          body={(row) => (
            <div style={{ 
              fontWeight: 800,
              color: theme.palette.mode === 'light' 
                ? theme.palette.primary.main 
                : theme.palette.primary.light,
              fontSize: '0.9rem',
              padding: '6px 12px',
              borderRadius: 6,
              background: theme.palette.mode === 'light' 
                ? 'rgba(99, 102, 241, 0.1)' 
                : 'rgba(99, 102, 241, 0.2)',
              display: 'inline-block',
              textAlign: 'center',
              width: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {row.symbol}
            </div>
          )}
        />
        <Column 
          field="currentPrice" 
          header="Current Price" 
          style={{ width: '180px', minWidth: '180px' }} 
          body={(row) => (
            <div style={{ 
              color: theme.palette.mode === 'light' 
                ? theme.palette.success.dark 
                : theme.palette.success.light,
              fontWeight: 700,
              fontSize: '1.1rem',
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)',
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${theme.palette.success.main}30`,
              textAlign: 'center',
              width: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              ${row.currentPrice.toFixed(2)}
            </div>
          )}
        />
        <Column 
          field="predictedPrice" 
          header="Predicted Price" 
          style={{ width: '200px', minWidth: '200px' }} 
          body={(row) => (
            <div style={{ 
              color: theme.palette.mode === 'light' 
                ? theme.palette.info.dark 
                : theme.palette.info.light,
              fontWeight: 600,
              fontSize: '1rem',
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(103, 232, 249, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(103, 232, 249, 0.2) 100%)',
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${theme.palette.info.main}30`,
              textAlign: 'center',
              width: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              ${row.predictedPrice.toFixed(2)}
            </div>
          )}
        />
        <Column 
          field="trend" 
          header="Trend" 
          style={{ width: '140px', minWidth: '140px' }} 
          body={(row) => (
            <div style={{ 
              color: row.trend === 'up' 
                ? (theme.palette.mode === 'light' 
                    ? theme.palette.success.dark 
                    : theme.palette.success.light)
                : (theme.palette.mode === 'light' 
                    ? theme.palette.error.dark 
                    : theme.palette.error.light),
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              padding: '6px 12px',
              borderRadius: 20,
              background: row.trend === 'up' 
                ? (theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)')
                : (theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.2) 100%)'),
              border: `1px solid ${row.trend === 'up' ? theme.palette.success.main : theme.palette.error.main}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              width: '130px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontSize: '1.1rem' }}>
                {row.trend === 'up' ? '↗️' : '↘️'}
              </span>
              <span>{row.trend}</span>
            </div>
          )}
        />
      </DataTable>
    </div>
    </>
  );
};

export default PrimeStockTable;