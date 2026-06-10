import React from 'react'

import type { FeatureFlagKey } from '@repo/feature-flags'
import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { useHistory } from 'react-router-dom'
import type { AnyAction, Middleware } from 'redux'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import {
    mockCursorPaginationMeta,
    mockGetTicketHandler,
    mockListMacrosHandler,
    mockListMacrosResponse,
    mockTicket,
    mockTicketMessage,
    mockTicketReplyOption,
} from '@gorgias/helpdesk-mocks'
import { useAgentActivity } from '@gorgias/realtime'

import { TicketMessageSourceType } from 'business/types/ticket'
import { UserRole } from 'config/types/user'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { ticket as ticketFixture } from 'fixtures/ticket'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import * as voiceCallQueries from 'models/voiceCall/queries'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import ticketReplyCache from 'state/newMessage/ticketReplyCache'
import rootReducer from 'state/reducers'
import type { StoreState } from 'state/types'

import TicketDetailContainer from '../TicketDetailContainer'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useIsMobileResolution: jest.fn(() => false),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
    reportError: jest.fn(),
}))

jest.mock('@repo/ticket-thread', () => ({
    ...jest.requireActual('@repo/ticket-thread'),
    useRealtimeTicketUpdates: jest.fn(() => ({
        handleTicketUpdateEvents: jest.fn(),
    })),
}))

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useLiveTicketTranslationsUpdates: jest.fn(() => ({
        handleTicketMessageTranslationEvents: jest.fn(),
    })),
    useTicketFieldsValidation: jest.fn(() => ({
        validateTicketFields: jest.fn(() => ({
            hasErrors: false,
            invalidFieldIds: [],
        })),
        isValidating: false,
    })),
}))

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn(() => false),
    useHelpdeskV2MS3Flag: jest.fn(() => false),
}))

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        bind: jest.fn(),
        clear: jest.fn(),
        denylist: jest.fn(),
        getActionKeys: jest.fn(() => []),
        pause: jest.fn(),
        trigger: jest.fn(),
        triggerAction: jest.fn(),
        unbind: jest.fn(),
        unpause: jest.fn(),
    },
}))

jest.mock('@gorgias/realtime', () => ({
    useAgentActivity: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('hooks/useRecentItems/useRecentItems', () => () => ({
    setRecentItem: jest.fn(),
}))

jest.mock('models/voiceCall/queries', () => ({
    ...jest.requireActual('models/voiceCall/queries'),
    useListVoiceCalls: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/whatsapp/useWhatsAppEditor',
    () => jest.fn(() => ({ showWhatsAppTemplateEditor: false })),
)

jest.mock('pages/tickets/detail/components/TicketBody', () => () => (
    <div data-testid="ticket-body" />
))

jest.mock(
    'pages/tickets/detail/components/TicketHeaderWrapper/TicketHeaderWrapper',
    () => ({
        __esModule: true,
        default: function TicketHeaderWrapperMock() {
            const ticketId = useAppSelector((state) => state.ticket.get('id'))

            return <div data-testid={`ticket-page-${ticketId}`} />
        },
    }),
)

jest.mock('pages/tickets/detail/components/TicketThread/TicketThread', () => ({
    TicketThread: () => <div data-testid="ticket-thread" />,
}))

jest.mock(
    'pages/tickets/detail/components/TicketThread/TicketThreadLegacyBridge',
    () => ({
        TicketThreadLegacyBridge: ({
            children,
        }: {
            children?: React.ReactNode
        }) => <>{children}</>,
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider',
    () => ({
        KnowledgeSourceSideBarProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => <>{children}</>,
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper',
    () => () => null,
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(() => ({ mode: null })),
    }),
)

jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket',
    () => jest.fn(() => ({ goToTicket: jest.fn(), isEnabled: false })),
)

jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket',
    () => jest.fn(() => ({ goToTicket: jest.fn(), isEnabled: false })),
)

jest.mock('pages/tickets/detail/hooks/useTicketActivityTracking', () =>
    jest.fn(),
)

jest.mock('pages/tickets/detail/hooks/useDraftTicketActivityTracking', () =>
    jest.fn(),
)

jest.mock('pages/tickets/detail/hooks/useTicketFieldsCheck', () => ({
    useTicketFieldsCheck: jest.fn(() => ({
        checkTicketFieldErrors: jest.fn(() => false),
    })),
}))

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

jest.mock('providers/OutboundTranslationProvider')
jest.mock('providers/standalone-ai/StandaloneAiContext')
jest.mock('services/socketManager/socketManager', () => ({
    __esModule: true,
    default: {
        join: jest.fn(),
        leave: jest.fn(),
        send: jest.fn(),
    },
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseIsMobileResolution = useIsMobileResolution as jest.Mock
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockUseAiAgentAccess = useAiAgentAccess as jest.Mock
const mockUseListVoiceCalls = voiceCallQueries.useListVoiceCalls as jest.Mock
const mockUseOutboundTranslationContext =
    useOutboundTranslationContext as jest.Mock
const mockUseStandaloneAiContext = useStandaloneAiContext as jest.Mock

const FIRST_TICKET_ID = '123'
const SECOND_TICKET_ID = '456'
const TICKET_PATH = '/app/ticket/:ticketId'

type MockTicketOverrides = NonNullable<Parameters<typeof mockTicket>[0]>
type MockTicketMessageOverrides = NonNullable<
    Parameters<typeof mockTicketMessage>[0]
>

const makeTicket = (id: string) =>
    mockTicket({
        ...ticketFixture,
        id: Number(id),
        uri: `/api/tickets/${id}/`,
        subject: `Ticket ${id}`,
        meta: {
            ...ticketFixture.meta,
            response_channel: TicketMessageSourceType.Email,
        },
        satisfaction_survey: null,
        custom_fields: {},
        reply_options: {
            email: mockTicketReplyOption({
                answerable: true,
                reason: null,
            }),
            'internal-note': mockTicketReplyOption({
                answerable: true,
                reason: null,
            }),
        },
        messages: ticketFixture.messages.map((message, index) =>
            mockTicketMessage({
                ...message,
                id: Number(`${id}${index}`),
                ticket_id: Number(id),
                source: {
                    ...('source' in message ? message.source : {}),
                    cc: [],
                },
            } as MockTicketMessageOverrides),
        ),
    } as unknown as MockTicketOverrides)

const mockGetTicket = mockGetTicketHandler(async ({ params, request }) => {
    const ticketId =
        typeof params?.id === 'string'
            ? params.id
            : new URL(request.url).pathname.split('/').at(-2)

    if (!ticketId) {
        throw new Error(`Unable to infer ticket id from ${request.url}`)
    }

    return HttpResponse.json(makeTicket(ticketId))
})

const mockListMacros = mockListMacrosHandler(async () =>
    HttpResponse.json(
        mockListMacrosResponse({
            data: [],
            meta: mockCursorPaginationMeta(),
        }),
    ),
)

const mockDraftEditorPluginProbe = http.get('/POST', () =>
    HttpResponse.text(''),
)

const server = setupServer()

const makeStore = () => {
    const initialState = rootReducer(undefined, {
        type: '@@INIT',
    } as AnyAction)

    return createStore(
        rootReducer,
        {
            ...initialState,
            currentUser: initialState.currentUser.mergeDeep({
                id: 1,
                email: 'agent@gorgias.com',
                role: { name: UserRole.Admin },
                settings: [
                    {
                        type: 'preferences',
                        data: {
                            hide_tips: true,
                            show_macros: false,
                            show_macros_suggestions: false,
                        },
                    },
                ],
            }),
            integrations: initialState.integrations.mergeDeep({
                integrations: [],
            }),
        } as StoreState,
        applyMiddleware(thunk as Middleware),
    )
}

function NavigationControls() {
    const routerHistory = useHistory()

    const navigateToTicket = (ticketId: string) => {
        const path = `/app/ticket/${ticketId}`
        window.history.pushState({}, '', path)
        routerHistory.push(path)
    }

    return (
        <>
            <button
                type="button"
                onClick={() => navigateToTicket(SECOND_TICKET_ID)}
            >
                Open ticket 456
            </button>
            <button
                type="button"
                onClick={() => navigateToTicket(FIRST_TICKET_ID)}
            >
                Open ticket 123
            </button>
        </>
    )
}

const renderTicketDetail = () => {
    const store = makeStore()

    window.history.pushState({}, '', `/app/ticket/${FIRST_TICKET_ID}`)

    const view = render<StoreState>(
        <>
            <NavigationControls />
            <TicketDetailContainer />
        </>,
        {
            initialEntries: [`/app/ticket/${FIRST_TICKET_ID}`],
            path: TICKET_PATH,
            storeState: store.getState(),
            wrapper: createStoreProvider(store),
        },
    )

    return { ...view, store }
}

const createStoreProvider =
    (store: ReturnType<typeof makeStore>) =>
    ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )

const getReplyEditor = () =>
    document.querySelector(
        '[data-name="reply-composer"] [contenteditable="true"]',
    ) as HTMLElement

const findReplyEditor = async () => {
    await waitFor(() => expect(getReplyEditor()).toBeInTheDocument())
    return getReplyEditor()
}

const writeReplyDraft = async (text: string, user: UserEvent) => {
    const editor = await findReplyEditor()

    await act(async () => {
        await user.click(editor)
        fireEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => text,
            },
        })
    })

    await waitFor(() => {
        expect(getReplyEditor()).toHaveTextContent(text)
    })
}

const waitForReplyDraftAutosave = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
    })
}

describe('Ticket detail reply drafts', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockGetTicket.handler,
            mockListMacros.handler,
            mockDraftEditorPluginProbe,
        )

        mockUseFlag.mockImplementation(
            (_flag: FeatureFlagKey, fallback?: unknown) => fallback ?? false,
        )
        mockUseIsMobileResolution.mockReturnValue(false)
        mockUseAgentActivity.mockReturnValue({
            joinTicket: jest.fn(),
            leaveTicket: jest.fn(),
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseListVoiceCalls.mockReturnValue({
            data: undefined,
            isLoading: false,
        })
        mockUseOutboundTranslationContext.mockReturnValue({
            ticketIdToDraftIdMap: new Map(),
            translationCache: new Map(),
            getTranslationFromCache: jest.fn(),
            registerTranslationDraft: jest.fn(),
            getCurrentDraftId: jest.fn(),
            isTranslationPending: false,
        })
        mockUseStandaloneAiContext.mockReturnValue(
            createMockStandaloneAiAccess(),
        )

        ticketReplyCache.delete(FIRST_TICKET_ID)
        ticketReplyCache.delete(SECOND_TICKET_ID)
    })

    afterEach(() => {
        server.resetHandlers()
        ticketReplyCache.delete(FIRST_TICKET_ID)
        ticketReplyCache.delete(SECOND_TICKET_ID)
        window.history.pushState({}, '', '/')
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    it('keeps reply draft content scoped to each ticket while navigating between tickets', async () => {
        const firstTicketDraft = 'first ticket scoped reply draft'
        const secondTicketDraft = 'second ticket scoped reply draft'
        const { user } = renderTicketDetail()

        await screen.findByTestId(`ticket-page-${FIRST_TICKET_ID}`)

        await writeReplyDraft(firstTicketDraft, user)
        await waitForReplyDraftAutosave()

        await user.click(
            screen.getByRole('button', { name: 'Open ticket 456' }),
        )

        await screen.findByTestId(`ticket-page-${SECOND_TICKET_ID}`)
        await waitFor(() => {
            expect(getReplyEditor()).not.toHaveTextContent(firstTicketDraft)
        })

        await writeReplyDraft(secondTicketDraft, user)
        await waitForReplyDraftAutosave()

        await user.click(
            screen.getByRole('button', { name: 'Open ticket 123' }),
        )

        await screen.findByTestId(`ticket-page-${FIRST_TICKET_ID}`)
        await waitFor(() => {
            expect(getReplyEditor()).toHaveTextContent(firstTicketDraft)
            expect(getReplyEditor()).not.toHaveTextContent(secondTicketDraft)
        })
    })
})
