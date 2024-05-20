import React from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {renderWithRouter} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {FeatureFlagKey} from 'config/featureFlags'
import {useGuidanceHelpCenter} from '../hooks/useGuidanceHelpCenter'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'
import {useGuidanceTemplate} from '../hooks/useGuidanceTemplate'
import {getGuidanceTemplateFixture} from '../fixtures/guidanceTemplate.fixture'
import {AiAgentGuidanceTemplateNewContainer} from '../AiAgentGuidanceTemplateNewContainer'

jest.mock('../hooks/useGuidanceHelpCenter', () => ({
    useGuidanceHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceTemplate', () => ({
    useGuidanceTemplate: jest.fn(),
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
}))

const mockedUseGuidanceHelpCenter = jest.mocked(useGuidanceHelpCenter)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceTemplate = jest.mocked(useGuidanceTemplate)

const helpCenter = getHelpCentersResponseFixture.data[0]
const guidanceTemplate = getGuidanceTemplateFixture('order-status')
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
    renderWithRouter(<AiAgentGuidanceTemplateNewContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance/templates/:templateId`,
        route: `/shopify/test-shop/ai-agent/guidance/templates/${guidanceTemplate.id}`,
    })
}
describe('<AiAgentGuidanceTemplateNewContainer />', () => {
    beforeEach(() => {
        mockedUseGuidanceHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceTemplate.mockReturnValue({guidanceTemplate})
    })

    it('should render loader when no help center', () => {
        mockedUseGuidanceHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should prefill input with the data', () => {
        renderComponent()

        expect(screen.getByLabelText(/Guidance name/)).toHaveValue(
            guidanceTemplate.name
        )
    })

    it('should create guidance with template name and content', () => {
        const createGuidanceArticle = jest.fn()
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            createGuidanceArticle,
        })

        renderComponent()

        expect(screen.getByText('Create Guidance')).toBeEnabled()

        userEvent.click(screen.getByText('Create Guidance'))

        expect(createGuidanceArticle).toHaveBeenCalledWith(
            expect.objectContaining({
                title: guidanceTemplate.name,
                content: guidanceTemplate.content,
            })
        )
    })
})
