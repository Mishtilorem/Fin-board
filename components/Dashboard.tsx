'use client';

// Main Dashboard Component - Handles widget management and layout
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useDashboardStore from '@/store/dashboardStore';
import WidgetCard from './widgets/WidgetCard';
import WidgetTable from './widgets/WidgetTable';
import WidgetChart from './widgets/WidgetChart';
import AddWidgetModal from './AddWidgetModal';
import ThemeToggle from './ThemeToggle';
import { BarChart3, Plus, Download, Upload } from 'lucide-react';
import { Widget } from '@/types/widget';

interface SortableWidgetProps {
  widget: Widget;
  className?: string;
  style?: React.CSSProperties;
}

function SortableWidget({ widget, className = '', style: customStyle }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...customStyle,
  };

  const renderWidget = () => {
    switch (widget.displayMode) {
      case 'card':
        return <WidgetCard widget={widget} />;
      case 'table':
        return <WidgetTable widget={widget} />;
      case 'chart':
        return <WidgetChart widget={widget} />;
      default:
        return <WidgetCard widget={widget} />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group h-full ${className}`}>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-move opacity-0 sm:group-hover:opacity-100 transition-opacity bg-purple-600/80 hover:bg-purple-500/80 dark:bg-purple-700/80 dark:hover:bg-purple-600/80 rounded-lg p-1.5 backdrop-blur-sm touch-none shadow-md"
        title="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="6" cy="3" r="1.5" />
          <circle cx="10" cy="3" r="1.5" />
          <circle cx="6" cy="8" r="1.5" />
          <circle cx="10" cy="8" r="1.5" />
          <circle cx="6" cy="13" r="1.5" />
          <circle cx="10" cy="13" r="1.5" />
        </svg>
      </div>
      {renderWidget()}
    </div>
  );
}

export default function Dashboard() {
  const widgets = useDashboardStore((state) => state.widgets);
  const theme = useDashboardStore((state) => state.theme);
  const reorderWidgets = useDashboardStore((state) => state.reorderWidgets);
  const exportConfig = useDashboardStore((state) => state.exportConfig);
  const importConfig = useDashboardStore((state) => state.importConfig);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      reorderWidgets(arrayMove(widgets, oldIndex, newIndex));
    }
  };

  const handleExport = () => {
    if (widgets.length === 0) {
      alert('No widgets to export. Add some widgets first!');
      return;
    }
    exportConfig();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const config = JSON.parse(text);

          // Check if it's a valid dashboard config
          if (!config.widgets || !Array.isArray(config.widgets)) {
            alert('Invalid configuration file. Please select a valid dashboard export file.');
            return;
          }

          // Confirm before importing (will replace current dashboard)
          const confirmMessage = `This will replace your current dashboard with ${config.widgets.length} widget(s). Continue?`;
          if (confirm(confirmMessage)) {
            const success = importConfig(config);
            if (success) {
              alert(`Successfully imported ${config.widgets.length} widget(s)!`);
            } else {
              alert('Failed to import configuration. Please check the file format.');
            }
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid JSON file.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' 
        ? 'dark bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={20} />
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-purple-100 truncate">Finance Dashboard</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {mounted ? (
                <>
                  {widgets.length} active widget{widgets.length !== 1 ? 's' : ''} • Real-time data
                </>
              ) : (
                'Loading... • Real-time data'
              )}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
            <ThemeToggle />
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
              title="Export dashboard configuration"
            >
              <Download size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleImport}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
              title="Import dashboard configuration"
            >
              <Upload size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-purple-500/30 text-sm sm:text-base flex-1 sm:flex-none"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Add Widget</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Widgets Grid */}
        {!mounted ? (
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        ) : widgets.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="border-2 border-dashed border-purple-400 dark:border-purple-500 rounded-2xl p-8 sm:p-12 hover:border-purple-500 dark:hover:border-purple-400 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-sm w-full max-w-sm mx-4 shadow-lg hover:shadow-xl"
            >
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 rounded-full p-4 sm:p-5 mb-3 sm:mb-4 shadow-lg">
                <Plus className="text-white" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 dark:text-purple-100 mb-2">Add Widget</h3>
              <p className="text-xs sm:text-sm text-indigo-700 dark:text-purple-300 text-center px-4">
                Connect to a finance API and create a custom widget
              </p>
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
              <div 
                className="grid gap-4 sm:gap-5 md:gap-6 auto-rows-fr w-full"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                }}
              >
                {widgets.map((widget) => {
                  // For tables and charts, span 2 columns to give them more width
                  const isWideWidget = widget.displayMode === 'table' || widget.displayMode === 'chart';
                  
                  return (
                    <SortableWidget 
                      key={widget.id} 
                      widget={widget}
                      style={isWideWidget ? {
                        gridColumn: 'span 2',
                      } : undefined}
                    />
                  );
                })}
                {/* Add Widget Placeholder */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="border-2 border-dashed border-purple-400 dark:border-purple-500 rounded-2xl p-6 sm:p-8 hover:border-purple-500 dark:hover:border-purple-400 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-sm h-full min-h-[200px] shadow-md hover:shadow-lg"
                >
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg">
                    <Plus className="text-white" size={28} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-900 dark:text-purple-100 mb-1 sm:mb-2">Add Widget</h3>
                  <p className="text-xs sm:text-sm text-indigo-700 dark:text-purple-300 text-center px-2">
                    Connect to a finance API and create a custom widget
                  </p>
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add Widget Modal */}
        {isAddModalOpen && <AddWidgetModal onClose={() => setIsAddModalOpen(false)} />}
      </div>
    </div>
  );
}
