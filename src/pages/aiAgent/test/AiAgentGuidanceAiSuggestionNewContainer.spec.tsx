// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { renderWithRouter } from 'utils/testing'

import { AiAgentGuidanceAiSuggestionNewContainer } from '../AiAgentGuidanceAiSuggestionNewContainer'
import { getAIGuidanceFixture } from '../fixtures/aiGuidance.fixture'
import { getGuidanceArticleFixture } from '../fixtures/guidanceArticle.fixture'
import { useAiAgentHelpCenter } from '../hooks/useAiAgentHelpCenter'
import { useAiAgentOnboardingNotification } from '../hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from '../hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from '../hooks/useGuidanceArticleMutation'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))
jest.mock('../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js',
    () => {
        const ComponentToMock = () => <div />
        return ComponentToMock
    },
)
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)

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

const defaultUseAiAgentOnboardingNotification = {
    isAdmin: true,
    onboardingNotificationState: undefined,
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    handleOnEnablementPostReceivedNotification: jest.fn(),
    handleOnPerformActionPostReceivedNotification: jest.fn(),
    handleOnTriggerActivateAiAgentNotification: jest.fn(),
    handleOnCancelActivateAiAgentNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
}

const defaultUseGuidanceAiSuggestions = {
    guidanceAISuggestions: [
        getAIGuidanceFixture('id-1'),
        getAIGuidanceFixture('id-2'),
    ],
    isLoadingAiGuidances: false,
    invalidateAiGuidances: jest.fn(),
    guidanceArticles: [
        getGuidanceArticleFixture(1),
        getGuidanceArticleFixture(2),
    ],
    isLoadingGuidanceArticleList: false,
    isAllAIGuidancesUsed: undefined,
    isEmptyStateNoAIGuidances: false,
    isEmptyStateAIGuidances: false,
    isGuidancesOnly: false,
    isGuidancesAndAIGuidances: false,
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
            defaultGuidanceArticleMutationProps,
        )
        mockedUseGuidanceAiSuggestions.mockReturnValue(
            defaultUseGuidanceAiSuggestions,
        )

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
    })

    it('should render loader when no help center', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render loader when fetching AI guidances', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            isLoadingAiGuidances: true,
            isLoadingGuidanceArticleList: false,
        } as any)

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should prefill input with the data', () => {
        renderComponent()

        expect(screen.getByLabelText(/Guidance name/)).toHaveValue(
            aiGuidanceSuggestion.name,
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
            }),
        )
    })

    it('should trigger call to send activate AI agent notification when created more than 3 guidance', async () => {
        renderComponent()

        expect(screen.getByText('Create Guidance')).toBeEnabled()

        userEvent.click(screen.getByText('Create Guidance'))

        await waitFor(() => {
            expect(
                defaultUseAiAgentOnboardingNotification.handleOnTriggerActivateAiAgentNotification,
            ).toHaveBeenCalled()
        })
    })

    it('should trigger call to send activate AI agent notification when click on Create and test', async () => {
        renderComponent()

        expect(screen.getByText('Create And Test')).toBeEnabled()

        userEvent.click(screen.getByText('Create And Test'))

        await waitFor(() => {
            expect(
                defaultUseAiAgentOnboardingNotification.handleOnTriggerActivateAiAgentNotification,
            ).toHaveBeenCalled()
        })
    })

    it('should not trigger call to send activate AI agent notification when created less than 3 guidance', async () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultUseGuidanceAiSuggestions,
            guidanceArticles: [getGuidanceArticleFixture(1)],
        })

        renderComponent()

        expect(screen.getByText('Create Guidance')).toBeEnabled()

        userEvent.click(screen.getByText('Create Guidance'))

        await waitFor(() => {
            expect(
                defaultUseAiAgentOnboardingNotification.handleOnTriggerActivateAiAgentNotification,
            ).not.toHaveBeenCalled()
        })
    })

    it('should disable "Create Guidance" and "Create And Test" buttons if fetching onboarding notification state is still loading', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isLoading: true,
        })

        renderComponent()

        expect(screen.getByText('Create Guidance')).toBeAriaDisabled()
        expect(screen.getByText('Create And Test')).toBeAriaDisabled()
    })
})
