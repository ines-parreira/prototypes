import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockStore } from 'utils/testing'

import { DeploySection } from '../DeploySection'
import { PostOnboardingStepMetadata } from '../types'

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
jest.mock('../../../hooks/useIsAiAgentDuringDeployment', () => ({
    useIsAiAgentDuringDeployment: () => [false, jest.fn()],
}))
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => jest.fn(),
}))

jest.mock('../../AiAgentTasks/EmailToggle', () => ({
    EmailToggle: (props: any) => (
        <div data-testid="email-toggle">
            <span>Email Toggle</span>
            <span>{props.isEmailChannelEnabled ? 'enabled' : 'disabled'}</span>
            <button
                data-testid="email-toggle-button"
                onClick={() => props.onEmailToggle(props.storeConfiguration)}
            >
                Toggle Email
            </button>
        </div>
    ),
}))

jest.mock('../../AiAgentTasks/ChatToggle', () => ({
    ChatToggle: (props: any) => (
        <div data-testid="chat-toggle">
            <span>Chat Toggle</span>
            <span>{props.isChatChannelEnabled ? 'enabled' : 'disabled'}</span>
            <button
                data-testid="chat-toggle-button"
                onClick={() => props.onChatToggle(props.storeConfiguration)}
            >
                Toggle Chat
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
        trialModeActivatedDatetime: null,
        previewModeActivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
    } as any

    const renderDeploySection = () => {
        const store = mockStore({})
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    <DeploySection
                        stepMetadata={mockStepMetadata}
                        step={mockStep}
                        updateStep={mockUpdateStep}
                        markPostStoreInstallationAsCompleted={
                            mockMarkPostStoreInstallationAsCompleted
                        }
                    />
                </MemoryRouter>
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

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
})
