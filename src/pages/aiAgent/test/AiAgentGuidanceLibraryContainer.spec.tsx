// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React from 'react'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import history from 'pages/history'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { renderWithRouter } from 'utils/testing'

import { AiAgentGuidanceLibraryContainer } from '../AiAgentGuidanceLibraryContainer'
import { getAIGuidanceFixture } from '../fixtures/aiGuidance.fixture'
import { getGuidanceTemplateFixture } from '../fixtures/guidanceTemplate.fixture'
import { useAiAgentHelpCenter } from '../hooks/useAiAgentHelpCenter'
import { useGuidanceAiSuggestions } from '../hooks/useGuidanceAiSuggestions'
import { useGuidanceTemplates } from '../hooks/useGuidanceTemplates'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../hooks/useGuidanceTemplates', () => ({
    useGuidanceTemplates: jest.fn(),
}))
jest.mock('../hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')
jest.mock('pages/history')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceTemplates = jest.mocked(useGuidanceTemplates)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = () => {
    renderWithRouter(<AiAgentGuidanceLibraryContainer />, {
        path: `/:shopType/:shopName/ai-agent/guidance/library`,
        route: '/shopify/test-shop/ai-agent/guidance/library',
    })
}
describe('<AiAgentGuidanceLibraryContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceTemplates.mockReturnValue({ guidanceTemplates: [] })
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            guidanceAISuggestions: [],
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        } as any)

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })

    it('should render loader', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)
        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render ai guidances and guidance templates', () => {
        const template = getGuidanceTemplateFixture('order-status')
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')

        mockedUseGuidanceTemplates.mockReturnValue({
            guidanceTemplates: [template],
        })

        mockedUseGuidanceAiSuggestions.mockReturnValue({
            guidanceAISuggestions: [aiGuidance],
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        } as any)

        renderComponent()

        expect(screen.getByText(template.name)).toBeInTheDocument()
        expect(screen.getByText(aiGuidance.name)).toBeInTheDocument()
        expect(screen.getByText('Create custom Guidance')).toBeInTheDocument()
    })

    it('should render ai guidances banner and guidance templates', () => {
        const template = getGuidanceTemplateFixture('order-status')

        mockedUseGuidanceTemplates.mockReturnValue({
            guidanceTemplates: [template],
        })

        renderComponent()

        expect(
            screen.getByText(
                'You’ve added all AI-generated suggestions to your library.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(template.name)).toBeInTheDocument()
        expect(screen.getByText('Create custom Guidance')).toBeInTheDocument()
    })

    it('should redirect to new ai guidance page on click', () => {
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')

        mockedUseGuidanceAiSuggestions.mockReturnValue({
            guidanceAISuggestions: [aiGuidance],
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        } as any)

        renderComponent()

        const createCustomGuidanceButton = screen.getByText(
            'Create Custom Guidance',
        )
        userEvent.click(createCustomGuidanceButton)

        expect(history.push).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/ai-agent/guidance/new',
        )
    })

    it('should redirect to new template guidance page on click', () => {
        const aiGuidance = getAIGuidanceFixture('ai_guidance_id1')
        const template = getGuidanceTemplateFixture('order-status')

        mockedUseGuidanceTemplates.mockReturnValue({
            guidanceTemplates: [template],
        })

        mockedUseGuidanceAiSuggestions.mockReturnValue({
            guidanceAISuggestions: [aiGuidance],
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        } as any)

        renderComponent()

        const templateGuidanceElement = screen.getByText(
            'Damaged or defective item',
        )
        userEvent.click(templateGuidanceElement)

        expect(history.push).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/ai-agent/guidance/templates/order-status',
        )
    })

    it('should display the loader until ai guidance suggestions are fetched', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            guidanceAISuggestions: null,
            isLoadingAiGuidances: true,
            isLoadingGuidanceArticleList: false,
        } as any)

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
})
