import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Location } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import { JourneyProvider } from 'AIJourney/providers'
import { mockStore, renderWithRouter } from 'utils/testing'

import {
    DEFAULT_TABLE_METRICS,
    LOADING_TABLE_METRICS,
} from '../../hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import type { TableRow } from '../../pages/Campaigns/Campaigns'
import CampaignsTable from './CampaignsTable'
import { actionColumns, columns, metricColumns } from './Columns'

const useParamsMock = jest.mocked(useParams)
const useLocationMock = jest.mocked(useLocation)

const mockHandleUpdate = jest.fn()
jest.mock('AIJourney/hooks', () => ({
    useJourneyUpdateHandler: () => ({
        handleUpdate: mockHandleUpdate,
    }),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useLocation: jest.fn(),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const mockMutateAsync = jest.fn()
jest.mock('AIJourney/queries', () => ({
    useCreateNewJourney: () => ({
        mutateAsync: mockMutateAsync,
    }),
}))

const mockGetJourneyData = jest.fn()
jest.mock('AIJourney/queries/useJourneyData/useJourneyData', () => ({
    getJourneyData: (...args: any[]) => mockGetJourneyData(...args),
    useJourneyData: jest.fn(() => ({
        data: null,
        isLoading: false,
    })),
}))

const mockDeleteJourney = jest.fn()
jest.mock('AIJourney/queries/useDeleteJourney/useDeleteJourney', () => ({
    useDeleteJourney: () => ({
        mutate: mockDeleteJourney,
    }),
}))

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: (key: string) => mockUseFlag(key),
}))

const mockFields: TableRow[] = [
    {
        id: '1',
        account_id: 1,
        created_datetime: '2025-07-04T12:24:29.121874',
        state: 'active',
        store_integration_id: 2,
        store_name: 'test-store',
        store_type: 'shopify',
        type: 'campaign',
        campaign: {
            title: 'Welcome campaign',
            state: 'draft',
            has_included_audiences: true,
        },
        metrics: DEFAULT_TABLE_METRICS,
    },
    {
        id: '2',
        account_id: 1,
        created_datetime: '2025-07-04T12:24:29.121874',
        state: 'active',
        store_integration_id: 2,
        store_name: 'test-store',
        store_type: 'shopify',
        type: 'campaign',
        campaign: {
            title: 'Win back campaign',
            state: 'sent',
            has_included_audiences: true,
        },
        metrics: DEFAULT_TABLE_METRICS,
    },
]

describe('CampaignsTable', () => {
    let queryClient: QueryClient
    const allColumns = [...columns, ...metricColumns, ...actionColumns]

    const wrapper = (children: React.ReactNode) => (
        <QueryClientProvider client={queryClient}>
            <Provider
                store={mockStore({
                    integrations: fromJS({ integrations: [] }),
                })}
            >
                <JourneyProvider>{children}</JourneyProvider>
            </Provider>
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        useParamsMock.mockReturnValue({ shopName: 'test-shop' })
        useLocationMock.mockReturnValue({
            pathname: '/app/ai-journey/test-shop/flows',
        } as Location)
        mockUseFlag.mockImplementation(() => false)

        jest.clearAllMocks()
    })

    it('should render table with data', () => {
        renderWithRouter(
            wrapper(<CampaignsTable columns={columns} data={mockFields} />),
        )

        expect(screen.getByText('Welcome campaign')).toBeInTheDocument()
        expect(screen.getByText('Win back campaign')).toBeInTheDocument()
    })

    it('should render loading state', () => {
        renderWithRouter(
            wrapper(
                <CampaignsTable columns={columns} data={[]} isLoading={true} />,
            ),
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should filter data based on search input', async () => {
        renderWithRouter(
            wrapper(<CampaignsTable columns={columns} data={mockFields} />),
        )

        const searchInput = screen.getByRole('textbox')
        await userEvent.type(searchInput, 'Welcome campaign')

        await waitFor(() => {
            expect(screen.getByText('Welcome campaign')).toBeInTheDocument()
            expect(
                screen.queryByText('Win back campaign'),
            ).not.toBeInTheDocument()
        })
    })

    it('should duplicate a campaign when duplicate option is clicked', async () => {
        const mockJourneyData = {
            id: '1',
            store_integration_id: 2,
            store_name: 'test-store',
            type: 'campaign',
            campaign: {
                title: 'Welcome campaign',
            },
            included_audience_list_ids: [],
            excluded_audience_list_ids: [],
            message_instructions: 'Test instructions',
            configuration: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_integration_id: 1,
                sms_sender_number: '415-111-111',
                discount_code_message_threshold: 2,
            },
        }

        const mockCreatedJourney = {
            id: 'new-journey-id',
            type: 'campaign',
        }

        mockGetJourneyData.mockResolvedValue(mockJourneyData)
        mockMutateAsync.mockResolvedValue(mockCreatedJourney)

        renderWithRouter(
            wrapper(<CampaignsTable columns={allColumns} data={mockFields} />),
        )

        const user = userEvent.setup()

        const moreOptionsButtons = screen.getAllByLabelText('Open options')
        await act(() => user.click(moreOptionsButtons[0]))

        const duplicateOption = screen
            .getAllByText('Duplicate')
            .find((el) => el.closest('[role="option"]'))

        if (duplicateOption) {
            await act(() => user.click(duplicateOption))
        }

        await waitFor(() => {
            expect(mockGetJourneyData).toHaveBeenCalledWith('1')
            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 2,
                    store_name: 'test-store',
                    type: 'campaign',
                    campaign: {
                        title: 'Welcome campaign (Copy)',
                    },
                    included_audience_list_ids: [],
                    excluded_audience_list_ids: [],
                    message_instructions: 'Test instructions',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                    sms_sender_number: '415-111-111',
                    discount_code_message_threshold: 2,
                },
            })
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaign/setup/new-journey-id',
            )
        })
    })

    it('should render skeleton when metrics are loading', () => {
        const dataWithLoadingMetrics: TableRow[] = [
            {
                ...mockFields[0],
                metrics: LOADING_TABLE_METRICS,
            },
        ]

        renderWithRouter(
            wrapper(
                <CampaignsTable
                    columns={[...columns, ...metricColumns]}
                    data={dataWithLoadingMetrics}
                />,
            ),
        )

        const skeletons = document.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render metric values when metrics are defined', () => {
        const dataWithMetrics: TableRow[] = [
            {
                ...mockFields[0],
                metrics: {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 150,
                },
            },
        ]

        renderWithRouter(
            wrapper(
                <CampaignsTable
                    columns={[...columns, ...metricColumns]}
                    data={dataWithMetrics}
                />,
            ),
        )

        expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should open cancel confirmation modal and cancel campaign when confirmed', async () => {
        const mockCampaignWithActiveState: TableRow[] = [
            {
                id: '1',
                account_id: 1,
                created_datetime: '2025-07-04T12:24:29.121874',
                state: 'active',
                store_integration_id: 2,
                store_name: 'test-store',
                store_type: 'shopify',
                type: 'campaign',
                campaign: {
                    title: 'Active campaign',
                    state: 'active',
                    has_included_audiences: true,
                },
                metrics: DEFAULT_TABLE_METRICS,
            },
        ]

        renderWithRouter(
            wrapper(
                <CampaignsTable
                    columns={allColumns}
                    data={mockCampaignWithActiveState}
                />,
            ),
        )

        const user = userEvent.setup()

        const moreOptionsButton = screen.getByLabelText('Open options')
        await act(() => user.click(moreOptionsButton))

        const cancelOption = screen
            .getAllByText('Cancel')
            .find((el) => el.closest('[role="option"]'))

        if (cancelOption) {
            await act(() => user.click(cancelOption))
        }

        await waitFor(() => {
            expect(screen.getByText('Cancel Campaign?')).toBeInTheDocument()
        })

        const confirmButton = screen.getByRole('button', {
            name: 'Cancel Campaign',
        })
        await act(() => user.click(confirmButton))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                id: '1',
                campaignState: 'canceled',
            })
        })
    })

    it('should show "No audience" badge for draft campaign without audiences', () => {
        const draftWithoutAudience: TableRow[] = [
            {
                ...mockFields[0],
                campaign: {
                    title: 'Draft campaign',
                    state: 'draft',
                    has_included_audiences: false,
                },
            },
        ]

        renderWithRouter(
            wrapper(
                <CampaignsTable
                    columns={columns}
                    data={draftWithoutAudience}
                />,
            ),
        )

        expect(screen.getByText('No audience')).toBeInTheDocument()
    })

    it('should open send confirmation modal and send campaign when confirmed', async () => {
        mockUseFlag.mockImplementation(() => true)

        renderWithRouter(
            wrapper(<CampaignsTable columns={allColumns} data={mockFields} />),
        )

        const user = userEvent.setup()

        const moreOptionsButton = screen.getAllByLabelText('Open options')[0]
        await act(() => user.click(moreOptionsButton))

        const sendOption = screen
            .getAllByText('Send')
            .find((el) => el.closest('[role="option"]'))

        if (sendOption) {
            await act(() => user.click(sendOption))
        }

        await waitFor(() => {
            expect(screen.getByText('Send Campaign?')).toBeInTheDocument()
        })

        const confirmButton = screen.getByRole('button', { name: 'Send' })
        await act(() => user.click(confirmButton))

        await waitFor(() => {
            expect(mockHandleUpdate).toHaveBeenCalledWith({
                id: '1',
                campaignState: 'scheduled',
            })
        })
    })
})
