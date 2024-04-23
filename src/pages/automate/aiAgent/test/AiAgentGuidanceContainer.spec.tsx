import React from 'react'
import {screen} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithRouter} from 'utils/testing'
import {AiAgentGuidanceContainer} from '../AiAgentGuidanceContainer'
import {useGuidanceHelpCenter} from '../hooks/useGuidanceHelpCenter'
import {useGuidanceArticles} from '../hooks/useGuidanceArticles'

jest.mock('../hooks/useGuidanceHelpCenter', () => ({
    useGuidanceHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))

const mockedUseGuidanceHelpCenter = jest.mocked(useGuidanceHelpCenter)
const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)
jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentPlayground]: false,
    [FeatureFlagKey.AiAgentGuidance]: true,
    [FeatureFlagKey.AiAgentSettings]: true,
}))
const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = () => {
    renderWithRouter(<AiAgentGuidanceContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance`,
        route: '/shopify/test-shop/ai-agent/guidance',
    })
}
describe('<AiAgentGuidanceContainer />', () => {
    beforeEach(() => {
        mockedUseGuidanceHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
            isGuidanceArticleUpdating: false,
            createOrUpdateGuidanceArticle: jest.fn(),
        })
    })

    it('should render loader', () => {
        mockedUseGuidanceHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render empty state component', () => {
        renderComponent()

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
    })
})
