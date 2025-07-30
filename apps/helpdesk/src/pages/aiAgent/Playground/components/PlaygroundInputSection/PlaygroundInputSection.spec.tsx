import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useFlag from 'core/flags/hooks/useFlag'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

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

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('core/flags/hooks/useFlag', () => ({
    __esModule: true,
    default: jest.fn(),
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
        <textarea
            value={value}
            onChange={(e) => onMessageChange(e.target.value)}
            data-testid="playground-editor"
        />
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

jest.mock('pages/common/components/button/Button', () => ({
    __esModule: true,
    default: ({ children, onClick, isDisabled, intent, ...props }: any) => (
        <button
            onClick={onClick}
            disabled={isDisabled}
            data-intent={intent}
            {...props}
        >
            {children}
        </button>
    ),
}))

jest.mock('pages/common/forms/input/TextInput', () => ({
    __esModule: true,
    default: ({ value, onChange, ...props }: any) => (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
        />
    ),
}))

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Tooltip: ({ children }: any) => <>{children}</>,
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
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
            expect(resetButton).toBeDisabled()
        })

        it('should be enabled when message is typed', () => {
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Hello world',
                },
            })

            const resetButton = screen.getByRole('button', { name: 'Reset' })
            expect(resetButton).toBeEnabled()
        })

        it('should call onNewConversation when reset is clicked', () => {
            const onNewConversation = jest.fn()
            renderComponent({
                formValues: {
                    ...defaultProps.formValues,
                    message: 'Test message',
                },
                onNewConversation,
            })

            const resetButton = screen.getByRole('button', { name: 'Reset' })

            act(() => {
                userEvent.click(resetButton)
            })

            expect(onNewConversation).toHaveBeenCalled()
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

            act(() => {
                userEvent.click(sendButton)
            })

            expect(onSendMessage).toHaveBeenCalled()
        })
    })

    describe('Channel selection', () => {
        it('should display email channel by default', () => {
            renderComponent()

            expect(
                screen.getAllByRole('tab', { selected: true })[0],
            ).toHaveTextContent('Email')
        })

        it('should switch to chat channel when clicked', () => {
            const onChannelChange = jest.fn()
            renderComponent({ onChannelChange })

            userEvent.click(screen.getByText('Chat'))

            expect(onChannelChange).toHaveBeenCalledWith('chat')
        })

        it('should show channel availability options when chat is selected', () => {
            renderComponent({ channel: 'chat' })

            expect(screen.getByText('Online')).toBeInTheDocument()
            expect(screen.getByText('Offline')).toBeInTheDocument()
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
})
