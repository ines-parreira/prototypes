import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useArticleRecommendation } from '../../hooks/useArticleRecommendation'
import { ConnectedChannelsChatView } from './ConnectedChannelsChatView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopName: 'test-shop',
        shopType: 'shopify',
    })),
}))

jest.mock('../../hooks/useArticleRecommendation')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ArticleRecommendationCard/ArticleRecommendationCard',
    () => ({
        ArticleRecommendationCard: () => <div>ArticleRecommendationCard</div>,
    }),
)

const mockedUseArticleRecommendation =
    useArticleRecommendation as jest.MockedFunction<
        typeof useArticleRecommendation
    >

describe('ConnectedChannelsChatView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseArticleRecommendation.mockReturnValue({
            enabledInSettings: true,
            isArticleRecommendationEnabled: false,
            isDisabled: false,
            isLoading: false,
            showHelpCenterRequired: false,
            handleToggle: jest.fn(),
        })
    })

    it('should render the article recommendation card when enabledInSettings is true', () => {
        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

        expect(
            screen.getByText('ArticleRecommendationCard'),
        ).toBeInTheDocument()
    })

    it('should not render the article recommendation card when enabledInSettings is false', () => {
        mockedUseArticleRecommendation.mockReturnValue({
            enabledInSettings: false,
            isArticleRecommendationEnabled: false,
            isDisabled: false,
            isLoading: false,
            showHelpCenterRequired: false,
            handleToggle: jest.fn(),
        })

        render(
            <MemoryRouter>
                <ConnectedChannelsChatView />
            </MemoryRouter>,
        )

        expect(
            screen.queryByText('ArticleRecommendationCard'),
        ).not.toBeInTheDocument()
    })
})
