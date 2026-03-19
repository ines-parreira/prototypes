import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasAutomateChatIntegrationRevamp } from '../GorgiasAutomateChatIntegration'
import { useArticleRecommendation } from '../hooks/useArticleRecommendation'
import { useOrderManagement } from '../hooks/useOrderManagement'

jest.mock('pages/integrations/integration/hooks/useStoreIntegration')
const mockUseStoreIntegration = jest.mocked(useStoreIntegration)

jest.mock('../hooks/useArticleRecommendation')
const mockUseArticleRecommendation = jest.mocked(useArticleRecommendation)

jest.mock('../hooks/useOrderManagement')
const mockUseOrderManagement = jest.mocked(useOrderManagement)

jest.mock('../GorgiasChatRevampLayout', () => ({
    GorgiasChatRevampLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="revamp-layout">{children}</div>
    ),
}))

jest.mock(
    '../components/ArticleRecommendationCard/ArticleRecommendationCard',
    () => ({
        ArticleRecommendationCard: () => (
            <div data-testid="article-recommendation-card" />
        ),
    }),
)

jest.mock('../components/OrderManagementCard/OrderManagementCard', () => ({
    OrderManagementCard: () => <div data-testid="order-management-card" />,
}))

jest.mock(
    '../components/ConnectedChannelsEmptyView/ConnectedChannelsEmptyView',
    () => ({
        ConnectedChannelsEmptyView: () => (
            <div data-testid="connected-channels-empty-view" />
        ),
    }),
)

const defaultArticleRecommendationHookReturn = {
    enabledInSettings: true,
    isArticleRecommendationEnabled: false,
    isDisabled: false,
    isLoading: false,
    showHelpCenterRequired: false,
    handleToggle: jest.fn(),
}

const defaultOrderManagementHookReturn = {
    enabledInSettings: true,
    isOrderManagementEnabled: false,
    isDisabled: false,
    isLoading: false,
    showStoreRequired: false,
    orderManagementUrl: '/app/settings/order-management/shopify/test-shop',
    handleToggle: jest.fn(),
}

const defaultProps = {
    integration: fromJS({ id: 1 }),
}

describe('<GorgiasAutomateChatIntegrationRevamp />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: true,
            isConnectedToShopify: false,
        })
        mockUseArticleRecommendation.mockReturnValue(
            defaultArticleRecommendationHookReturn,
        )
        mockUseOrderManagement.mockReturnValue(defaultOrderManagementHookReturn)
    })

    it('should render within the revamp layout', () => {
        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(screen.getByTestId('revamp-layout')).toBeInTheDocument()
    })

    it('should render article recommendation card when enabledInSettings is true', () => {
        mockUseArticleRecommendation.mockReturnValue({
            ...defaultArticleRecommendationHookReturn,
            enabledInSettings: true,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.getByTestId('article-recommendation-card'),
        ).toBeInTheDocument()
    })

    it('should not render article recommendation card when enabledInSettings is false', () => {
        mockUseArticleRecommendation.mockReturnValue({
            ...defaultArticleRecommendationHookReturn,
            enabledInSettings: false,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.queryByTestId('article-recommendation-card'),
        ).not.toBeInTheDocument()
    })

    it('should render order management card when enabledInSettings is true', () => {
        mockUseOrderManagement.mockReturnValue({
            ...defaultOrderManagementHookReturn,
            enabledInSettings: true,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(screen.getByTestId('order-management-card')).toBeInTheDocument()
    })

    it('should not render order management card when enabledInSettings is false', () => {
        mockUseOrderManagement.mockReturnValue({
            ...defaultOrderManagementHookReturn,
            enabledInSettings: false,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.queryByTestId('order-management-card'),
        ).not.toBeInTheDocument()
    })

    it('should render empty view within layout when no store is connected', () => {
        mockUseStoreIntegration.mockReturnValue({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(screen.getByTestId('revamp-layout')).toBeInTheDocument()
        expect(
            screen.getByTestId('connected-channels-empty-view'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('order-management-card'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('article-recommendation-card'),
        ).not.toBeInTheDocument()
    })
})
