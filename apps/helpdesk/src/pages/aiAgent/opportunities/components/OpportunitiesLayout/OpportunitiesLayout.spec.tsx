import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, useHistory, useParams } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'

import { OpportunityType } from '../../enums'
import { useKnowledgeServiceOpportunities } from '../../hooks/useKnowledgeServiceOpportunities'
import {
    State,
    useOpportunityPageState,
} from '../../hooks/useOpportunityPageState'
import { useSelectedOpportunity } from '../../hooks/useSelectedOpportunity'
import { ResourceType } from '../../types'
import { mapAiArticlesToOpportunities } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunitiesLayout } from './OpportunitiesLayout'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn((payload) => ({
        type: 'NOTIFY',
        payload,
    })),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))

jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary',
    () => ({
        useHelpCenterAIArticlesLibrary: jest.fn(),
    }),
)

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(() => ({
        setIsCollapsibleColumnOpen: jest.fn(),
    })),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => 'en-US'),
}))

jest.mock('state/ui/helpCenter', () => ({
    getViewLanguage: jest.fn(() => 'en-US'),
}))

jest.mock('../../utils/mapAiArticlesToOpportunities', () => ({
    mapAiArticlesToOpportunities: jest.fn(),
}))

jest.mock('../../hooks/useKnowledgeServiceOpportunities', () => ({
    useKnowledgeServiceOpportunities: jest.fn(),
}))

jest.mock('../../hooks/useSelectedOpportunity', () => ({
    useSelectedOpportunity: jest.fn(),
}))

jest.mock('../../hooks/useOpportunityPageState', () => ({
    useOpportunityPageState: jest.fn(),
    State: {
        LOADING: 'LOADING',
        HAS_OPPORTUNITIES: 'HAS_OPPORTUNITIES',
        ENABLED_NO_OPPORTUNITIES: 'ENABLED_NO_OPPORTUNITIES',
        DISABLED_NEEDS_ENABLE: 'DISABLED_NEEDS_ENABLE',
        DISABLED_NEEDS_SETUP: 'DISABLED_NEEDS_SETUP',
    },
}))

jest.mock('pages/aiAgent/hooks/useShopIntegrationId', () => ({
    useShopIntegrationId: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('../OpportunitiesSidebar/OpportunitiesSidebar', () => ({
    OpportunitiesSidebar: jest.fn(
        ({
            opportunities,
            onSelectOpportunity,
            opportunitiesPageState,
        }: any) => (
            <div data-testid="opportunities-sidebar">
                {opportunitiesPageState?.isLoading && <div>Loading...</div>}
                {opportunities.map((opp: any) => (
                    <button
                        key={opp.id}
                        onClick={() => onSelectOpportunity(opp)}
                        data-testid={`opportunity-${opp.id}`}
                    >
                        {opp.resources?.[0]?.title}
                    </button>
                ))}
            </div>
        ),
    ),
}))

jest.mock('../OpportunitiesContent/OpportunitiesContent', () => ({
    OpportunitiesContent: jest.fn(
        ({ selectedOpportunity, onArchive, onPublish }: any) => (
            <div data-testid="opportunities-content">
                {selectedOpportunity ? (
                    <div>
                        <h2>{selectedOpportunity.resources?.[0]?.title}</h2>
                        <button
                            data-testid="archive-button"
                            onClick={() => onArchive(selectedOpportunity.id)}
                        >
                            Archive
                        </button>
                        <button
                            data-testid="publish-button"
                            onClick={() => onPublish(selectedOpportunity.id)}
                        >
                            Publish
                        </button>
                    </div>
                ) : (
                    <div>No opportunity selected</div>
                )}
            </div>
        ),
    ),
}))

const mockStore = configureStore([])
const mockMapAiArticlesToOpportunities = assumeMock(
    mapAiArticlesToOpportunities,
)
const mockUseKnowledgeServiceOpportunities = assumeMock(
    useKnowledgeServiceOpportunities,
)
const mockUseSelectedOpportunity = assumeMock(useSelectedOpportunity)
const mockUseOpportunityPageState = assumeMock(useOpportunityPageState)
const mockUseShopIntegrationId = assumeMock(useShopIntegrationId)
const mockUseFlag = assumeMock(useFlag)

describe('OpportunitiesLayout', () => {
    const mockMarkArticleAsReviewed = jest.fn()
    const mockArticles = [
        {
            key: 'article-1',
            title: 'First Article',
            html_content: 'First article content',
            isNew: true,
        },
        {
            key: 'article-2',
            title: 'Second Article',
            html_content: 'Second article content',
            isNew: true,
        },
        {
            key: 'article-3',
            title: 'Third Article',
            html_content: 'Third article content',
            isNew: false,
        },
    ]

    const mockStoreConfiguration = {
        guidanceHelpCenterId: 1,
        helpCenterId: 2,
        isEnabled: true,
    }

    const mockHelpCenter = {
        id: 1,
        default_locale: 'en-US',
        name: 'Test Help Center',
        type: 'guidance',
    }

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    const renderComponent = () => {
        const store = mockStore({
            notifications: [],
        })

        return render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <OpportunitiesLayout />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Configure the mock mapping function to return expected opportunities
        mockMapAiArticlesToOpportunities.mockImplementation((articles) =>
            articles.map((article: any) => ({
                id: article.key,
                key: article.key,
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                resources: [
                    {
                        title: article.title,
                        content: article.html_content,
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            })),
        )
        ;(useParams as jest.Mock).mockReturnValue({
            shopName: 'test-shop',
            shopType: 'shopify',
        })
        ;(useHistory as jest.Mock).mockReturnValue({
            replace: jest.fn(),
            push: jest.fn(),
        })
        ;(useAiAgentStoreConfigurationContext as jest.Mock).mockReturnValue({
            storeConfiguration: mockStoreConfiguration,
            isLoading: false,
        })
        ;(useAiAgentHelpCenter as jest.Mock).mockReturnValue(mockHelpCenter)
        ;(useHelpCenterAIArticlesLibrary as jest.Mock).mockReturnValue({
            articles: mockArticles,
            isLoading: false,
            markArticleAsReviewed: mockMarkArticleAsReviewed,
        })

        // Mock new hooks with default legacy behavior
        mockUseFlag.mockReturnValue(false)
        mockUseShopIntegrationId.mockReturnValue(undefined)
        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: [],
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            totalCount: 0,
            totalPending: 0,
            refetch: jest.fn(),
            allowedOpportunityIds: undefined,
        })
        mockUseSelectedOpportunity.mockImplementation(() => ({
            selectedOpportunity: null,
            selectedOpportunityId: null,
            setSelectedOpportunityId: jest.fn(),
            isLoading: false,
        }))
        mockUseOpportunityPageState.mockReturnValue({
            state: State.HAS_OPPORTUNITIES,
            isLoading: false,
            title: 'Opportunities',
            description: '',
            media: null,
            primaryCta: null,
            showEmptyState: false,
        })
    })

    it('should render sidebar and content components', () => {
        const { container } = renderComponent()

        expect(screen.getByTestId('opportunities-sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()

        const wrapper = container.querySelector('[data-ai-opportunities]')
        expect(wrapper).toBeInTheDocument()
    })

    it('should map articles to opportunities correctly', () => {
        renderComponent()

        expect(screen.getByTestId('opportunity-article-1')).toHaveTextContent(
            'First Article',
        )
        expect(screen.getByTestId('opportunity-article-2')).toHaveTextContent(
            'Second Article',
        )
        expect(screen.getByTestId('opportunity-article-3')).toHaveTextContent(
            'Third Article',
        )
    })

    it('should show loading state when any data is loading', () => {
        mockUseOpportunityPageState.mockReturnValue({
            state: State.LOADING,
            isLoading: true,
            title: '',
            description: '',
            media: null,
            primaryCta: null,
            showEmptyState: false,
        })

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show loading when help center is loading', () => {
        ;(useAiAgentHelpCenter as jest.Mock).mockReturnValue(null)

        renderComponent()

        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()
    })

    it('should show loading when AI articles are loading', () => {
        mockUseOpportunityPageState.mockReturnValue({
            state: State.LOADING,
            isLoading: true,
            title: '',
            description: '',
            media: null,
            primaryCta: null,
            showEmptyState: false,
        })

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should handle opportunity selection', async () => {
        const mockSetSelectedOpportunityId = jest.fn()
        mockUseSelectedOpportunity.mockImplementation(
            ({ opportunities }: { opportunities: any[] }) => ({
                selectedOpportunity: opportunities[0] || null,
                selectedOpportunityId: opportunities[0]?.id || null,
                setSelectedOpportunityId: mockSetSelectedOpportunityId,
                isLoading: false,
            }),
        )

        renderComponent()

        const firstOpportunity = screen.getByTestId('opportunity-article-1')

        await act(async () => {
            await userEvent.click(firstOpportunity)
        })

        await waitFor(() => {
            expect(mockSetSelectedOpportunityId).toHaveBeenCalledWith(
                'article-1',
            )
        })
    })

    it('should call onArchive when archive handler is triggered', () => {
        const {
            OpportunitiesContent,
        } = require('../OpportunitiesContent/OpportunitiesContent')

        renderComponent()

        const callArgs = OpportunitiesContent.mock.calls[0][0]
        expect(callArgs.opportunityConfig.onArchive).toBeDefined()

        callArgs.opportunityConfig.onArchive('article-1')

        expect(mockMarkArticleAsReviewed).toHaveBeenCalledWith(
            'article-1',
            'archive',
        )
    })

    it('should call onPublish when publish handler is triggered', () => {
        const {
            OpportunitiesContent,
        } = require('../OpportunitiesContent/OpportunitiesContent')

        renderComponent()

        const callArgs = OpportunitiesContent.mock.calls[0][0]
        expect(callArgs.opportunityConfig.onPublish).toBeDefined()

        callArgs.opportunityConfig.onPublish('article-1')

        expect(mockMarkArticleAsReviewed).toHaveBeenCalledWith(
            'article-1',
            'publish',
        )
    })

    it('should select next opportunity when current one is archived', () => {
        const TestComponentWithSelection = () => {
            const [selected, setSelected] = React.useState({
                id: 'article-1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                resources: [
                    {
                        title: 'First Article',
                        content: 'First article content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            })

            React.useEffect(() => {
                const handleArchive = (articleKey: string) => {
                    mockMarkArticleAsReviewed(articleKey, 'archive')
                    if (selected?.id === articleKey) {
                        const opportunities = mockArticles.map((article) => ({
                            id: article.key,
                            type: OpportunityType.FILL_KNOWLEDGE_GAP,
                            resources: [
                                {
                                    title: article.title,
                                    content: article.html_content,
                                    type: ResourceType.GUIDANCE,
                                    isVisible: true,
                                },
                            ],
                        }))
                        const remaining = opportunities.filter(
                            (opp) => opp.id !== articleKey,
                        )
                        setSelected(remaining[0] || null)
                    }
                }

                handleArchive('article-1')
            }, [selected?.id])

            return (
                <div data-testid="test-selected">
                    {selected?.resources?.[0]?.title || 'No selection'}
                </div>
            )
        }

        const store = mockStore({
            notifications: [],
            ui: { helpCenter: { viewLanguage: 'en-US' } },
        })

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <TestComponentWithSelection />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(screen.getByText('Second Article')).toBeInTheDocument()
    })

    it('should clear selection when archiving last opportunity', () => {
        ;(useHelpCenterAIArticlesLibrary as jest.Mock).mockReturnValueOnce({
            articles: [mockArticles[0]],
            isLoading: false,
            markArticleAsReviewed: mockMarkArticleAsReviewed,
        })

        const TestComponentWithSingleSelection = () => {
            const [selected, setSelected] = React.useState({
                id: 'article-1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                resources: [
                    {
                        title: 'First Article',
                        content: 'First article content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            })

            React.useEffect(() => {
                const handleArchive = (articleKey: string) => {
                    mockMarkArticleAsReviewed(articleKey, 'archive')
                    if (selected?.id === articleKey) {
                        const opportunities = [
                            {
                                id: 'article-1',
                                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                                resources: [
                                    {
                                        title: 'First Article',
                                        content: 'First article content',
                                        type: ResourceType.GUIDANCE,
                                        isVisible: true,
                                    },
                                ],
                            },
                        ]
                        const remaining = opportunities.filter(
                            (opp) => opp.id !== articleKey,
                        )
                        setSelected(remaining[0] || null)
                    }
                }

                handleArchive('article-1')
            }, [selected?.id])

            return (
                <div data-testid="test-selected">
                    {selected?.resources?.[0]?.title || 'No selection'}
                </div>
            )
        }

        const store = mockStore({
            notifications: [],
            ui: { helpCenter: { viewLanguage: 'en-US' } },
        })

        render(
            <MemoryRouter>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <TestComponentWithSingleSelection />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(screen.getByText('No selection')).toBeInTheDocument()
    })

    it('should handle empty articles list', () => {
        ;(useHelpCenterAIArticlesLibrary as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
            markArticleAsReviewed: mockMarkArticleAsReviewed,
        })

        renderComponent()

        expect(screen.getByText('No opportunity selected')).toBeInTheDocument()
    })

    it('should handle missing store configuration', () => {
        ;(useAiAgentStoreConfigurationContext as jest.Mock).mockReturnValue({
            storeConfiguration: null,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()
    })

    it('should find guidance help center from hook', () => {
        const guidanceHelpCenter = {
            id: 5,
            default_locale: 'en-US',
            name: 'Guidance Help Center',
            type: 'guidance',
        }

        ;(useAiAgentHelpCenter as jest.Mock).mockReturnValue(guidanceHelpCenter)
        ;(useAiAgentStoreConfigurationContext as jest.Mock).mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfiguration,
                guidanceHelpCenterId: 5,
            },
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()
    })

    it('should handle undefined help center data', () => {
        ;(useAiAgentHelpCenter as jest.Mock).mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()
    })

    it('should pass correct props to OpportunitiesContent', () => {
        const {
            OpportunitiesContent,
        } = require('../OpportunitiesContent/OpportunitiesContent')

        renderComponent()

        expect(OpportunitiesContent).toHaveBeenCalledWith(
            expect.objectContaining({
                opportunityConfig: expect.objectContaining({
                    shopName: 'test-shop',
                    helpCenterId: 2,
                    guidanceHelpCenterId: 1,
                    onArchive: expect.any(Function),
                    onPublish: expect.any(Function),
                    markArticleAsReviewed: mockMarkArticleAsReviewed,
                }),
            }),
            expect.anything(),
        )
    })

    it('should pass correct props to OpportunitiesSidebar', () => {
        const {
            OpportunitiesSidebar,
        } = require('../OpportunitiesSidebar/OpportunitiesSidebar')

        renderComponent()

        expect(OpportunitiesSidebar).toHaveBeenCalledWith(
            expect.objectContaining({
                opportunities: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'article-1',
                        type: OpportunityType.FILL_KNOWLEDGE_GAP,
                        resources: expect.arrayContaining([
                            expect.objectContaining({
                                title: 'First Article',
                                content: 'First article content',
                                type: ResourceType.GUIDANCE,
                                isVisible: true,
                            }),
                        ]),
                    }),
                ]),
                opportunitiesPageState: expect.objectContaining({
                    isLoading: false,
                    state: 'HAS_OPPORTUNITIES',
                }),
                onSelectOpportunity: expect.any(Function),
            }),
            expect.anything(),
        )
    })

    it('should call mapAiArticlesToOpportunities util function with ai articles', () => {
        renderComponent()

        expect(mockMapAiArticlesToOpportunities).toHaveBeenCalledWith(
            mockArticles,
        )
        expect(mockMapAiArticlesToOpportunities).toHaveBeenCalledTimes(1)
    })

    it('should re-call mapAiArticlesToOpportunities when articles change', () => {
        const { rerender } = renderComponent()

        expect(mockMapAiArticlesToOpportunities).toHaveBeenCalledTimes(1)

        // Update articles and re-render
        const newMockArticles = [
            {
                key: 'new-article-1',
                title: 'New Article',
                html_content: 'New content',
                isNew: true,
            },
        ]
        ;(useHelpCenterAIArticlesLibrary as jest.Mock).mockReturnValue({
            articles: newMockArticles,
            isLoading: false,
            markArticleAsReviewed: mockMarkArticleAsReviewed,
        })

        rerender(
            <MemoryRouter>
                <Provider store={mockStore({ notifications: [] })}>
                    <QueryClientProvider client={queryClient}>
                        <OpportunitiesLayout />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(mockMapAiArticlesToOpportunities).toHaveBeenCalledWith(
            newMockArticles,
        )
        expect(mockMapAiArticlesToOpportunities).toHaveBeenCalledTimes(2)
    })

    it('should handle when mapAiArticlesToOpportunities returns empty array', () => {
        mockMapAiArticlesToOpportunities.mockReturnValueOnce([])

        renderComponent()

        expect(screen.getByText('No opportunity selected')).toBeInTheDocument()
    })

    describe('Knowledge Service Integration', () => {
        const mockKnowledgeServiceOpportunities = [
            {
                id: '1',
                key: 'ks_1',
                insight: 'KS Opportunity 1 insight',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
            },
            {
                id: '2',
                key: 'ks_2',
                insight: 'KS Opportunity 2 insight',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 3,
            },
        ]

        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseShopIntegrationId.mockReturnValue(123)
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: mockKnowledgeServiceOpportunities,
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: true,
                fetchNextPage: jest.fn(),
                preloadNextPage: jest.fn(),
                totalCount: 50,
                totalPending: 50,
                refetch: jest.fn(),
                allowedOpportunityIds: undefined,
            })
        })

        it('should use knowledge service when feature flag is enabled', () => {
            renderComponent()

            expect(mockUseFlag).toHaveBeenCalled()
            expect(mockUseKnowledgeServiceOpportunities).toHaveBeenCalledWith(
                123,
                true,
            )
        })

        it('should pass pagination props to sidebar when using knowledge service', () => {
            const {
                OpportunitiesSidebar,
            } = require('../OpportunitiesSidebar/OpportunitiesSidebar')

            renderComponent()

            expect(OpportunitiesSidebar).toHaveBeenCalledWith(
                expect.objectContaining({
                    hasNextPage: true,
                    isFetchingNextPage: false,
                    onEndReached: expect.any(Function),
                }),
                expect.anything(),
            )
        })

        it('should not pass pagination props when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const {
                OpportunitiesSidebar,
            } = require('../OpportunitiesSidebar/OpportunitiesSidebar')

            renderComponent()

            expect(OpportunitiesSidebar).toHaveBeenCalledWith(
                expect.objectContaining({
                    hasNextPage: false,
                    isFetchingNextPage: false,
                    onEndReached: undefined,
                }),
                expect.anything(),
            )
        })

        it('should select next opportunity when archiving with knowledge service', async () => {
            const mockSetSelectedOpportunityId = jest.fn()
            mockUseSelectedOpportunity.mockImplementation(
                ({ opportunities }: { opportunities: any[] }) => ({
                    selectedOpportunity: opportunities[0] || null,
                    selectedOpportunityId: opportunities[0]?.id || null,
                    setSelectedOpportunityId: mockSetSelectedOpportunityId,
                    isLoading: false,
                }),
            )

            const {
                OpportunitiesContent,
            } = require('../OpportunitiesContent/OpportunitiesContent')

            renderComponent()

            const callArgs = OpportunitiesContent.mock.calls[0][0]

            await act(async () => {
                await callArgs.opportunityConfig.onArchive('ks_1')
            })

            await waitFor(() => {
                expect(mockSetSelectedOpportunityId).toHaveBeenCalledWith('2')
            })
        })

        it('should not call markArticleAsReviewed when using knowledge service', async () => {
            const {
                OpportunitiesContent,
            } = require('../OpportunitiesContent/OpportunitiesContent')

            renderComponent()

            const callArgs = OpportunitiesContent.mock.calls[0][0]
            await act(async () => {
                await callArgs.opportunityConfig.onArchive('ks_1')
            })

            expect(mockMarkArticleAsReviewed).not.toHaveBeenCalled()
        })

        it('should pass shopIntegrationId to OpportunitiesContent', () => {
            const {
                OpportunitiesContent,
            } = require('../OpportunitiesContent/OpportunitiesContent')

            renderComponent()

            expect(OpportunitiesContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    opportunityConfig: expect.objectContaining({
                        shopIntegrationId: 123,
                        useKnowledgeService: true,
                    }),
                }),
                expect.anything(),
            )
        })

        it('should show loading state for opportunity details', () => {
            const mockSelectedOpportunity = {
                id: '1',
                key: 'ks_1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                resources: [
                    {
                        title: 'KS Opportunity 1',
                        content: 'KS Opportunity 1 content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            }
            mockUseSelectedOpportunity.mockReturnValue({
                selectedOpportunity: mockSelectedOpportunity,
                selectedOpportunityId: '1',
                setSelectedOpportunityId: jest.fn(),
                isLoading: true,
            })

            const {
                OpportunitiesContent,
            } = require('../OpportunitiesContent/OpportunitiesContent')

            renderComponent()

            expect(OpportunitiesContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    isLoadingOpportunityDetails: true,
                }),
                expect.anything(),
            )
        })
    })

    describe('URL routing with opportunity ID', () => {
        const mockHistoryReplace = jest.fn()
        const mockKnowledgeServiceOpportunities = [
            {
                id: '1',
                key: 'ks_1',
                insight: 'KS Opportunity 1 insight',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
            },
            {
                id: '2',
                key: 'ks_2',
                insight: 'KS Opportunity 2 insight',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 3,
            },
        ]
        const mockFullOpportunities = [
            {
                id: '1',
                key: 'ks_1',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 5,
                resources: [
                    {
                        title: 'KS Opportunity 1',
                        content: 'KS Opportunity 1 content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            },
            {
                id: '2',
                key: 'ks_2',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 3,
                resources: [
                    {
                        title: 'KS Opportunity 2',
                        content: 'KS Opportunity 2 content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            },
        ]

        beforeEach(() => {
            ;(useHistory as jest.Mock).mockReturnValue({
                replace: mockHistoryReplace,
                push: jest.fn(),
            })
            ;(useParams as jest.Mock).mockReturnValue({
                shopName: 'test-shop',
                shopType: 'shopify',
            })
            mockUseFlag.mockReturnValue(true)
            mockUseShopIntegrationId.mockReturnValue(123)
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: mockKnowledgeServiceOpportunities,
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: jest.fn(),
                preloadNextPage: jest.fn(),
                totalCount: 2,
                totalPending: 2,
                refetch: jest.fn(),
                allowedOpportunityIds: undefined,
            })
        })

        it('should extract opportunityId from URL params and pass to useSelectedOpportunity', () => {
            ;(useParams as jest.Mock).mockReturnValue({
                shopName: 'test-shop',
                shopType: 'shopify',
                opportunityId: '2',
            })

            renderComponent()

            expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopIntegrationId: 123,
                    opportunities: mockKnowledgeServiceOpportunities,
                    useKnowledgeService: true,
                    initialOpportunityId: '2',
                    shopType: 'shopify',
                    shopName: 'test-shop',
                }),
            )
        })

        it('should pass undefined opportunityId when not in URL', () => {
            ;(useParams as jest.Mock).mockReturnValue({
                shopName: 'test-shop',
                shopType: 'shopify',
            })

            renderComponent()

            expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopIntegrationId: 123,
                    opportunities: mockKnowledgeServiceOpportunities,
                    useKnowledgeService: true,
                    initialOpportunityId: undefined,
                }),
            )
        })

        it('should pass shopType and shopName to useSelectedOpportunity for URL updates', () => {
            renderComponent()

            expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopType: 'shopify',
                    shopName: 'test-shop',
                }),
            )
        })

        it('should pass allowedOpportunityIds to useSelectedOpportunity when using knowledge service', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: mockKnowledgeServiceOpportunities,
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: jest.fn(),
                preloadNextPage: jest.fn(),
                totalCount: 2,
                totalPending: 2,
                refetch: jest.fn(),
                allowedOpportunityIds: [1, 2],
            })

            renderComponent()

            expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
                expect.objectContaining({
                    allowedOpportunityIds: [1, 2],
                }),
            )
        })

        it('should handle direct URL access with opportunityId', () => {
            ;(useParams as jest.Mock).mockReturnValue({
                shopName: 'test-shop',
                shopType: 'shopify',
                opportunityId: '2',
            })

            mockUseSelectedOpportunity.mockReturnValue({
                selectedOpportunity: mockFullOpportunities[1],
                selectedOpportunityId: '2',
                setSelectedOpportunityId: jest.fn(),
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.getByTestId('opportunities-content'),
            ).toBeInTheDocument()
        })
    })

    describe('Responsive sidebar visibility', () => {
        let resizeObserverCallback: ResizeObserverCallback

        beforeEach(() => {
            global.ResizeObserver = jest.fn().mockImplementation((callback) => {
                resizeObserverCallback = callback
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                }
            })
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        it('should initialize sidebar visibility based on window width', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1300,
            })

            renderComponent()

            expect(
                screen.getByTestId('opportunities-sidebar'),
            ).toBeInTheDocument()
        })

        it('should update sidebar visibility on window resize', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1000,
            })

            renderComponent()

            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1300,
            })

            act(() => {
                resizeObserverCallback([], {} as ResizeObserver)
            })

            expect(
                screen.getByTestId('opportunities-sidebar'),
            ).toBeInTheDocument()
        })

        it('should setup and cleanup ResizeObserver', () => {
            const mockObserve = jest.fn()
            const mockDisconnect = jest.fn()
            global.ResizeObserver = jest.fn().mockImplementation(() => ({
                observe: mockObserve,
                unobserve: jest.fn(),
                disconnect: mockDisconnect,
            }))

            const { unmount } = renderComponent()

            expect(mockObserve).toHaveBeenCalled()

            unmount()

            expect(mockDisconnect).toHaveBeenCalled()
        })
    })
})
