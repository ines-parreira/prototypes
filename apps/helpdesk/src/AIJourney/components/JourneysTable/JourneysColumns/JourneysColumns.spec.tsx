import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TableV1Root, useTableV1 } from '@gorgias/axiom'
import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { ThemeProvider } from 'core/theme'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { useAppDispatch } from 'hooks/useAppDispatch'

import type { TableRow } from '../../../pages/Flows/Flows'
import {
    getRowDatetime,
    journeysColumns,
    metricColumns,
} from './JourneysColumns'

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockDispatch = jest.fn()

const mockTableData: TableRow[] = [
    {
        id: 'journey-123',
        type: JourneyTypeEnum.WinBack,
        state: JourneyStatusEnum.Active,
        store_name: 'Test Store',
        store_integration_id: 456,
        created_datetime: '2024-01-01T00:00:00Z',
        account_id: 1,
        store_type: 'shopify',
        metrics: {
            recipients: 100,
            revenue: 1000,
            totalOrders: 10,
            revenuePerRecipient: 10,
            averageOrderValue: 100,
            messagesSent: 150,
            ctr: 0.25,
            replyRate: 0.35,
            optOutRate: 0.05,
            conversionRate: 0.1,
        },
    },
]

const TestTable = ({
    data,
    integrationId,
}: {
    data: TableRow[]
    integrationId?: number
}) => {
    const table = useTableV1({
        data,
        columns: metricColumns,
        additionalOptions: {
            meta: {
                currency: 'USD',
                integrationId,
            },
        },
    })

    return (
        <TableV1Root>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                                {typeof cell.column.columnDef.cell ===
                                'function'
                                    ? cell.column.columnDef.cell(
                                          cell.getContext(),
                                      )
                                    : null}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </TableV1Root>
    )
}

const renderComponent = (integrationId?: number) => {
    return render(
        <ThemeProvider>
            <TestTable data={mockTableData} integrationId={integrationId} />
        </ThemeProvider>,
    )
}

describe('journeysColumns - datetime columns', () => {
    const createdColumn = journeysColumns.find(
        (column) => 'id' in column && column.id === 'created_datetime',
    )
    const updatedColumn = journeysColumns.find(
        (column) => 'id' in column && column.id === 'updated_datetime',
    )

    it('declares both datetime columns with the datetime sort fn', () => {
        expect(createdColumn).toBeDefined()
        expect(updatedColumn).toBeDefined()
        expect(
            createdColumn && 'sortingFn' in createdColumn
                ? createdColumn.sortingFn
                : undefined,
        ).toBe('datetime')
        expect(
            updatedColumn && 'sortingFn' in updatedColumn
                ? updatedColumn.sortingFn
                : undefined,
        ).toBe('datetime')
    })

    it('returns the timestamp string for rows with both id and the requested key', () => {
        const row = {
            id: 'journey-1',
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-02-02T00:00:00Z',
        } as unknown as TableRow

        expect(getRowDatetime(row, 'created_datetime')).toBe(
            '2024-01-01T00:00:00Z',
        )
        expect(getRowDatetime(row, 'updated_datetime')).toBe(
            '2024-02-02T00:00:00Z',
        )
    })

    it('returns undefined when the row has no id (placeholder/empty row)', () => {
        const row = {
            id: undefined,
            created_datetime: '2024-01-01T00:00:00Z',
        } as unknown as TableRow

        expect(getRowDatetime(row, 'created_datetime')).toBeUndefined()
    })

    it('exercises the created_datetime accessor through the column definition', () => {
        const accessorFn =
            createdColumn && 'accessorFn' in createdColumn
                ? createdColumn.accessorFn
                : undefined
        const row = {
            id: 'journey-1',
            created_datetime: '2024-03-03T00:00:00Z',
        } as unknown as TableRow

        expect(accessorFn?.(row, 0)).toBe('2024-03-03T00:00:00Z')
    })

    it('falls back to an empty string when the row has no created_datetime', () => {
        const accessorFn =
            createdColumn && 'accessorFn' in createdColumn
                ? createdColumn.accessorFn
                : undefined
        const row = {
            id: undefined,
            created_datetime: undefined,
        } as unknown as TableRow

        expect(accessorFn?.(row, 0)).toBe('')
    })
})

describe('journeysColumns - title accessor', () => {
    const titleColumn = journeysColumns[0]
    const accessorFn =
        'accessorFn' in titleColumn ? titleColumn.accessorFn : undefined

    it('should use campaign title when available', () => {
        const row = {
            ...mockTableData[0],
            campaign: { title: 'Summer Campaign' },
        } as unknown as TableRow

        expect(accessorFn?.(row, 0)).toBe('Summer Campaign')
    })

    it('should use name for custom flows without a campaign', () => {
        const row = {
            id: 'custom-1',
            type: 'custom' as unknown as JourneyTypeEnum,
            name: 'My Custom Flow',
            state: JourneyStatusEnum.Active,
            store_name: 'Test Store',
            store_integration_id: 1,
            store_type: 'shopify',
            created_datetime: '2024-01-01T00:00:00Z',
            account_id: 1,
            metrics: mockTableData[0].metrics,
        } as unknown as TableRow

        expect(accessorFn?.(row, 0)).toBe('My Custom Flow')
    })

    it('should fall back to journey type string when no campaign or name', () => {
        const row = {
            ...mockTableData[0],
            campaign: undefined,
        } as unknown as TableRow

        expect(accessorFn?.(row, 0)).toBeTruthy()
    })
})

describe('JourneysColumns - Response Rate Drilldown', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    describe('DrillDownModalTrigger configuration', () => {
        it('should render response rate metric with drilldown trigger', () => {
            renderComponent(456)

            expect(screen.getByText('0.4%')).toBeInTheDocument()
        })

        it('should dispatch correct drilldown data when response rate is clicked', async () => {
            const user = userEvent.setup()
            renderComponent(456)

            const responseRateCell = screen.getByText('0.4%')
            await user.click(responseRateCell)

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData({
                    title: 'Response Rate',
                    metricName: AIJourneyMetric.ResponseRate,
                    integrationId: '456',
                    journeyIds: ['journey-123'],
                }),
            )
        })

        it('should convert integrationId to string', async () => {
            const user = userEvent.setup()
            renderComponent(789)

            const responseRateCell = screen.getByText('0.4%')
            await user.click(responseRateCell)

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({
                        integrationId: '789',
                    }),
                ),
            )
        })

        it('should handle undefined integrationId', async () => {
            const user = userEvent.setup()
            renderComponent(undefined)

            const responseRateCell = screen.getByText('0.4%')
            await user.click(responseRateCell)

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({
                        integrationId: '',
                    }),
                ),
            )
        })

        it('should include journeyId in journeyIds array', async () => {
            const user = userEvent.setup()
            renderComponent(456)

            const responseRateCell = screen.getByText('0.4%')
            await user.click(responseRateCell)

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({
                        journeyIds: ['journey-123'],
                    }),
                ),
            )
        })

        it('should handle undefined journey id', async () => {
            const user = userEvent.setup()
            const dataWithoutId: TableRow[] = [
                {
                    type: JourneyTypeEnum.WinBack,
                    state: JourneyStatusEnum.Draft,
                    store_name: 'Test Store',
                    id: undefined,
                    campaign: undefined,
                    metrics: {
                        recipients: undefined,
                        revenue: undefined,
                        totalOrders: undefined,
                        revenuePerRecipient: undefined,
                        averageOrderValue: undefined,
                        messagesSent: undefined,
                        ctr: undefined,
                        replyRate: 0.35,
                        optOutRate: undefined,
                        conversionRate: undefined,
                    },
                },
            ]

            render(
                <ThemeProvider>
                    <TestTable data={dataWithoutId} integrationId={456} />
                </ThemeProvider>,
            )

            const responseRateCell = screen.getByText('0.4%')
            await user.click(responseRateCell)

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({
                        journeyIds: [],
                    }),
                ),
            )
        })

        it('should not enable drilldown trigger when value is undefined', () => {
            const dataWithUndefinedValue: TableRow[] = [
                {
                    ...mockTableData[0],
                    metrics: {
                        ...mockTableData[0].metrics,
                        replyRate: undefined,
                    },
                },
            ]

            render(
                <ThemeProvider>
                    <TestTable
                        data={dataWithUndefinedValue}
                        integrationId={456}
                    />
                </ThemeProvider>,
            )

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        })
    })

    describe('Metric formatting', () => {
        it('should format response rate as percentage with one decimal', () => {
            renderComponent(456)

            expect(screen.getByText('0.4%')).toBeInTheDocument()
        })

        it('should handle zero response rate', () => {
            const dataWithZero: TableRow[] = [
                {
                    ...mockTableData[0],
                    metrics: {
                        ...mockTableData[0].metrics,
                        replyRate: 0,
                    },
                },
            ]

            render(
                <ThemeProvider>
                    <TestTable data={dataWithZero} integrationId={456} />
                </ThemeProvider>,
            )

            expect(screen.getByText('0%')).toBeInTheDocument()
        })

        it('should handle high response rate', () => {
            const dataWithHighRate: TableRow[] = [
                {
                    ...mockTableData[0],
                    metrics: {
                        ...mockTableData[0].metrics,
                        replyRate: 0.999,
                    },
                },
            ]

            render(
                <ThemeProvider>
                    <TestTable data={dataWithHighRate} integrationId={456} />
                </ThemeProvider>,
            )

            expect(screen.getByText('1%')).toBeInTheDocument()
        })
    })
})
