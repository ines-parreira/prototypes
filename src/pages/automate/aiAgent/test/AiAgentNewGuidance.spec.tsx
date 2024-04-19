import React from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {screen} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {FeatureFlagKey} from 'config/featureFlags'
import {AiAgentNewGuidanceContainer} from '../AiAgentNewGuidanceContainer'
import {useGuidanceArticles} from '../hooks/useGuidanceArticles'
import {useGuidanceHelpCenter} from '../hooks/useGuidanceHelpCenter'

jest.mock('../hooks/useGuidanceHelpCenter', () => ({
    useGuidanceHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))
jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js',
    () => {
        const ComponentToMock = () => <div />
        return ComponentToMock
    }
)
jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentPlayground]: false,
    [FeatureFlagKey.AiAgentGuidance]: true,
}))

const mockedUseGuidanceHelpCenter = jest.mocked(useGuidanceHelpCenter)
const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)

const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = () => {
    renderWithRouter(<AiAgentNewGuidanceContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance`,
        route: '/shopify/test-shop/ai-agent/guidance',
    })
}
describe('<AiAgentNewGuidance />', () => {
    beforeEach(() => {
        mockedUseGuidanceHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isArticleListLoading: false,
            isArticleLoading: false,
            createOrUpdateArticle: jest.fn(),
        })
    })

    it('should render loader when no help center', () => {
        mockedUseGuidanceHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render component', () => {
        renderComponent()

        expect(screen.getByText('Guidance name')).toBeInTheDocument()
    })

    it.todo('should validate the form')
    it.todo('should submit the form')
})
