import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'

import { useSkillsArticles } from '../../hooks/useSkillsArticles'
import { useTotalAiAgentTickets } from '../../hooks/useTotalAiAgentTickets'
import type { TransformedArticle } from '../../types'
import { SkillsTable } from './SkillsTable'

jest.mock('../../hooks/useSkillsArticles')
jest.mock('../../hooks/useTotalAiAgentTickets')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)

const mockUseSkillsArticles = useSkillsArticles as jest.Mock
const mockUseTotalAiAgentTickets = useTotalAiAgentTickets as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseStoreIntegrationByShopName =
    useStoreIntegrationByShopName as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock

const mockStore = configureMockStore([thunk])

Element.prototype.getAnimations = jest.fn(() => [])

describe('SkillsTable', () => {
    let store: ReturnType<typeof mockStore>

    const mockArticles: TransformedArticle[] = [
        {
            id: 1,
            title: 'How to track order',
            intents: [
                { name: 'order::status' as any, formattedName: 'Order Status' },
                {
                    name: 'order::tracking' as any,
                    formattedName: 'Order Tracking',
                },
            ],
            status: 'enabled',
            metrics: {
                tickets: 100,
                handoverTickets: 20,
                csat: 4.5,
                resourceSourceSetId: 123,
            },
        },
        {
            id: 2,
            title: 'How to cancel order',
            intents: [
                { name: 'order::cancel' as any, formattedName: 'Cancel Order' },
            ],
            status: 'disabled',
            metrics: {
                tickets: 50,
                handoverTickets: 10,
                csat: 4.0,
                resourceSourceSetId: 124,
            },
        },
        {
            id: 3,
            title: 'Shipping information',
            intents: [
                { name: 'shipping::status' as any, formattedName: 'Shipping' },
            ],
            status: 'enabled',
            metrics: {
                tickets: 75,
                handoverTickets: 15,
                csat: 4.2,
                resourceSourceSetId: 125,
            },
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        store = mockStore({})

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 123,
                storeName: 'test-store',
            },
        })

        mockUseStoreIntegrationByShopName.mockReturnValue({
            id: 456,
        })

        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            outcomeCustomFieldId: 111,
            intentCustomFieldId: 222,
        })

        mockUseSkillsArticles.mockReturnValue({
            articles: mockArticles,
            isLoading: false,
            isError: false,
            isMetricsLoading: false,
            isMetricsError: false,
            metricsDateRange: {
                start_datetime: '2023-01-01',
                end_datetime: '2023-01-31',
            },
        })

        mockUseTotalAiAgentTickets.mockReturnValue({
            totalCount: 225,
            isLoading: false,
            isError: false,
        })
    })

    const renderComponent = () => {
        return render(
            <Provider store={store}>
                <ThemeProvider>
                    <SkillsTable />
                </ThemeProvider>
            </Provider>,
        )
    }

    describe('Rendering', () => {
        it('should render table with all articles', () => {
            renderComponent()

            expect(screen.getByText('How to track order')).toBeInTheDocument()
            expect(screen.getByText('How to cancel order')).toBeInTheDocument()
            expect(screen.getByText('Shipping information')).toBeInTheDocument()
        })

        it('should render column headers', () => {
            renderComponent()

            expect(screen.getByText('Name')).toBeInTheDocument()
            expect(screen.getByText('Intents')).toBeInTheDocument()
            expect(screen.getByText('Ticket volume')).toBeInTheDocument()
            expect(screen.getByText('Handover')).toBeInTheDocument()
            expect(screen.getByText('Average CSAT')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })

        it('should display article count', () => {
            renderComponent()

            expect(
                screen.getByText('Showing 3 of 3 skills'),
            ).toBeInTheDocument()
        })

        it('should display metrics date range info', () => {
            renderComponent()

            expect(
                screen.getByText('Metrics from last 28 days'),
            ).toBeInTheDocument()
        })

        it('should show loading state', () => {
            mockUseSkillsArticles.mockReturnValue({
                articles: [],
                isLoading: true,
                isError: false,
                isMetricsLoading: false,
                isMetricsError: false,
                metricsDateRange: undefined,
            })

            renderComponent()

            const skeletons = screen.getAllByLabelText('Loading')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('Search functionality', () => {
        it('should filter articles by title', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByPlaceholderText('Search ...')
            await user.type(searchInput, 'track')

            await waitFor(() => {
                expect(
                    screen.getByText('How to track order'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('How to cancel order'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Shipping information'),
                ).not.toBeInTheDocument()
            })
        })

        it('should update showing count after search', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByPlaceholderText('Search ...')
            await user.type(searchInput, 'order')

            await waitFor(() => {
                expect(
                    screen.getByText('Showing 2 of 3 skills'),
                ).toBeInTheDocument()
            })
        })

        it('should be case insensitive', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByPlaceholderText('Search ...')
            await user.type(searchInput, 'SHIPPING')

            await waitFor(() => {
                expect(
                    screen.getByText('Shipping information'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('How to track order'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Display mode toggle', () => {
        it('should have percentage mode selected by default', () => {
            renderComponent()

            const percentageButton = screen.getByRole('radio', {
                name: /percent/i,
            })
            expect(percentageButton).toHaveAttribute('aria-checked', 'true')
        })

        it('should switch to numeric mode when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const numericButton = screen.getByRole('radio', {
                name: /hashtag/i,
            })
            await user.click(numericButton)

            expect(numericButton).toHaveAttribute('aria-checked', 'true')
        })

        it('should display percentages in percentage mode', () => {
            renderComponent()

            expect(screen.getByText('44.4%')).toBeInTheDocument()
        })
    })

    describe('Intents column', () => {
        it('should display first intent as tag', () => {
            renderComponent()

            expect(screen.getByText('Order Status')).toBeInTheDocument()
        })

        it('should show additional intents count', () => {
            renderComponent()

            expect(screen.getByText('+1')).toBeInTheDocument()
        })

        it('should show dash when no intents', () => {
            mockUseSkillsArticles.mockReturnValue({
                articles: [
                    {
                        id: 4,
                        title: 'No intents article',
                        intents: [],
                        status: 'enabled',
                    },
                ],
                isLoading: false,
                isError: false,
                isMetricsLoading: false,
                isMetricsError: false,
                metricsDateRange: undefined,
            })

            renderComponent()

            const rows = screen.getAllByRole('row')
            const dataRow = rows[1]
            expect(within(dataRow).getByText('-')).toBeInTheDocument()
        })
    })

    describe('Status column', () => {
        it('should display enabled status as green tag', () => {
            renderComponent()

            const enabledTags = screen.getAllByText('Enabled')
            expect(enabledTags).toHaveLength(2)
        })

        it('should display disabled status as grey tag', () => {
            renderComponent()

            expect(screen.getByText('Disabled')).toBeInTheDocument()
        })
    })

    describe('Metrics columns', () => {
        it('should calculate ticket volume percentage correctly', () => {
            renderComponent()

            expect(screen.getByText('44.4%')).toBeInTheDocument()
            expect(screen.getByText('22.2%')).toBeInTheDocument()
            expect(screen.getByText('33.3%')).toBeInTheDocument()
        })

        it('should calculate handover percentage based on skill volume', () => {
            renderComponent()

            const handoverPercentages = screen.getAllByText('20%')
            expect(handoverPercentages.length).toBeGreaterThanOrEqual(2)
        })

        it('should display CSAT values', () => {
            renderComponent()

            expect(screen.getByText('4.5')).toBeInTheDocument()
            expect(screen.getByText('4')).toBeInTheDocument()
            expect(screen.getByText('4.2')).toBeInTheDocument()
        })

        it('should show -- when metrics are missing', () => {
            mockUseSkillsArticles.mockReturnValue({
                articles: [
                    {
                        id: 5,
                        title: 'No metrics article',
                        intents: [
                            {
                                name: 'test::intent',
                                formattedName: 'Test Intent',
                            },
                        ],
                        status: 'enabled',
                    },
                ],
                isLoading: false,
                isError: false,
                isMetricsLoading: false,
                isMetricsError: false,
                metricsDateRange: undefined,
            })

            renderComponent()

            const dashes = screen.getAllByText('--')
            expect(dashes.length).toBeGreaterThan(0)
        })

        it('should show skeleton when metrics are loading', () => {
            mockUseSkillsArticles.mockReturnValue({
                articles: mockArticles,
                isLoading: false,
                isError: false,
                isMetricsLoading: true,
                isMetricsError: false,
                metricsDateRange: undefined,
            })

            renderComponent()

            const skeletons = screen.getAllByLabelText('Loading')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('Sorting', () => {
        it('should sort by ticket volume when column header is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const ticketVolumeHeader = screen.getByText('Ticket volume')
            await user.click(ticketVolumeHeader)

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const firstDataRow = rows[1]
                expect(
                    within(firstDataRow).getByText('How to track order'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Pagination', () => {
        it('should not show pagination when articles are less than page size', () => {
            renderComponent()

            const nextButton = screen.queryByRole('button', {
                name: /next.*page/i,
            })
            expect(nextButton).not.toBeInTheDocument()
        })

        it('should show pagination when articles exceed page size', () => {
            const manyArticles: TransformedArticle[] = Array.from(
                { length: 15 },
                (_, i) => ({
                    id: i + 1,
                    title: `Article ${i + 1}`,
                    intents: [
                        {
                            name: `intent::${i}` as any,
                            formattedName: `Intent ${i}`,
                        },
                    ],
                    status: 'enabled' as const,
                    metrics: {
                        tickets: 10,
                        handoverTickets: 2,
                        csat: 4.0,
                        resourceSourceSetId: 100 + i,
                    },
                }),
            )

            mockUseSkillsArticles.mockReturnValue({
                articles: manyArticles,
                isLoading: false,
                isError: false,
                isMetricsLoading: false,
                isMetricsError: false,
                metricsDateRange: {
                    start_datetime: '2023-01-01',
                    end_datetime: '2023-01-31',
                },
            })

            renderComponent()

            const nextButton = screen.getByRole('button', {
                name: /next.*page/i,
            })
            expect(nextButton).toBeInTheDocument()
        })
    })

    describe('Error handling', () => {
        it('should handle missing help center ID', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    guidanceHelpCenterId: null,
                    storeName: 'test-store',
                },
            })

            mockUseSkillsArticles.mockReturnValue({
                articles: [],
                isLoading: false,
                isError: false,
                isMetricsLoading: false,
                isMetricsError: false,
                metricsDateRange: undefined,
            })

            renderComponent()

            expect(
                screen.getByText('Showing 0 of 0 skills'),
            ).toBeInTheDocument()
        })

        it('should handle missing shop integration', () => {
            mockUseStoreIntegrationByShopName.mockReturnValue(null)

            renderComponent()

            expect(screen.getByText('Name')).toBeInTheDocument()
        })
    })
})
