'use client';

import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Settings, Trash2, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useDashboardStore from '@/store/dashboardStore';
import { fetchApiData, getNestedValue } from '@/utils/api';
import { Widget } from '@/types/widget';
import { format } from 'date-fns';
import WidgetConfigModal from '../WidgetConfigModal';

interface WidgetChartProps {
  widget: Widget;
}

function WidgetChart({ widget }: WidgetChartProps) {
  const updateWidget = useDashboardStore((state) => state.updateWidget);
  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    updateWidget(widget.id, { isLoading: true, error: undefined });

    try {
      const response = await fetchApiData(widget.apiUrl, {
        refreshInterval: widget.refreshInterval,
        bypassCache: false, // Use cache for better performance
      });
      
      if (response.error) {
        updateWidget(widget.id, {
          error: response.error,
          isLoading: false,
        });
      } else {
        updateWidget(widget.id, {
          data: response.data,
          lastUpdated: new Date(),
          isLoading: false,
          error: undefined,
        });
      }
    } catch (error: any) {
      updateWidget(widget.id, {
        error: error.message || 'Failed to fetch data',
        isLoading: false,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, widget.refreshInterval * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.apiUrl, widget.refreshInterval, widget.id]);

  const handleRefresh = async () => {
    // Force refresh by bypassing cache
    setIsRefreshing(true);
    updateWidget(widget.id, { isLoading: true, error: undefined });

    try {
      const response = await fetchApiData(widget.apiUrl, {
        refreshInterval: widget.refreshInterval,
        bypassCache: true, // Force fresh data on manual refresh
      });
      
      if (response.error) {
        updateWidget(widget.id, {
          error: response.error,
          isLoading: false,
        });
      } else {
        updateWidget(widget.id, {
          data: response.data,
          lastUpdated: new Date(),
          isLoading: false,
          error: undefined,
        });
      }
    } catch (error: any) {
      updateWidget(widget.id, {
        error: error.message || 'Failed to fetch data',
        isLoading: false,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this widget?')) {
      removeWidget(widget.id);
    }
  };

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!widget.data || widget.selectedFields.length === 0) return [];

    const data = widget.data;
    
    // Check if root data is an array (like /api/mock/chart)
    if (Array.isArray(data) && data.length > 0) {
      if (widget.selectedFields.length >= 2) {
        const xField = widget.selectedFields[0];
        const yFields = widget.selectedFields.slice(1);
        
        // Extract field names from paths (e.g., "[0].date" -> "date")
        const xFieldName = xField.path.replace(/^\[0\]\.?/, '').split('.').pop() || 'name';
        
        return data.map((item: any, index: number) => {
          const result: any = {
            name: item[xFieldName] || item.date || item.time || index,
          };
          yFields.forEach((field) => {
            const fieldName = field.path.replace(/^\[0\]\.?/, '').split('.').pop() || 'value';
            let value = item[fieldName] !== undefined ? item[fieldName] : null;
            // Convert string numbers to actual numbers for proper chart rendering
            if (value !== null && typeof value === 'string' && !isNaN(Number(value))) {
              value = Number(value);
            }
            result[fieldName] = value;
          });
          return result;
        });
      }
      
      // If no fields selected but array exists, use first object's keys
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        return data.map((item: any, index: number) => ({
          ...item,
          name: item.date || item.time || item.name || index,
        }));
      }
    }
    
    // If we have selected fields, use them
    if (widget.selectedFields.length >= 2) {
      // Assume first field is X-axis, others are Y-axis
      const xField = widget.selectedFields[0];
      const yFields = widget.selectedFields.slice(1);

      // Try to extract array data from nested path
      const arrayValue = getNestedValue(data, xField.path);
      if (Array.isArray(arrayValue)) {
        return arrayValue.map((item: any, index: number) => {
          const result: any = {
            name: item[xField.path.split('.').pop() || 'name'] || index,
          };
          yFields.forEach((field) => {
            let value = typeof item === 'object' ? getNestedValue(item, field.path) : null;
            // Convert string numbers to actual numbers for proper chart rendering
            if (value !== null && typeof value === 'string' && !isNaN(Number(value))) {
              value = Number(value);
            }
            result[field.path.split('.').pop() || 'value'] = value;
          });
          return result;
        });
      }
    }

    // Handle Alpha Vantage format: object with "Time Series (Daily)" or similar
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      
      // Look for Alpha Vantage time series structure
      const timeSeriesKey = keys.find(key => 
        key.includes('Time Series') || key.includes('time_series') || key.includes('TimeSeries')
      );
      
      if (timeSeriesKey && typeof data[timeSeriesKey] === 'object') {
        const timeSeries = data[timeSeriesKey];
        const dateKeys = Object.keys(timeSeries).sort();
        
        if (widget.selectedFields.length >= 2) {
          const xField = widget.selectedFields[0];
          const yFields = widget.selectedFields.slice(1);
          
          return dateKeys.map((dateKey) => {
            const dayData = timeSeries[dateKey];
            const result: any = {
              name: dateKey, // Use date as X-axis
            };
            
            yFields.forEach((field) => {
              // Extract field name from path (e.g., "Time Series (Daily).2023-01-01.1. open" -> "1. open")
              const pathParts = field.path.split('.');
              // Remove the first part (time series key) and date key, get the data field
              const dataField = pathParts.slice(2).join('.') || pathParts[pathParts.length - 1];
              let value = dayData[dataField] !== undefined ? dayData[dataField] : null;
              
              // Convert string numbers to actual numbers
              if (value !== null && typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
              }
              
              // Use a clean field name for the chart (e.g., "1. open" -> "open")
              const cleanFieldName = dataField.replace(/^\d+\.\s*/, '').toLowerCase();
              result[cleanFieldName] = value;
            });
            
            return result;
          });
        }
        
        // If no fields selected, create default structure
        return dateKeys.map((dateKey) => {
          const dayData = timeSeries[dateKey];
          return {
            name: dateKey,
            open: dayData['1. open'] ? Number(dayData['1. open']) : null,
            high: dayData['2. high'] ? Number(dayData['2. high']) : null,
            low: dayData['3. low'] ? Number(dayData['3. low']) : null,
            close: dayData['4. close'] ? Number(dayData['4. close']) : null,
            volume: dayData['5. volume'] ? Number(dayData['5. volume']) : null,
          };
        });
      }
      
      // Fallback: try to find any array structure
      for (const key of keys) {
        const value = data[key];
        if (Array.isArray(value) && value.length > 0) {
          return value.map((item: any, index: number) => {
            if (typeof item === 'object' && item !== null) {
              return {
                ...item,
                name: item.date || item.time || item.name || index,
              };
            }
            return { name: index, value: item };
          });
        }
      }
    }

    return [];
  }, [widget.data, widget.selectedFields]);

  const colors = ['#8b5cf6', '#6366f1', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9'];

  return (
    <div className="bg-white/90 dark:bg-indigo-950/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 relative group h-full border-2 border-purple-200/50 dark:border-purple-800/50 flex flex-col hover:shadow-2xl transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{widget.name}</h3>
          <span className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-700 dark:text-purple-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0 border border-purple-300/50 dark:border-purple-700/50">
            {widget.refreshInterval}s
          </span>
        </div>
        <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw
              size={16}
              className={`text-purple-600 dark:text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
            title="Configure"
          >
            <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 w-full">
        {widget.isLoading && !widget.data ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="animate-spin text-purple-600 dark:text-purple-400" size={32} />
          </div>
        ) : widget.error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-400">
              {widget.error}
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No chart data available. Please select appropriate fields for time series data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="line"
              />
              {widget.selectedFields.slice(1).map((field, index) => {
                // Extract field name consistently with chartData transformation
                let dataKey = field.path.replace(/^\[0\]\.?/, '').split('.').pop() || 'value';
                
                // Handle Alpha Vantage format: "Time Series (Daily).2023-01-01.1. open" -> "open"
                if (dataKey.match(/^\d+\.\s*/)) {
                  dataKey = dataKey.replace(/^\d+\.\s*/, '').toLowerCase();
                }
                
                return (
                  <Line
                    key={field.path}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={field.label || dataKey}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      {widget.lastUpdated && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200 dark:border-purple-800 flex items-center gap-1.5 sm:gap-2 text-xs text-purple-600 dark:text-purple-400">
          <Clock size={12} className="flex-shrink-0" />
          <span className="truncate">Last updated: {format(widget.lastUpdated, 'HH:mm:ss')}</span>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <WidgetConfigModal widget={widget} onClose={() => setShowConfigModal(false)} />
      )}
    </div>
  );
}

export default WidgetChart;
