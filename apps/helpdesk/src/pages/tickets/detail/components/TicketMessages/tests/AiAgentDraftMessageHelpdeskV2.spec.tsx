import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'
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
import { AiAgentDraftMessageHelpdeskV2 } from '../AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2'
import { AIAgentUsedDataHelpdeskV2 } from '../AIAgentDraftMessageHelpdeskV2/AIAgentUsedDataHelpdeskV2'

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
    Card: ({
        children,
        className,
    }: {
        children?: ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    CardContent: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    Disclosure: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    DisclosureHeader: ({ title }: { title?: ReactNode }) => <div>{title}</div>,
    DisclosurePanel: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    Icon: ({ name }: { name: string }) => <span>{name}</span>,
    Skeleton: () => <div data-testid="skeleton" />,
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}))

jest.mock('models/aiAgentFeedback/queries')
jest.mock('state/currentAccount/selectors')
jest.mock('scroll-into-view-if-needed')
jest.mock('@repo/logging')
jest.mock('@repo/activity-tracker/utils', () => ({
    isSessionImpersonated: jest.fn(() => false),
}))
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('state/ticket/actions', () => ({
    applyMacro: jest.fn(),
    applyMacroAction: jest.fn(),
}))
jest.mock('../AIAgentDraftMessageHelpdeskV2/AIAgentUsedDataHelpdeskV2', () => ({
    __esModule: true,
    AIAgentUsedDataHelpdeskV2: jest.fn(() => <div>Data Used</div>),
}))
jest.mock(
    '../AIAgentDraftMessageHelpdeskV2/TicketReplyActionHelpdeskV2/TicketReplyActionHelpdeskV2',
    () => {
        const mockTicketReplyActionHelpdeskV2Component = jest.fn(
            ({ action }: { action: MacroAction }) => (
                <div>{`Action: ${action.name}`}</div>
            ),
        )

        return {
            __esModule: true,
            TicketReplyActionHelpdeskV2:
                mockTicketReplyActionHelpdeskV2Component,
            default: mockTicketReplyActionHelpdeskV2Component,
        }
    },
)

const mockDispatch = jest.fn()
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const getCurrentAccountIdMock = assumeMock(getCurrentAccountId)
const logEventMock = assumeMock(logEvent)
const scrollIntoViewMock = assumeMock(scrollIntoView)
const isSessionImpersonatedMock = assumeMock(isSessionImpersonated)
const aiAgentUsedDataHelpdeskV2Mock = assumeMock(AIAgentUsedDataHelpdeskV2)
const { default: ticketReplyActionHelpdeskV2Mock } = jest.requireMock(
    '../AIAgentDraftMessageHelpdeskV2/TicketReplyActionHelpdeskV2/TicketReplyActionHelpdeskV2',
) as {
    default: jest.Mock
}
const { applyMacro, applyMacroAction } = jest.requireMock(
    'state/ticket/actions',
) as {
    applyMacro: jest.Mock
    applyMacroAction: jest.Mock
}

const mockStore = configureMockStore([thunk])
const asActionName = (name: string) => name as MacroAction['name']
const ACTION_NAMES = {
    AddTags: asActionName('addTags'),
    SetResponseText: asActionName('setResponseText'),
    SetStatus: asActionName('setStatus'),
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
    props: Partial<ComponentProps<typeof AiAgentDraftMessageHelpdeskV2>> = {},
    state: Partial<RootState> = defaultState,
) {
    return render(
        <Provider store={mockStore(state)}>
            <AiAgentDraftMessageHelpdeskV2
                ticketId={1}
                message={defaultMessage}
                {...props}
            />
        </Provider>,
    )
}

describe('AiAgentDraftMessageHelpdeskV2', () => {
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

    it('keeps the CTA visible while feedback is loading', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        expect(screen.getAllByTestId('skeleton')).toHaveLength(8)
        expect(
            screen.queryByRole('button', {
                name: 'Copy message and actions',
            }),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Data Used')).not.toBeInTheDocument()
    })

    it('renders the base layout when feedback is missing', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(screen.queryByText('Data Used')).not.toBeInTheDocument()
        expect(screen.queryByText('Drafted message')).not.toBeInTheDocument()
    })

    it('renders summary and CTA when the draft message is missing', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [{ ...messageFeedback, draftMessage: undefined }],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        expect(
            screen.queryByText(/AI Agent sent a response/i),
        ).not.toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(screen.queryByText('Drafted message')).not.toBeInTheDocument()
    })

    it('renders when the ticket message carries embedded mock feedback', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent({
            message: {
                ...defaultMessage,
                meta: {
                    ai_agent_mock_feedback: messageFeedback,
                } as typeof defaultMessage.meta,
            },
        })

        expect(screen.getByText('Copy message and actions')).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent sent a response and left the ticket open pending further information from the customer.',
            ),
        ).toBeInTheDocument()
    })

    it('renders HTML summaries as markup instead of escaped text', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            ...messageFeedback,
                            summary:
                                '<p><strong>AI Agent</strong> drafted a reply.</p>',
                        },
                    ],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent()

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('drafted a reply.')).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent').closest('strong'),
        ).toBeInTheDocument()
    })

    it('renders execution id only when impersonating', () => {
        const { unmount } = renderComponent()

        expect(
            screen.queryByText(
                'Execution ID: 923665aa-5081-49b3-9cca-2ad6e1823175',
            ),
        ).not.toBeInTheDocument()

        isSessionImpersonatedMock.mockReturnValue(true)

        unmount()
        renderComponent()

        expect(
            screen.getByText(
                'Execution ID: 923665aa-5081-49b3-9cca-2ad6e1823175',
            ),
        ).toBeInTheDocument()
    })

    it('copies the draft to the editor and applies ticket actions', async () => {
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

        await user.click(
            screen.getByRole('button', {
                name: 'Copy message and actions',
            }),
        )

        expect(scrollIntoViewMock).toHaveBeenCalledWith(editorElement, {
            scrollMode: 'if-needed',
            behavior: 'smooth',
            block: 'nearest',
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentCopiedToEditor,
            {
                accountId: 1,
                banner: 'qa_failed',
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
        expect(applyMacro).toHaveBeenCalledWith(
            fromJS({
                actions: messageWithActions.draftMessage.ticketActions,
            }),
            1,
        )

        document.body.removeChild(editorElement)
    })

    it('copies the draft without scrolling when the editor is absent and skips empty ticket actions', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(
            screen.getByRole('button', {
                name: 'Copy message and actions',
            }),
        )

        expect(scrollIntoViewMock).not.toHaveBeenCalled()
        expect(applyMacroAction).toHaveBeenCalledWith(
            fromJS({
                arguments: {
                    body_html: 'test content',
                },
                name: ACTION_NAMES.SetResponseText,
                title: 'Set Response Text',
                type: MacroActionType.User,
            }),
        )
        expect(applyMacro).not.toHaveBeenCalled()
    })

    it('does not render the used-data section when the message has no id', () => {
        renderComponent({
            message: {
                ...defaultMessage,
                id: undefined as unknown as typeof defaultMessage.id,
            },
        })

        expect(screen.queryByText('Data Used')).not.toBeInTheDocument()
    })

    it('renders data used and passes plain ticket actions in order', () => {
        const ticketActions: MacroAction[] = [
            {
                name: ACTION_NAMES.SetStatus,
                title: 'Set status',
                type: MacroActionType.User,
                arguments: {
                    status: 'open',
                },
            },
            {
                name: ACTION_NAMES.AddTags,
                title: 'Add tags',
                type: MacroActionType.User,
                arguments: {
                    tags: 'vip',
                },
            },
        ]

        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            ...messageFeedback,
                            draftMessage: {
                                content: 'test content',
                                ticketActions,
                            },
                        },
                    ],
                },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAiAgentFeedback>)

        renderComponent({ isTrial: true })

        expect(screen.getByText('Data Used')).toBeInTheDocument()
        expect(screen.getByText('Action: setStatus')).toBeInTheDocument()
        expect(screen.getByText('Action: addTags')).toBeInTheDocument()
        expect(ticketReplyActionHelpdeskV2Mock).toHaveBeenCalledTimes(2)
        expect(aiAgentUsedDataHelpdeskV2Mock).toHaveBeenCalledWith(
            {
                messageFeedback: expect.objectContaining({
                    messageId: defaultMessage.id,
                }),
                messageId: defaultMessage.id,
            },
            expect.anything(),
        )
        expect(ticketReplyActionHelpdeskV2Mock.mock.calls[0][0]).toMatchObject({
            action: ticketActions[0],
        })
        expect(ticketReplyActionHelpdeskV2Mock.mock.calls[1][0]).toMatchObject({
            action: ticketActions[1],
        })
        expect(
            ticketReplyActionHelpdeskV2Mock.mock.calls[0][0],
        ).not.toHaveProperty('index')
        expect(
            ticketReplyActionHelpdeskV2Mock.mock.calls[0][0],
        ).not.toHaveProperty('ticketId')
        expect(
            ticketReplyActionHelpdeskV2Mock.mock.calls[0][0],
        ).not.toHaveProperty('disabled')
    })
})
