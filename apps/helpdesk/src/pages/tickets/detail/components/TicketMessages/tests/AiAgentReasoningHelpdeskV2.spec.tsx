import * as React from 'react'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import {
    AiAgentMessageType,
    useCanAccessAIFeedback,
    useFeedbackTracking,
    useReasoningTracking,
} from '@repo/ai-agent'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map } from 'immutable'
import { useLocation } from 'react-router-dom'

import { TicketMessageSourceType } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { useAiAgentReasoning } from 'pages/aiAgent/hooks/useAiAgentReasoning'
import { useIsEvoliTicket } from 'pages/tickets/detail/hooks/useIsEvoliTicket'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { useKnowledgeSourceSideBar } from '../../AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { AiAgentReasoningFeedback } from '../AiAgentReasoningFeedback'
import { AiAgentReasoningHelpdeskV2 } from '../AiAgentReasoningHelpdeskV2'
import { AiAgentReasoningContent } from '../AiReasoningContent'

const DisclosureContext = React.createContext<{
    isDisabled: boolean
    isExpanded: boolean
    onExpandedChange: (expanded: boolean) => void
}>({
    isDisabled: false,
    isExpanded: false,
    onExpandedChange: () => undefined,
})

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Button: ({
        children,
        isDisabled,
        onClick,
    }: {
        children: React.ReactNode
        isDisabled?: boolean
        onClick?: React.MouseEventHandler<HTMLButtonElement>
    }) => {
        const { act } = jest.requireActual('react-dom/test-utils')

        return (
            <button
                disabled={isDisabled}
                onClick={(event) => {
                    act(() => {
                        onClick?.(event)
                    })
                }}
                type="button"
            >
                {children}
            </button>
        )
    },
    Disclosure: ({
        children,
        isDisabled = false,
        isExpanded,
        onExpandedChange,
    }: {
        children: React.ReactNode
        isDisabled?: boolean
        isExpanded: boolean
        onExpandedChange: (expanded: boolean) => void
    }) => (
        <DisclosureContext.Provider
            value={{ isDisabled, isExpanded, onExpandedChange }}
        >
            <div data-testid="disclosure-root">{children}</div>
        </DisclosureContext.Provider>
    ),
    DisclosureHeader: ({
        title,
    }: {
        title:
            | React.ReactNode
            | ((params: { isExpanded: boolean }) => React.ReactNode)
    }) => {
        const { isDisabled, isExpanded, onExpandedChange } =
            React.useContext(DisclosureContext)
        const { act } = jest.requireActual('react-dom/test-utils')

        return (
            <button
                disabled={isDisabled}
                onClick={() => {
                    act(() => {
                        onExpandedChange(!isExpanded)
                    })
                }}
                type="button"
            >
                {typeof title === 'function' ? title({ isExpanded }) : title}
            </button>
        )
    },
    DisclosurePanel: ({ children }: { children?: React.ReactNode }) => {
        const { isExpanded } = React.useContext(DisclosureContext)

        return isExpanded ? (
            <div data-testid="disclosure-panel">{children}</div>
        ) : null
    },
    DropdownIcon: ({ isOpen }: { isOpen: boolean }) => (
        <span>{isOpen ? 'open' : 'closed'}</span>
    ),
    Icon: ({ name }: { name: string }) => <span>{name}</span>,
    Loader: () => <span aria-hidden="true">loader</span>,
    Text: ({ children }: { children?: React.ReactNode }) => (
        <span>{children}</span>
    ),
}))

jest.mock('@repo/activity-tracker/utils', () => ({
    isSessionImpersonated: jest.fn(),
}))

jest.mock('@repo/ai-agent', () => ({
    ...jest.requireActual('@repo/ai-agent'),
    useCanAccessAIFeedback: jest.fn(),
    useFeedbackTracking: jest.fn(),
    useReasoningTracking: jest.fn(),
}))

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/hooks/useAiAgentReasoning')
jest.mock('pages/tickets/detail/hooks/useIsEvoliTicket')
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)

jest.mock('../AiReasoningContent', () => ({
    AiAgentReasoningContent: jest.fn(() => <div>AiAgentReasoningContent</div>),
}))

jest.mock('../AiAgentReasoningFeedback', () => ({
    AiAgentReasoningFeedback: jest.fn(() => (
        <div>AiAgentReasoningFeedback</div>
    )),
}))

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseAiAgentReasoning = useAiAgentReasoning as jest.Mock
const mockUseIsEvoliTicket = useIsEvoliTicket as jest.Mock
const mockUseLocation = useLocation as jest.Mock
const mockUseCanAccessAIFeedback = useCanAccessAIFeedback as jest.Mock
const mockUseFeedbackTracking = useFeedbackTracking as jest.Mock
const mockUseReasoningTracking = useReasoningTracking as jest.Mock
const mockUseTicketInfobarNavigation = useTicketInfobarNavigation as jest.Mock
const mockUseKnowledgeSourceSideBar = useKnowledgeSourceSideBar as jest.Mock
const mockIsSessionImpersonated = isSessionImpersonated as jest.Mock
const mockAiAgentReasoningContent = AiAgentReasoningContent as jest.Mock
const mockAiAgentReasoningFeedback = AiAgentReasoningFeedback as jest.Mock

const ticket = Map({ id: 123 })
const account = Map({ id: 456 })
const currentUser = Map({ id: 789 })
const EVOLI_STATIC_MESSAGE =
    "Message powered by AI Agent's new brain (beta). Reasoning is not available for this ticket."

const refetch = jest.fn()
const onReasoningOpened = jest.fn()
const onFeedbackTabOpened = jest.fn()
const onKnowledgeResourceClick = jest.fn()
const onChangeTab = jest.fn()
const openPreview = jest.fn()
let ticketState = ticket

let reasoningState: {
    reasoningContent: string | null
    reasoningMetadata?: { data?: unknown[]; isLoading?: boolean }
    reasoningResources: unknown[]
    staticMessage?: string
    storeConfiguration?: { executionId?: string; shopName?: string } | null
    refetch: jest.Mock
}

const createMessage = (overrides: Partial<TicketMessage> = {}): TicketMessage =>
    ({
        id: 10,
        created_datetime: '2025-06-01T10:00:00Z',
        meta: {},
        sender: {
            id: 1,
            email: 'bot@658d6f54fbff9b7c6f2d0321',
            name: 'AI Agent',
        },
        ...overrides,
    }) as TicketMessage

function renderComponent(message: TicketMessage = createMessage()) {
    return render(<AiAgentReasoningHelpdeskV2 message={message} />)
}

describe('AiAgentReasoningHelpdeskV2', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        reasoningState = {
            reasoningContent: null,
            reasoningMetadata: {
                data: [{ id: 'resource-1' }],
                isLoading: false,
            },
            reasoningResources: [{ resourceId: 'resource-1' }],
            staticMessage: undefined,
            storeConfiguration: { executionId: 'exec-123', shopName: 'acme' },
            refetch,
        }
        ticketState = ticket

        mockUseAppSelector.mockImplementation((selector: unknown) => {
            if (selector === getTicketState) {
                return ticketState
            }

            if (selector === getCurrentAccountState) {
                return account
            }

            return currentUser
        })
        mockUseAiAgentReasoning.mockImplementation(() => reasoningState)
        mockUseIsEvoliTicket.mockReturnValue(false)
        mockUseLocation.mockReturnValue({
            search: '',
        })
        mockUseCanAccessAIFeedback.mockReturnValue(true)
        mockUseFeedbackTracking.mockReturnValue({
            onFeedbackTabOpened,
            onKnowledgeResourceClick,
        })
        mockUseReasoningTracking.mockReturnValue({
            onReasoningOpened,
        })
        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: 'overview',
            onChangeTab,
        })
        mockUseKnowledgeSourceSideBar.mockReturnValue({
            openPreview,
        })
        mockIsSessionImpersonated.mockReturnValue(false)
    })

    it('renders the evoli static state immediately', async () => {
        mockUseIsEvoliTicket.mockReturnValue(true)

        renderComponent()

        expect(
            await screen.findByText(EVOLI_STATIC_MESSAGE),
        ).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(mockUseAiAgentReasoning).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
                isHandover: false,
                messageId: '10',
                objectId: '123',
                objectType: 'TICKET',
            }),
        )
    })

    it('renders post-cutoff evoli tickets as expandable reasoning', async () => {
        const user = userEvent.setup()
        mockUseIsEvoliTicket.mockReturnValue(true)

        renderComponent(
            createMessage({
                created_datetime: '2999-01-01T00:00:00Z',
            }),
        )

        expect(screen.queryByText(EVOLI_STATIC_MESSAGE)).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show reasoning/i }),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        expect(mockUseAiAgentReasoning).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
        )
    })

    it('renders a static message returned by the reasoning hook', async () => {
        reasoningState = {
            ...reasoningState,
            reasoningContent: '',
            staticMessage:
                'AI Agent was not confident in its answer and handed the ticket over to your team.',
        }

        renderComponent()

        expect(
            await screen.findByText(
                'AI Agent was not confident in its answer and handed the ticket over to your team.',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('Show reasoning')).not.toBeInTheDocument()
    })

    it('starts collapsed and enters loading when expanded', async () => {
        const user = userEvent.setup()

        renderComponent()

        expect(
            screen.getByRole('button', { name: /show reasoning/i }),
        ).toBeInTheDocument()
        expect(mockUseAiAgentReasoning).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        expect(onReasoningOpened).toHaveBeenCalled()
        expect(
            screen.getByRole('button', {
                name: /loading ai agent reasoning/i,
            }),
        ).toBeDisabled()
        expect(mockUseAiAgentReasoning).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
        )
    })

    it('keeps reasoning disabled when the message id is missing', async () => {
        const user = userEvent.setup()

        renderComponent(
            createMessage({
                id: undefined as unknown as TicketMessage['id'],
            }),
        )

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        expect(mockUseAiAgentReasoning).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
                messageId: '0',
                objectId: '123',
            }),
        )
    })

    it('expands the panel, renders feedback content, and collapses again', async () => {
        const user = userEvent.setup()
        const message = createMessage()
        const { rerender } = renderComponent(message)

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        reasoningState = {
            ...reasoningState,
            reasoningContent: 'Reasoning body',
        }

        rerender(<AiAgentReasoningHelpdeskV2 message={message} />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /hide reasoning/i }),
            ).toBeInTheDocument()
        })

        expect(screen.getByTestId('disclosure-panel')).toBeInTheDocument()
        expect(screen.getByText('AiAgentReasoningContent')).toBeInTheDocument()
        expect(screen.getByText('AiAgentReasoningFeedback')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /give feedback/i }),
        ).toBeInTheDocument()
        expect(mockAiAgentReasoningContent).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [{ id: 'resource-1' }],
                onKnowledgeResourceClick,
                openPreview,
                reasoningContent: 'Reasoning body',
                reasoningResources: [{ resourceId: 'resource-1' }],
                referenceDatetime: message.created_datetime,
                storeConfiguration: {
                    executionId: 'exec-123',
                    shopName: 'acme',
                },
                ticketId: 123,
            }),
            expect.anything(),
        )
        expect(mockAiAgentReasoningFeedback).toHaveBeenCalledWith(
            expect.objectContaining({
                accountId: 456,
                executionId: 'exec-123',
                messageId: 10,
                ticketId: 123,
                userId: 789,
            }),
            expect.anything(),
        )

        await user.click(
            screen.getByRole('button', { name: /hide reasoning/i }),
        )

        expect(
            screen.getByRole('button', { name: /show reasoning/i }),
        ).toBeInTheDocument()
        expect(screen.queryByTestId('disclosure-panel')).not.toBeInTheDocument()
    })

    it('opens the AI feedback tab from the panel action', async () => {
        const user = userEvent.setup()
        const { rerender } = renderComponent()

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        reasoningState = {
            ...reasoningState,
            reasoningContent: 'Reasoning body',
        }

        rerender(<AiAgentReasoningHelpdeskV2 message={createMessage()} />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /give feedback/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /give feedback/i }))

        expect(onFeedbackTabOpened).toHaveBeenCalledWith(
            'give-feedback-buton-from-reasoning',
        )
        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('disables the give feedback button when the AI feedback tab is already active', async () => {
        const user = userEvent.setup()
        mockUseTicketInfobarNavigation.mockReturnValue({
            activeTab: TicketInfobarTab.AIFeedback,
            onChangeTab,
        })
        const { rerender } = renderComponent()

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        reasoningState = {
            ...reasoningState,
            reasoningContent: 'Reasoning body',
        }

        rerender(<AiAgentReasoningHelpdeskV2 message={createMessage()} />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /give feedback/i }),
            ).toBeDisabled()
        })
    })

    it('shows the execution id when explicitly requested and hides feedback affordances when access is missing', async () => {
        const user = userEvent.setup()
        mockUseCanAccessAIFeedback.mockReturnValue(false)
        mockUseLocation.mockReturnValue({
            search: '?showAiAgentExecutionIds=true',
        })
        const { rerender } = renderComponent()

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        reasoningState = {
            ...reasoningState,
            reasoningContent: 'Reasoning body',
        }

        rerender(<AiAgentReasoningHelpdeskV2 message={createMessage()} />)

        await waitFor(() => {
            expect(
                screen.getByText('Execution ID: exec-123'),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByText('AiAgentReasoningFeedback'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /give feedback/i }),
        ).not.toBeInTheDocument()
    })

    it('shows the execution id while impersonating', async () => {
        const user = userEvent.setup()
        mockIsSessionImpersonated.mockReturnValue(true)
        const { rerender } = renderComponent()

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        reasoningState = {
            ...reasoningState,
            reasoningContent: 'Reasoning body',
        }

        rerender(<AiAgentReasoningHelpdeskV2 message={createMessage()} />)

        expect(
            await screen.findByText('Execution ID: exec-123'),
        ).toBeInTheDocument()
    })

    it('shows the error state and retries the reasoning request', async () => {
        const user = userEvent.setup()
        const message = createMessage()
        const { rerender } = renderComponent(message)

        await user.click(
            screen.getByRole('button', { name: /show reasoning/i }),
        )

        reasoningState = {
            ...reasoningState,
            reasoningContent: '',
            reasoningMetadata: {
                data: [],
                isLoading: false,
            },
        }

        rerender(<AiAgentReasoningHelpdeskV2 message={message} />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: /couldn't load reasoning\. please try again\./i,
                }),
            ).toBeDisabled()
        })
        expect(
            screen.getByRole('button', { name: /^try again$/i }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /^try again$/i }))

        expect(refetch).toHaveBeenCalled()
    })

    it('passes handover messages through to the reasoning hook', () => {
        renderComponent(
            createMessage({
                meta: {
                    ai_agent_message_type: AiAgentMessageType.HANDOVER_TO_AGENT,
                } as unknown as TicketMessage['meta'],
            }),
        )

        expect(mockUseAiAgentReasoning).toHaveBeenCalledWith(
            expect.objectContaining({
                isHandover: true,
            }),
        )
    })

    it('does not crash when the ticket store is briefly cleared during navigation', () => {
        const message = createMessage()
        const { rerender } = renderComponent(message)

        ticketState = Map()

        expect(() => {
            rerender(<AiAgentReasoningHelpdeskV2 message={message} />)
        }).not.toThrow()
        expect(mockUseAiAgentReasoning).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
                objectId: '',
            }),
        )
    })

    describe('Internal note messages', () => {
        it('returns null when message is an internal note with no reasoning content', () => {
            reasoningState = {
                ...reasoningState,
                reasoningContent: null,
            }

            const { container } = renderComponent(
                createMessage({
                    source: { type: TicketMessageSourceType.InternalNote },
                }),
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('returns null when message is an internal note with empty reasoning', () => {
            reasoningState = {
                ...reasoningState,
                reasoningContent: '',
            }

            const { container } = renderComponent(
                createMessage({
                    source: { type: TicketMessageSourceType.InternalNote },
                }),
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('renders the reasoning toggle when an internal note has reasoning content', () => {
            reasoningState = {
                ...reasoningState,
                reasoningContent: 'Some reasoning text',
            }

            renderComponent(
                createMessage({
                    source: { type: TicketMessageSourceType.InternalNote },
                }),
            )

            expect(
                screen.getByRole('button', { name: /show reasoning/i }),
            ).toBeInTheDocument()
        })

        it('eagerly enables the reasoning query for internal notes without user interaction', () => {
            renderComponent(
                createMessage({
                    source: { type: TicketMessageSourceType.InternalNote },
                }),
            )

            expect(mockUseAiAgentReasoning).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                    messageId: '10',
                    objectId: '123',
                }),
            )
        })

        it('does not eagerly enable the reasoning query for non-internal-note messages', () => {
            renderComponent()

            expect(mockUseAiAgentReasoning).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })
    })

    it('defaults tracking ids to zero when account and user stores are briefly unavailable', () => {
        mockUseAppSelector.mockImplementation((selector: unknown) => {
            if (selector === getTicketState) {
                return Map()
            }

            if (selector === getCurrentAccountState) {
                return Map()
            }

            return Map()
        })

        renderComponent()

        expect(mockUseFeedbackTracking).toHaveBeenLastCalledWith({
            accountId: 0,
            ticketId: 0,
            userId: 0,
        })
        expect(mockUseReasoningTracking).toHaveBeenLastCalledWith({
            accountId: 0,
            messageId: 10,
            ticketId: 0,
            userId: 0,
        })
    })
})
