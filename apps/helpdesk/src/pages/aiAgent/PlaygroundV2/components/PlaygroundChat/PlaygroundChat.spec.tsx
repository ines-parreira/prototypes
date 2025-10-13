import { userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AiAgentNotificationType } from 'automate/notifications/types'
import useFlag from 'core/flags/hooks/useFlag'
import { defaultUseAiAgentOnboardingNotificationFixture } from 'fixtures/onboardingStateNotification'
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
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import { getAccountConfigurationWithHttpIntegrationFixture } from '../../../fixtures/accountConfiguration.fixture'
import { getStoreConfigurationFixture } from '../../../fixtures/storeConfiguration.fixtures'
import { useAiAgentOnboardingNotification } from '../../../hooks/useAiAgentOnboardingNotification'
import { useAiAgentHttpIntegration } from '../../hooks/useAiAgentHttpIntegration'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import { usePlaygroundMessages } from '../../hooks/usePlaygroundMessages'
import KnowledgeSourcesWrapper from '../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper'
import { PlaygroundChat } from './PlaygroundChat'

jest.mock('core/flags/hooks/useFlag', () => ({
    __esModule: true,
    default: jest.fn(),
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

jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
}))

const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)

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

jest.mock('../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper', () => ({
    __esModule: true,
    default: jest.fn(({ children }: any) => (
        <div data-testid="knowledge-sources-wrapper">{children}</div>
    )),
}))

jest.mock('../../hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: jest.fn(),
}))

const MockKnowledgeSourcesWrapper =
    KnowledgeSourcesWrapper as jest.MockedFunction<
        typeof KnowledgeSourcesWrapper
    >

const mockUseSearchParam = jest.mocked(useSearchParam)
const mockedUsePlaygroundMessages = jest.mocked(usePlaygroundMessages)
const mockedUsePlaygroundForm = jest.mocked(usePlaygroundForm)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)
const mockUseFlag = jest.mocked(useFlag)
const mockUseAiAgentHttpIntegration = jest.mocked(useAiAgentHttpIntegration)

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

const defaultUseAiAgentOnboardingNotification =
    defaultUseAiAgentOnboardingNotificationFixture()

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const renderComponent = () => {
    return renderWithRouter(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <PlaygroundChat
                    storeData={getStoreConfigurationFixture()}
                    accountData={getAccountConfigurationWithHttpIntegrationFixture()}
                />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/knowledge`,
            route: '/shopify/test-store/ai-agent/knowledge',
        },
    )
}

describe('PlaygroundChat', () => {
    beforeEach(() => {
        MockKnowledgeSourcesWrapper.mockClear()
        mockedUsePlaygroundMessages.mockReturnValue(
            defaultUsePlaygroundMessagesProps,
        )
        mockUseAiAgentHttpIntegration.mockReturnValue({
            httpIntegrationId: 123,
            baseUrl: 'https://aiagent.gorgias.help',
            aiAgentIntegration: undefined,
        })
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
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
            isInitialLoading: false,
            isLoading: false,
            isError: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseFlag.mockReturnValue(false)
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

    describe('when standalone feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should default to chat channel', () => {
            renderComponent()

            expect(
                screen.getAllByRole('tab', { selected: true })[0],
            ).toHaveTextContent('Chat')
        })

        it('should not show email channel option', () => {
            renderComponent()

            expect(screen.queryByText('Email')).not.toBeInTheDocument()
        })
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

        it('should render KnowledgeSourcesWrapper for AI agent messages with executionId', () => {
            const executionId = 'test-execution-123'
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'AI Response',
                        createdDatetime: '2021-09-01T00:00:00Z',
                        executionId,
                    },
                    {
                        sender: 'AI Agent',
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })

            renderComponent()

            // Verify the message is rendered
            expect(screen.getByText('AI Response')).toBeInTheDocument()

            // Verify KnowledgeSourcesWrapper is rendered
            expect(
                screen.getByTestId('knowledge-sources-wrapper'),
            ).toBeInTheDocument()

            // Verify KnowledgeSourcesWrapper was called with correct props
            expect(MockKnowledgeSourcesWrapper).toHaveBeenCalled()
            expect(MockKnowledgeSourcesWrapper).toHaveBeenCalledWith(
                expect.objectContaining({
                    executionId,
                    storeConfiguration: getStoreConfigurationFixture(),
                    onFeedbackPollingStop: expect.any(Function),
                    outcome: TicketOutcome.CLOSE,
                }),
                expect.anything(),
            )
        })

        it('should pass correct outcome to KnowledgeSourcesWrapper when HANDOVER', () => {
            const executionId = 'test-execution-123'
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'AI Response with handover',
                        createdDatetime: '2021-09-01T00:00:00Z',
                        executionId,
                    },
                    {
                        sender: 'AI Agent',
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.HANDOVER,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })

            renderComponent()

            expect(
                screen.getByText('AI Response with handover'),
            ).toBeInTheDocument()

            expect(MockKnowledgeSourcesWrapper).toHaveBeenCalledWith(
                expect.objectContaining({
                    executionId,
                    outcome: TicketOutcome.HANDOVER,
                }),
                expect.anything(),
            )
        })

        it('should not render KnowledgeSourcesWrapper when message has no executionId', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'AI Response without execution',
                        createdDatetime: '2021-09-01T00:00:00Z',
                        // No executionId
                    },
                ],
            })

            renderComponent()

            expect(
                screen.getByText('AI Response without execution'),
            ).toBeInTheDocument()

            expect(MockKnowledgeSourcesWrapper).not.toHaveBeenCalled()
            expect(
                screen.queryByTestId('knowledge-sources-wrapper'),
            ).not.toBeInTheDocument()
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

        it('should handle onFeedbackPollingStop callback', () => {
            const mockStopFn = jest.fn()

            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'AI Response',
                        createdDatetime: '2021-09-01T00:00:00Z',
                        executionId: 'test-execution-123',
                    },
                ],
            })

            renderComponent()

            expect(MockKnowledgeSourcesWrapper).toHaveBeenCalled()

            const onFeedbackPollingStop =
                MockKnowledgeSourcesWrapper.mock.calls[0]?.[0]
                    ?.onFeedbackPollingStop

            expect(typeof onFeedbackPollingStop).toBe('function')
            if (onFeedbackPollingStop) {
                onFeedbackPollingStop(mockStopFn)
            }

            // The stop function should be stored in the ref and will be called during unmount/new conversation
            expect(mockStopFn).not.toHaveBeenCalled()
        })

        it('should stop feedback polling when component unmounts', () => {
            const executionId = 'test-execution-123'
            const mockStopFn = jest.fn()
            const mockOnNewConversation = jest.fn()
            const mockClearForm = jest.fn()

            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'AI Response',
                        createdDatetime: '2021-09-01T00:00:00Z',
                        executionId,
                    },
                ],
                onNewConversation: mockOnNewConversation,
            })

            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                formValues: {
                    message: '',
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                },
                clearForm: mockClearForm,
            })

            const { unmount } = renderComponent()

            const onFeedbackPollingStop =
                MockKnowledgeSourcesWrapper.mock.calls[0]?.[0]
                    ?.onFeedbackPollingStop

            // Call it with our mock stop function to simulate feedback polling being active
            if (onFeedbackPollingStop) {
                onFeedbackPollingStop(mockStopFn)
            }

            unmount()

            // Verify cleanup functions were called
            expect(mockOnNewConversation).toHaveBeenCalled()
            expect(mockClearForm).toHaveBeenCalled()
            expect(mockStopFn).toHaveBeenCalled()
        })
    })

    describe('Actions Banner', () => {
        it('should show warning banner when actions are enabled in test mode', () => {
            mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
                data: [
                    {
                        should_run_in_test_mode: true,
                        id: 'test-action-1',
                        name: 'Test Action',
                    },
                ],
                isInitialLoading: false,
                isLoading: false,
                isError: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                refetch: jest.fn(),
            } as unknown as ReturnType<
                typeof useGetStoreWorkflowsConfigurations
            >)

            renderComponent()

            const warningBanner = screen.getByText(
                'Actions are enabled. Executing an Action will run live and may update your store data.',
            )
            expect(warningBanner).toBeInTheDocument()
        })

        it('should not show any banner while loading workflow configurations', () => {
            mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
                data: [],
                isInitialLoading: true,
                isLoading: true,
                isError: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                refetch: jest.fn(),
            } as unknown as ReturnType<
                typeof useGetStoreWorkflowsConfigurations
            >)

            renderComponent()

            // Check that the banner text is not present
            expect(
                screen.queryByText(
                    'Actions are enabled. Executing an Action will run live and may update your store data.',
                ),
            ).not.toBeInTheDocument()
        })

        it('should show warning banner when at least one action has should_run_in_test_mode set to true', () => {
            mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
                data: [
                    {
                        should_run_in_test_mode: false,
                        id: 'test-action-1',
                        name: 'Test Action 1',
                    },
                    {
                        should_run_in_test_mode: true,
                        id: 'test-action-2',
                        name: 'Test Action 2',
                    },
                    {
                        should_run_in_test_mode: false,
                        id: 'test-action-3',
                        name: 'Test Action 3',
                    },
                ],
                isInitialLoading: false,
                isLoading: false,
                isError: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                refetch: jest.fn(),
            } as unknown as ReturnType<
                typeof useGetStoreWorkflowsConfigurations
            >)

            renderComponent()

            const warningBanner = screen.getByText(
                'Actions are enabled. Executing an Action will run live and may update your store data.',
            )
            expect(warningBanner).toBeInTheDocument()
        })
    })
})
