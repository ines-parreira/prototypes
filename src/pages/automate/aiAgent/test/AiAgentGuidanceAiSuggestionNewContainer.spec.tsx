import React from 'react'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {renderWithRouter} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {useAiAgentHelpCenter} from '../hooks/useAiAgentHelpCenter'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'
import {AiAgentGuidanceAiSuggestionNewContainer} from '../AiAgentGuidanceAiSuggestionNewContainer'
import {getAIGuidanceFixture} from '../fixtures/aiGuidance.fixture'
import {useGuidanceAiSuggestions} from '../hooks/useGuidanceAiSuggestions'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: jest.fn(),
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

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)

const helpCenter = getHelpCentersResponseFixture.data[0]
const aiGuidanceSuggestion = getAIGuidanceFixture('id-1')
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
    renderWithRouter(<AiAgentGuidanceAiSuggestionNewContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance/library/:aiGuidanceId`,
        route: `/shopify/test-shop/ai-agent/guidance/library/${aiGuidanceSuggestion.key}`,
    })
}
describe('<AiAgentGuidanceAiSuggestionNewContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            getAiGuidanceById: () => aiGuidanceSuggestion,
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        } as any)
    })

    it('should render loader when no help center', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render loader when fetching AI guidances', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            getAiGuidanceById: () => aiGuidanceSuggestion,
            isLoadingAiGuidances: true,
            isLoadingGuidanceArticleList: false,
        } as any)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should prefill input with the data', () => {
        renderComponent()

        expect(screen.getByLabelText(/Guidance name/)).toHaveValue(
            aiGuidanceSuggestion.name
        )
    })

    it('should create guidance with ai suggestion name and content', () => {
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
                title: aiGuidanceSuggestion.name,
                content: aiGuidanceSuggestion.content,
            })
        )
    })
})
