'use client';

import { useState, useEffect } from 'react';
import { X, Eye, Search, Plus, Check, Loader2 } from 'lucide-react';
import useDashboardStore from '@/store/dashboardStore';
import { fetchApiData, flattenObject } from '@/utils/api';
import { WidgetField, DisplayMode, Widget } from '@/types/widget';
import { LayoutDashboard, Table, LineChart } from 'lucide-react';

interface WidgetConfigModalProps {
  widget: Widget;
  onClose: () => void;
}

export default function WidgetConfigModal({ widget, onClose }: WidgetConfigModalProps) {
  const updateWidget = useDashboardStore((state) => state.updateWidget);
  
  const [widgetName, setWidgetName] = useState(widget.name);
  const [apiUrl, setApiUrl] = useState(widget.apiUrl);
  const [refreshInterval, setRefreshInterval] = useState(widget.refreshInterval);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(widget.displayMode);
  const [selectedFields, setSelectedFields] = useState<WidgetField[]>(widget.selectedFields);
  const [availableFields, setAvailableFields] = useState<Array<{ path: string; value: any; type: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [apiUrlChanged, setApiUrlChanged] = useState(false);

  // Load existing API data if URL hasn't changed
  useEffect(() => {
    if (widget.data && !apiUrlChanged) {
      const flattened = flattenObject(widget.data);
      setAvailableFields(flattened);
      setApiData(widget.data);
    }
  }, [widget.data, apiUrlChanged]);

  // Track if API URL changes
  useEffect(() => {
    if (apiUrl !== widget.apiUrl) {
      setApiUrlChanged(true);
      setSelectedFields([]);
      setAvailableFields([]);
      setApiData(null);
      setTestResult(null);
    } else {
      setApiUrlChanged(false);
    }
  }, [apiUrl, widget.apiUrl]);

  const testApi = async () => {
    if (!apiUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter an API URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetchApiData(apiUrl, {
        bypassCache: true, // Always get fresh data when testing
      });
      
      if (response.error) {
        setTestResult({ success: false, message: response.error });
        setApiData(null);
      } else {
        setApiData(response.data);
        const flattened = flattenObject(response.data);
        setTestResult({
          success: true,
          message: `API connection successful! ${flattened.length} fields found.`,
        });
        setAvailableFields(flattened);
        // If URL changed, clear selected fields; otherwise keep them
        if (apiUrlChanged) {
          setSelectedFields([]);
        }
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Failed to test API' });
      setApiData(null);
    } finally {
      setIsTesting(false);
    }
  };

  const filteredFields = availableFields.filter((field) => {
    const matchesSearch = field.path.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For "Show arrays only": show fields that are inside arrays (paths containing [0] or similar)
    // or fields that are arrays themselves
    const isInsideArray = field.path.includes('[0]') || field.path.startsWith('[0]');
    const matchesArrayFilter = !showArraysOnly || field.type === 'array' || isInsideArray;
    
    return matchesSearch && matchesArrayFilter;
  });

  const toggleField = (field: { path: string; value: any; type: string }) => {
    const isSelected = selectedFields.some((f) => f.path === field.path);
    
    if (isSelected) {
      setSelectedFields(selectedFields.filter((f) => f.path !== field.path));
    } else {
      setSelectedFields([
        ...selectedFields,
        {
          path: field.path,
          label: field.path.split('.').pop(),
          type: field.type,
          value: field.value,
        },
      ]);
    }
  };

  const handleSubmit = () => {
    if (!widgetName.trim()) {
      alert('Please enter a widget name');
      return;
    }
    if (!apiUrl.trim()) {
      alert('Please enter an API URL');
      return;
    }
    if (selectedFields.length === 0) {
      alert('Please select at least one field to display');
      return;
    }

    updateWidget(widget.id, {
      name: widgetName.trim(),
      apiUrl: apiUrl.trim(),
      refreshInterval,
      displayMode,
      selectedFields,
      // Clear data and error when updating, so it can refresh
      data: undefined,
      error: undefined,
      lastUpdated: undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Widget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="text-gray-600 dark:text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 w-full">
          {/* Widget Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Widget Name
            </label>
            <input
              type="text"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              placeholder="Bitcoin"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* API URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={testApi}
                disabled={isTesting || !apiUrl.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Testing...
                  </>
                ) : (
                  'Test'
                )}
              </button>
            </div>
            {testResult && (
              <div
                className={`p-3 rounded-lg flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                <Eye size={18} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{testResult.message}</span>
              </div>
            )}
            {apiUrlChanged && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
                API URL changed. Please test the connection and re-select fields.
              </div>
            )}
          </div>

          {/* Refresh Interval */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value) || 30)}
              min={1}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Display Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Mode
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDisplayMode('card')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  displayMode === 'card'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutDashboard size={18} />
                Card
              </button>
              <button
                onClick={() => setDisplayMode('table')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  displayMode === 'table'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Table size={18} />
                Table
              </button>
              <button
                onClick={() => setDisplayMode('chart')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  displayMode === 'chart'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <LineChart size={18} />
                Chart
              </button>
            </div>
          </div>

          {/* Field Selection */}
          {(testResult?.success || (!apiUrlChanged && widget.data)) && (
            <div className="space-y-4">
              {!apiUrlChanged && widget.data && !testResult && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                  Using existing API data. Test the API to refresh data, or edit fields below.
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search for fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                {displayMode === 'table' && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showArraysOnly}
                      onChange={(e) => setShowArraysOnly(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    Show arrays only (for table view)
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Available Fields */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Available Fields
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {filteredFields.length} found
                    </span>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 max-h-80 overflow-y-auto shadow-inner">
                    {filteredFields.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        <Search className="mx-auto mb-2 opacity-50" size={24} />
                        No fields found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredFields.map((field, index) => {
                          const isSelected = selectedFields.some((f) => f.path === field.path);
                          const valueStr = String(field.value);
                          const truncatedValue = valueStr.length > 60 ? valueStr.substring(0, 60) + '...' : valueStr;
                          
                          return (
                            <div
                              key={index}
                              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleField(field)}
                                  className={`mt-0.5 flex-shrink-0 p-1.5 rounded-md transition-colors ${
                                    isSelected
                                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  {isSelected ? <Check size={14} /> : <Plus size={14} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white break-words mb-1.5">
                                    {field.path}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                      {field.type}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                                      {truncatedValue}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Fields */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Selected Fields
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                      {selectedFields.length} selected
                    </span>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 max-h-80 overflow-y-auto shadow-inner">
                    {selectedFields.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        <Plus className="mx-auto mb-2 opacity-50" size={24} />
                        No fields selected
                        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                          Click fields on the left to add them
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedFields.map((field, index) => (
                          <div
                            key={index}
                            className="p-4 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white break-words mb-1">
                                {field.path}
                              </div>
                              {field.type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                  {field.type}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => toggleField({ path: field.path, value: field.value, type: field.type || 'string' })}
                              className="flex-shrink-0 p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Remove field"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-row justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!widgetName.trim() || !apiUrl.trim() || selectedFields.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

