import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { toast } from '@gorgias/axiom'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { DeploySection } from '../DeploySection'
import type { PostOnboardingStepMetadata } from '../types'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        shopName: 'test-shop',
        shopType: 'shopify',
    }),
}))
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: () => ({
        updateSettingsAfterAiAgentEnabled: jest.fn(),
    }),
}))
const mockSetIsAiAgentDuringDeployment = jest.fn()
jest.mock('../../../hooks/useIsAiAgentDuringDeployment', () => ({
    useIsAiAgentDuringDeployment: () => [
        false,
        mockSetIsAiAgentDuringDeployment,
    ],
}))
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: () => ({ get: () => 'test-domain' }),
}))
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: () => ({
        storeActivations: {},
        isFetchLoading: false,
    }),
}))
let mockTrialAccess: {
    trialType: string
    isInAiAgentTrial: boolean
    hasAiAgentStoreTrialStarted: boolean
} = {
    trialType: 'aiAgent',
    isInAiAgentTrial: false,
    hasAiAgentStoreTrialStarted: false,
}
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess', () => ({
    useTrialAccess: () => mockTrialAccess,
}))
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))
const mockOpenTrialUpgradeModal = jest.fn()
let mockIsTrialModalOpen = false
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow', () => ({
    useShoppingAssistantTrialFlow: () => ({
        openTrialUpgradeModal: mockOpenTrialUpgradeModal,
        isTrialModalOpen: mockIsTrialModalOpen,
    }),
}))
jest.mock('../../AiAgentTasks/EmailToggle', () => ({
    EmailToggle: (props: any) => (
        <div data-testid="email-toggle">
            <span>Email Toggle</span>
            <span>{props.isEmailChannelEnabled ? 'enabled' : 'disabled'}</span>
            <span>
                email-trial-gated:{props.isTrialGated ? 'true' : 'false'}
            </span>
            <button
                data-testid="email-toggle-button"
                onClick={() => props.onEmailToggle(props.storeConfiguration)}
            >
                Toggle Email
            </button>
            <button
                data-testid="email-start-trial-button"
                onClick={props.onStartTrial}
            >
                Email Start Trial
            </button>
        </div>
    ),
}))
jest.mock('../../AiAgentTasks/ChatToggle', () => ({
    ChatToggle: (props: any) => (
        <div data-testid="chat-toggle">
            <span>Chat Toggle</span>
            <span>{props.isChatChannelEnabled ? 'enabled' : 'disabled'}</span>
            <span>
                chat-trial-gated:{props.isTrialGated ? 'true' : 'false'}
            </span>
            <button
                data-testid="chat-toggle-button"
                onClick={() => props.onChatToggle(props.storeConfiguration)}
            >
                Toggle Chat
            </button>
            <button
                data-testid="chat-start-trial-button"
                onClick={props.onStartTrial}
            >
                Chat Start Trial
            </button>
        </div>
    ),
}))
jest.mock('../../AiAgentTasks/SuccessModal', () => ({
    SuccessModal: (props: any) =>
        props.isOpen ? (
            <div data-testid="live-modal">
                <span>Modal for {props.title}</span>
                <button
                    data-testid="modal-close-button"
                    onClick={props.handleOnClose}
                >
                    Close
                </button>
            </div>
        ) : null,
}))
describe('DeploySection', () => {
    const mockStepMetadata: PostOnboardingStepMetadata = {
        stepName: StepName.DEPLOY,
        stepTitle: 'Deploy AI Agent',
        stepDescription: 'This is a test description for deployment',
    }
    const mockStep = {
        stepName: StepName.DEPLOY,
        stepStartedDatetime: '2023-01-01T00:00:00Z',
        stepCompletedDatetime: null,
        stepDismissedDatetime: null,
    }
    const mockUpdateStep = jest.fn().mockResolvedValue(undefined)
    const mockMarkPostStoreInstallationAsCompleted = jest
        .fn()
        .mockResolvedValue(undefined)
    const mockUpdateStoreConfiguration = jest.fn().mockResolvedValue(undefined)
    const mockStoreConfiguration = {
        monitoredEmailIntegrations: [],
        monitoredChatIntegrations: [],
        previewModeActivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
    } as any
    const renderDeploySection = ({
        needsTrialOptIn = false,
    }: { needsTrialOptIn?: boolean } = {}) => {
        const element = (
            <DeploySection
                stepMetadata={mockStepMetadata}
                step={mockStep}
                updateStep={mockUpdateStep}
                markPostStoreInstallationAsCompleted={
                    mockMarkPostStoreInstallationAsCompleted
                }
                needsTrialOptIn={needsTrialOptIn}
            />
        )
        return { ...render(element), element }
    }
    beforeEach(() => {
        jest.clearAllMocks()
        mockIsTrialModalOpen = false
        mockTrialAccess = {
            trialType: 'aiAgent',
            isInAiAgentTrial: false,
            hasAiAgentStoreTrialStarted: false,
        }
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: false })
        const mockUseAiAgentStoreConfigurationContext =
            useAiAgentStoreConfigurationContext as jest.MockedFunction<
                typeof useAiAgentStoreConfigurationContext
            >
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: mockStoreConfiguration,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isLoading: false,
            isPendingCreateOrUpdate: false,
        })
    })

    afterEach(() => {
        act(() => {
            toast.dismiss()
        })
    })
    it('renders the component with correct description', () => {
        renderDeploySection()
        expect(
            screen.getByText(mockStepMetadata.stepDescription),
        ).toBeInTheDocument()
    })
    it('renders the Email and Chat toggles', () => {
        renderDeploySection()
        expect(screen.getByTestId('email-toggle')).toBeInTheDocument()
        expect(screen.getByText('Email Toggle')).toBeInTheDocument()
        expect(screen.getByTestId('chat-toggle')).toBeInTheDocument()
        expect(screen.getByText('Chat Toggle')).toBeInTheDocument()
    })
    it('calls updateStoreConfiguration when Email toggle is clicked', async () => {
        renderDeploySection()
        const emailToggleButton = screen.getByTestId('email-toggle-button')
        await act(async () => {
            await userEvent.click(emailToggleButton)
        })
        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
            mockStoreConfiguration,
        )
    })
    it('calls updateStoreConfiguration when Chat toggle is clicked', async () => {
        renderDeploySection()
        const chatToggleButton = screen.getByTestId('chat-toggle-button')
        await act(async () => {
            await userEvent.click(chatToggleButton)
        })
        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
            mockStoreConfiguration,
        )
    })
    it('shows the PostOnboardingLiveModal after successful deployment', async () => {
        renderDeploySection()
        expect(screen.queryByTestId('live-modal')).not.toBeInTheDocument()
        const emailToggleButton = screen.getByTestId('email-toggle-button')
        await act(async () => {
            await userEvent.click(emailToggleButton)
        })
        expect(screen.getByTestId('live-modal')).toBeInTheDocument()
        expect(
            screen.getByText(/Modal for AI Agent is now live/),
        ).toBeInTheDocument()
    })
    it('closes the modal and resets state when close button is clicked', async () => {
        renderDeploySection()
        const emailToggleButton = screen.getByTestId('email-toggle-button')
        await act(async () => {
            await userEvent.click(emailToggleButton)
        })
        expect(screen.getByTestId('live-modal')).toBeInTheDocument()
        const closeButton = screen.getByTestId('modal-close-button')
        await act(async () => {
            await userEvent.click(closeButton)
        })
        expect(screen.queryByTestId('live-modal')).not.toBeInTheDocument()
    })
    it('calls updateStep and markPostStoreInstallationAsCompleted after successful deployment', async () => {
        renderDeploySection()
        const emailToggleButton = screen.getByTestId('email-toggle-button')
        await act(async () => {
            await userEvent.click(emailToggleButton)
        })
        expect(mockUpdateStep).toHaveBeenCalledWith({
            ...mockStep,
            stepCompletedDatetime: expect.any(String),
        })
        expect(mockMarkPostStoreInstallationAsCompleted).toHaveBeenCalled()
    })
    it('passes isTrialGated to both toggles when needsTrialOptIn is true', () => {
        renderDeploySection({ needsTrialOptIn: true })
        expect(screen.getByText('email-trial-gated:true')).toBeInTheDocument()
        expect(screen.getByText('chat-trial-gated:true')).toBeInTheDocument()
    })
    it('passes isTrialGated=false to both toggles when needsTrialOptIn is false', () => {
        renderDeploySection()
        expect(screen.getByText('email-trial-gated:false')).toBeInTheDocument()
        expect(screen.getByText('chat-trial-gated:false')).toBeInTheDocument()
    })

    it('opens the trial upgrade modal when a toggle requests starting the trial', async () => {
        renderDeploySection({ needsTrialOptIn: true })

        await act(async () => {
            await userEvent.click(
                screen.getByTestId('email-start-trial-button'),
            )
        })
        expect(mockOpenTrialUpgradeModal).toHaveBeenCalledTimes(1)

        await act(async () => {
            await userEvent.click(screen.getByTestId('chat-start-trial-button'))
        })
        expect(mockOpenTrialUpgradeModal).toHaveBeenCalledTimes(2)
    })

    it('does not deploy any channel while the trial is not yet started', async () => {
        renderDeploySection({ needsTrialOptIn: true })

        await act(async () => {
            await userEvent.click(
                screen.getByTestId('email-start-trial-button'),
            )
        })

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
    })

    it('auto-deploys only the clicked channel once the trial has started', async () => {
        mockTrialAccess = {
            trialType: 'aiAgent',
            isInAiAgentTrial: false,
            hasAiAgentStoreTrialStarted: true,
        }
        renderDeploySection({ needsTrialOptIn: true })

        await act(async () => {
            await userEvent.click(
                screen.getByTestId('email-start-trial-button'),
            )
        })

        expect(mockUpdateStoreConfiguration).toHaveBeenCalledTimes(1)
        expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({ emailChannelDeactivatedDatetime: null }),
        )
        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalledWith(
            expect.objectContaining({ chatChannelDeactivatedDatetime: null }),
        )
    })

    it('logs the deployed channel as chat when the chat channel is deployed', async () => {
        renderDeploySection()

        await act(async () => {
            await userEvent.click(screen.getByTestId('chat-toggle-button'))
        })

        expect(logEvent).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ action: 'deployed_chat' }),
        )
        expect(logEvent).not.toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ action: 'deployed_email' }),
        )
    })

    it('drops a stale deploy intent when the trial modal is reopened by another CTA after dismissal', async () => {
        const { rerender, element } = renderDeploySection({
            needsTrialOptIn: true,
        })

        await act(async () => {
            await userEvent.click(
                screen.getByTestId('email-start-trial-button'),
            )
        })

        // The toggle-triggered modal opens, consuming the arming.
        mockIsTrialModalOpen = true
        await act(async () => {
            rerender(element)
        })

        // The user dismisses the modal without starting the trial.
        mockIsTrialModalOpen = false
        await act(async () => {
            rerender(element)
        })

        // Another CTA (e.g. the overview trial banner) reopens the modal.
        mockIsTrialModalOpen = true
        await act(async () => {
            rerender(element)
        })

        // The trial finally starts from that other CTA.
        mockTrialAccess = {
            trialType: 'aiAgent',
            isInAiAgentTrial: false,
            hasAiAgentStoreTrialStarted: true,
        }
        mockIsTrialModalOpen = false
        await act(async () => {
            rerender(element)
        })

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
    })

    describe('when AiAgentOnboardingV3 is enabled', () => {
        beforeEach(() => {
            mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: true })
        })

        it('shows the toast and skips the modal when Email toggle is clicked', async () => {
            renderDeploySection()

            const emailToggleButton = screen.getByTestId('email-toggle-button')
            await act(async () => {
                await userEvent.click(emailToggleButton)
            })

            const toastEl = await screen.findByRole('status', { hidden: true })
            expect(toastEl).toHaveTextContent('AI Agent is now live on email')
            expect(screen.queryByTestId('live-modal')).not.toBeInTheDocument()
        })

        it('shows the toast and skips the modal when Chat toggle is clicked', async () => {
            renderDeploySection()

            const chatToggleButton = screen.getByTestId('chat-toggle-button')
            await act(async () => {
                await userEvent.click(chatToggleButton)
            })

            const toastEl = await screen.findByRole('status', { hidden: true })
            expect(toastEl).toHaveTextContent('AI Agent is now live on chat')
            expect(screen.queryByTestId('live-modal')).not.toBeInTheDocument()
        })

        it('clears the during-deployment flag after a successful deploy (no modal close to do it)', async () => {
            renderDeploySection()

            const emailToggleButton = screen.getByTestId('email-toggle-button')
            await act(async () => {
                await userEvent.click(emailToggleButton)
            })

            expect(mockSetIsAiAgentDuringDeployment).toHaveBeenCalledWith(false)
        })
    })
})
