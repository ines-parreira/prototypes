import type React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import type { Integration } from '@gorgias/helpdesk-types'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { columns } from '../columns'
import { ImportStatus } from '../types'
import { createMockIntegration } from './fixture'

describe('Zendesk Import Table Columns', () => {
    const renderCell = (columnIndex: number, integration: Integration) => {
        const column = columns[columnIndex]
        if (!column || !('cell' in column)) {
            throw new Error(`Column at index ${columnIndex} does not exist`)
        }

        const mockInfo = {
            getValue: () => {
                if ('accessorKey' in column && column.accessorKey) {
                    const keys = column.accessorKey.split('.')
                    let value: any = integration
                    for (const key of keys) {
                        value = value?.[key]
                    }
                    return value
                }
                return undefined
            },
            row: {
                original: integration,
            },
            table: {},
            column: {},
            cell: {},
            renderValue: () => null,
        } as any

        const cellContent =
            typeof column.cell === 'function' ? column.cell(mockInfo) : null

        const queryClient = mockQueryClient()
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        return render(<div>{cellContent}</div>, { wrapper })
    }

    describe('Account Column', () => {
        it('displays Zendesk logo and account name', () => {
            const integration = createMockIntegration({
                name: 'Test Zendesk Account',
            })

            renderCell(0, integration)

            expect(screen.getByAltText('Zendesk logo')).toBeInTheDocument()
            expect(screen.getByText('Test Zendesk Account')).toBeInTheDocument()
        })
    })

    describe('Status Column', () => {
        it('displays "Completed" status for successful import', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
            })

            renderCell(1, integration)

            expect(screen.getByText('Completed')).toBeInTheDocument()
        })

        it('displays formatted datetime for completed import', () => {
            const integration = createMockIntegration({
                updated_datetime: '2025-01-15T10:30:00Z',
                meta: {
                    status: ImportStatus.Success,
                },
            })

            renderCell(1, integration)

            expect(screen.getByText('Completed')).toBeInTheDocument()
            expect(screen.getByText(/01\/15\/2025/)).toBeInTheDocument()
        })

        it('displays "in-progress" status for pending import', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Pending,
                },
            })

            renderCell(1, integration)

            expect(screen.getByText('in-progress')).toBeInTheDocument()
        })

        it('displays "in-progress" status for rate limit exceeded', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.RateLimitExceededBackoff,
                },
            })

            renderCell(1, integration)

            expect(screen.getByText('in-progress')).toBeInTheDocument()
        })

        it('displays "Unknown" status for unrecognized status', () => {
            const integration = createMockIntegration({
                meta: {
                    status: 'unknown_status' as any,
                },
            })

            renderCell(1, integration)

            expect(screen.getByText('Unknown')).toBeInTheDocument()
        })
    })

    describe('Tickets Column', () => {
        it('displays ticket count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_tickets: { count: 5432 },
                },
            })

            renderCell(2, integration)

            expect(screen.getByText('5432')).toBeInTheDocument()
        })

        it('displays zero ticket count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_tickets: { count: 0 },
                },
            })

            renderCell(2, integration)

            expect(screen.getByText('0')).toBeInTheDocument()
        })
    })

    describe('Macros Column', () => {
        it('displays macro count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_macros: { count: 123 },
                },
            })

            renderCell(3, integration)

            expect(screen.getByText('123')).toBeInTheDocument()
        })

        it('displays zero macro count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_macros: { count: 0 },
                },
            })

            renderCell(3, integration)

            expect(screen.getByText('0')).toBeInTheDocument()
        })
    })

    describe('Customers Column', () => {
        it('displays customer count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_users: {
                        customers_count: 890,
                        users_count: 45,
                    },
                },
            })

            renderCell(4, integration)

            expect(screen.getByText('890')).toBeInTheDocument()
        })

        it('displays zero customer count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_users: {
                        customers_count: 0,
                        users_count: 10,
                    },
                },
            })

            renderCell(4, integration)

            expect(screen.getByText('0')).toBeInTheDocument()
        })
    })

    describe('Users Column', () => {
        it('displays user count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_users: {
                        customers_count: 890,
                        users_count: 45,
                    },
                },
            })

            renderCell(5, integration)

            expect(screen.getByText('45')).toBeInTheDocument()
        })

        it('displays zero user count', () => {
            const integration = createMockIntegration({
                meta: {
                    sync_users: {
                        customers_count: 100,
                        users_count: 0,
                    },
                },
            })

            renderCell(5, integration)

            expect(screen.getByText('0')).toBeInTheDocument()
        })
    })

    describe('Sync Status Column', () => {
        it('displays "Synchronizing" badge when continuous import is enabled', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: true,
                },
            })

            renderCell(6, integration)

            expect(screen.getByText('Synchronizing')).toBeInTheDocument()
        })

        it('displays "Paused" badge when continuous import is disabled', () => {
            const integration = createMockIntegration({
                meta: {
                    status: ImportStatus.Success,
                    continuous_import_enabled: false,
                },
            })

            renderCell(6, integration)

            expect(screen.getByText('Paused')).toBeInTheDocument()
        })
    })
})
