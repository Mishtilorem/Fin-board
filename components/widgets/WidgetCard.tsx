'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Settings, Trash2, Clock } from 'lucide-react';
import useDashboardStore from '@/store/dashboardStore';
import { fetchApiData, getNestedValue } from '@/utils/api';
import { Widget } from '@/types/widget';
import { format } from 'date-fns';
import WidgetConfigModal from '../WidgetConfigModal';

interface WidgetCardProps {
  widget: Widget;
}

export default function WidgetCard({ widget }: WidgetCardProps) {
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

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      // Check if it looks like currency
      if (value > 1000) {
        return new Intl.NumberFormat('en-IN', {
          maximumFractionDigits: 2,
        }).format(value);
      }
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 relative group h-full w-full border border-gray-200/50 dark:border-gray-700/50 flex flex-col">
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

      {/* Content */}
      <div className="space-y-4 flex-1">
        {widget.isLoading && !widget.data ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
          </div>
        ) : widget.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-400">
            {widget.error}
          </div>
        ) : widget.data && widget.selectedFields.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {widget.selectedFields.map((field, index) => {
              const value = getNestedValue(widget.data, field.path);
              return (
                <div key={index} className="flex justify-between items-center py-2 sm:py-2.5 gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 capitalize truncate">
                    {field.label || field.path.split('.').pop()}
                  </span>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-right break-words">{formatValue(value)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No fields selected
          </div>
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
