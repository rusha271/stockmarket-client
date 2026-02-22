export interface Stock {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface StockList {
  stocks: Stock[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string; borderColor?: string; }[];
} 