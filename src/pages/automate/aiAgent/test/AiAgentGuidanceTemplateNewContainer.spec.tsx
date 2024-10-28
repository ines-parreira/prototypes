import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {renderWithRouter} from 'utils/testing'

import {AiAgentGuidanceTemplateNewContainer} from '../AiAgentGuidanceTemplateNewContainer'
import {getGuidanceTemplateFixture} from '../fixtures/guidanceTemplate.fixture'
import {useAiAgentHelpCenter} from '../hooks/useAiAgentHelpCenter'
import {useGuidanceArticleMutation} from '../hooks/useGuidanceArticleMutation'
import {useGuidanceTemplate} from '../hooks/useGuidanceTemplate'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
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
jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled')

jest.mock('pages/automate/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceTemplate = jest.mocked(useGuidanceTemplate)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

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
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps
        )
        mockedUseGuidanceTemplate.mockReturnValue({guidanceTemplate})

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })

    it('should render loader when no help center', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

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
