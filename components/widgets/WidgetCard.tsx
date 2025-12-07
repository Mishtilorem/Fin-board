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
    <div className="bg-white/90 dark:bg-indigo-950/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 relative group h-full w-full border-2 border-purple-200/50 dark:border-purple-800/50 flex flex-col hover:shadow-2xl transition-all">
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

      {/* Content */}
      <div className="space-y-4 flex-1">
        {widget.isLoading && !widget.data ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-purple-600 dark:text-purple-400" size={32} />
          </div>
        ) : widget.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-400">
            {widget.error}
          </div>
        ) : widget.data && widget.selectedFields.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {widget.selectedFields.map((field, index) => {
              const value = getNestedValue(widget.data, field.path);
              return (
                <div key={index} className="flex justify-between items-center py-2.5 sm:py-3 gap-2 border-b border-purple-100 dark:border-purple-900/50 last:border-0">
                  <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 capitalize truncate">
                    {field.label || field.path.split('.').pop()}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-100 text-right break-words">{formatValue(value)}</span>
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
