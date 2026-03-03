import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, useHistory, useParams } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { OpportunityType } from '../../enums'
import { useKnowledgeServiceOpportunities } from '../../hooks/useKnowledgeServiceOpportunities'
import {
    State,
    useOpportunityPageState,
} from '../../hooks/useOpportunityPageState'
import { useSelectedOpportunity } from '../../hooks/useSelectedOpportunity'
import { ResourceType } from '../../types'
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
        RESTRICTED_NO_OPPORTUNITIES: 'RESTRICTED_NO_OPPORTUNITIES',
        OPPORTUNITY_NOT_FOUND: 'OPPORTUNITY_NOT_FOUND',
    },
}))

jest.mock('pages/aiAgent/hooks/useShopIntegrationId', () => ({
    useShopIntegrationId: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        OpportunitiesMilestone2: 'OpportunitiesMilestone2',
    },
    useFlag: jest.fn(),
}))

jest.mock('../OpportunitiesSidebar/OpportunitiesSidebar', () => ({
    OpportunitiesSidebar: jest.fn(() => (
        <div data-testid="opportunities-sidebar">Sidebar</div>
    )),
}))

jest.mock('../OpportunitiesContent/OpportunitiesContent', () => ({
    OpportunitiesContent: jest.fn(() => (
        <div data-testid="opportunities-content">Content</div>
    )),
}))

jest.mock('../../hooks/useOpportunitiesTracking', () => ({
    useOpportunitiesTracking: jest.fn(() => ({
        onOpportunityPageVisited: jest.fn(),
        onOpportunityAccepted: jest.fn(),
        onOpportunityDismissed: jest.fn(),
    })),
}))

const mockStore = configureStore([])
const mockUseKnowledgeServiceOpportunities = assumeMock(
    useKnowledgeServiceOpportunities,
)
const mockUseSelectedOpportunity = assumeMock(useSelectedOpportunity)
const mockUseOpportunityPageState = assumeMock(useOpportunityPageState)
const mockUseShopIntegrationId = assumeMock(useShopIntegrationId)
const mockUseFlag = assumeMock(useFlag)

describe('OpportunitiesLayout', () => {
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

    const mockOpportunities = [
        {
            id: '1',
            key: 'opp-1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'First Opportunity',
            ticketCount: 10,
            resources: [
                {
                    title: 'First Resource',
                    content: 'Content 1',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
        {
            id: '2',
            key: 'opp-2',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Second Opportunity',
            ticketCount: 5,
            resources: [
                {
                    title: 'Second Resource',
                    content: 'Content 2',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
    ]

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    const renderComponent = () => {
        const store = mockStore({
            currentAccount: { id: 123 },
        })

        return render(
            <MemoryRouter initialEntries={['/shopify/test-shop/opportunities']}>
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

        mockUseFlag.mockReturnValue(true)
        mockUseShopIntegrationId.mockReturnValue(123)
        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: mockOpportunities,
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
        mockUseSelectedOpportunity.mockImplementation(() => ({
            selectedOpportunity: null,
            selectedOpportunityId: null,
            setSelectedOpportunityId: jest.fn(),
            isLoading: false,
        }))
        mockUseOpportunityPageState.mockReturnValue({
            currentState: {
                state: State.HAS_OPPORTUNITIES,
                isLoading: false,
                title: 'Opportunities',
                description: '',
                media: null,
                primaryCta: null,
                showEmptyState: false,
            },
            stateConfig: {} as any,
        })
    })

    it('should render sidebar and content components', () => {
        renderComponent()

        expect(screen.getByTestId('opportunities-sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()
    })

    it('should show loading state when loading', () => {
        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: [],
            isLoading: true,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            totalCount: 0,
            totalPending: 0,
            refetch: jest.fn(),
            allowedOpportunityIds: undefined,
        })

        mockUseOpportunityPageState.mockReturnValue({
            currentState: {
                state: State.LOADING,
                isLoading: true,
                title: '',
                description: '',
                media: null,
                primaryCta: null,
                showEmptyState: false,
            },
            stateConfig: {} as any,
        })

        renderComponent()

        // Should render the components even when loading
        expect(screen.getByTestId('opportunities-sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('opportunities-content')).toBeInTheDocument()
    })

    it('should use knowledge service opportunities', () => {
        renderComponent()

        expect(mockUseKnowledgeServiceOpportunities).toHaveBeenCalledWith(
            123,
            true,
        )
    })

    it('should pass opportunities to sidebar', () => {
        const {
            OpportunitiesSidebar,
        } = require('../OpportunitiesSidebar/OpportunitiesSidebar')

        renderComponent()

        const callArgs = OpportunitiesSidebar.mock.calls[0][0]
        expect(callArgs.opportunities).toEqual(mockOpportunities)
    })

    it('should pass pagination props to sidebar', () => {
        const {
            OpportunitiesSidebar,
        } = require('../OpportunitiesSidebar/OpportunitiesSidebar')

        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: mockOpportunities,
            isLoading: false,
            isFetchingNextPage: true,
            hasNextPage: true,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            totalCount: 10,
            totalPending: 10,
            refetch: jest.fn(),
            allowedOpportunityIds: undefined,
        })

        renderComponent()

        const callArgs = OpportunitiesSidebar.mock.calls[0][0]
        expect(callArgs.isFetchingNextPage).toBe(true)
        expect(callArgs.hasNextPage).toBe(true)
    })

    it('should pass shopIntegrationId to OpportunitiesContent', () => {
        const {
            OpportunitiesContent,
        } = require('../OpportunitiesContent/OpportunitiesContent')

        renderComponent()

        const callArgs = OpportunitiesContent.mock.calls[0][0]
        expect(callArgs.opportunityConfig.shopIntegrationId).toBe(123)
        expect(callArgs.opportunityConfig.useKnowledgeService).toBe(true)
    })

    it('should extract opportunityId from URL params', () => {
        ;(useParams as jest.Mock).mockReturnValue({
            shopName: 'test-shop',
            shopType: 'shopify',
            opportunityId: '123',
        })

        renderComponent()

        expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
            expect.objectContaining({
                initialOpportunityId: '123',
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
                initialOpportunityId: undefined,
            }),
        )
    })

    it('should pass shopType and shopName for URL updates', () => {
        renderComponent()

        expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
            expect.objectContaining({
                shopType: 'shopify',
                shopName: 'test-shop',
            }),
        )
    })

    it('should pass allowedOpportunityIds to useSelectedOpportunity', () => {
        const allowedIds = [1, 2, 3]
        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: mockOpportunities,
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            totalCount: 2,
            totalPending: 2,
            refetch: jest.fn(),
            allowedOpportunityIds: allowedIds,
        })

        renderComponent()

        expect(mockUseSelectedOpportunity).toHaveBeenCalledWith(
            expect.objectContaining({
                allowedOpportunityIds: allowedIds,
            }),
        )
    })

    it('should handle refetch after archiving opportunity', async () => {
        const mockRefetch = jest.fn()
        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: mockOpportunities,
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            totalCount: 2,
            totalPending: 2,
            refetch: mockRefetch,
            allowedOpportunityIds: undefined,
        })

        const {
            OpportunitiesContent,
        } = require('../OpportunitiesContent/OpportunitiesContent')

        renderComponent()

        const callArgs = OpportunitiesContent.mock.calls[0][0]

        await callArgs.opportunityConfig.onArchive('opp-1')

        expect(mockRefetch).toHaveBeenCalled()
    })

    it('should handle refetch after publishing opportunity', async () => {
        const mockRefetch = jest.fn()
        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: mockOpportunities,
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            totalCount: 2,
            totalPending: 2,
            refetch: mockRefetch,
            allowedOpportunityIds: undefined,
        })

        const {
            OpportunitiesContent,
        } = require('../OpportunitiesContent/OpportunitiesContent')

        renderComponent()

        const callArgs = OpportunitiesContent.mock.calls[0][0]

        await callArgs.opportunityConfig.onPublish('opp-1')

        expect(mockRefetch).toHaveBeenCalled()
    })
})
