import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { GorgiasAutomateChatIntegrationRevamp } from '../GorgiasAutomateChatIntegration'
import { useArticleRecommendation } from '../hooks/useArticleRecommendation'

jest.mock('../hooks/useArticleRecommendation')
const mockUseArticleRecommendation = jest.mocked(useArticleRecommendation)

jest.mock('../hooks/useChatPreviewPanel', () => ({
    useChatPreviewPanel: jest.fn(),
}))

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

const defaultHookReturn = {
    enabledInSettings: true,
    isArticleRecommendationEnabled: false,
    isDisabled: false,
    isLoading: false,
    showHelpCenterRequired: false,
    handleToggle: jest.fn(),
}

const defaultProps = {
    integration: fromJS({ id: 1 }),
}

describe('<GorgiasAutomateChatIntegrationRevamp />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseArticleRecommendation.mockReturnValue(defaultHookReturn)
    })

    it('should render within the revamp layout', () => {
        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(screen.getByTestId('revamp-layout')).toBeInTheDocument()
    })

    it('should render article recommendation card when enabledInSettings is true', () => {
        mockUseArticleRecommendation.mockReturnValue({
            ...defaultHookReturn,
            enabledInSettings: true,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.getByTestId('article-recommendation-card'),
        ).toBeInTheDocument()
    })

    it('should not render article recommendation card when enabledInSettings is false', () => {
        mockUseArticleRecommendation.mockReturnValue({
            ...defaultHookReturn,
            enabledInSettings: false,
        })

        render(<GorgiasAutomateChatIntegrationRevamp {...defaultProps} />)

        expect(
            screen.queryByTestId('article-recommendation-card'),
        ).not.toBeInTheDocument()
    })
})
