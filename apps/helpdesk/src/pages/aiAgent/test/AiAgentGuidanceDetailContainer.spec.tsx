// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React from 'react'

import { userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { defaultUseAiAgentOnboardingNotification } from 'fixtures/onboardingStateNotification'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentGuidanceDetailContainer } from '../AiAgentGuidanceDetailContainer'
import { getAIGuidanceFixture } from '../fixtures/aiGuidance.fixture'
import { getGuidanceArticleFixture } from '../fixtures/guidanceArticle.fixture'
import { useAiAgentHelpCenter } from '../hooks/useAiAgentHelpCenter'
import { useAiAgentOnboardingNotification } from '../hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from '../hooks/useGuidanceAiSuggestions'
import { useGuidanceArticle } from '../hooks/useGuidanceArticle'
import { useGuidanceArticleMutation } from '../hooks/useGuidanceArticleMutation'

jest.mock('../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))
jest.mock('../hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: jest.fn(),
}))
jest.mock('../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent',
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
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(),
    }),
)

const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)
const mockedUseGuidanceArticle = jest.mocked(useGuidanceArticle)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)
const mockedUseGetGuidancesAvailableActions = jest.mocked(
    useGetGuidancesAvailableActions,
)

const helpCenter = getHelpCentersResponseFixture.data[0]
const defaultGuidanceArticleMutationProps: ReturnType<
    typeof useGuidanceArticleMutation
> = {
    createGuidanceArticle: jest.fn(),
    deleteGuidanceArticle: jest.fn(),
    updateGuidanceArticle: jest.fn(),
    isGuidanceArticleUpdating: false,
    isGuidanceArticleDeleting: false,
    duplicate: jest.fn(),
    duplicateGuidanceArticle: jest.fn(),
    discardGuidanceDraft: jest.fn(),
    isDiscardingDraft: false,
}
const guidanceArticle = getGuidanceArticleFixture(1)

const queryClient = mockQueryClient()
const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const renderComponent = (articleId = 1) => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentGuidanceDetailContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/guidance/:articleId`,
            route: `/shopify/test-shop/ai-agent/guidance/${articleId}`,
        },
    )
}
describe('<AiAgentGuidanceDetail />', () => {
    beforeEach(() => {
        mockedUseAiAgentHelpCenter.mockReturnValue(helpCenter)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps,
        )
        mockedUseGuidanceArticle.mockReturnValue({
            guidanceArticle: guidanceArticle,
            isGuidanceArticleLoading: false,
            refetch: jest.fn(),
            isError: false,
            error: null,
        })
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            guidanceAISuggestions: [
                getAIGuidanceFixture('id-1'),
                getAIGuidanceFixture('id-2'),
            ],
        } as any)

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockedUseGetGuidancesAvailableActions.mockReturnValue({
            guidanceActions: [],
            isLoading: false,
        })
    })

    it('should render loader when no help center', () => {
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render loader when guidance article query has not fulfilled', () => {
        mockedUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: true,
            refetch: jest.fn(),
            isError: false,
            error: null,
        })

        renderComponent()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render guidance', () => {
        renderComponent()

        expect(screen.getByLabelText(/Guidance name/)).toHaveValue(
            guidanceArticle.title,
        )
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Save And Test')).toBeInTheDocument()
        expect(screen.getByText('Delete Guidance')).toBeInTheDocument()
    })

    it('should disable inputs when data not changed', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: 'Save And Test' }),
        ).toBeAriaDisabled()
    })

    it('should disable save when name input is empty', () => {
        renderComponent()

        userEvent.clear(screen.getByLabelText(/Guidance name/))

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: 'Save And Test' }),
        ).toBeAriaDisabled()
    })

    it('should update guidance article', async () => {
        const updateGuidanceArticle = jest.fn()
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            updateGuidanceArticle,
        })

        renderComponent()

        const inputEl = screen.getByLabelText(/Guidance name/)
        userEvent.clear(inputEl)
        await userEvent.type(inputEl, 'New name')

        userEvent.click(screen.getByText('Save Changes'))

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            {
                title: 'New name',
                content: `<div>${guidanceArticle.content}</div>`,
                locale: guidanceArticle.locale,
                templateKey: null,
                visibility: 'PUBLIC',
            },
            { articleId: guidanceArticle.id, locale: guidanceArticle.locale },
        )
    })

    it('should update guidance article visibility', () => {
        const updateGuidanceArticle = jest.fn()
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            updateGuidanceArticle,
        })

        renderComponent()

        // Using foreEvent because userEvent has issue with checkbox
        fireEvent.click(screen.getByLabelText('Available for AI Agent'))

        userEvent.click(screen.getByText('Save Changes'))

        expect(updateGuidanceArticle).toHaveBeenCalledWith(
            {
                title: guidanceArticle.title,
                content: `<div>${guidanceArticle.content}</div>`,
                locale: guidanceArticle.locale,
                templateKey: null,
                visibility: 'UNLISTED',
            },
            { articleId: guidanceArticle.id, locale: guidanceArticle.locale },
        )
    })
})
