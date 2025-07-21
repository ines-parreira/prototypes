import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { useSearchParam } from 'hooks/useSearchParam'
import { useSearchCustomer } from 'models/aiAgent/queries'
import {
    AiAgentOnboardingState,
    OnboardingNotificationState,
} from 'models/aiAgent/types'
import {
    MessageType,
    PlaygroundPromptType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import { userEvent } from 'utils/testing/userEvent'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import { getAccountConfigurationWithHttpIntegrationFixture } from '../../../fixtures/accountConfiguration.fixture'
import { getStoreConfigurationFixture } from '../../../fixtures/storeConfiguration.fixtures'
import { useAiAgentOnboardingNotification } from '../../../hooks/useAiAgentOnboardingNotification'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import { usePlaygroundMessages } from '../../hooks/usePlaygroundMessages'
import { PlaygroundChat } from './PlaygroundChat'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(),
}))
jest.mock('../../hooks/usePlaygroundForm', () => ({
    usePlaygroundForm: jest.fn(),
}))

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
}))
const mockUseSearchCustomer = jest.mocked(useSearchCustomer)

jest.mock('../../../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent',
    () => () => <div />,
)
jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))
const mockUseSearchParam = jest.mocked(useSearchParam)
const mockedUsePlaygroundMessages = jest.mocked(usePlaygroundMessages)
const mockedUsePlaygroundForm = jest.mocked(usePlaygroundForm)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)

const defaultUsePlaygroundMessagesProps = {
    messages: [],
    onMessageSend: jest.fn(),
    onNewConversation: jest.fn(),
    isMessageSending: false,
    isWaitingResponse: false,
}

const defaultUsePlaygroundFormProps = {
    formValues: { message: '' },
    onFormValuesChange: jest.fn(),
    isDisabled: false,
    isFormValid: false,
    clearForm: jest.fn(),
    isPendingResources: false,
    isKnowledgeBaseEmpty: false,
    disabledMessage: undefined,
}

const defaultUseAiAgentOnboardingNotification = {
    isAdmin: true,
    onboardingNotificationState: getOnboardingNotificationStateFixture(),
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    handleOnEnablementPostReceivedNotification: jest.fn(),
    handleOnPerformActionPostReceivedNotification: jest.fn(),
    handleOnTriggerActivateAiAgentNotification: jest.fn(),
    handleOnCancelActivateAiAgentNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
}

const renderComponent = () => {
    return render(
        <PlaygroundChat
            storeData={getStoreConfigurationFixture()}
            accountData={getAccountConfigurationWithHttpIntegrationFixture()}
        />,
    )
}

describe('PlaygroundChat', () => {
    beforeEach(() => {
        mockedUsePlaygroundMessages.mockReturnValue(
            defaultUsePlaygroundMessagesProps,
        )
        mockedUsePlaygroundForm.mockReturnValue({
            formValues: { message: '', customer: DEFAULT_PLAYGROUND_CUSTOMER },
            onFormValuesChange: jest.fn(),
            isDisabled: false,
            isFormValid: false,
            clearForm: jest.fn(),
            isPendingResources: false,
            isKnowledgeBaseEmpty: false,
            disabledMessage: undefined,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockUseSearchParam.mockReturnValue([null, jest.fn()])
    })

    it('should render', () => {
        renderComponent()

        expect(
            screen.getByText('Or test a common question'),
        ).toBeInTheDocument()
    })

    it('should change channel', () => {
        renderComponent()

        expect(
            screen.getAllByRole('tab', { selected: true })[0],
        ).toHaveTextContent('Email')

        userEvent.click(screen.getByText('Chat'))

        expect(
            screen.getAllByRole('tab', { selected: true })[0],
        ).toHaveTextContent('Chat')
    })

    it('should render channel availability', () => {
        renderComponent()
        expect(
            screen.getAllByRole('tab', { selected: true })[0],
        ).toHaveTextContent('Email')

        userEvent.click(screen.getByText('Chat'))

        expect(
            screen.getAllByRole('tab', { selected: true })[0],
        ).toHaveTextContent('Chat')
    })

    it('should change channel availability', () => {
        renderComponent()
        expect(
            screen.getAllByRole('tab', { selected: true })[0],
        ).toHaveTextContent('Email')

        userEvent.click(screen.getByText('Chat'))

        expect(
            screen.getAllByRole('tab', { selected: true })[0],
        ).toHaveTextContent('Chat')

        expect(
            screen.getAllByRole('tab', { selected: true })[1],
        ).toHaveTextContent('Online')

        userEvent.click(screen.getByText('Offline'))

        expect(
            screen.getAllByRole('tab', { selected: true })[1],
        ).toHaveTextContent('Offline')
    })

    it('should change customer', async () => {
        const customer = {
            id: 0,
            address: 'test@example.com',
            user: {
                name: 'test',
                id: 0,
            },
        }

        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: { data: [customer] },
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)

        renderComponent()
        userEvent.click(screen.getByText('Existing customer'))
        await userEvent.type(
            screen.getByPlaceholderText('Search customer email'),
            customer.address,
        )
        userEvent.click(await screen.findByText(customer.address))
        expect(screen.getByDisplayValue(customer.address)).toBeInTheDocument()
    })

    it('should save the test datetime when an admin performed test', () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).toHaveBeenCalledWith({
            onboardingState: AiAgentOnboardingState.FinishedSetup,
            testBeforeActivationDatetimes: [expect.any(String)],
        })
    })

    it('should not save the test datetime when user without admin role performed test', () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isAdmin: false,
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).not.toHaveBeenCalled()
    })

    it('should not save the test datetime when AiAgentOnboardingNotification feature flag is disable', () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isAiAgentOnboardingNotificationEnabled: false,
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).not.toHaveBeenCalled()
    })

    it('should not save the test datetime when it is already fully onboarded', () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            }),
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).not.toHaveBeenCalled()
    })

    it('should not save the test datetime when it is already activated', () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                onboardingState: AiAgentOnboardingState.Activated,
            }),
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).not.toHaveBeenCalled()
    })

    it('should not save the test datetime when activate notification is already received previously', () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                activateAiAgentNotificationReceivedDatetime:
                    '2021-09-01T00:00:00Z',
            }),
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSave,
        ).not.toHaveBeenCalled()
    })

    it('should trigger call to send activate AI agent notification when user performed at least 5 tests', async () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: {
                ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                testBeforeActivationDatetimes: [
                    '2021-09-01T00:00:00Z',
                    '2021-09-02T00:00:00Z',
                    '2021-09-03T00:00:00Z',
                    '2021-09-04T00:00:00Z',
                ],
            },
            handleOnSave: jest
                .fn()
                .mockImplementation(
                    (payload: Partial<OnboardingNotificationState>) => ({
                        ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                        testBeforeActivationDatetimes: [
                            ...(payload.testBeforeActivationDatetimes || []),
                        ],
                    }),
                ),
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        await waitFor(() => {
            expect(
                defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
            ).toHaveBeenCalledWith({
                aiAgentNotificationType:
                    AiAgentNotificationType.ActivateAiAgent,
            })
        })
    })

    it('should not trigger call to send activate AI agent notification when user performed less than 5 tests', async () => {
        mockedUsePlaygroundForm.mockReturnValue({
            ...defaultUsePlaygroundFormProps,
            formValues: {
                message: 'Hello',
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            },
            isFormValid: true,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: {
                ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                testBeforeActivationDatetimes: [
                    '2021-09-01T00:00:00Z',
                    '2021-09-02T00:00:00Z',
                    '2021-09-03T00:00:00Z',
                ],
            },
            handleOnSave: jest
                .fn()
                .mockImplementation(
                    (payload: Partial<OnboardingNotificationState>) => ({
                        ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                        testBeforeActivationDatetimes: [
                            ...(payload.testBeforeActivationDatetimes || []),
                        ],
                    }),
                ),
        })

        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Send' }))

        await waitFor(() => {
            expect(
                defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
            ).not.toHaveBeenCalled()
        })
    })

    describe('Chat', () => {
        it('should render chat with messages', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Hello',
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Hello')).toBeInTheDocument()
        })

        it('should notify user no real data will be impacted while testing', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        createdDatetime: '2021-10-01T00:00:00Z',
                        content: 'test',
                    },
                ],
                onMessageSend: jest.fn(),
                onNewConversation: jest.fn(),
                isMessageSending: false,
                isWaitingResponse: false,
            })
            renderComponent()
            expect(screen.getByRole('alert')).toHaveTextContent(
                'No messages will be sent, no data will change and no actions will be performed while testing.',
            )
        })

        it('should dismiss notification when messages are sent', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        createdDatetime: '2021-10-01T00:00:00Z',
                        content: 'test',
                    },
                    {
                        sender: 'User',
                        type: MessageType.MESSAGE,
                        createdDatetime: '2021-10-01T00:00:00Z',
                        content: 'test',
                    },
                ],
                onMessageSend: jest.fn(),
                onNewConversation: jest.fn(),
                isMessageSending: false,
                isWaitingResponse: false,
            })
            renderComponent()

            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        it('should render ticket close event', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Closed')).toBeInTheDocument()
        })

        it('should render placeholder message', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.PLACEHOLDER,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Checking permissions')).toBeInTheDocument()
        })

        it('should render error message', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.ERROR,
                        content: <div>Error Message</div>,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Error Message')).toBeInTheDocument()
        })

        it('should call onSendMessage with default email when no customer selected', () => {
            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                formValues: {
                    message: 'Hello',
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                },
                isFormValid: true,
            })
            renderComponent()
            userEvent.click(screen.getByRole('button', { name: 'Send' }))
            expect(
                defaultUsePlaygroundMessagesProps.onMessageSend,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'Hello',
                    type: MessageType.MESSAGE,
                    sender: CustomerHttpIntegrationDataMock.name,
                }),
                {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                    subject: undefined,
                },
            )
        })

        it('should call onSendMessage with selected customer email', () => {
            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                isFormValid: true,
                formValues: {
                    message: 'Hello',
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                },
            })

            renderComponent()

            userEvent.click(screen.getByRole('button', { name: 'Send' }))
            expect(
                defaultUsePlaygroundMessagesProps.onMessageSend,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'Hello',
                    type: MessageType.MESSAGE,
                    sender: DEFAULT_PLAYGROUND_CUSTOMER.name,
                }),
                {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                    subject: undefined,
                },
            )
        })

        it('should hide predefined messages when sending message', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                isMessageSending: true,
            })
            renderComponent()
            expect(
                screen.queryByText('Or test a common question'),
            ).not.toBeInTheDocument()
        })

        it('should generate a relevant prompt type message when user click on "Yes, thanks"', () => {
            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                formValues: {
                    message: 'Hello',
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                },
            })
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                isWaitingResponse: true,
            })
            renderComponent()

            userEvent.click(screen.getByText('Yes, thanks'))

            expect(
                defaultUsePlaygroundMessagesProps.onMessageSend,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'Yes, thanks',
                    sender: DEFAULT_PLAYGROUND_CUSTOMER.name,
                    type: MessageType.PROMPT,
                    prompt: PlaygroundPromptType.RELEVANT_RESPONSE,
                }),
                {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,

                    subject: undefined,
                },
            )
        })

        it('should generate prompt message when click on it was not relevant prompt', () => {
            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                formValues: {
                    message: 'Hello',
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                },
            })
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                isWaitingResponse: true,
            })

            renderComponent()

            userEvent.click(screen.getByText('No, I need more help'))

            expect(
                defaultUsePlaygroundMessagesProps.onMessageSend,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'No, I need more help',
                    type: MessageType.PROMPT,
                    sender: DEFAULT_PLAYGROUND_CUSTOMER.name,
                    prompt: PlaygroundPromptType.NOT_RELEVANT_RESPONSE,
                }),
                {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                    subject: undefined,
                },
            )
        })

        it('should call onNewConversation when component unmounts', () => {
            const onNewConversation = jest.fn()
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                onNewConversation,
            })

            const { unmount } = renderComponent()

            expect(onNewConversation).not.toHaveBeenCalled()

            unmount()

            expect(onNewConversation).toHaveBeenCalledTimes(1)
        })
    })
})
