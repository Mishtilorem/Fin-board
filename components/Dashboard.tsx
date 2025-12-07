'use client';

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
import { BarChart3, Plus } from 'lucide-react';
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
        className="absolute top-2 left-2 z-10 cursor-move opacity-0 sm:group-hover:opacity-100 transition-opacity bg-gray-700/80 hover:bg-gray-600/80 dark:bg-gray-700/80 dark:hover:bg-gray-600/80 rounded p-1 backdrop-blur-sm touch-none"
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

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' 
        ? 'dark bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
        : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'
    }`}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">Finance Dashboard</h1>
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
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <ThemeToggle />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-blue-600/20 text-sm sm:text-base flex-1 sm:flex-none"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        ) : widgets.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="border-2 border-dashed border-blue-500 dark:border-blue-500 rounded-lg p-8 sm:p-12 hover:border-blue-600 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-sm w-full max-w-sm mx-4"
            >
              <div className="bg-blue-600 dark:bg-blue-500 rounded-full p-4 sm:p-5 mb-3 sm:mb-4 shadow-lg">
                <Plus className="text-white" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Add Widget</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center px-4">
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
                  className="border-2 border-dashed border-blue-500 dark:border-blue-500 rounded-lg p-6 sm:p-8 hover:border-blue-600 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center bg-white/5 dark:bg-white/5 backdrop-blur-sm h-full min-h-[200px]"
                >
                  <div className="bg-blue-600 dark:bg-blue-500 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg">
                    <Plus className="text-white" size={28} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">Add Widget</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center px-2">
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
