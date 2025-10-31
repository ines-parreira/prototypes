import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../../constants'
import {
    PlaygroundChannelAvailability,
    PlaygroundChannels,
    PlaygroundFormValues,
} from '../PlaygroundChat/PlaygroundChat.types'
import { PlaygroundInputSection } from './PlaygroundInputSection'

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

jest.mock('../PlaygroundEditor/PlaygroundEditor', () => ({
    PlaygroundEditor: ({ value, onMessageChange }: any) => (
        <div className="fr-element">
            <textarea
                value={value}
                onChange={(e) => onMessageChange(e.target.value)}
                data-testid="playground-editor"
            />
        </div>
    ),
}))

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

jest.mock('core/flags', () => ({
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
}

const renderComponent = (props = {}) => {
    return renderWithRouter(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <PlaygroundInputSection {...defaultProps} {...props} />
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

            const resetButton = screen.getByRole('button', { name: 'Reset' })
            expect(resetButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should be disabled when message is typed', () => {
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Hello world',
                },
            })

            const resetButton = screen.getByRole('button', { name: 'Reset' })
            expect(resetButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Send button', () => {
        it('should be enabled when form is valid', () => {
            renderComponent({
                isDisabled: false,
            })

            const sendButton = screen.getByRole('button', { name: 'Send' })
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

            const sendButton = screen.getByRole('button', { name: 'Send' })

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

    describe('Channel selection', () => {
        it('should display email channel by default', () => {
            renderComponent()

            expect(
                screen.getAllByRole('tab', { selected: true })[0],
            ).toHaveTextContent('Email')
        })

        it('should switch to chat channel when clicked', async () => {
            const onChannelChange = jest.fn()
            renderComponent({ onChannelChange })

            await act(async () => {
                await userEvent.click(screen.getByText('Chat'))
            })

            expect(onChannelChange).toHaveBeenCalledWith('chat')
        })

        it('should show channel availability options when chat is selected', () => {
            renderComponent({ channel: 'chat' })

            expect(screen.getByText('Online')).toBeInTheDocument()
            expect(screen.getByText('Offline')).toBeInTheDocument()
        })

        it('should show customer selection for email channel', () => {
            renderComponent({ channel: 'email' })
            expect(screen.getByText('Customer Selection')).toBeInTheDocument()
        })

        it('should show customer selection for chat channel', () => {
            renderComponent({ channel: 'chat' })
            expect(screen.getByText('Customer Selection')).toBeInTheDocument()
        })

        describe('when standalone feature flag is enabled', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(true)
            })

            it('should only show chat channel option', () => {
                renderComponent()

                expect(screen.getByText('Chat')).toBeInTheDocument()
                expect(screen.queryByText('Email')).not.toBeInTheDocument()
            })

            it('should not have any other channel segments', () => {
                renderComponent()

                const tabs = screen.getAllByRole('tab')
                expect(tabs).toHaveLength(1)
                expect(tabs[0]).toHaveTextContent('Chat')
            })

            it('should disable channel switching when not initial message', () => {
                renderComponent({ isInitialMessage: false })

                const tabs = screen.getAllByRole('tab')
                expect(tabs).toHaveLength(1)
                expect(tabs[0]).toBeDisabled()
            })
        })
    })

    describe('arePlaygroundActionsAllowed prop', () => {
        const rerenderWithActionsAllowed = (
            rerender: any,
            arePlaygroundActionsAllowed: boolean | undefined,
            additionalProps: any,
        ) => {
            rerender(
                <Provider store={mockStore({})}>
                    <QueryClientProvider client={queryClient}>
                        <PlaygroundInputSection
                            {...defaultProps}
                            {...additionalProps}
                            arePlaygroundActionsAllowed={
                                arePlaygroundActionsAllowed
                            }
                        />
                    </QueryClientProvider>
                </Provider>,
            )
        }

        it('should reset the playground when arePlaygroundActionsAllowed value changes', async () => {
            const onNewConversation = jest.fn()
            const onSendMessage = jest.fn()

            const { rerender } = renderComponent({
                arePlaygroundActionsAllowed: true,
                onNewConversation,
                onSendMessage,
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
            })

            const sendButton = screen.getByRole('button', { name: 'Send' })

            await act(async () => {
                await userEvent.click(sendButton)
            })

            expect(onSendMessage).toHaveBeenCalledTimes(1)
            expect(
                screen.getByRole('button', { name: 'Reset' }),
            ).toHaveAttribute('aria-disabled', 'false')
            expect(onNewConversation).not.toHaveBeenCalled()

            onNewConversation.mockClear()
            onSendMessage.mockClear()

            rerenderWithActionsAllowed(rerender, false, {
                onNewConversation,
                onSendMessage,
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
            })

            await waitFor(() => {
                expect(onNewConversation).toHaveBeenCalledTimes(1)
            })
        })

        it('should not reset when arePlaygroundActionsAllowed value stays the same', async () => {
            const onNewConversation = jest.fn()

            const { rerender } = renderComponent({
                arePlaygroundActionsAllowed: true,
                onNewConversation,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Send' }),
                ).toBeInTheDocument()
            })

            onNewConversation.mockClear()

            rerenderWithActionsAllowed(rerender, true, {
                onNewConversation,
            })

            expect(onNewConversation).not.toHaveBeenCalled()
        })

        it('should reset when arePlaygroundActionsAllowed changes from undefined to a value', async () => {
            const onNewConversation = jest.fn()

            const { rerender } = renderComponent({
                arePlaygroundActionsAllowed: undefined,
                onNewConversation,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Send' }),
                ).toBeInTheDocument()
            })

            onNewConversation.mockClear()

            rerenderWithActionsAllowed(rerender, true, {
                onNewConversation,
            })

            await waitFor(() => {
                expect(onNewConversation).toHaveBeenCalledTimes(1)
            })
        })

        it('should disable reset button after automatic reset when arePlaygroundActionsAllowed changes', async () => {
            const onNewConversation = jest.fn()
            const onSendMessage = jest.fn()

            const { rerender } = renderComponent({
                arePlaygroundActionsAllowed: true,
                onNewConversation,
                onSendMessage,
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
            })

            const sendButton = screen.getByRole('button', { name: 'Send' })

            await act(async () => {
                await userEvent.click(sendButton)
            })

            const resetButton = screen.getByRole('button', { name: 'Reset' })
            expect(resetButton).toHaveAttribute('aria-disabled', 'false')

            rerenderWithActionsAllowed(rerender, false, {
                onNewConversation,
                onSendMessage,
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
            })

            await waitFor(() => {
                const resetButtonAfterReset = screen.getByRole('button', {
                    name: 'Reset',
                })
                expect(resetButtonAfterReset).toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })
        })
    })
})
