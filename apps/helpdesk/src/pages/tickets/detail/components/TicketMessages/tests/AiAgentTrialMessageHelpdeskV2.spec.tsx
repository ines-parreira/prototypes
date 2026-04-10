import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import scrollIntoView from 'scroll-into-view-if-needed'

import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionType } from 'models/macroAction/types'
import { message } from 'models/ticket/tests/mocks'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import type { RootState } from 'state/types'

import { messageFeedback } from '../../AIAgentFeedbackBar/tests/fixtures'
import { AiAgentTrialMessageHelpdeskV2 } from '../AIAgentTrialMessageHelpdeskV2/AiAgentTrialMessageHelpdeskV2'

jest.mock('@gorgias/axiom', () => ({
    Box: ({
        children,
        className,
    }: {
        children?: ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    Button: ({
        children,
        isDisabled,
        onClick,
    }: {
        children?: ReactNode
        isDisabled?: boolean
        onClick?: MouseEventHandler<HTMLButtonElement>
    }) => (
        <button disabled={isDisabled} onClick={onClick} type="button">
            {children}
        </button>
    ),
    Icon: ({ name }: { name: string }) => <span>{name}</span>,
    Link: ({ children, href }: { children?: ReactNode; href?: string }) => (
        <a href={href}>{children}</a>
    ),
    Skeleton: () => <div data-testid="skeleton" />,
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}))

jest.mock('models/aiAgentFeedback/queries')
jest.mock('state/currentAccount/selectors')
jest.mock('scroll-into-view-if-needed')
jest.mock('@repo/logging')
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('state/ticket/actions', () => ({
    applyMacro: jest.fn(),
    applyMacroAction: jest.fn(),
}))
jest.mock('../AiAgentReasoningHelpdeskV2', () => ({
    AiAgentReasoningHelpdeskV2: jest.fn(() => <div>Show reasoning</div>),
}))

const mockDispatch = jest.fn()
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const getCurrentAccountIdMock = assumeMock(getCurrentAccountId)
const logEventMock = assumeMock(logEvent)
const scrollIntoViewMock = assumeMock(scrollIntoView)
const { applyMacro, applyMacroAction } = jest.requireMock(
    'state/ticket/actions',
) as {
    applyMacro: jest.Mock
    applyMacroAction: jest.Mock
}

const mockStore = configureMockStore([thunk])
const asActionName = (name: string) => name as MacroAction['name']
const ACTION_NAMES = {
    SetStatus: asActionName('setStatus'),
    SetResponseText: asActionName('setResponseText'),
} as const

const defaultMessage = {
    ...message,
    id: messageFeedback.messageId,
}

const defaultState: Partial<RootState> = {
    ui: {
        editor: { isFocused: false, isEditingLink: false },
    } as RootState['ui'],
    ticket: fromJS({ _internal: { isPartialUpdating: false } }),
}

function renderComponent(
    props: Partial<ComponentProps<typeof AiAgentTrialMessageHelpdeskV2>> = {},
    state: Partial<RootState> = defaultState,
) {
    return render(
        <Provider store={mockStore(state)}>
            <AiAgentTrialMessageHelpdeskV2
                ticketId={1}
                message={defaultMessage}
                {...props}
            />
        </Provider>,
    )
}

describe('AiAgentTrialMessageHelpdeskV2', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        getCurrentAccountIdMock.mockReturnValue(1)
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [messageFeedback],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)
    })

    it('renders a loading state while feedback is loading', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        expect(screen.getAllByTestId('skeleton')).toHaveLength(5)
        expect(
            screen.queryByRole('button', { name: 'Copy message' }),
        ).not.toBeInTheDocument()
    })

    it('returns null when feedback is missing', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        const { container } = renderComponent()

        expect(container.firstChild).toBeNull()
    })

    it('renders the CTA link, message body, and reasoning slot', () => {
        renderComponent()

        expect(
            screen.getByText(/Let AI Agent automate tickets/i),
        ).toBeInTheDocument()
        const enableLink = screen.getByRole('link', { name: 'Enable it now' })
        expect(enableLink).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/fast-cars/settings/preview',
        )
        expect(screen.getByText('test content')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Copy message' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Show reasoning')).toBeInTheDocument()
    })

    it('falls back to plain enable text when no preview link is available', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            ...messageFeedback,
                            shopName: undefined,
                        },
                    ],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        expect(
            screen.queryByRole('link', { name: 'Enable it now' }),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Enable it now')).toBeInTheDocument()
    })

    it('does not render reasoning when the ticket message has no id', () => {
        renderComponent({
            message: {
                ...defaultMessage,
                id: undefined as unknown as typeof defaultMessage.id,
            },
        })

        expect(screen.queryByText('Show reasoning')).not.toBeInTheDocument()
    })

    it('copies only the message for trial previews even when ticket actions are present', async () => {
        const user = userEvent.setup()
        const messageWithActions = {
            ...messageFeedback,
            draftMessage: {
                content: 'draft content',
                ticketActions: [
                    {
                        name: ACTION_NAMES.SetStatus,
                        title: 'Set status',
                        type: MacroActionType.User,
                        arguments: {
                            status: 'open',
                        },
                    },
                ],
            },
        }
        const editorElement = document.createElement('div')
        editorElement.id = 'ticket-reply-editor'
        document.body.appendChild(editorElement)

        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [messageWithActions],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Copy message' }))

        expect(scrollIntoViewMock).toHaveBeenCalledWith(editorElement, {
            scrollMode: 'if-needed',
            behavior: 'smooth',
            block: 'nearest',
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentCopiedToEditor,
            {
                accountId: 1,
                banner: 'trial',
            },
        )
        expect(applyMacroAction).toHaveBeenCalledWith(
            fromJS({
                arguments: {
                    body_html: 'draft content',
                },
                name: ACTION_NAMES.SetResponseText,
                title: 'Set Response Text',
                type: MacroActionType.User,
            }),
        )
        expect(applyMacro).not.toHaveBeenCalled()

        document.body.removeChild(editorElement)
    })
})
