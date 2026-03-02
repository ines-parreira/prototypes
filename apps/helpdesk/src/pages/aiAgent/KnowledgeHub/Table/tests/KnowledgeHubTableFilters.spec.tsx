import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { useFaqHelpCenter } from 'pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { EMPTY_HELP_CENTER_ID } from 'pages/automate/common/components/HelpCenterSelect'

const mockStore = configureStore([])

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))

jest.mock('pages/aiAgent/hooks/useSyncStoreDomain', () => ({
    useSyncStoreDomain: jest.fn(() => ({
        storeDomain: 'example.com',
        storeUrl: 'https://example.com',
        storeDomainIngestionLog: null,
        isFetchLoading: false,
        syncTriggered: false,
        handleTriggerSync: jest.fn(),
        handleOnSync: jest.fn(),
        handleOnCancel: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(() => ({
        storeConfiguration: { helpCenterId: 1 },
        isLoading: false,
    })),
}))

jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter')

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(() => ({
        guidanceArticle: null,
        isLoading: false,
    })),
}))

const mockUseFaqHelpCenter = useFaqHelpCenter as jest.MockedFunction<
    typeof useFaqHelpCenter
>

const mockData = [
    {
        type: KnowledgeType.Document,
        title: 'Product Manual',
        lastUpdatedAt: '2024-01-15T10:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'docs.example.com',
        id: '1',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'Shipping FAQ',
        lastUpdatedAt: '2024-01-10T10:00:00Z',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'docs.example.com',
        id: '2',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Return Policy',
        lastUpdatedAt: '2024-01-20T10:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '3',
    },
    {
        type: KnowledgeType.URL,
        title: 'Help Center',
        lastUpdatedAt: '2024-01-05T10:00:00Z',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        id: '4',
    },
]

const mixedVisibilityData = [
    {
        type: KnowledgeType.Document,
        title: 'Public Doc 1',
        lastUpdatedAt: '2024-01-15T10:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'docs.example.com',
        id: '1',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'Unlisted FAQ',
        lastUpdatedAt: '2024-01-10T10:00:00Z',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'docs.example.com',
        id: '2',
    },
    {
        type: KnowledgeType.Document,
        title: 'Public Doc 2',
        lastUpdatedAt: '2024-01-20T10:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'help.example.com',
        id: '3',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Unlisted Guidance',
        lastUpdatedAt: '2024-01-25T10:00:00Z',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        id: '4',
    },
]

describe('KnowledgeHubTable - Filters', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
        logger: {
            log: jest.fn(),
            warn: console.warn,
            error: () => {},
        },
    })

    const store = mockStore({})

    const defaultProps = {
        data: mockData,
        metricsDateRange: {
            start_datetime: '2025-01-01T00:00:00Z',
            end_datetime: '2025-01-28T23:59:59Z',
        },
        isMetricsEnabled: true,
        isLoading: false,
        onRowClick: jest.fn(),
        selectedFolder: null,
        shopType: 'shopify',
        searchTerm: '',
        onSearchChange: jest.fn(),
        dateRange: { startDate: null, endDate: null },
        onDateRangeChange: jest.fn(),
        inUseByAIFilter: null,
        onInUseByAIChange: jest.fn(),
        clearSearchParams: jest.fn(),
    }

    beforeEach(() => {
        queryClient.clear()
        mockUseFaqHelpCenter.mockReturnValue({
            faqHelpCenters: [],
            selectedHelpCenter: {
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            },
            setHelpCenterId: jest.fn(),
            handleOnSave: jest.fn(),
            shopName: 'test-shop',
            isPendingCreateOrUpdate: false,
            helpCenterItems: [{ id: -1, name: 'No help center' }],
        })
    })

    const KnowledgeHubTableWithState = (props: any) => {
        const [inUseByAIFilter, setInUseByAIFilter] = React.useState<
            boolean | null
        >(props.inUseByAIFilter ?? null)
        const [dateRange, setDateRange] = React.useState(
            props.dateRange || { startDate: null, endDate: null },
        )

        return (
            <KnowledgeHubTable
                {...defaultProps}
                {...props}
                inUseByAIFilter={inUseByAIFilter}
                onInUseByAIChange={setInUseByAIFilter}
                dateRange={dateRange}
                onDateRangeChange={(startDate, endDate) =>
                    setDateRange({ startDate, endDate })
                }
            />
        )
    }

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <KnowledgeHubTable {...defaultProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    const renderComponentWithState = (props = {}) => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <KnowledgeHubTableWithState {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    const getToolbar = () => {
        const toolbars = document.querySelectorAll(
            '[data-name="table-toolbar"]',
        )
        return toolbars[0] as HTMLElement
    }

    describe('filter button', () => {
        it('renders Add Filter button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /add filter/i }),
            ).toBeInTheDocument()
        })
    })

    describe('type filtering', () => {
        it('filters data by selected type filter and shows grouped row', () => {
            renderComponent({ selectedTypeFilter: KnowledgeType.FAQ })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()

            const groupRow = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow).toHaveTextContent('1')
        })

        it('shows all items when type filter is null', () => {
            renderComponent({ selectedTypeFilter: null })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()

            const groupRow = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow).toHaveTextContent('2')
        })

        it('filters multiple items of the same type across different sources', () => {
            const dataWithMultipleDocs = [
                ...mockData,
                {
                    type: KnowledgeType.Document,
                    title: 'User Guide',
                    lastUpdatedAt: '2024-01-25T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'guides.example.com',
                    id: '5',
                },
            ]

            renderComponent({
                data: dataWithMultipleDocs,
                selectedTypeFilter: KnowledgeType.Document,
            })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()
            expect(screen.getByText('guides.example.com')).toBeInTheDocument()

            const groupRow1 = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow1).toHaveTextContent('1')

            const groupRow2 = screen
                .getByText('guides.example.com')
                .closest('tr')
            expect(groupRow2).toHaveTextContent('1')
        })

        it('shows empty state when filter matches no items', () => {
            const dataWithoutGuidance = mockData.filter(
                (item) => item.type !== KnowledgeType.Guidance,
            )

            renderComponent({
                data: dataWithoutGuidance,
                selectedTypeFilter: KnowledgeType.Guidance,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create Guidance' }),
            ).toBeInTheDocument()
        })

        it('filters grouped data correctly when multiple types share same source', () => {
            const dataWithSameSourceDifferentTypes = [
                {
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'same-source.com',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'same-source.com',
                    id: '2',
                },
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guide 1',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'same-source.com',
                    id: '3',
                },
            ]

            renderComponent({
                data: dataWithSameSourceDifferentTypes,
                selectedTypeFilter: KnowledgeType.Document,
            })

            const groupRow = screen.getByText('same-source.com').closest('tr')
            expect(groupRow).toHaveTextContent('1')
        })

        it('correctly filters items without source', () => {
            const dataWithItemsWithoutSource = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '2',
                },
            ]

            renderComponent({
                data: dataWithItemsWithoutSource,
                selectedTypeFilter: KnowledgeType.Guidance,
            })

            expect(screen.getByText('Guidance 1')).toBeInTheDocument()
            expect(screen.queryByText('FAQ 1')).not.toBeInTheDocument()
        })

        it('respects type filter when displaying item counts', () => {
            renderComponent({ selectedTypeFilter: KnowledgeType.Document })

            const itemCountText = screen.getByText('1 item')
            expect(itemCountText).toBeInTheDocument()
        })
    })

    describe('InUseByAI filter', () => {
        it('shows items as flat list when InUseByAI filter is applied', async () => {
            const user = userEvent.setup()
            renderComponentWithState({ data: mixedVisibilityData })

            const addFilterButton = screen.getByRole('button', {
                name: /add filter/i,
            })

            await user.click(addFilterButton)

            const inUseByAIOptions =
                await screen.findAllByText('In use by AI Agent')

            await user.click(inUseByAIOptions[1])

            const trueOption = await screen.findByText('True')
            await user.click(trueOption)

            await waitFor(() => {
                expect(screen.getByText('Public Doc 1')).toBeInTheDocument()
                expect(screen.getByText('Public Doc 2')).toBeInTheDocument()
                expect(screen.queryByText('snippets')).not.toBeInTheDocument()
            })
        })

        it('filters correctly for PUBLIC items in flat list', async () => {
            const user = userEvent.setup()
            renderComponentWithState({ data: mixedVisibilityData })

            const addFilterButton = screen.getByRole('button', {
                name: /add filter/i,
            })
            await user.click(addFilterButton)

            const inUseByAIOptions =
                await screen.findAllByText('In use by AI Agent')
            await user.click(inUseByAIOptions[1])

            const trueOption = await screen.findByText('True')
            await user.click(trueOption)

            await waitFor(() => {
                expect(screen.getByText('Public Doc 1')).toBeInTheDocument()
                expect(screen.getByText('Public Doc 2')).toBeInTheDocument()
                expect(
                    screen.queryByText('Unlisted FAQ'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Unlisted Guidance'),
                ).not.toBeInTheDocument()
            })
        })

        it('filters correctly for UNLISTED items in flat list', async () => {
            const user = userEvent.setup()
            renderComponentWithState({ data: mixedVisibilityData })

            const addFilterButton = screen.getByRole('button', {
                name: /add filter/i,
            })
            await user.click(addFilterButton)

            const inUseByAIOptions =
                await screen.findAllByText('In use by AI Agent')
            await user.click(inUseByAIOptions[1])

            const falseOption = await screen.findByText('False')
            await user.click(falseOption)

            await waitFor(() => {
                expect(screen.getByText('Unlisted FAQ')).toBeInTheDocument()
                expect(
                    screen.getByText('Unlisted Guidance'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('Public Doc 1'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Public Doc 2'),
                ).not.toBeInTheDocument()
            })
        })

        it('works correctly with type filter', async () => {
            const user = userEvent.setup()
            renderComponentWithState({
                data: mixedVisibilityData,
                selectedTypeFilter: KnowledgeType.Document,
            })

            const addFilterButton = screen.getByRole('button', {
                name: /add filter/i,
            })
            await user.click(addFilterButton)

            const inUseByAIOptions =
                await screen.findAllByText('In use by AI Agent')
            await user.click(inUseByAIOptions[1])

            const trueOption = await screen.findByText('True')
            await user.click(trueOption)

            await waitFor(() => {
                expect(screen.getByText('Public Doc 1')).toBeInTheDocument()
                expect(screen.getByText('Public Doc 2')).toBeInTheDocument()
                expect(
                    screen.queryByText('Unlisted FAQ'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Unlisted Guidance'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('date range filter', () => {
        it('renders date range filter with clear handler when dates are set', () => {
            const mockOnDateRangeChange = jest.fn()

            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{
                                startDate: '2024-01-01T00:00:00.000Z',
                                endDate: '2024-01-07T23:59:59.999Z',
                            }}
                            onDateRangeChange={mockOnDateRangeChange}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(screen.getByText('Last updated date')).toBeInTheDocument()
        })

        it('renders AI filter with clear handler when value is set', () => {
            const mockOnInUseByAIChange = jest.fn()

            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            inUseByAIFilter={true}
                            onInUseByAIChange={mockOnInUseByAIChange}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            const buttons = screen.getAllByRole('button', {
                name: /in use by ai agent/i,
            })
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })

        it('renders both filters when both are active', () => {
            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{
                                startDate: '2024-01-01T00:00:00.000Z',
                                endDate: '2024-01-07T23:59:59.999Z',
                            }}
                            inUseByAIFilter={true}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(screen.getByText('Last updated date')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /in use by ai agent/i }),
            ).toBeInTheDocument()
        })

        it('does not render date filter when no dates are set', () => {
            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{ startDate: null, endDate: null }}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByText('Last updated date'),
            ).not.toBeInTheDocument()
        })
    })

    describe('filter clearing', () => {
        it('does not render AI filter when value is null', () => {
            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            inUseByAIFilter={null}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            const buttons = screen.queryAllByRole('button', {
                name: /in use by ai agent/i,
            })
            expect(buttons.length).toBe(1)
        })

        it('shows Add Filter button when filters are available', () => {
            render(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable {...defaultProps} />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByRole('button', { name: /add filter/i }),
            ).toBeInTheDocument()
        })
    })

    describe('filter card visibility', () => {
        it('should show date filter card when date range is set', () => {
            renderComponent({
                dateRange: {
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                },
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('Last updated date'),
            ).toBeInTheDocument()
        })

        it('should show inUseByAI filter card when value is set to true', () => {
            renderComponent({
                inUseByAIFilter: true,
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('In use by AI Agent'),
            ).toBeInTheDocument()
        })

        it('should show inUseByAI filter card when value is set to false', () => {
            renderComponent({
                inUseByAIFilter: false,
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('In use by AI Agent'),
            ).toBeInTheDocument()
        })

        it('should remove date filter card when date range is cleared', async () => {
            const { rerender } = renderComponent({
                dateRange: {
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                },
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('Last updated date'),
            ).toBeInTheDocument()

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{ startDate: null, endDate: null }}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                within(toolbar).queryByText('Last updated date'),
            ).not.toBeInTheDocument()
        })

        it('should remove inUseByAI filter card when value is cleared', async () => {
            const { rerender } = renderComponent({
                inUseByAIFilter: true,
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('In use by AI Agent'),
            ).toBeInTheDocument()

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            inUseByAIFilter={null}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                within(toolbar).queryByText('In use by AI Agent'),
            ).not.toBeInTheDocument()
        })

        it('should remove both filter cards when both filters are cleared', async () => {
            const { rerender } = renderComponent({
                dateRange: {
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                },
                inUseByAIFilter: true,
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('Last updated date'),
            ).toBeInTheDocument()
            expect(
                within(toolbar).getByText('In use by AI Agent'),
            ).toBeInTheDocument()

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{ startDate: null, endDate: null }}
                            inUseByAIFilter={null}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                within(toolbar).queryByText('Last updated date'),
            ).not.toBeInTheDocument()
            expect(
                within(toolbar).queryByText('In use by AI Agent'),
            ).not.toBeInTheDocument()
        })

        it('should hide date filter card when only startDate is cleared', async () => {
            const { rerender } = renderComponent({
                dateRange: {
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                },
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('Last updated date'),
            ).toBeInTheDocument()

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{
                                startDate: null,
                                endDate: '2025-01-31',
                            }}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                within(toolbar).queryByText('Last updated date'),
            ).not.toBeInTheDocument()
        })

        it('should hide date filter card when only endDate is cleared', async () => {
            const { rerender } = renderComponent({
                dateRange: {
                    startDate: '2025-01-01',
                    endDate: '2025-01-31',
                },
            })

            const toolbar = getToolbar()
            expect(
                within(toolbar).getByText('Last updated date'),
            ).toBeInTheDocument()

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            dateRange={{
                                startDate: '2025-01-01',
                                endDate: null,
                            }}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                within(toolbar).queryByText('Last updated date'),
            ).not.toBeInTheDocument()
        })

        it('should not show filter cards initially when filters are null', () => {
            renderComponent()

            const toolbar = getToolbar()
            expect(
                within(toolbar).queryByText('Last updated date'),
            ).not.toBeInTheDocument()
            expect(
                within(toolbar).queryByText('In use by AI Agent'),
            ).not.toBeInTheDocument()
        })
    })
})
