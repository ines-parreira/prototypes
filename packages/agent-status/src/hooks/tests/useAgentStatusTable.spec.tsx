import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import type { AgentStatusWithSystem } from '../../types'
import { useAgentStatusTable } from '../useAgentStatusTable'

const mockStatuses: AgentStatusWithSystem[] = [
    {
        id: 'unavailable',
        name: 'Unavailable',
        description: '',
        is_system: true,
        durationDisplay: 'Until turned off',
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        duration_unit: null,
        duration_value: null,
    },
    {
        id: '1',
        name: 'Lunch break',
        description: 'Taking a lunch break',
        is_system: false,
        duration_unit: 'minutes',
        duration_value: 30,
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Meeting',
        description: '',
        is_system: false,
        duration_unit: null,
        duration_value: null,
        created_datetime: '2024-01-02T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
    },
]

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useAgentStatusTable', () => {
    const defaultOptions = {
        data: mockStatuses,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    }

    describe('table initialization', () => {
        it('should return a table instance', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            expect(result.current.table).toBeDefined()
            expect(result.current.table.getRowModel).toBeInstanceOf(Function)
            expect(result.current.table.getHeaderGroups).toBeInstanceOf(
                Function,
            )
        })

        it('should configure table with correct data', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            const rows = result.current.table.getRowModel().rows
            expect(rows).toHaveLength(3)
            expect(rows[0].original.name).toBe('Unavailable')
            expect(rows[1].original.name).toBe('Lunch break')
            expect(rows[2].original.name).toBe('Meeting')
        })

        it('should create table with 4 columns', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            const columns = result.current.table.getAllColumns()
            expect(columns).toHaveLength(4)
        })

        it('should have correct column IDs', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            const columns = result.current.table.getAllColumns()
            const columnIds = columns.map((col) => col.id)

            expect(columnIds).toEqual([
                'name',
                'description',
                'duration',
                'actions',
            ])
        })
    })

    describe('table configuration', () => {
        it('should enable sorting', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            expect(result.current.table.getState().sorting).toBeDefined()
        })

        it('should disable pagination', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            const rows = result.current.table.getRowModel().rows
            expect(rows).toHaveLength(mockStatuses.length)
        })

        it('should use id as row identifier', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            const rows = result.current.table.getRowModel().rows
            expect(rows[0].id).toBe('unavailable')
            expect(rows[1].id).toBe('1')
            expect(rows[2].id).toBe('2')
        })
    })

    describe('memoization', () => {
        it('should memoize columns based on callbacks', () => {
            const onEdit = vi.fn()
            const onDelete = vi.fn()

            const { result, rerender } = renderHook(
                (props: {
                    data: AgentStatusWithSystem[]
                    onEdit: typeof onEdit
                    onDelete: typeof onDelete
                }) => useAgentStatusTable(props),
                {
                    initialProps: {
                        data: mockStatuses,
                        onEdit,
                        onDelete,
                    },
                },
            )

            const firstColumns = result.current.table.getAllColumns()

            // Rerender with same callbacks
            rerender({ data: mockStatuses, onEdit, onDelete })
            const secondColumns = result.current.table.getAllColumns()

            // Columns should be the same reference
            expect(firstColumns).toBe(secondColumns)
        })

        it('should update columns when callbacks change', () => {
            const { result, rerender } = renderHook(
                (props: {
                    data: AgentStatusWithSystem[]
                    onEdit: (status: AgentStatusWithSystem) => void
                    onDelete: (status: AgentStatusWithSystem) => void
                }) => useAgentStatusTable(props),
                {
                    initialProps: {
                        data: mockStatuses,
                        onEdit: vi.fn(),
                        onDelete: vi.fn(),
                    },
                },
            )

            const firstColumns = result.current.table.getAllColumns()

            // Rerender with new callbacks
            rerender({
                data: mockStatuses,
                onEdit: vi.fn(),
                onDelete: vi.fn(),
            })
            const secondColumns = result.current.table.getAllColumns()

            // Columns should be different references
            expect(firstColumns).not.toBe(secondColumns)
        })
    })

    describe('data updates', () => {
        it('should update table when data changes', () => {
            const { result, rerender } = renderHook(
                (props: {
                    data: AgentStatusWithSystem[]
                    onEdit: (status: AgentStatusWithSystem) => void
                    onDelete: (status: AgentStatusWithSystem) => void
                }) => useAgentStatusTable(props),
                {
                    initialProps: defaultOptions,
                },
            )

            expect(result.current.table.getRowModel().rows).toHaveLength(3)

            const newData: AgentStatusWithSystem[] = [
                {
                    id: '3',
                    name: 'Break',
                    description: 'Short break',
                    is_system: false,
                    duration_unit: 'minutes',
                    duration_value: 15,
                    created_datetime: '2024-01-03T00:00:00Z',
                    updated_datetime: '2024-01-03T00:00:00Z',
                },
            ]

            rerender({
                data: newData,
                onEdit: defaultOptions.onEdit,
                onDelete: defaultOptions.onDelete,
            })

            const rows = result.current.table.getRowModel().rows
            expect(rows).toHaveLength(1)
            expect(rows[0].original.name).toBe('Break')
        })

        it('should handle empty data', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable({
                    data: [],
                    onEdit: vi.fn(),
                    onDelete: vi.fn(),
                }),
            )

            expect(result.current.table.getRowModel().rows).toHaveLength(0)
        })
    })

    describe('header groups', () => {
        it('should return header groups', () => {
            const { result } = renderHook(() =>
                useAgentStatusTable(defaultOptions),
            )

            const headerGroups = result.current.table.getHeaderGroups()
            expect(headerGroups).toHaveLength(1)
            expect(headerGroups[0].headers).toHaveLength(4)
        })
    })
})
