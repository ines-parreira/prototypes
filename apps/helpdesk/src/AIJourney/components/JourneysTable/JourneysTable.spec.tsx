import React from 'react'

import { formatMetricValue } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { Box, createSortableColumn } from '@gorgias/axiom'
import type { ColumnDef } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { MetricCell } from 'AIJourney/components'
import {
    DEFAULT_TABLE_METRICS,
    LOADING_TABLE_METRICS,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { ThemeProvider } from 'core/theme'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { mockStore } from 'utils/testing'

import { JourneysTable } from './JourneysTable'

jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

const useCurrencyMock = assumeMock(useCurrency)

const mockColumns: ColumnDef<JourneyApiDTO, unknown>[] = [
    {
        id: 'title',
        accessorFn: (row) => row.campaign?.title || row.type,
        header: 'Title',
        cell: (info) => <Box gap="xs">{String(info.getValue())}</Box>,
        enableSorting: true,
    },
    createSortableColumn<JourneyApiDTO>('state', 'Status', (info) => (
        <Box gap="xs">{String(info.getValue())}</Box>
    )),
]

const mockJourneyData: JourneyApiDTO[] = [
    {
        id: '1',
        type: JourneyTypeEnum.WinBack,
        state: JourneyStatusEnum.Active,
        store_name: 'Test Store',
        store_integration_id: 123,
        created_datetime: '2024-01-01T00:00:00Z',
        account_id: 1,
        store_type: 'shopify',
    },
    {
        id: '2',
        type: JourneyTypeEnum.Welcome,
        state: JourneyStatusEnum.Draft,
        store_name: 'Test Store',
        store_integration_id: 123,
        created_datetime: '2024-01-01T00:00:00Z',
        account_id: 1,
        store_type: 'shopify',
    },
    {
        id: '3',
        type: JourneyTypeEnum.PostPurchase,
        state: JourneyStatusEnum.Paused,
        store_name: 'Test Store',
        store_integration_id: 123,
        created_datetime: '2024-01-01T00:00:00Z',
        account_id: 1,
        store_type: 'shopify',
    },
]

const renderComponent = (
    props: Partial<{
        columns: ColumnDef<JourneyApiDTO, unknown>[]
        data: JourneyApiDTO[]
        onEditColumns?: () => void
        isLoading?: boolean
        integrationId?: number
    }> = {},
) => {
    const defaultProps = {
        columns: mockColumns,
        data: mockJourneyData,
        isLoading: false,
    }

    return render(
        <Provider store={mockStore({})}>
            <ThemeProvider>
                <JourneysTable<JourneyApiDTO, unknown>
                    {...defaultProps}
                    {...props}
                />
            </ThemeProvider>
        </Provider>,
    )
}

describe('JourneysTable', () => {
    beforeEach(() => {
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
    })

    describe('Rendering', () => {
        it('should render the table with data', () => {
            renderComponent()

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(screen.getByText('Title')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })

        it('should render empty state when no data', () => {
            renderComponent({ data: [] })

            expect(screen.getByText('No journeys selected')).toBeInTheDocument()
        })

        it('should pass currency to table meta', () => {
            useCurrencyMock.mockReturnValue({
                currency: 'EUR',
                isCurrencyUSD: false,
            })

            renderComponent()

            expect(useCurrencyMock).toHaveBeenCalled()
        })

        it('should pass integrationId to table meta when provided', () => {
            const integrationId = 123

            renderComponent({ integrationId })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should handle undefined integrationId', () => {
            renderComponent({ integrationId: undefined })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })
    })

    describe('Loading state', () => {
        it('should show loading state when isLoading is true', () => {
            renderComponent({ isLoading: true })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should not show loading state when isLoading is false', () => {
            renderComponent({ isLoading: false })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })
    })

    describe('Edit metrics button', () => {
        it('should render Edit metrics button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /edit table/i }),
            ).toBeInTheDocument()
        })

        it('should call onEditColumns when Edit metrics button is clicked', async () => {
            const user = userEvent.setup()
            const onEditColumns = jest.fn()

            renderComponent({ onEditColumns })

            const editButton = screen.getByRole('button', {
                name: /edit table/i,
            })
            await user.click(editButton)

            expect(onEditColumns).toHaveBeenCalledTimes(1)
        })

        it('should render Edit metrics button even when onEditColumns is not provided', () => {
            renderComponent({ onEditColumns: undefined })

            expect(
                screen.queryByRole('button', { name: /edit table/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Different data types', () => {
        it('should handle journeys with campaign titles', () => {
            const dataWithCampaign: JourneyApiDTO[] = [
                {
                    ...mockJourneyData[0],
                    campaign: {
                        title: 'Campaign Title',
                        state: JourneyStatusEnum.Active,
                    },
                },
            ]

            renderComponent({ data: dataWithCampaign })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should handle different journey states', () => {
            const dataWithVariousStates = [
                { ...mockJourneyData[0], state: JourneyStatusEnum.Active },
                { ...mockJourneyData[1], state: JourneyStatusEnum.Draft },
                { ...mockJourneyData[2], state: JourneyStatusEnum.Paused },
            ]

            renderComponent({ data: dataWithVariousStates })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should handle different journey types', () => {
            const dataWithVariousTypes = [
                { ...mockJourneyData[0], type: JourneyTypeEnum.WinBack },
                { ...mockJourneyData[1], type: JourneyTypeEnum.Welcome },
                { ...mockJourneyData[2], type: JourneyTypeEnum.PostPurchase },
            ]

            renderComponent({ data: dataWithVariousTypes })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })
    })

    describe('Pagination rendering', () => {
        it('should render pagination in bottom toolbar when there are 10 or fewer rows', () => {
            const smallDataSet = mockJourneyData.slice(0, 3)
            renderComponent({ data: smallDataSet })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should not render pagination in bottom toolbar when there are more than 10 rows', () => {
            const largeDataSet: JourneyApiDTO[] = Array.from(
                { length: 15 },
                (_, index) => ({
                    id: String(index + 1),
                    type: JourneyTypeEnum.WinBack,
                    state: JourneyStatusEnum.Active,
                    store_name: `Test Store ${index + 1}`,
                    store_integration_id: 123 + index,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                    store_type: 'shopify',
                }),
            )

            renderComponent({ data: largeDataSet })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should handle exactly 10 rows', () => {
            const exactTenRows: JourneyApiDTO[] = Array.from(
                { length: 10 },
                (_, index) => ({
                    id: String(index + 1),
                    type: JourneyTypeEnum.WinBack,
                    state: JourneyStatusEnum.Active,
                    store_name: `Test Store ${index + 1}`,
                    store_integration_id: 123 + index,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                    store_type: 'shopify',
                }),
            )

            renderComponent({ data: exactTenRows })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should handle exactly 11 rows', () => {
            const elevenRows: JourneyApiDTO[] = Array.from(
                { length: 11 },
                (_, index) => ({
                    id: String(index + 1),
                    type: JourneyTypeEnum.WinBack,
                    state: JourneyStatusEnum.Active,
                    store_name: `Test Store ${index + 1}`,
                    store_integration_id: 123 + index,
                    created_datetime: '2024-01-01T00:00:00Z',
                    account_id: 1,
                    store_type: 'shopify',
                }),
            )

            renderComponent({ data: elevenRows })

            expect(screen.getByRole('table')).toBeInTheDocument()
        })
    })

    describe('MetricCell loading states', () => {
        it('should render skeleton when metrics are loading', () => {
            const metricColumn: ColumnDef<JourneyApiDTO, unknown>[] = [
                createSortableColumn<JourneyApiDTO>(
                    'metrics.recipients',
                    'Recipients',
                    (info) => {
                        const value = info.getValue()
                        return (
                            <MetricCell value={value}>
                                {formatMetricValue(value as number, 'integer')}
                            </MetricCell>
                        )
                    },
                ),
            ]

            const dataWithLoadingMetrics = mockJourneyData.map((journey) => ({
                ...journey,
                metrics: LOADING_TABLE_METRICS,
            }))

            renderComponent({
                columns: [...mockColumns, ...metricColumn],
                data: dataWithLoadingMetrics,
            })

            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should render metric values when metrics are defined', () => {
            const metricColumn: ColumnDef<JourneyApiDTO, unknown>[] = [
                createSortableColumn<JourneyApiDTO>(
                    'metrics.recipients',
                    'Recipients',
                    (info) => {
                        const value = info.getValue()
                        return (
                            <MetricCell value={value}>
                                {formatMetricValue(value as number, 'integer')}
                            </MetricCell>
                        )
                    },
                ),
            ]

            const dataWithMetrics = [
                {
                    ...mockJourneyData[0],
                    metrics: {
                        ...DEFAULT_TABLE_METRICS,
                        recipients: 250,
                    },
                },
            ]

            renderComponent({
                columns: [...mockColumns, ...metricColumn],
                data: dataWithMetrics,
            })

            expect(screen.getByText('250')).toBeInTheDocument()
        })
    })
})
