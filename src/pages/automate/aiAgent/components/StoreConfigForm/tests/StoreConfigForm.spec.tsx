import {screen, waitFor} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {mockFlags} from 'jest-launchdarkly-mock'
import {notify} from 'state/notifications/actions'
import {IntegrationType} from 'models/integration/types'
import {renderWithRouter} from 'utils/testing'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {NotificationStatus} from 'state/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {usePublicResources} from 'pages/automate/aiAgent/hooks/usePublicResources'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {useGetOrCreateSnippetHelpCenter} from 'pages/automate/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import {getHasAutomate} from 'state/billing/selectors'
import {HelpCenter} from 'models/helpCenter/types'
import {StoreConfigForm} from '../StoreConfigForm'
import {useStoreConfigurationMutation} from '../../../hooks/useStoreConfigurationMutation'

jest.mock('state/notifications/actions')
jest.mock('../../../hooks/useStoreConfigurationMutation', () => ({
    useStoreConfigurationMutation: jest.fn(),
}))
jest.mock('../../../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
jest.mock('../../../hooks/useConfigurationForm')
jest.mock('pages/automate/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))
jest.mock('../../PublicSourcesSection/PublicSourcesSection', () => ({
    PublicSourcesSection: jest.fn(() => <p>Public Source Section</p>),
}))
jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))

const mockedUseStoreConfigurationMutation = jest.mocked(
    useStoreConfigurationMutation
)
const mockedUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter
)
const mockedUseConfigurationForm = jest.mocked(useConfigurationForm)
const mockedUsePublicResources = jest.mocked(usePublicResources)
const mockGetHasAutomate = jest.mocked(getHasAutomate)

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
        ],
    }),
}

const renderComponent = (
    props: Partial<ComponentProps<typeof StoreConfigForm>>
) => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <StoreConfigForm
                shopName="test-shop"
                accountDomain="test-domain"
                faqHelpCenters={
                    [
                        {id: 1, name: 'help center 1', type: 'faq'},
                        {id: 2, name: 'help center 2', type: 'faq'},
                    ] as unknown as HelpCenter[]
                }
                {...props}
            />
        </Provider>
    )
}

describe('<StoreConfigForm />', () => {
    const storeConfiguration = {
        deactivatedDatetime: null,
        trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
        storeName: 'test-shop',
        helpCenterId: 1,
        snippetHelpCenterId: 1,
        guidanceHelpCenterId: 1,
        toneOfVoice: 'Friendly',
        customToneOfVoiceGuidance:
            "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
        signature: 'This response was created by AI',
        excludedTopics: [],
        tags: [],
        conversationBot: {
            id: 1,
            email: 'test@mail.com',
        },
        monitoredEmailIntegrations: [],
        silentHandover: false,
        ticketSampleRate: 100,
        dryRun: false,
        isDraft: false,
    }
    beforeEach(() => {
        mockGetHasAutomate.mockReturnValue(true)
        mockedUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: () => Promise.resolve(),
            upsertStoreConfiguration: () => Promise.resolve(),
            error: null,
        })
        mockedUseGetOrCreateSnippetHelpCenter.mockReturnValue(null)
        mockedUseConfigurationForm.mockReturnValue({
            formValues: {
                deactivatedDatetime: null,
                trialModeActivatedDatetime: '2024-07-30T12:55:07.585Z',
                ticketSampleRate: null,
                silentHandover: false,
                monitoredEmailIntegrations: [],
                tags: [],
                excludedTopics: [],
                signature: 'This response was created by AI',
                toneOfVoice: 'Friendly',
                customToneOfVoiceGuidance:
                    "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
                helpCenterId: 1,
            },
            resetForm: jest.fn(),
            isFormDirty: false,
            updateValue: jest.fn(),
            isFieldDirty: jest.fn(),
        })
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
            [FeatureFlagKey.AiAgentSupportContactForm]: false,
        })
    })
    it('should render the component', () => {
        renderComponent({})

        expect(screen.getByText('General settings')).toBeInTheDocument()
    })

    it('should render new email integration tooltip', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentSupportContactForm]: true,
        })

        renderComponent({})
        expect(
            screen.getByText(
                'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.'
            )
        ).toBeInTheDocument()
    })

    it('should deactivate AI agent if agentMode is in trial and AiAgentTrialMode flag is false', () => {
        const mockMutation = {
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        }
        mockedUseStoreConfigurationMutation.mockReturnValue(mockMutation)

        renderComponent({
            storeConfiguration,
        })

        expect(mockMutation.upsertStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: expect.any(String),
            trialModeActivatedDatetime: null,
        })

        const actualDeactivatedDatetime =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            mockMutation.upsertStoreConfiguration.mock.calls[0][0]
                .deactivatedDatetime
        const actualDate = new Date(actualDeactivatedDatetime)
        const now = new Date()

        expect(actualDate.getTime()).toBeCloseTo(now.getTime(), -3)

        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalledWith({
            message:
                'AI Agent has been disabled, because no Knowledge source is connected.',
            status: NotificationStatus.Warning,
        })
    })

    it('should not deactivate AI agent if agentMode is in trial and AiAgentTrialMode flag is true', () => {
        const mockMutation = {
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        }
        mockedUseStoreConfigurationMutation.mockReturnValue(mockMutation)

        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
        })

        renderComponent({
            storeConfiguration,
        })

        expect(mockMutation.upsertStoreConfiguration).not.toHaveBeenCalled()
    })

    it('should call reportError when upsertStoreConfiguration throws an error', async () => {
        const mockMutation = {
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest
                .fn()
                .mockRejectedValue(new Error('Test error')),
            error: null,
        }
        mockedUseStoreConfigurationMutation.mockReturnValue(mockMutation)

        try {
            renderComponent({
                storeConfiguration,
            })

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                    extra: {
                        context: 'Error during disabling AI Agent',
                    },
                })
            })
        } catch (error) {}
    })

    it('should call deactivateAiAgent and dispatch notification when no knowledge base', async () => {
        const mockMutation = {
            isLoading: false,
            createStoreConfiguration: jest.fn(),
            upsertStoreConfiguration: jest.fn(),
            error: null,
        }
        mockedUseStoreConfigurationMutation.mockReturnValue(mockMutation)

        const helpCenter = getHelpCentersResponseFixture.data[0]
        mockedUseGetOrCreateSnippetHelpCenter.mockReturnValue(helpCenter)

        mockedUsePublicResources.mockReturnValue({
            sourceItems: [
                {id: 1, url: 'https://test1.com', status: 'error'},
                {id: 2, url: 'https://test2.com', status: 'error'},
            ],
            isSourceItemsListLoading: false,
        } as unknown as ReturnType<typeof usePublicResources>)

        const mockStoreIntegration = {
            ...storeConfiguration,
            helpCenterId: null,
            deactivatedDatetime: null,
        }

        renderComponent({
            storeConfiguration: mockStoreIntegration,
        })

        await waitFor(() => {
            expect(mockMutation.upsertStoreConfiguration).toHaveBeenCalledWith({
                ...mockStoreIntegration,
                deactivatedDatetime: expect.any(String),
                trialModeActivatedDatetime: null,
            })

            expect(mockDispatch).toHaveBeenCalled()
            expect(notify).toHaveBeenCalledWith({
                message:
                    'AI Agent has been disabled, because no Knowledge source is connected.',
                status: NotificationStatus.Warning,
            })
        })
    })
})
