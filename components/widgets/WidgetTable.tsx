'use client';

import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Settings, Trash2, Clock } from 'lucide-react';
import useDashboardStore from '@/store/dashboardStore';
import { fetchApiData, getNestedValue, flattenObject } from '@/utils/api';
import { Widget } from '@/types/widget';
import { format } from 'date-fns';
import WidgetConfigModal from '../WidgetConfigModal';

interface WidgetTableProps {
  widget: Widget;
}

export default function WidgetTable({ widget }: WidgetTableProps) {
  const updateWidget = useDashboardStore((state) => state.updateWidget);
  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // Extract array data from API response
  const tableData = useMemo(() => {
    if (!widget.data) return [];

    // Try to find array in selected fields
    for (const field of widget.selectedFields) {
      const value = getNestedValue(widget.data, field.path);
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
    }

    // Try to find any array in the data
    const flattened = flattenObject(widget.data);
    const arrayField = flattened.find((f) => f.type === 'array' && Array.isArray(f.value) && f.value.length > 0);
    if (arrayField && Array.isArray(arrayField.value)) {
      return arrayField.value;
    }

    return [];
  }, [widget.data, widget.selectedFields]);

  // Get table columns from first item
  const columns = useMemo(() => {
    if (tableData.length === 0) return [];
    const firstItem = tableData[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
      return Object.keys(firstItem);
    }
    return [];
  }, [tableData]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...tableData];

    // Filter
    if (searchQuery) {
      result = result.filter((row) => {
        if (typeof row === 'object' && row !== null) {
          return Object.values(row).some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return String(row).toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Sort
    if (sortConfig && typeof result[0] === 'object' && result[0] !== null) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [tableData, searchQuery, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = processedData.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current && current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 relative group h-full border border-gray-200/50 dark:border-gray-700/50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{widget.name}</h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium flex-shrink-0">
            {widget.refreshInterval}s
          </span>
        </div>
        <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw
              size={16}
              className={`text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Configure"
          >
            <Settings size={16} className="text-gray-600 dark:text-gray-400" />
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

      {/* Search */}
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Container - Fixed height with vertical scroll */}
      <div className="flex-1 min-h-0 flex flex-col">
        {widget.isLoading && !widget.data ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
          </div>
        ) : widget.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-400">
            {widget.error}
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No data available
          </div>
        ) : (
          <>
            {/* Table - Full width, no horizontal scroll */}
            <div className="overflow-y-auto flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full">
                <colgroup>
                  {columns.map((_, index) => (
                    <col key={index} className="w-auto" />
                  ))}
                </colgroup>
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 uppercase"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{col.replace(/_/g, ' ')}</span>
                          {sortConfig?.key === col && (
                            <span className="flex-shrink-0">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {columns.map((col) => {
                        const cellValue = typeof row === 'object' && row !== null
                          ? String((row as any)[col] ?? 'N/A')
                          : String(row);
                        return (
                          <td 
                            key={col} 
                            className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-gray-200 break-words max-w-0"
                            title={cellValue}
                          >
                            <div className="truncate">{cellValue}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {/* Rows per page selector */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <label>Rows per page:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Page info */}
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of {processedData.length} entries
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {widget.lastUpdated && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
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
