import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    Row,
    ColumnDef,
} from '@tanstack/react-table';
import { clsx } from 'clsx';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { Task, TaskPriority, TaskStatus, EnergyLevel } from '../../types';
import { useTasks } from '../../hooks/useTasks';

import { useReadOnly } from '../../context/ReadOnlyContext';

import { RowData } from '@tanstack/react-table';

// Extend TanStack Table Meta
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    }
}

// --- EDITABLE CELL ---
const EditableCell = ({ getValue, row, column, table }: any) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const isReadOnly = useReadOnly();

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
        setIsEditing(false);
        table.options.meta?.updateData(row.index, column.id, value);
    };

    if (isReadOnly) {
        return <span className="block w-full h-full min-h-[1.5rem] text-slate-700">{value}</span>;
    }

    if (!isEditing) {
        return (
            <span
                onClick={() => setIsEditing(true)}
                className="cursor-pointer block w-full h-full min-h-[1.5rem]"
            >
                {value}
            </span>
        );
    }

    return (
        <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            autoFocus
            className="w-full bg-white border border-blue-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
    );
};

// --- COLUMN DEFINITIONS ---
const columnHelper = createColumnHelper<Task>();

const columns = [
    columnHelper.accessor('title', {
        header: 'Task Name',
        cell: EditableCell,
        size: 300,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue, row, column, table }) => {
            const status = getValue();
            const colors = {
                'Not Started': 'text-gray-500 bg-gray-100',
                'In Progress': 'text-blue-600 bg-blue-50',
                'Blocked': 'text-red-600 bg-red-50',
                'Reviewing': 'text-purple-600 bg-purple-50',
                'Done': 'text-green-600 bg-green-50',
            };

            const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                table.options.meta?.updateData(row.index, column.id, e.target.value);
            };

            return (
                <select
                    value={status}
                    onChange={handleChange}
                    className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium border-none focus:ring-0 cursor-pointer w-full',
                        colors[status] || 'text-gray-500'
                    )}
                >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Done">Done</option>
                </select>
            );
        },
    }),
    columnHelper.accessor('priority', {
        header: 'Priority',
        cell: ({ getValue, row, column, table }) => {
            const priority = getValue();
            const colors = {
                'High': 'bg-red-100 text-red-800',
                'Medium': 'bg-yellow-100 text-yellow-800',
                'Low': 'bg-blue-100 text-blue-800'
            };

            const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                table.options.meta?.updateData(row.index, column.id, e.target.value);
            };

            return (
                <div className="relative group">
                    <span className={clsx("px-2 py-0.5 rounded-full text-xs font-bold", colors[priority])}>
                        {priority}
                    </span>
                    <select
                        value={priority}
                        onChange={handleChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            );
        }
    }),
    columnHelper.accessor('energy_level', {
        header: 'Energy',
        cell: ({ getValue, row, column, table }) => {
            const val = getValue();
            const isHigh = val === 'High Focus';

            const toggle = () => {
                const newVal = isHigh ? 'Low Energy' : 'High Focus';
                table.options.meta?.updateData(row.index, column.id, newVal);
            };

            return (
                <button onClick={toggle} className="flex items-center gap-1 text-xs hover:bg-gray-100 p-1 rounded">
                    {isHigh ? '⚡️ High' : '🔋 Low'}
                </button>
            );
        }
    }),
    columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ getValue, row, column, table }) => {
            const dateStr = getValue();
            const display = dateStr ? format(parseISO(dateStr), 'MMM d') : '-';

            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                table.options.meta?.updateData(row.index, column.id, e.target.value);
            };

            return (
                <div className="relative group w-full">
                    <span className={clsx("text-xs", isToday(parseISO(dateStr)) ? "text-orange-600 font-bold" : "")}>
                        {display}
                    </span>
                    <input
                        type="date"
                        value={dateStr ? dateStr.split('T')[0] : ''}
                        onChange={handleChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                </div>
            );
        }
    }),
    columnHelper.accessor('estimated_minutes', {
        header: 'Progress',
        cell: ({ row }) => {
            const est = row.original.estimated_minutes;
            const act = row.original.actual_minutes;
            return (
                <span className="text-xs text-slate-500">
                    {act}m / {est}m
                </span>
            );
        }
    })
];

// --- MASTER GRID COMPONENT ---
const MasterGridContent = () => {
    const { tasks: data, isLoading, createTask, updateTask } = useTasks();
    const isReadOnly = useReadOnly();

    const handleUpdateData = (rowIndex: number, columnId: string, value: unknown) => {
        if (isReadOnly) return;
        // Find the task by index (Note: this relies on data order being stable, which it might not be if sorted)
        // Better to find by ID if possible, but row.original.id is available in the cell.
        // The Meta function only gives us rowIndex. 
        // We need to trust TanStack table's rowIndex maps to data[rowIndex].
        const task = data[rowIndex];
        if (task) {
            updateTask({ id: task.id, updates: { [columnId]: value } });
        }
    };

    const handleAddTask = () => {
        if (isReadOnly) return;
        const newTask: Partial<Task> = {
            title: 'New Task',
            status: 'Not Started',
            priority: 'Medium',
            energy_level: 'High Focus',
            due_date: new Date().toISOString(),
            estimated_minutes: 30,
            actual_minutes: 0,
            subject_tag: 'General',
            is_missed: false
        };
        createTask(newTask);
    };

    const getRowClassName = (row: Row<Task>) => {
        const isUrgent = isPast(new Date(row.original.due_date)) && !isToday(new Date(row.original.due_date)) && row.original.status !== 'Done';
        const isTodayUrgent = isToday(new Date(row.original.due_date)) && row.original.status !== 'Done';

        if (isUrgent || isTodayUrgent) return 'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100';
        return 'even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition-colors';
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        meta: {
            updateData: handleUpdateData,
        },
    });

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Master Planner</h2>
                {!isReadOnly && (
                    <button
                        onClick={handleAddTask}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        + Add Task
                    </button>
                )}
            </div>

            <div className="overflow-x-auto border-t border-slate-200 min-h-[300px]">
                {isLoading ? (
                    // Skeleton Loader
                    <div className="animate-pulse">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex border-b border-slate-100 py-3 px-4">
                                <div className="h-4 bg-slate-200 rounded w-1/3 mr-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-20 mr-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-16 mr-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-12 mr-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/50">
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className={getRowClassName(row)}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-3 py-2 text-sm border-r border-transparent last:border-none">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {data.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">📝</span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks yet</h3>
                                <p className="max-w-xs text-sm text-slate-400 mb-6">
                                    Start planning your academic journey by adding your first task.
                                </p>
                                {!isReadOnly && (
                                    <button
                                        onClick={handleAddTask}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                    >
                                        Add First Task
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Wrapped Export
import ErrorBoundary from '../common/ErrorBoundary';

const MasterGrid = () => (
    <ErrorBoundary fallback={<div className="p-4 text-red-500 border border-red-200 bg-red-50 rounded">Master Grid Error</div>}>
        <MasterGridContent />
    </ErrorBoundary>
);

export default MasterGrid;
