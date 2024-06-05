import React from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {screen} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {FeatureFlagKey} from 'config/featureFlags'
import {AiAgentGuidanceNewContainer} from '../AiAgentGuidanceNewContainer'
import {useGuidanceArticles} from '../hooks/useGuidanceArticles'
import {useAiAgentHelpCenter} from '../hooks/useAiAgentHelpCenter'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js',
    () => {
        const ComponentToMock = () => <div />
        return ComponentToMock
    }
)
jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AiAgentGuidance]: true,
    [FeatureFlagKey.AiAgentSettings]: true,
}))

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)

const helpCenter = getHelpCentersResponseFixture.data[0]
const defaultGuidanceArticleMutationProps: ReturnType<
    typeof useGuidanceArticleMutation
> = {
    createGuidanceArticle: jest.fn(),
    deleteGuidanceArticle: jest.fn(),
    updateGuidanceArticle: jest.fn(),
    isGuidanceArticleUpdating: false,
    isGuidanceArticleDeleting: false,
}

const renderComponent = () => {
    renderWithRouter(<AiAgentGuidanceNewContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance`,
        route: '/shopify/test-shop/ai-agent/guidance',
    })
}
describe('<AiAgentNewGuidance />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })
    })

    it('should render loader when no help center', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

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
