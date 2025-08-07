import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import _omit from 'lodash/omit'
import moment from 'moment'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockGetCurrentUserHandler,
    mockListTicketTranslationsHandler,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import { TicketPriority } from '@gorgias/helpdesk-types'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import shortcutManager from 'services/shortcutManager'
import * as notificationsActions from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import * as ticketActions from 'state/ticket/actions'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { makeExecuteKeyboardAction } from 'utils/testing'

import Snooze from '../Snooze'
import TicketHeader from '../TicketHeader'
import useIsTicketNavigationAvailable from '../TicketNavigation/hooks/useIsTicketNavigationAvailable'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useElementSize: jest.fn().mockImplementation(() => [0, 160]),
}))

// Mock useTextWidth to avoid Canvas API issues in tests
jest.mock('@repo/hooks', () => {
    const actual = jest.requireActual('@repo/hooks')
    return {
        ...actual,
        useTextWidth: (text: string, options: any = {}) => {
            // Simple mock that returns a basic width calculation
            const baseWidth = text ? text.length * 8 : 0
            return baseWidth + (options.padding || 0)
        },
    }
})

jest.mock(
    'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee',
    () => () => <div>TicketAssigneeMock</div>,
)

jest.mock('services/shortcutManager')

jest.mock('../TicketDetails/TicketTags', () => () => 'TicketTagsMock')

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

jest.mock('state/ticket/actions', () => ({
    addTag: jest.fn(),
    clearTicket: jest.fn(),
    displayAuditLogEvents: jest.fn(),
    goToNextTicket: jest.fn(async (_ticketId, promise: Promise<any>) => {
        await Promise.resolve(promise)
    }),
    hideAuditLogEvents: jest.fn(),
    removeTag: jest.fn(),
    setAgent: jest.fn(),
    setSpam: jest.fn(),
    setStatus: jest.fn(),
    setSubject: jest.fn(() => () => Promise.resolve()),
    setTeam: jest.fn(),
    setTrashed: jest.fn(),
    snoozeTicket: jest.fn((_datime, callback?: () => void) => {
        callback?.()
    }),
    ticketPartialUpdate: jest.fn(() => () => Promise.resolve()),
    isTicketNavigationAvailable: jest.fn(),
}))

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')

    return {
        ...reactstrap,
        Popover: (props: Record<string, any>) => {
            return props.isOpen ? <div {...props}>{props.children}</div> : null
        },
    }
})

jest.mock('common/segment')

const mockMoment = moment

jest.mock('../Snooze', () => ({ onUpdate }: ComponentProps<typeof Snooze>) => (
    <div onClick={() => onUpdate(mockMoment())}>Snooze</div>
))

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>
const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

// mock Date object
const DATE_TO_USE = new Date('2017')
jest.spyOn(Date, 'now').mockImplementation(() => DATE_TO_USE.getTime())

const mockStore = configureMockStore([thunk])

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView', () =>
    jest.fn().mockReturnValue([true]),
)

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('../TicketHeaderToggle', () => ({
    TicketHeaderToggle: () => null,
}))

jest.mock('../TicketNavigation/hooks/useIsTicketNavigationAvailable')
const mockUseIsTicketNavigationAvailable =
    useIsTicketNavigationAvailable as jest.Mock

const useParamsMock = useParams as jest.Mock

jest.mock('core/flags')
const useFlagMock = useFlag as jest.Mock

const mockedQueryClient = mockQueryClient()

// MSW server setup for translation testing
const server = setupServer()

const preferences = {
    id: 1,
    type: 'preferences',
    data: {
        available: true,
        date_format: 'en_GB',
        time_format: '24-hour',
        prefill_best_macro: false,
        show_macros: false,
        show_macros_suggestions: true,
        'language-preferences': {
            primary: 'en',
            proficient: [],
        },
    },
}

const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [preferences],
    } as any),
)
const mockListTicketTranslations = mockListTicketTranslationsHandler()

const localHandlers = [
    mockGetCurrentUser.handler,
    mockListTicketTranslations.handler,
]

server.use(...localHandlers)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('<TicketHeader />', () => {
    const defaultStore: Partial<RootState> = {
        currentUser: fromJS(user),
        ticket: fromJS(_omit(ticket, 'id')),
    }

    const minProps = {
        className: '',
        ticket: fromJS(_omit(ticket, 'id')),
        hideTicket: () => Promise.resolve(),
        setStatus: jest.fn(),
    }

    let dispatch: jest.Mock
    const useAppDispatchMock = useAppDispatch as jest.Mock

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        mockUseIsTicketNavigationAvailable.mockReturnValue(false)
        useParamsMock.mockReturnValue({})
        mockUseFlagForFeature(FeatureFlagKey.TicketAllowPriorityUsage, false)
        mockUseFlagForFeature(FeatureFlagKey.AITicketSummary, false)
    })

    const mockUseFlagForFeature = (
        flagKey: FeatureFlagKey,
        returnValue: boolean,
    ) => {
        useFlagMock.mockImplementation(
            (key: FeatureFlagKey, defaultValue: boolean) => {
                if (key === flagKey) return returnValue
                return defaultValue
            },
        )
    }

    it('should render new ticket', () => {
        const { container } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} />
                </Provider>
            </QueryClientProvider>,
        )

        const actions = container.querySelector('[class*="actions"]')!

        expect(actions.children).toHaveLength(0)
        expect(screen.queryByText('Snooze')).not.toBeInTheDocument()
    })

    it('should render existing ticket', () => {
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)
        render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: fromJS(ticket),
                    })}
                >
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('keyboard_arrow_left')).toBeInTheDocument()
        expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
        expect(screen.getByText('Snooze')).toBeInTheDocument()
        expect(screen.getByText('more_vert')).toBeInTheDocument()
    })

    it('should render spam ticket', () => {
        const spamTicket = fromJS({ ...ticket, spam: true })
        render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: spamTicket,
                    })}
                >
                    <TicketHeader {...minProps} ticket={spamTicket} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('flag')).toBeInTheDocument()
    })

    it('should render trashed ticket', () => {
        const trashedTicket = fromJS({ ...ticket, trashed_datetime: true })
        render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: trashedTicket,
                    })}
                >
                    <TicketHeader {...minProps} ticket={trashedTicket} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('delete')).toBeInTheDocument()
    })

    it('should mark a ticket as unread when clicking "Mark as unread" button', async () => {
        const readTicket = fromJS({ ...ticket, is_unread: false })
        const mockOnToggleUnread = jest.fn()

        const { getByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: readTicket,
                    })}
                >
                    <TicketHeader
                        {...minProps}
                        ticket={readTicket}
                        onToggleUnread={mockOnToggleUnread}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Mark as unread/))
        await waitFor(() => {
            expect(ticketActions.ticketPartialUpdate).toHaveBeenNthCalledWith(
                1,
                {
                    is_unread: true,
                },
            )
            expect(mockOnToggleUnread).toHaveBeenCalledWith(ticket.id, true)
            return expect(notificationsActions.notify).toHaveBeenNthCalledWith(
                1,
                {
                    message: 'Ticket has been marked as unread',
                    status: NotificationStatus.Success,
                },
            )
        })
    })

    it('should display the delete action for lead and admin agents', () => {
        const { getByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(getByText(/more_vert/))
        expect(getByText(/Delete/)).toBeTruthy()
    })

    it('should not display the delete action for basic, lite and observer agents', () => {
        const { getByText, queryByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        currentUser: fromJS({
                            ...user,
                            role: {
                                name: UserRole.LiteAgent,
                            },
                        }),
                    })}
                >
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(getByText(/more_vert/))

        expect(queryByText(/Delete/)).toBeFalsy()
    })

    it('should not register the shortcut of the delete action for basic, lite and observer agents', () => {
        const { queryByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        currentUser: fromJS({
                            ...user,
                            role: {
                                name: UserRole.LiteAgent,
                            },
                        }),
                    })}
                >
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'TicketDetailContainer',
        )('DELETE_TICKET')

        expect(queryByText(/You are about to /)).toBeFalsy()
    })

    it('should log segment event', () => {
        jest.useFakeTimers()

        const { getByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: fromJS(ticket),
                    })}
                >
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )
        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Print ticket/))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.PrintTicketClicked)

        jest.runAllTimers()
    })

    it('should open the print page', () => {
        jest.useFakeTimers()

        const { getByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: fromJS(ticket),
                    })}
                >
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )
        fireEvent.click(getByText(/more_vert/))
        fireEvent.click(getByText(/Print ticket/))

        jest.runAllTimers()
        expect(window.open).toHaveBeenCalledWith(
            `/app/ticket/${ticket.id}/print`,
        )
    })

    it('should clear ticket and go to next ticket on ticket snooze', async () => {
        const { getByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(getByText(/Snooze/))

        expect(ticketActions.snoozeTicket).toHaveBeenCalled()
        await waitFor(() =>
            expect(ticketActions.clearTicket).toHaveBeenCalled(),
        )
    })

    it('should render AI ticket summary popover when enableAITicketSummary feature flag is enabled', () => {
        mockUseFlagForFeature(FeatureFlagKey.TicketAllowPriorityUsage, false)
        mockUseFlagForFeature(FeatureFlagKey.AITicketSummary, true)

        const { getByText } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(getByText('Summarize')).toBeInTheDocument()
    })

    it('should not render AI ticket summary popover when enableAITicketSummary feature flag is disabled', () => {
        render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.queryByText('Summarize')).not.toBeInTheDocument()
    })

    it('should render priority dropdown when feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader
                        {...minProps}
                        ticket={fromJS({
                            ...ticket,
                            priority: TicketPriority.Critical,
                        })}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText(/critical/i)).toBeInTheDocument()
    })

    it('should not render AI ticket summary popover when enableAITicketSummary feature flag is disabled', () => {
        render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader
                        {...minProps}
                        ticket={fromJS({
                            ...ticket,
                            priority: TicketPriority.Critical,
                        })}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.queryByText(/critical/i)).not.toBeInTheDocument()
    })

    it('should render elements in correct order when setPriorityFlagEnabled is true', () => {
        const existingTicket = fromJS({
            ...ticket,
            priority: TicketPriority.Normal,
        })
        mockUseFlagForFeature(FeatureFlagKey.TicketAllowPriorityUsage, true)
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)

        const { container } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: existingTicket,
                    })}
                >
                    <TicketHeader {...minProps} ticket={existingTicket} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText(/normal/i)).toBeInTheDocument()

        const actions = container.querySelector('[class*="actions"]')!
        const navigationButtons = container.querySelector(
            '[class*="arrowPaginationWrapper"]',
        )!

        expect(actions.children[actions.children.length - 1]).toBe(
            navigationButtons,
        )
    })

    it('should render elements in correct order when setPriorityFlagEnabled is false', () => {
        const existingTicket = fromJS({
            ...ticket,
            priority: TicketPriority.Normal,
        })
        mockUseFlagForFeature(FeatureFlagKey.TicketAllowPriorityUsage, false)
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)

        const { container } = render(
            <QueryClientProvider client={mockedQueryClient}>
                <Provider
                    store={mockStore({
                        ...defaultStore,
                        ticket: existingTicket,
                    })}
                >
                    <TicketHeader {...minProps} ticket={existingTicket} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.queryByText(/normal/i)).not.toBeInTheDocument()

        const actions = container.querySelector('[class*="actions"]')!
        const ellipsisButton = container.querySelector(
            '[id="ticket-actions-button"]',
        )!

        expect(actions.children[actions.children.length - 1]).toBe(
            ellipsisButton,
        )
    })

    describe('Translation handling', () => {
        const ticketWithTranslation = fromJS({
            ...ticket,
            subject: 'Original English Subject',
        })

        beforeEach(() => {
            // Enable MessagesTranslations feature flag for translation tests
            mockUseFlagForFeature(FeatureFlagKey.MessagesTranslations, true)
        })

        it('should display translated subject when translation is available', async () => {
            const mockTranslation = mockTicketTranslationCompact({
                subject: 'Translated Subject in French',
                excerpt: 'Translated excerpt',
                ticket_id: ticket.id,
                ticket_translation_id: `${ticket.id}-translation`,
            })

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation],
                    }),
            )
            server.use(handler)

            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue('Translated Subject in French'),
                ).toBeInTheDocument()
            })
        })

        it('should display original subject when no translation is available', async () => {
            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue('Original English Subject'),
                ).toBeInTheDocument()
            })
        })

        it('should show translate icon when translation is available', async () => {
            const mockTranslation = mockTicketTranslationCompact({
                subject: 'Translated Subject',
                excerpt: 'Translated excerpt',
                ticket_id: ticket.id,
                ticket_translation_id: `${ticket.id}-translation`,
            })

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation],
                    }),
            )
            server.use(handler)

            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(screen.getByText('translate')).toBeInTheDocument()
            })
        })

        it('should not show translate icon when no translation is available', async () => {
            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(screen.queryByText('translate')).not.toBeInTheDocument()
            })
        })

        it('should show original subject in tooltip when hovering over translate icon', async () => {
            const mockTranslation = mockTicketTranslationCompact({
                subject: 'Translated Subject',
                excerpt: 'Translated excerpt',
                ticket_id: ticket.id,
                ticket_translation_id: `${ticket.id}-translation`,
            })

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation],
                    }),
            )
            server.use(handler)

            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(screen.getByText('translate')).toBeInTheDocument()
            })

            const translateIcon = screen.getByText('translate')
            fireEvent.mouseEnter(translateIcon)

            await waitFor(() => {
                expect(
                    screen.getByText('Original English Subject'),
                ).toBeInTheDocument()
            })
        })

        it('should handle empty translation response gracefully', async () => {
            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [],
                    }),
            )
            server.use(handler)

            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue('Original English Subject'),
                ).toBeInTheDocument()
                expect(screen.queryByText('translate')).not.toBeInTheDocument()
            })
        })

        it('should handle API errors gracefully', async () => {
            const { handler } = mockListTicketTranslationsHandler(
                async () => new HttpResponse(null, { status: 500 }),
            )
            server.use(handler)

            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue('Original English Subject'),
                ).toBeInTheDocument()
                expect(screen.queryByText('translate')).not.toBeInTheDocument()
            })
        })
    })

    describe('EditableTitle Integration', () => {
        it('should render EditableTitle with correct placeholder', () => {
            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={mockStore(defaultStore)}>
                        <TicketHeader {...minProps} />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = screen.getByRole('textbox')
            expect(input).toHaveAttribute('placeholder', 'Subject')
        })

        it('should focus EditableTitle on new tickets', () => {
            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider store={mockStore(defaultStore)}>
                        <TicketHeader {...minProps} />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = screen.getByRole('textbox')
            expect(input).toHaveFocus()
        })

        it('should not focus EditableTitle on existing tickets', () => {
            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: fromJS(ticket),
                        })}
                    >
                        <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = screen.getByRole('textbox')
            expect(input).not.toHaveFocus()
        })

        it('should display the ticket subject as the input value', async () => {
            const ticketWithSubject = fromJS({
                ...ticket,
                subject: 'Test Ticket Subject',
            })

            render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithSubject,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithSubject}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = await screen.findByRole('textbox')
            expect(input).toHaveValue('Test Ticket Subject')
        })

        it("should make EditableTitle not resizable when translation isn't available", async () => {
            const ticketWithTranslation = fromJS({
                ...ticket,
                subject: 'Original Subject',
            })

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [],
                    }),
            )
            server.use(handler)

            const { container } = render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithTranslation,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithTranslation}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                const editableTitleInput =
                    container.querySelector('input[type="text"]')
                expect(editableTitleInput).toHaveAttribute(
                    'data-resizable',
                    'false',
                )
            })
        })

        it('should make EditableTitle not resizable for new tickets without ID', () => {
            const newTicket = fromJS(_omit(ticket, 'id'))

            const { container } = render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: newTicket,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={newTicket} />
                    </Provider>
                </QueryClientProvider>,
            )

            const editableTitleInput =
                container.querySelector('input[type="text"]')
            expect(editableTitleInput).toHaveAttribute(
                'data-resizable',
                'false',
            )
        })

        it('should make EditableTitle not resizable when ticket has no translated subject', async () => {
            const ticketWithSubject = fromJS({
                ...ticket,
                subject: 'Original Subject',
            })

            // Mock translation response with empty data
            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [],
                    }),
            )
            server.use(handler)

            const { container } = render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithSubject,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithSubject}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                const editableTitleInput =
                    container.querySelector('input[type="text"]')
                expect(editableTitleInput).toHaveAttribute(
                    'data-resizable',
                    'false',
                )
            })
        })

        it('should make EditableTitle not resizable when title is empty', async () => {
            const ticketWithEmptySubject = fromJS({
                ...ticket,
                subject: '',
            })

            const mockTranslation = mockTicketTranslationCompact({
                subject: '',
                excerpt: 'Some excerpt',
                ticket_id: ticket.id,
                ticket_translation_id: `${ticket.id}-translation`,
            })

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation],
                    }),
            )
            server.use(handler)

            const { container } = render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithEmptySubject,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithEmptySubject}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                const editableTitleInput =
                    container.querySelector('input[type="text"]')
                expect(editableTitleInput).toHaveAttribute(
                    'data-resizable',
                    'false',
                )
            })
        })

        it('should make EditableTitle not resizable when title has zero length', async () => {
            const ticketWithNullSubject = fromJS({
                ...ticket,
                subject: null,
            })

            const mockTranslation = mockTicketTranslationCompact({
                subject: null,
                excerpt: 'Some excerpt',
                ticket_id: ticket.id,
                ticket_translation_id: `${ticket.id}-translation`,
            })

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation],
                    }),
            )
            server.use(handler)

            const { container } = render(
                <QueryClientProvider client={mockedQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithNullSubject,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithNullSubject}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            await waitFor(() => {
                const editableTitleInput =
                    container.querySelector('input[type="text"]')
                expect(editableTitleInput).toHaveAttribute(
                    'data-resizable',
                    'false',
                )
            })
        })
    })
})
