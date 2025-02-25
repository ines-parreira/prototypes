import 'tests/__mocks__/intersectionObserverMock'

import React, { ComponentProps } from 'react'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import {
    AiAgentChannel,
    DEFAULT_WIZARD_FORM_VALUES,
    ToneOfVoice,
    WIZARD_BUTTON_ACTIONS,
} from '../../constants'
import useCustomToneOfVoicePreview from '../../hooks/useCustomToneOfVoicePreview'
import { FormValues } from '../../types'
import AiAgentOnboardingWizardStepPersonalize from '../AiAgentOnboardingWizardPersonalize'
import { useAiAgentOnboardingWizard } from '../hooks/useAiAgentOnboardingWizard'

const mockStore = configureMockStore([thunk])
jest.mock(
    'pages/automate/common/hooks/useSelfServiceChatChannels',
    () => () => [
        { name: '1', meta: { app_id: 1 }, id: 1 },
        { name: '2', meta: { app_id: 2 }, id: 2 },
    ],
)
jest.mock('../hooks/useAiAgentOnboardingWizard')
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock(
    '../../components/ChatIntegrationListSelection/ChatIntegrationListSelection',
    () => ({
        ChatIntegrationListSelection: () => (
            <div>ChatIntegrationListSelection</div>
        ),
    }),
)

const mockUseAiAgentOnboardingWizard = jest.mocked(useAiAgentOnboardingWizard)

jest.mock('../../hooks/useCustomToneOfVoicePreview')

const mockuseCustomToneofVoicePreview = jest.mocked(useCustomToneOfVoicePreview)

const QueryClientProvider = mockQueryClientProvider()
const defaultState = {}
const defaultProps = {
    shopType: 'shopify',
    shopName: 'test-shop',
}

const history = createMemoryHistory()
const renderComponent = (
    props: Partial<
        ComponentProps<typeof AiAgentOnboardingWizardStepPersonalize>
    >,
) => {
    const currentProps = {
        ...defaultProps,
        ...props,
    }
    renderWithRouter(
        <Router history={history}>
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider>
                    <Wizard steps={[AiAgentOnboardingWizardStep.Personalize]}>
                        <AiAgentOnboardingWizardStepPersonalize
                            {...currentProps}
                        />
                    </Wizard>
                </QueryClientProvider>
            </Provider>
        </Router>,
    )
}

const storeFormValues = {
    toneOfVoice: ToneOfVoice.Friendly,
    signature: 'This response was created by AI',
    monitoredEmailIntegrations: [],
    monitoredChatIntegrations: [],
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    deactivatedDatetime: new Date().toISOString(),
    silentHandover: false,
    tags: [],
    excludedTopics: [],
    customToneOfVoiceGuidance:
        "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
    helpCenter: null,
    wizard: {
        monitoredEmailIntegrations: [],
        monitoredChatIntegrations: {},
        step: AiAgentOnboardingWizardStep.Personalize,
    },
} as unknown as FormValues

describe('<AiAgentOnboardingWizardPersonalize />', () => {
    const mockHandleSave = jest.fn()
    const mockHandleFormUpdate = jest.fn()
    const mockHandleAction = jest.fn()

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: true,
        })

        mockUseAiAgentOnboardingWizard.mockReturnValue({
            handleFormUpdate: mockHandleFormUpdate,
            handleSave: mockHandleSave,
            storeFormValues: storeFormValues,
            faqHelpCenters: [],
            handleAction: mockHandleAction,
            isLoading: false,
            snippetHelpCenter: null,
            updateValue: jest.fn(),
            storeConfiguration: undefined,
            isUpdateWizardSetup: false,
        })

        mockuseCustomToneofVoicePreview.mockReturnValue({
            latestCustomToneOfVoicePreview: '',
            onGenerateCustomToneOfVoicePreview: jest.fn(),
            isLoading: false,
            isError: false,
        })

        mockUseAppSelector.mockReturnValue([])
    })

    it('should render the header and footer correctly', () => {
        renderComponent({})

        expect(
            screen.getAllByText('Personalize AI Agent')[1],
        ).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Save & Customize Later')).toBeInTheDocument
    })

    it('should render the footer without back button when educational step feature flag is false', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: false,
        })

        renderComponent({})

        expect(screen.queryByText('Back')).not.toBeInTheDocument()
        expect(screen.queryByText('Save & Customize Later')).not
            .toBeInTheDocument
        expect(
            screen.getAllByText('Personalize AI Agent')[1],
        ).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('call save form when next button is clicked', () => {
        renderComponent({})
        const nextButton = screen.getByText('Next')
        expect(nextButton).toBeInTheDocument()
        userEvent.click(nextButton)
        expect(mockHandleSave).toHaveBeenCalledWith({
            redirectTo: WIZARD_BUTTON_ACTIONS.NEXT_STEP,
            stepName: AiAgentOnboardingWizardStep.Knowledge,
        })
    })

    it('call save form when save&customize later button is clicked', () => {
        renderComponent({})
        expect(screen.getByText('Save & Customize Later')).toBeInTheDocument()
        userEvent.click(screen.getByText('Save & Customize Later'))
        expect(mockHandleSave).toHaveBeenCalledWith({
            stepName: AiAgentOnboardingWizardStep.Personalize,
            redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
        })
    })

    it('do not call save form when Back button is clicked', () => {
        renderComponent({
            shopName: 'test-shop',
            shopType: 'shopify',
        })
        expect(screen.getByText('Back')).toBeInTheDocument()
        userEvent.click(screen.getByText('Back'))
        expect(mockHandleSave).not.toHaveBeenCalled()
    })

    it('call handleAction when cancel button is clicked', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: false,
        })
        renderComponent({})
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        userEvent.click(screen.getByText('Cancel'))
        expect(mockHandleAction).toHaveBeenCalledWith(
            WIZARD_BUTTON_ACTIONS.CANCEL,
        )
    })

    it('handles initial channel setup in useEffect', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })
        mockUseAiAgentOnboardingWizard.mockReturnValue({
            handleFormUpdate: mockHandleFormUpdate,
            handleSave: mockHandleSave,
            storeFormValues: {
                ...storeFormValues,
                wizard: { ...DEFAULT_WIZARD_FORM_VALUES, enabledChannels: [] },
            },
            faqHelpCenters: [],
            handleAction: jest.fn,
            isLoading: false,
            snippetHelpCenter: null,
            updateValue: jest.fn(),
            storeConfiguration: undefined,
            isUpdateWizardSetup: false,
        })

        renderComponent({})

        expect(mockHandleFormUpdate).toHaveBeenCalledWith({
            wizard: {
                ...DEFAULT_WIZARD_FORM_VALUES,
                enabledChannels: [AiAgentChannel.Email, AiAgentChannel.Chat],
            },
        })
    })

    it('should render the ChatIntegrationListSelection component when chat flag is enabled', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: true,
        })
        renderComponent({})
        expect(
            screen.getByText('ChatIntegrationListSelection'),
        ).toBeInTheDocument()
    })

    it('should not render the ChatIntegrationListSelection component when chat flag is disabled', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentChat]: false,
        })
        renderComponent({})

        expect(
            screen.queryByText('ChatIntegrationListSelection'),
        ).not.toBeInTheDocument()
    })

    it('should display confirmation dialog modal when user try to leave the page after changes are made', () => {
        renderComponent({})

        userEvent.click(screen.getByText('Professional'))
        history.push('/test')

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Discard Changes')).toBeInTheDocument()

        userEvent.click(screen.getByText('Save Changes'))
        expect(mockHandleSave).toHaveBeenCalledWith({
            stepName: AiAgentOnboardingWizardStep.Personalize,
            redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
        })
    })
})
