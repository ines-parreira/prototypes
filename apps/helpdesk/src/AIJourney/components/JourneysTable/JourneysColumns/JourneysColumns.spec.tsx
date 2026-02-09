import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TableRoot, useTable } from '@gorgias/axiom'
import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { ThemeProvider } from 'core/theme'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'

import type { TableRow } from '../../../pages/Flows/Flows'
import { metricColumns } from './JourneysColumns'

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
    const table = useTable({
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
        <TableRoot>
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
        </TableRoot>
    )
}

const renderComponent = (integrationId?: number) => {
    return render(
        <ThemeProvider>
            <TestTable data={mockTableData} integrationId={integrationId} />
        </ThemeProvider>,
    )
}

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
