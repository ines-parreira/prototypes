import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../../constants'
import { getStoreConfigurationFixture } from '../../../fixtures/storeConfiguration.fixtures'
import { useMessagesContext } from '../../contexts/MessagesContext'
import { usePlaygroundForm } from '../../hooks/usePlaygroundForm'
import type {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../../types'
import { PlaygroundInputSection } from './PlaygroundInputSection'

const mockUseMessagesContext = jest.mocked(useMessagesContext)
const mockUsePlaygroundForm = jest.mocked(usePlaygroundForm)

const mockUseCoreContext = jest.fn(() => ({
    channel: 'email',
    channelAvailability: 'online',
    onChannelChange: jest.fn(),
    onChannelAvailabilityChange: jest.fn(),
    testSessionId: 'test-session-123',
    isTestSessionLoading: false,
    createTestSession: jest.fn(),
    testSessionLogs: undefined,
    isPolling: false,
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    isDraftKnowledgeReady: true,
}))

jest.mock('../../contexts/CoreContext', () => ({
    useCoreContext: () => mockUseCoreContext(),
}))

jest.mock('../../contexts/ConfigurationContext', () => ({
    useConfigurationContext: jest.fn(() => ({
        storeConfiguration: getStoreConfigurationFixture(),
        accountConfiguration: null,
        snippetHelpCenterId: 456,
        httpIntegrationId: 1,
        baseUrl: 'https://test.com',
        gorgiasDomain: 'acme',
        accountId: 1,
        chatIntegrationId: 123,
        shopName: 'test-store',
    })),
}))

jest.mock('../../contexts/EventsContext', () => ({
    useEvents: jest.fn(() => ({
        on: jest.fn(() => jest.fn()),
        emit: jest.fn(),
    })),
    useSubscribeToEvent: jest.fn(),
}))

const mockUseSettingsContext = jest.fn(() => ({
    mode: 'inbound',
}))

jest.mock('../../contexts/SettingsContext', () => ({
    useSettingsContext: () => mockUseSettingsContext(),
}))

jest.mock('./PlaygroundInputSection.less', () => ({
    container: 'container',
    section: 'section',
    disabled: 'disabled',
    topSection: 'topSection',
    subjectInput: 'subjectInput',
    editor: 'editor',
    footer: 'footer',
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent',
    () => () => <div />,
)

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: () => ({ shopName: 'test-store' }),
}))

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: () => [null, jest.fn()],
}))

jest.mock('../../hooks/usePlaygroundTracking', () => ({
    usePlaygroundTracking: () => ({
        onTestMessageSent: jest.fn(),
    }),
}))

jest.mock('../../contexts/MessagesContext', () => ({
    ...jest.requireActual('../../contexts/MessagesContext'),
    useMessagesContext: jest.fn(),
}))

jest.mock('../../hooks/usePlaygroundForm', () => ({
    usePlaygroundForm: jest.fn(),
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent',
    () => ({
        __esModule: true,
        default: ({ model, onModelChange }: any) => (
            <div className="fr-element">
                <textarea
                    value={model}
                    onChange={(e) => onModelChange(e.target.value)}
                    data-testid="playground-editor"
                />
            </div>
        ),
    }),
)

jest.mock('../PlaygroundSegmentControl/PlaygroundSegmentControl', () => ({
    PlaygroundSegmentControl: ({
        segments,
        selectedValue,
        onValueChange,
        isDisabled,
    }: any) => (
        <div>
            {segments.map((segment: any) => (
                <button
                    key={segment.value}
                    role="tab"
                    aria-selected={selectedValue === segment.value}
                    onClick={() => onValueChange(segment.value)}
                    disabled={isDisabled}
                >
                    {segment.label}
                </button>
            ))}
        </div>
    ),
}))

jest.mock('../PlaygroundCustomerSelection/PlaygroundCustomerSelection', () => ({
    PlaygroundCustomerSelection: () => <div>Customer Selection</div>,
    SenderTypeValues: {
        NEW_CUSTOMER: 'new_customer',
        EXISTING_CUSTOMER: 'existing_customer',
    },
}))

jest.mock(
    '../PlaygroundPredefinedMessages/PlaygroundPredefinedMessages',
    () => ({
        PlaygroundPredefinedMessages: ({ isVisible }: any) =>
            isVisible ? <div>Predefined Messages</div> : null,
    }),
)

jest.mock('pages/common/forms/input/TextInput', () => ({
    __esModule: true,
    default: React.forwardRef(
        ({ value, onChange, isDisabled, ...props }: any, ref: any) => (
            <input
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isDisabled}
                {...props}
            />
        ),
    ),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacyTooltip: ({ children, target, placement, offset }: any) => (
        <div
            data-testid={`tooltip-${target}`}
            data-placement={placement}
            data-offset={offset}
        >
            {children}
        </div>
    ),
}))

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        getActionKeys: jest.fn(() => 'Cmd+Enter'),
    },
    shortcuts: {
        TicketDetailContainer: {
            actions: {
                SUBMIT_TICKET: {
                    key: 'mod+enter',
                    description: 'Send message.',
                },
            },
        },
    },
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const defaultProps = {
    formValues: {
        message: '',
        customer: DEFAULT_PLAYGROUND_CUSTOMER,
        subject: '',
    } as PlaygroundFormValues,
    onFormValuesChange: jest.fn(),
    isDisabled: false,
    isInitialMessage: true,
    onSendMessage: jest.fn(),
    onNewConversation: jest.fn(),
    isMessageSending: false,
    onChannelChange: jest.fn(),
    channel: 'email' as PlaygroundChannels,
    isWaitingResponse: false,
    onPromptMessage: jest.fn(),
    channelAvailability: 'online' as PlaygroundChannelAvailability,
    onChannelAvailabilityChange: jest.fn(),
    withResetButton: true,
}

const renderComponent = (props: any = {}) => {
    const contextOverrides = props.contextOverrides || {}
    const stateOverrides = props.stateOverrides || {}
    const formOverrides = props.formOverrides || {}

    // Map old-style props to new structure
    const mappedChannelOverrides = {
        ...(props.channel && { channel: props.channel }),
        ...(props.channelAvailability && {
            channelAvailability: props.channelAvailability,
        }),
        ...(props.onChannelChange && {
            onChannelChange: props.onChannelChange,
        }),
        ...(props.onChannelAvailabilityChange && {
            onChannelAvailabilityChange: props.onChannelAvailabilityChange,
        }),
    }

    const mappedMessagesOverrides = {
        ...(props.onSendMessage && { onMessageSend: props.onSendMessage }),
        ...(props.isMessageSending !== undefined && {
            isMessageSending: props.isMessageSending,
        }),
        ...(props.onNewConversation && {
            onNewConversation: props.onNewConversation,
        }),
        ...(props.isWaitingResponse !== undefined && {
            isWaitingResponse: props.isWaitingResponse,
        }),
        ...(props.isInitialMessage !== undefined && {
            messages: props.isInitialMessage ? [] : [{ sender: 'Customer' }],
        }),
        ...stateOverrides,
    }

    const mappedFormOverrides = {
        ...(props.formValues && { formValues: props.formValues }),
        ...(props.isDisabled !== undefined && { isDisabled: props.isDisabled }),
        ...(props.onFormValuesChange && {
            onFormValuesChange: props.onFormValuesChange,
        }),
        ...formOverrides,
    }

    // Update CoreContext mock with channel overrides
    const shouldOverrideContext =
        Object.keys(mappedChannelOverrides).length > 0 ||
        props.isDraftKnowledgeReady !== undefined

    if (shouldOverrideContext) {
        mockUseCoreContext.mockReturnValueOnce({
            channel: mappedChannelOverrides.channel || 'email',
            channelAvailability:
                mappedChannelOverrides.channelAvailability || 'online',
            onChannelChange:
                mappedChannelOverrides.onChannelChange || jest.fn(),
            onChannelAvailabilityChange:
                mappedChannelOverrides.onChannelAvailabilityChange || jest.fn(),
            testSessionId: 'test-session-123',
            isTestSessionLoading: false,
            createTestSession: jest.fn(),
            testSessionLogs: undefined,
            isPolling: false,
            startPolling: jest.fn(),
            stopPolling: jest.fn(),
            isDraftKnowledgeReady:
                props.isDraftKnowledgeReady !== undefined
                    ? props.isDraftKnowledgeReady
                    : true,
        } as any)
    }

    mockUseMessagesContext.mockReturnValue({
        messages: mappedMessagesOverrides.messages || [],
        onMessageSend:
            mappedMessagesOverrides.onMessageSend || defaultProps.onSendMessage,
        isMessageSending:
            mappedMessagesOverrides.isMessageSending !== undefined
                ? mappedMessagesOverrides.isMessageSending
                : defaultProps.isMessageSending,
        onNewConversation:
            mappedMessagesOverrides.onNewConversation ||
            defaultProps.onNewConversation,
        isWaitingResponse:
            mappedMessagesOverrides.isWaitingResponse !== undefined
                ? mappedMessagesOverrides.isWaitingResponse
                : defaultProps.isWaitingResponse,
        ...contextOverrides,
    } as any)

    mockUsePlaygroundForm.mockReturnValue({
        formValues: defaultProps.formValues,
        isFormValid: !defaultProps.isDisabled,
        isDisabled: defaultProps.isDisabled,
        disabledMessage: '',
        onFormValuesChange: defaultProps.onFormValuesChange,
        clearForm: jest.fn(),
        ...mappedFormOverrides,
    })

    return renderWithRouter(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <PlaygroundInputSection
                    withResetButton={
                        props.withResetButton !== undefined
                            ? props.withResetButton
                            : defaultProps.withResetButton
                    }
                />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/playground`,
            route: '/shopify/test-store/ai-agent/playground',
        },
    )
}

describe('PlaygroundInputSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(false)
    })

    describe('Reset button', () => {
        it('should be disabled when no message is typed and no message has been sent', () => {
            renderComponent()

            const resetButton = screen.getByRole('button', {
                name: 'Reset conversation',
            })
            expect(resetButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should be disabled when message is typed', () => {
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Hello world',
                },
            })

            const resetButton = screen.getByRole('button', {
                name: 'Reset conversation',
            })
            expect(resetButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Send button', () => {
        it('should be enabled when form is valid', () => {
            renderComponent({
                isDisabled: false,
            })

            const sendButton = screen.getByRole('button', {
                name: 'Send message',
            })
            expect(sendButton).toBeEnabled()
        })

        it('should call onSendMessage when clicked', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
            })

            const sendButton = screen.getByRole('button', {
                name: 'Send message',
            })

            await act(async () => {
                await userEvent.click(sendButton)
            })

            expect(onSendMessage).toHaveBeenCalled()
        })

        it('should show tooltip with keyboard shortcut when button is enabled', () => {
            renderComponent({
                isDisabled: false,
            })

            const tooltip = screen.getByTestId('tooltip-send-button')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent('Cmd+Enter')
            expect(tooltip).toHaveAttribute('data-placement', 'top')
            expect(tooltip).toHaveAttribute('data-offset', '0, 4px')
        })

        it('should not show tooltip when button is disabled', () => {
            renderComponent({
                isDisabled: true,
            })

            const tooltip = screen.queryByTestId('tooltip-send-button')
            expect(tooltip).not.toBeInTheDocument()
        })
    })

    describe('Keyboard shortcuts', () => {
        it('should send message when Cmd+Enter is pressed in the editor', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: false,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await act(async () => {
                await userEvent.keyboard('{Meta>}{Enter}{/Meta}')
            })

            expect(onSendMessage).toHaveBeenCalled()
        })

        it('should send message when Ctrl+Enter is pressed in the editor', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: false,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await act(async () => {
                await userEvent.keyboard('{Control>}{Enter}{/Control}')
            })

            expect(onSendMessage).toHaveBeenCalled()
        })

        it('should not send message when only Enter is pressed in the editor', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: false,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await userEvent.keyboard('{Enter}')

            expect(onSendMessage).not.toHaveBeenCalled()
        })

        it('should not send message when Cmd+Enter is pressed in the editor but button is disabled', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: true,
                isMessageSending: false,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await userEvent.keyboard('{Meta>}{Enter}{/Meta}')

            expect(onSendMessage).not.toHaveBeenCalled()
        })

        it('should not send message when Cmd+Enter is pressed in the editor but message is sending', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: true,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await userEvent.keyboard('{Meta>}{Enter}{/Meta}')

            expect(onSendMessage).not.toHaveBeenCalled()
        })

        it('should not send message when Cmd+other key is pressed in the editor', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: false,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await userEvent.keyboard('{Meta>}s{/Meta}')

            expect(onSendMessage).not.toHaveBeenCalled()
        })

        it('should not send message when Cmd+Enter is pressed outside the editor', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: false,
            })

            // Create and focus an element outside the component entirely
            const outsideInput = document.createElement('input')
            outsideInput.setAttribute('data-testid', 'outside-input')
            document.body.appendChild(outsideInput)
            outsideInput.focus()

            // Dispatch keyboard event directly on the outside element
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                metaKey: true,
                bubbles: true,
            })
            outsideInput.dispatchEvent(event)

            expect(onSendMessage).not.toHaveBeenCalled()

            // Cleanup
            document.body.removeChild(outsideInput)
        })

        it('should cleanup keyboard event listener on unmount', () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
            const removeEventListenerSpy = jest.spyOn(
                document,
                'removeEventListener',
            )

            const { unmount } = renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage: jest.fn(),
                isDisabled: false,
                isMessageSending: false,
            })

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
            )

            unmount()

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
            )

            addEventListenerSpy.mockRestore()
            removeEventListenerSpy.mockRestore()
        })
    })

    describe('Predefined messages', () => {
        it('should show predefined messages in inbound mode when no message is typed', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'inbound',
            })
            renderComponent({
                isInitialMessage: true,
                formValues: {
                    ...defaultProps.formValues,
                    message: '',
                },
            })

            expect(screen.getByText('Predefined Messages')).toBeInTheDocument()
        })

        it('should not show predefined messages in outbound mode', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'outbound',
            })
            renderComponent({
                isInitialMessage: true,
                formValues: {
                    ...defaultProps.formValues,
                    message: '',
                },
            })

            expect(
                screen.queryByText('Predefined Messages'),
            ).not.toBeInTheDocument()
        })

        it('should not show predefined messages when message is typed', () => {
            mockUseSettingsContext.mockReturnValue({
                mode: 'inbound',
            })
            renderComponent({
                isInitialMessage: true,
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Hello',
                },
            })

            expect(
                screen.queryByText('Predefined Messages'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Draft knowledge readiness', () => {
        it('should disable send button when draft knowledge is not ready', () => {
            renderComponent({
                isDraftKnowledgeReady: false,
                isDisabled: false,
            })

            const sendButton = screen.getByRole('button', {
                name: 'Send message',
            })
            expect(sendButton).toBeDisabled()
        })

        it('should enable send button when draft knowledge is ready', () => {
            renderComponent({
                isDraftKnowledgeReady: true,
                isDisabled: false,
            })

            const sendButton = screen.getByRole('button', {
                name: 'Send message',
            })
            expect(sendButton).toBeEnabled()
        })

        it('should show tooltip when draft knowledge is not ready', () => {
            renderComponent({
                isDraftKnowledgeReady: false,
                isDisabled: false,
            })

            const tooltip = screen.getByTestId('tooltip-send-button')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent(
                'Your draft updates are being synced for testing.',
            )
        })

        it('should prioritize draft knowledge tooltip over disabled message', () => {
            renderComponent({
                isDraftKnowledgeReady: false,
                isDisabled: true,
                formOverrides: {
                    disabledMessage: 'Form is invalid',
                },
            })

            const tooltip = screen.getByTestId('tooltip-send-button')
            expect(tooltip).toHaveTextContent(
                'Your draft updates are being synced for testing.',
            )
            expect(tooltip).not.toHaveTextContent('Form is invalid')
        })

        it('should still send message when draft knowledge is not ready and Cmd+Enter is pressed (keyboard shortcut does not check isDraftKnowledgeReady)', async () => {
            const onSendMessage = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onSendMessage,
                isDisabled: false,
                isMessageSending: false,
                isDraftKnowledgeReady: false,
            })

            const editor = screen.getByTestId('playground-editor')
            editor.focus()

            await act(async () => {
                await userEvent.keyboard('{Meta>}{Enter}{/Meta}')
            })

            expect(onSendMessage).toHaveBeenCalled()
        })
    })
})
