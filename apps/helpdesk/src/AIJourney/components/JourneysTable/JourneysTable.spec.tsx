import { formatMetricValue } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import {
    Box,
    createSortableColumn,
    TableBodyContent,
    TableHeader,
    TableRoot,
    useTable,
} from '@gorgias/axiom'
import type { ColumnDef } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

import { MetricCell } from 'AIJourney/components'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import {
    DEFAULT_TABLE_METRICS,
    LOADING_TABLE_METRICS,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import { ThemeProvider } from 'core/theme'

import { campaignsActionColumns } from './JourneysColumns/JourneysColumns'
import { JourneysTable } from './JourneysTable'

jest.mock('AIJourney/providers')

jest.mock(
    'AIJourney/components/JourneysTable/CampaignsRowAdditionalOptions/CampaignsRowAdditionalOptions',
    () => ({
        CampaignsRowAdditionalOptions: ({
            handleChangeStatus,
            handleCancelClick,
            handleRemoveClick,
            handleSendClick,
            handleDuplicateClick,
        }: {
            handleChangeStatus: (status: UpdatableJourneyCampaignState) => void
            handleCancelClick: () => void
            handleRemoveClick: () => void
            handleSendClick: () => void
            handleDuplicateClick: () => void
        }) => (
            <div>
                <button onClick={() => handleChangeStatus('paused')}>
                    Change Status
                </button>
                <button onClick={handleCancelClick}>Cancel</button>
                <button onClick={handleRemoveClick}>Remove</button>
                <button onClick={handleSendClick}>Send</button>
                <button onClick={handleDuplicateClick}>Duplicate</button>
            </div>
        ),
    }),
)

const useJourneyContextMock = assumeMock(useJourneyContext)

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
        isCampaign?: boolean
    }> = {},
    historyInstance = createMemoryHistory(),
) => {
    const defaultProps = {
        columns: mockColumns,
        data: mockJourneyData,
        isLoading: false,
        isCampaign: false,
    }

    return {
        ...render(
            <Router history={historyInstance}>
                <ThemeProvider>
                    <JourneysTable<JourneyApiDTO, unknown>
                        {...defaultProps}
                        {...props}
                    />
                </ThemeProvider>
            </Router>,
        ),
        history: historyInstance,
    }
}

describe('JourneysTable', () => {
    beforeEach(() => {
        useJourneyContextMock.mockReturnValue({
            currency: 'USD',
            shopName: 'test-shop',
            journeys: [],
            campaigns: [],
            journeyData: undefined,
            currentIntegration: undefined,
            isLoading: false,
            isLoadingJourneys: false,
            isLoadingJourneyData: false,
            isLoadingIntegrations: false,
            journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            storeConfiguration: undefined,
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

            expect(
                screen.getByText('Create your first campaign'),
            ).toBeInTheDocument()
        })

        it('should pass currency to table meta', () => {
            useJourneyContextMock.mockReturnValue({
                currency: 'EUR',
                shopName: 'test-shop',
                journeys: [],
                campaigns: [],
                journeyData: undefined,
                currentIntegration: undefined,
                isLoading: false,
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isLoadingIntegrations: false,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                storeConfiguration: undefined,
            })

            renderComponent()

            expect(useJourneyContextMock).toHaveBeenCalled()
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
            await act(() => user.click(editButton))

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

        it('should render opt out rate metric as percentage', () => {
            const optOutRateColumn: ColumnDef<JourneyApiDTO, unknown>[] = [
                createSortableColumn<JourneyApiDTO>(
                    'metrics.optOutRate',
                    'Opt out rate',
                    (info) => {
                        const value = info.getValue()
                        return (
                            <MetricCell value={value}>
                                {typeof value === 'number'
                                    ? formatMetricValue(
                                          value,
                                          'percent-precision-1',
                                      )
                                    : (value as string)}
                            </MetricCell>
                        )
                    },
                ),
            ]

            const dataWithOptOutRate = [
                {
                    ...mockJourneyData[0],
                    metrics: {
                        ...DEFAULT_TABLE_METRICS,
                        optOutRate: 0.05,
                    },
                },
            ]

            renderComponent({
                columns: [...mockColumns, ...optOutRateColumn],
                data: dataWithOptOutRate,
            })

            const formattedOptOutRate = formatMetricValue(
                0.05,
                'percent-precision-1',
            )
            expect(screen.getByText(formattedOptOutRate)).toBeInTheDocument()
        })

        it('should render opt out rate as string when value is not a number', () => {
            const optOutRateColumn: ColumnDef<JourneyApiDTO, unknown>[] = [
                createSortableColumn<JourneyApiDTO>(
                    'metrics.optOutRate',
                    'Opt out rate',
                    (info) => {
                        const value = info.getValue()
                        return (
                            <MetricCell value={value}>
                                {typeof value === 'number'
                                    ? formatMetricValue(
                                          value,
                                          'percent-precision-1',
                                      )
                                    : (value as string)}
                            </MetricCell>
                        )
                    },
                ),
            ]

            const dataWithOptOutRateString = [
                {
                    ...mockJourneyData[0],
                    metrics: {
                        ...DEFAULT_TABLE_METRICS,
                        optOutRate: 'N/A' as any,
                    },
                },
            ]

            renderComponent({
                columns: [...mockColumns, ...optOutRateColumn],
                data: dataWithOptOutRateString,
            })

            expect(screen.getByText('N/A')).toBeInTheDocument()
        })
    })

    describe('Create campaign button', () => {
        it('should not render Create campaign button when isCampaign is false', () => {
            renderComponent({ isCampaign: false })

            expect(
                screen.queryByRole('button', { name: /create campaign/i }),
            ).not.toBeInTheDocument()
        })

        it('should render Create campaign button when isCampaign is true', () => {
            renderComponent({ isCampaign: true })

            expect(
                screen.getByRole('button', { name: /create campaign/i }),
            ).toBeInTheDocument()
        })

        it('should navigate to campaign setup page when Create campaign button is clicked', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory()
            const shopName = 'test-shop'

            useJourneyContextMock.mockReturnValue({
                currency: 'USD',
                shopName,
                journeys: [],
                campaigns: [],
                journeyData: undefined,
                currentIntegration: undefined,
                isLoading: false,
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isLoadingIntegrations: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                storeConfiguration: undefined,
            })

            renderComponent({ isCampaign: true }, history)

            const createButton = screen.getByRole('button', {
                name: /create campaign/i,
            })

            await act(() => user.click(createButton))

            expect(history.location.pathname).toBe(
                `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
            )
        })

        it('should use correct shopName from context in navigation', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory()
            const customShopName = 'my-custom-shop'

            useJourneyContextMock.mockReturnValue({
                currency: 'USD',
                shopName: customShopName,
                journeys: [],
                campaigns: [],
                journeyData: undefined,
                currentIntegration: undefined,
                isLoading: false,
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isLoadingIntegrations: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                storeConfiguration: undefined,
            })

            renderComponent({ isCampaign: true }, history)

            const createButton = screen.getByRole('button', {
                name: /create campaign/i,
            })

            await act(() => user.click(createButton))

            expect(history.location.pathname).toContain(customShopName)
            expect(history.location.pathname).toBe(
                `/app/ai-journey/${customShopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
            )
        })
    })

    describe('Empty state', () => {
        it('should not render Create campaign button when isCampaign is false', () => {
            renderComponent({ data: [], isCampaign: false })

            expect(
                screen.queryAllByRole('button', { name: /create campaign/i }),
            ).toHaveLength(1)
        })

        it('should render Create campaign button when isCampaign is true', () => {
            renderComponent({ data: [], isCampaign: true })

            expect(
                screen.queryAllByRole('button', { name: /create campaign/i }),
            ).toHaveLength(2)
        })

        it('should navigate to campaign setup page when Create campaign button is clicked', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory()
            const shopName = 'test-shop'

            useJourneyContextMock.mockReturnValue({
                currency: 'USD',
                shopName,
                journeys: [],
                campaigns: [],
                journeyData: undefined,
                currentIntegration: undefined,
                isLoading: false,
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isLoadingIntegrations: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                storeConfiguration: undefined,
            })

            renderComponent({ isCampaign: true }, history)

            const createButton = screen.getByRole('button', {
                name: /create campaign/i,
            })
            await act(() => user.click(createButton))

            expect(history.location.pathname).toBe(
                `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
            )
        })

        it('should use correct shopName from context in navigation', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory()
            const customShopName = 'my-custom-shop'

            useJourneyContextMock.mockReturnValue({
                currency: 'USD',
                shopName: customShopName,
                journeys: [],
                campaigns: [],
                journeyData: undefined,
                currentIntegration: undefined,
                isLoading: false,
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isLoadingIntegrations: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                storeConfiguration: undefined,
            })

            renderComponent({ isCampaign: true }, history)

            const createButton = screen.getByRole('button', {
                name: /create campaign/i,
            })
            await act(() => user.click(createButton))

            expect(history.location.pathname).toContain(customShopName)
            expect(history.location.pathname).toBe(
                `/app/ai-journey/${customShopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
            )
        })
    })

    describe('Campaign action columns', () => {
        const mockJourneyWithCampaign: JourneyApiDTO = {
            ...mockJourneyData[0],
            campaign: {
                title: 'Test Campaign',
                state: JourneyCampaignStateEnum.Draft,
            },
        }

        interface TestTableProps {
            data: JourneyApiDTO[]
            meta: {
                onRemoveClick: (id: string) => void
                onSendClick: (id: string) => void
                onCancelClick: (id: string) => void
                onDuplicateClick: (journey: JourneyApiDTO) => void
                onChangeStatus: (
                    id: string,
                    status: UpdatableJourneyCampaignState,
                ) => void
                currency: string
            }
        }

        function TestTableWithActions({ data, meta }: TestTableProps) {
            const table = useTable({
                data,
                columns: [
                    ...mockColumns,
                    ...campaignsActionColumns,
                ] as ColumnDef<JourneyApiDTO, unknown>[],
                additionalOptions: {
                    meta,
                },
            })

            return (
                <TableRoot withBorder>
                    <TableHeader />
                    <TableBodyContent
                        isLoading={false}
                        rows={table.getRowModel().rows}
                        columnCount={
                            mockColumns.length + campaignsActionColumns.length
                        }
                        table={table}
                    />
                </TableRoot>
            )
        }

        const renderTableWithActions = (props: TestTableProps) => {
            return render(
                <ThemeProvider>
                    <TestTableWithActions {...props} />
                </ThemeProvider>,
            )
        }

        it('should call onChangeStatus with correct journey id and status when change status is triggered', async () => {
            const user = userEvent.setup()
            const onChangeStatus = jest.fn()
            const meta = {
                onRemoveClick: jest.fn(),
                onSendClick: jest.fn(),
                onCancelClick: jest.fn(),
                onDuplicateClick: jest.fn(),
                onChangeStatus,
                currency: 'USD',
            }

            renderTableWithActions({
                data: [mockJourneyWithCampaign],
                meta,
            })

            const changeStatusButton = screen.getByRole('button', {
                name: /change status/i,
            })
            await user.click(changeStatusButton)

            expect(onChangeStatus).toHaveBeenCalledWith('1', 'paused')
        })

        it('should call onCancelClick with correct journey id when cancel is triggered', async () => {
            const user = userEvent.setup()
            const onCancelClick = jest.fn()
            const meta = {
                onRemoveClick: jest.fn(),
                onSendClick: jest.fn(),
                onCancelClick,
                onDuplicateClick: jest.fn(),
                onChangeStatus: jest.fn(),
                currency: 'USD',
            }

            renderTableWithActions({
                data: [mockJourneyWithCampaign],
                meta,
            })

            const cancelButton = screen.getByRole('button', {
                name: /cancel/i,
            })
            await user.click(cancelButton)

            expect(onCancelClick).toHaveBeenCalledWith('1')
        })

        it('should call onRemoveClick with correct journey id when remove is triggered', async () => {
            const user = userEvent.setup()
            const onRemoveClick = jest.fn()
            const meta = {
                onRemoveClick,
                onSendClick: jest.fn(),
                onCancelClick: jest.fn(),
                onDuplicateClick: jest.fn(),
                onChangeStatus: jest.fn(),
                currency: 'USD',
            }

            renderTableWithActions({
                data: [mockJourneyWithCampaign],
                meta,
            })

            const removeButton = screen.getByRole('button', {
                name: /remove/i,
            })
            await user.click(removeButton)

            expect(onRemoveClick).toHaveBeenCalledWith('1')
        })

        it('should call onSendClick with correct journey id when send is triggered', async () => {
            const user = userEvent.setup()
            const onSendClick = jest.fn()
            const meta = {
                onRemoveClick: jest.fn(),
                onSendClick,
                onCancelClick: jest.fn(),
                onDuplicateClick: jest.fn(),
                onChangeStatus: jest.fn(),
                currency: 'USD',
            }

            renderTableWithActions({
                data: [mockJourneyWithCampaign],
                meta,
            })

            const sendButton = screen.getByRole('button', {
                name: /send/i,
            })
            await user.click(sendButton)

            expect(onSendClick).toHaveBeenCalledWith('1')
        })

        it('should call onDuplicateClick with correct journey object when duplicate is triggered', async () => {
            const user = userEvent.setup()
            const onDuplicateClick = jest.fn()
            const meta = {
                onRemoveClick: jest.fn(),
                onSendClick: jest.fn(),
                onCancelClick: jest.fn(),
                onDuplicateClick,
                onChangeStatus: jest.fn(),
                currency: 'USD',
            }

            renderTableWithActions({
                data: [mockJourneyWithCampaign],
                meta,
            })

            const duplicateButton = screen.getByRole('button', {
                name: /duplicate/i,
            })
            await user.click(duplicateButton)

            expect(onDuplicateClick).toHaveBeenCalledWith(
                mockJourneyWithCampaign,
            )
        })
    })
})
