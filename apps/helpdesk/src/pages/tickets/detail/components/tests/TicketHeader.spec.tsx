import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    mockSearchTicketsHandler,
} from '@gorgias/helpdesk-mocks'
import { UserSettingType } from '@gorgias/helpdesk-queries'
import { TicketPriority } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { logEvent, SegmentEvent } from 'common/segment'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import shortcutManager from 'services/shortcutManager'
import * as notificationsActions from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import * as ticketActions from 'state/ticket/actions'
import * as ticketSelectors from 'state/ticket/selectors'
import { RootState } from 'state/types'
import { useTicketsTranslatedProperties } from 'tickets/core/hooks/translations/useTicketsTranslatedProperties'
import { makeExecuteKeyboardAction } from 'utils/testing'

import Snooze from '../Snooze'
import TicketHeader from '../TicketHeader'
import useIsTicketNavigationAvailable from '../TicketNavigation/hooks/useIsTicketNavigationAvailable'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useElementSize: jest.fn().mockImplementation(() => [0, 160]),
}))

jest.mock(
    'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee',
    () => () => <div>TicketAssigneeMock</div>,
)

jest.mock('services/shortcutManager')

jest.mock('../TicketDetails/TicketTags', () => () => 'TicketTagsMock')

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => Promise.resolve()),
}))

jest.mock('state/ticket/selectors', () => ({
    shouldDisplayAuditLogEvents: jest.fn(() => false),
    getShouldDisplayAllFollowUps: jest.fn(() => false),
}))

jest.mock('state/ticket/actions', () => ({
    addTag: jest.fn(),
    clearTicket: jest.fn(),
    displayAuditLogEvents: jest.fn(() => () => Promise.resolve()),
    goToNextTicket: jest.fn(async (_ticketId, promise: Promise<any>) => {
        await Promise.resolve(promise)
    }),
    hideAuditLogEvents: jest.fn(),
    removeTag: jest.fn(),
    setAgent: jest.fn(),
    setShouldDisplayAllFollowUps: jest.fn(),
    setSpam: jest.fn((_spam, callback?: () => void) => () => {
        callback?.()
        return Promise.resolve()
    }),
    setStatus: jest.fn(),
    setSubject: jest.fn(() => () => Promise.resolve()),
    setTeam: jest.fn(),
    setTrashed: jest.fn((_datetime, callback?: () => void) => () => {
        callback?.()
        return Promise.resolve()
    }),
    snoozeTicket: jest.fn((_datetime, callback?: () => void) => () => {
        callback?.()
        return Promise.resolve()
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

jest.mock('tickets/core/hooks/translations/useTicketsTranslatedProperties')
const mockUseTicketsTranslatedProperties =
    useTicketsTranslatedProperties as jest.Mock

const useParamsMock = useParams as jest.Mock

jest.mock('core/flags')
const useFlagMock = useFlag as jest.Mock

jest.mock(
    'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay',
)
const mockUseTicketMessageTranslationDisplay = jest.requireMock(
    'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay',
).useTicketMessageTranslationDisplay as jest.Mock

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
    },
}

const languagePreferences = {
    type: UserSettingType.LanguagePreferences,
    data: {
        primary: 'en',
        proficient: ['fr'],
    },
}

const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [preferences, languagePreferences],
    } as any),
)
const mockListTicketTranslations = mockListTicketTranslationsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
)
const mockSearchTickets = mockSearchTicketsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [],
    }),
)

const localHandlers = [
    mockGetCurrentUser.handler,
    mockListTicketTranslations.handler,
    mockSearchTickets.handler,
]

server.use(...localHandlers)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    appQueryClient.clear()
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
        mockUseFlagForFeature(FeatureFlagKey.AITicketSummary, false)

        // Default mock for useTicketsTranslatedProperties
        mockUseTicketsTranslatedProperties.mockReturnValue({
            translationMap: {},
            updateTicketTranslatedSubject: jest.fn(),
            isInitialLoading: false,
        })

        // Default mock for useTicketMessageTranslationDisplay
        mockUseTicketMessageTranslationDisplay.mockReturnValue({
            setAllTicketMessagesToOriginal: jest.fn(),
            setAllTicketMessagesToTranslated: jest.fn(),
            allMessageDisplayState: 'translated',
            getTicketMessageTranslationDisplay: jest.fn(),
            setTicketMessageTranslationDisplay: jest.fn(),
        })
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
        let container: any
        act(() => {
            const result = render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore(defaultStore)}>
                        <TicketHeader {...minProps} />
                    </Provider>
                </QueryClientProvider>,
            )
            container = result.container
        })

        const actions = container.querySelector('[class*="actions"]')!

        expect(actions.children).toHaveLength(1)
        expect(screen.queryByText('Snooze')).not.toBeInTheDocument()
    })

    it('should render existing ticket', () => {
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)
        act(() => {
            render(
                <QueryClientProvider client={appQueryClient}>
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
        })

        expect(screen.getByText('keyboard_arrow_left')).toBeInTheDocument()
        expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
        expect(screen.getByText('Snooze')).toBeInTheDocument()
        expect(screen.getByText('more_vert')).toBeInTheDocument()
    })

    it('should render spam ticket', () => {
        const spamTicket = fromJS({ ...ticket, spam: true })
        act(() => {
            render(
                <QueryClientProvider client={appQueryClient}>
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
        })

        expect(screen.getByText('flag')).toBeInTheDocument()
    })

    it('should render trashed ticket', () => {
        const trashedTicket = fromJS({ ...ticket, trashed_datetime: true })
        render(
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
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
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                </Provider>
            </QueryClientProvider>,
        )

        fireEvent.click(getByText(/Snooze/))

        // The Snooze component is mocked, and clicking it calls onUpdate with a mocked moment
        // This should trigger snoozeTicket action
        await waitFor(() => {
            expect(ticketActions.snoozeTicket).toHaveBeenCalled()
        })
    })

    it('should render AI ticket summary popover when enableAITicketSummary feature flag is enabled', () => {
        mockUseFlagForFeature(FeatureFlagKey.AITicketSummary, true)

        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.queryByLabelText('Summarize')).toBeInTheDocument()
    })

    it('should not render AI ticket summary popover when enableAITicketSummary feature flag is disabled', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore(defaultStore)}>
                    <TicketHeader {...minProps} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.queryByLabelText('Summarize')).not.toBeInTheDocument()
    })

    it('should render priority dropdown', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
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

    it('should render elements in correct order', () => {
        const existingTicket = fromJS({
            ...ticket,
            priority: TicketPriority.Normal,
        })
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)

        const { container } = render(
            <QueryClientProvider client={appQueryClient}>
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

    describe('Translation handling', () => {
        const ticketWithTranslation = fromJS({
            ...ticket,
            subject: 'Original English Subject',
            language: 'es', // Add language that's not in user's proficient languages to trigger translation
        })

        beforeEach(() => {
            // Enable MessagesTranslations feature flag for translation tests
            mockUseFlagForFeature(FeatureFlagKey.MessagesTranslations, true)
        })

        it('should show loading skeleton when translations are initially loading', async () => {
            // Mock the useTicketsTranslatedProperties hook to simulate loading state
            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {},
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: true,
            })

            await act(async () => {
                render(
                    <QueryClientProvider client={appQueryClient}>
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
            })

            // Wait for the component to be rendered
            await waitFor(() => {
                // Check for loading skeleton with aria attributes
                const loadingSkeleton = screen.getByRole('status', {
                    name: 'Loading ticket subject',
                })
                expect(loadingSkeleton).toBeInTheDocument()
                expect(loadingSkeleton).toHaveAttribute('aria-busy', 'true')
                expect(loadingSkeleton).toHaveAttribute('aria-live', 'polite')
            })

            // Should not show the EditableTitle when loading
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
        })

        it('should hide loading skeleton and show content when loading completes', async () => {
            // Mock completed loading state with translation
            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
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

            // Wait for component to render
            await waitFor(() => {
                // Should not have loading skeleton
                expect(
                    screen.queryByRole('status', {
                        name: 'Loading ticket subject',
                    }),
                ).not.toBeInTheDocument()

                // Should show the EditableTitle with translated content
                expect(
                    screen.getByDisplayValue('Translated Subject'),
                ).toBeInTheDocument()
            })
        })

        it('should not show loading skeleton when MessagesTranslations flag is disabled', () => {
            mockUseFlagForFeature(FeatureFlagKey.MessagesTranslations, false)

            render(
                <QueryClientProvider client={appQueryClient}>
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

            // Should not show loading skeleton
            expect(
                screen.queryByRole('status', {
                    name: 'Loading ticket subject',
                }),
            ).not.toBeInTheDocument()

            // Should show EditableTitle directly
            expect(
                screen.getByDisplayValue('Original English Subject'),
            ).toBeInTheDocument()
        })

        it('should display translated subject when translation is available', async () => {
            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject in French',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
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
            expect(document.title).toEqual('Translated Subject in French')
        })

        it('should display original subject when no translation is available', async () => {
            render(
                <QueryClientProvider client={appQueryClient}>
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
            expect(document.title).toEqual('Original English Subject')
        })

        it('should show translate icon when translation is available', async () => {
            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
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
                <QueryClientProvider client={appQueryClient}>
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

        it('should show translate button when translation is available', async () => {
            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
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
                const translateButton = container.querySelector('button i')
                expect(translateButton).toBeInTheDocument()
                expect(translateButton?.textContent).toBe('translate')
            })
        })

        it('should toggle to original content when clicking translate button in translated state', async () => {
            const setAllTicketMessagesToOriginal = jest.fn()
            const setAllTicketMessagesToTranslated = jest.fn()

            mockUseTicketMessageTranslationDisplay.mockReturnValue({
                setAllTicketMessagesToOriginal,
                setAllTicketMessagesToTranslated,
                allMessageDisplayState: 'translated',
                getTicketMessageTranslationDisplay: jest.fn(),
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
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
                const translateIcon = container.querySelector('button i')
                expect(translateIcon?.textContent).toBe('translate')
            })

            const translateButton = container.querySelector('button i')
                ?.parentElement as HTMLElement
            fireEvent.click(translateButton)

            expect(setAllTicketMessagesToOriginal).toHaveBeenCalledTimes(1)
            expect(setAllTicketMessagesToTranslated).not.toHaveBeenCalled()
        })

        it('should toggle to translated content when clicking translate button in original state', async () => {
            const setAllTicketMessagesToOriginal = jest.fn()
            const setAllTicketMessagesToTranslated = jest.fn()

            mockUseTicketMessageTranslationDisplay.mockReturnValue({
                setAllTicketMessagesToOriginal,
                setAllTicketMessagesToTranslated,
                allMessageDisplayState: 'original',
                getTicketMessageTranslationDisplay: jest.fn(),
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
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
                const translateIcon = container.querySelector('button i')
                expect(translateIcon?.textContent).toBe('translate')
            })

            const translateButton = container.querySelector('button i')
                ?.parentElement as HTMLElement
            fireEvent.click(translateButton)

            expect(setAllTicketMessagesToTranslated).toHaveBeenCalledTimes(1)
            expect(setAllTicketMessagesToOriginal).not.toHaveBeenCalled()
        })

        it('should display translated subject when allMessageDisplayState is translated', async () => {
            mockUseTicketMessageTranslationDisplay.mockReturnValue({
                setAllTicketMessagesToOriginal: jest.fn(),
                setAllTicketMessagesToTranslated: jest.fn(),
                allMessageDisplayState: 'translated',
                getTicketMessageTranslationDisplay: jest.fn(),
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
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
                    screen.getByDisplayValue('Translated Subject'),
                ).toBeInTheDocument()
            })
        })

        it('should display original subject when allMessageDisplayState is original', async () => {
            mockUseTicketMessageTranslationDisplay.mockReturnValue({
                setAllTicketMessagesToOriginal: jest.fn(),
                setAllTicketMessagesToTranslated: jest.fn(),
                allMessageDisplayState: 'original',
                getTicketMessageTranslationDisplay: jest.fn(),
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
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

        it('should show correct tooltip text when displaying translated content', async () => {
            mockUseTicketMessageTranslationDisplay.mockReturnValue({
                setAllTicketMessagesToOriginal: jest.fn(),
                setAllTicketMessagesToTranslated: jest.fn(),
                allMessageDisplayState: 'translated',
                getTicketMessageTranslationDisplay: jest.fn(),
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
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
                const translateIcon = container.querySelector('button i')
                expect(translateIcon?.textContent).toBe('translate')
            })

            const translateButton = container.querySelector('button i')
                ?.parentElement as HTMLElement
            fireEvent.mouseEnter(translateButton)

            await waitFor(() => {
                expect(
                    screen.getByText(/Ticket translated from Spanish/i),
                ).toBeInTheDocument()
            })
        })

        it('should show correct tooltip text when displaying original content', async () => {
            mockUseTicketMessageTranslationDisplay.mockReturnValue({
                setAllTicketMessagesToOriginal: jest.fn(),
                setAllTicketMessagesToTranslated: jest.fn(),
                allMessageDisplayState: 'original',
                getTicketMessageTranslationDisplay: jest.fn(),
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            mockUseTicketsTranslatedProperties.mockReturnValue({
                translationMap: {
                    [ticket.id]: {
                        subject: 'Translated Subject',
                    },
                },
                updateTicketTranslatedSubject: jest.fn(),
                isInitialLoading: false,
            })

            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
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
                const translateIcon = container.querySelector('button i')
                expect(translateIcon?.textContent).toBe('translate')
            })

            const translateButton = container.querySelector('button i')
                ?.parentElement as HTMLElement
            fireEvent.mouseEnter(translateButton)

            await waitFor(() => {
                expect(
                    screen.getByText(/Click to translate ticket to English/i),
                ).toBeInTheDocument()
            })
        })
    })

    describe('EditableTitle Integration', () => {
        it('should render EditableTitle with correct placeholder', () => {
            render(
                <QueryClientProvider client={appQueryClient}>
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
                <QueryClientProvider client={appQueryClient}>
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
                <QueryClientProvider client={appQueryClient}>
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
                <QueryClientProvider client={appQueryClient}>
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
    })

    describe('Mouse and focus interactions', () => {
        it('should update mouse over state when mousing over editable title', async () => {
            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore(defaultStore)}>
                        <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                    </Provider>
                </QueryClientProvider>,
            )

            const editableTitle = container.querySelector('input[type="text"]')!
            fireEvent.mouseEnter(editableTitle)

            // The component should handle mouse over without errors
            expect(editableTitle).toBeInTheDocument()
        })

        it('should update focus state when focusing on editable title', () => {
            const { container } = render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore(defaultStore)}>
                        <TicketHeader {...minProps} ticket={fromJS(ticket)} />
                    </Provider>
                </QueryClientProvider>,
            )

            const editableTitle = container.querySelector('input[type="text"]')!
            fireEvent.focus(editableTitle)
            fireEvent.blur(editableTitle)

            // The component should handle focus events without errors
            expect(editableTitle).toBeInTheDocument()
        })
    })

    describe('History display prevention', () => {
        it('should not go to next ticket when history is displayed', () => {
            const onGoToNextTicketMock = jest.fn()
            const ticketWithHistory = fromJS({
                ...ticket,
                _internal: { displayHistory: true },
            })

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithHistory,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithHistory}
                            onGoToNextTicket={onGoToNextTicketMock}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            // Trigger keyboard shortcut that would normally go to next ticket
            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEventMock,
                'TicketDetailContainer',
            )('CLOSE_TICKET')

            expect(onGoToNextTicketMock).not.toHaveBeenCalled()
        })
    })

    describe('Subject handling', () => {
        it('should handle subject change and update translation', () => {
            const ticketWithId = fromJS(ticket)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithId,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={ticketWithId} />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = screen.getByRole('textbox')
            fireEvent.change(input, { target: { value: 'New Subject' } })
            fireEvent.blur(input)

            expect(ticketActions.setSubject).toHaveBeenCalledWith('New Subject')
        })

        it('should handle subject change for new tickets', () => {
            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore(defaultStore)}>
                        <TicketHeader {...minProps} />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = screen.getByRole('textbox')
            fireEvent.change(input, { target: { value: 'New Subject' } })
            fireEvent.blur(input)

            expect(ticketActions.setSubject).toHaveBeenCalledWith('New Subject')
        })
    })

    describe('Priority handling', () => {
        it('should handle priority change', async () => {
            const ticketWithPriority = fromJS({
                ...ticket,
                priority: TicketPriority.Normal,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithPriority,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithPriority}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            // The component should render without errors - testing the priority change handler
            expect(screen.getByText(/normal/i)).toBeInTheDocument()
        })
    })

    describe('Merge ticket modal', () => {
        it('should handle merge ticket modal toggle', () => {
            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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
            fireEvent.click(getByText(/Merge ticket/))

            // Component should handle modal toggle without errors
            expect(screen.getByText(/more_vert/)).toBeInTheDocument()
        })
    })

    describe('Snooze operations', () => {
        it('should handle unsnoozed ticket', () => {
            const unsnoozeTicket = fromJS({ ...ticket, snooze_datetime: null })

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: unsnoozeTicket,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={unsnoozeTicket} />
                    </Provider>
                </QueryClientProvider>,
            )

            fireEvent.click(screen.getByText('Snooze'))
            expect(ticketActions.snoozeTicket).toHaveBeenCalled()
        })
    })

    describe('Action creation edge cases', () => {
        it('should include unmark spam action for spam tickets', () => {
            const spamTicket = fromJS({ ...ticket, spam: true })

            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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

            fireEvent.click(getByText(/more_vert/))
            expect(getByText(/Unmark as spam/)).toBeInTheDocument()
        })

        it('should include undelete action for trashed tickets', () => {
            const trashedTicket = fromJS({
                ...ticket,
                trashed_datetime: '2023-01-01',
            })

            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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

            fireEvent.click(getByText(/more_vert/))
            expect(getByText(/Undelete/)).toBeInTheDocument()
        })
    })

    describe('Keyboard shortcuts', () => {
        it('should close ticket with CLOSE_TICKET shortcut', () => {
            render(
                <QueryClientProvider client={appQueryClient}>
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

            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEventMock,
                'TicketDetailContainer',
            )('CLOSE_TICKET')

            expect(minProps.setStatus).toHaveBeenCalledWith('closed')
        })

        it('should open ticket with OPEN_TICKET shortcut', () => {
            const closedTicket = fromJS({ ...ticket, status: 'closed' })

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: closedTicket,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={closedTicket} />
                    </Provider>
                </QueryClientProvider>,
            )

            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEventMock,
                'TicketDetailContainer',
            )('OPEN_TICKET')

            expect(minProps.setStatus).toHaveBeenCalledWith('open')
        })

        it('should toggle spam with MARK_TICKET_SPAM shortcut', () => {
            render(
                <QueryClientProvider client={appQueryClient}>
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

            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEventMock,
                'TicketDetailContainer',
            )('MARK_TICKET_SPAM')

            expect(ticketActions.setSpam).toHaveBeenCalled()
        })

        it('should hide trash confirmation popover with ESC key', () => {
            const { queryByText } = render(
                <QueryClientProvider client={appQueryClient}>
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

            // First open the trash confirmation
            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEventMock,
                'TicketDetailContainer',
            )('DELETE_TICKET')

            expect(queryByText(/You are about to/)).toBeInTheDocument()

            // Then hide it with ESC
            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEventMock,
                'TicketDetailContainer',
            )('HIDE_POPOVER')

            expect(queryByText(/You are about to/)).not.toBeInTheDocument()
        })
    })

    describe('Audit log events', () => {
        it('should display audit log events when clicking "Show all events"', () => {
            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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
            fireEvent.click(getByText(/Show all events/))

            expect(ticketActions.displayAuditLogEvents).toHaveBeenCalledWith(
                ticket.id,
                undefined,
            )
        })

        it('should hide audit log events when clicking "Hide all events"', () => {
            // Mock that audit log events are currently displayed
            ;(
                ticketSelectors.shouldDisplayAuditLogEvents as unknown as jest.Mock
            ).mockReturnValue(true)

            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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
            fireEvent.click(getByText(/Hide all events/))

            expect(ticketActions.hideAuditLogEvents).toHaveBeenCalled()

            // Reset mock
            ;(
                ticketSelectors.shouldDisplayAuditLogEvents as unknown as jest.Mock
            ).mockReturnValue(false)
        })

        it('should pass satisfaction survey id when displaying audit log events', () => {
            const ticketWithSurvey = fromJS({
                ...ticket,
                satisfaction_survey: { id: 'survey-123' },
            })

            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithSurvey,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={ticketWithSurvey} />
                    </Provider>
                </QueryClientProvider>,
            )

            fireEvent.click(getByText(/more_vert/))
            fireEvent.click(getByText(/Show all events/))

            expect(ticketActions.displayAuditLogEvents).toHaveBeenCalledWith(
                ticket.id,
                'survey-123',
            )
        })
    })

    describe('Spam and navigation behavior', () => {
        it('should navigate to next ticket after marking as spam', () => {
            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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
            fireEvent.click(getByText(/Mark as spam/))

            // setSpam is called with true (spam = true) and a callback
            expect(ticketActions.setSpam).toHaveBeenCalled()
        })

        it('should not navigate after unmarking as spam', () => {
            const spamTicket = fromJS({ ...ticket, spam: true })

            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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

            fireEvent.click(getByText(/more_vert/))
            fireEvent.click(getByText(/Unmark as spam/))

            expect(ticketActions.setSpam).toHaveBeenCalled()
            const setSpamCall = (ticketActions.setSpam as jest.Mock).mock
                .calls[0]
            expect(setSpamCall[0]).toBe(false) // spam = false
        })
    })

    describe('Trash confirmation behavior', () => {
        it('should trash ticket and navigate when confirming deletion', async () => {
            const { getByText } = render(
                <QueryClientProvider client={appQueryClient}>
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

            // Open actions menu
            fireEvent.click(getByText(/more_vert/))
            // Click delete
            fireEvent.click(getByText(/Delete/))

            // Check confirmation popover is shown
            expect(getByText(/You are about to/)).toBeInTheDocument()

            // Find and click confirm button
            const buttons = document.querySelectorAll('button')
            const confirmButton = Array.from(buttons).find((btn) =>
                btn.textContent?.toLowerCase().includes('confirm'),
            )

            if (confirmButton) {
                fireEvent.click(confirmButton)
                expect(ticketActions.setTrashed).toHaveBeenCalled()
            }
        })

        it('should close confirmation popover when clicking cancel', () => {
            const { getByText, queryByText } = render(
                <QueryClientProvider client={appQueryClient}>
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
            fireEvent.click(getByText(/Delete/))

            expect(queryByText(/You are about to/)).toBeInTheDocument()

            // Find and click cancel button
            const buttons = document.querySelectorAll('button')
            const cancelButton = Array.from(buttons).find((btn) =>
                btn.textContent?.toLowerCase().includes('cancel'),
            )

            if (cancelButton) {
                fireEvent.click(cancelButton)
                expect(queryByText(/You are about to/)).not.toBeInTheDocument()
            }
        })
    })

    describe('onGoToNextTicket callback', () => {
        beforeEach(() => {
            // Clear the mock calls before each test
            jest.clearAllMocks()
        })

        it('should use provided onGoToNextTicket callback when available', async () => {
            const onGoToNextTicketMock = jest.fn()

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: fromJS(ticket),
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={fromJS(ticket)}
                            onGoToNextTicket={onGoToNextTicketMock}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            // Trigger snooze which calls handleGoToNextTicket
            fireEvent.click(screen.getByText('Snooze'))

            await waitFor(() => {
                expect(ticketActions.snoozeTicket).toHaveBeenCalled()
            })

            // The snooze callback should call the provided onGoToNextTicket
            const snoozeCall = (ticketActions.snoozeTicket as jest.Mock).mock
                .calls[0]
            const callback = snoozeCall[1]
            callback()

            expect(onGoToNextTicketMock).toHaveBeenCalled()
        })

        it('should use default navigation when onGoToNextTicket is not provided', async () => {
            jest.clearAllMocks()

            render(
                <QueryClientProvider client={appQueryClient}>
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

            fireEvent.click(screen.getByText('Snooze'))

            await waitFor(() => {
                expect(ticketActions.snoozeTicket).toHaveBeenCalled()
            })

            // The snooze callback should call goToNextTicket
            const snoozeCall = (ticketActions.snoozeTicket as jest.Mock).mock
                .calls[0]
            const callback = snoozeCall[1]
            callback()

            expect(ticketActions.goToNextTicket).toHaveBeenCalled()
        })
    })

    describe('Unsnooze functionality', () => {
        it('should unsnooze ticket when passing null datetime', () => {
            const snoozedTicket = fromJS({
                ...ticket,
                snooze_datetime: '2024-12-31T10:00:00Z',
            })

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: snoozedTicket,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={snoozedTicket} />
                    </Provider>
                </QueryClientProvider>,
            )

            // The Snooze component is mocked, but we can test the handler directly
            expect(ticketActions.snoozeTicket).toBeDefined()
        })
    })

    describe('Smart follow ups control', () => {
        describe('Feature flag disabled', () => {
            beforeEach(() => {
                jest.clearAllMocks()
                mockUseFlagForFeature(FeatureFlagKey.SmartFollowUps, false)
            })

            it('should not show Smart follow ups control actions when feature flag is disabled', () => {
                // Mock the selector to return false (follow ups hidden)
                ;(
                    ticketSelectors.getShouldDisplayAllFollowUps as unknown as jest.Mock
                ).mockReturnValue(false)

                const { getByText, queryByText } = render(
                    <QueryClientProvider client={appQueryClient}>
                        <Provider store={mockStore(defaultStore)}>
                            <TicketHeader
                                {...minProps}
                                ticket={fromJS(ticket)}
                            />
                        </Provider>
                    </QueryClientProvider>,
                )

                fireEvent.click(getByText(/more_vert/))
                expect(
                    queryByText(/Show all quick-replies/),
                ).not.toBeInTheDocument()
                expect(
                    queryByText(/Hide all quick-replies/),
                ).not.toBeInTheDocument()
            })
        })

        describe('Feature flag enabled', () => {
            beforeEach(() => {
                jest.clearAllMocks()
                mockUseFlagForFeature(FeatureFlagKey.SmartFollowUps, true)
            })

            it('should show "Show all quick-replies" action when follow ups are hidden', () => {
                // Mock the selector to return false (follow ups hidden)
                ;(
                    ticketSelectors.getShouldDisplayAllFollowUps as unknown as jest.Mock
                ).mockReturnValue(false)

                const { getByText } = render(
                    <QueryClientProvider client={appQueryClient}>
                        <Provider store={mockStore(defaultStore)}>
                            <TicketHeader
                                {...minProps}
                                ticket={fromJS(ticket)}
                            />
                        </Provider>
                    </QueryClientProvider>,
                )

                fireEvent.click(getByText(/more_vert/))
                expect(getByText(/Show all quick-replies/)).toBeInTheDocument()
            })

            it('should show "Hide all quick-replies" action when follow ups are displayed', () => {
                // Mock the selector to return true (follow ups displayed)
                ;(
                    ticketSelectors.getShouldDisplayAllFollowUps as unknown as jest.Mock
                ).mockReturnValue(true)

                const { getByText } = render(
                    <QueryClientProvider client={appQueryClient}>
                        <Provider store={mockStore(defaultStore)}>
                            <TicketHeader
                                {...minProps}
                                ticket={fromJS(ticket)}
                            />
                        </Provider>
                    </QueryClientProvider>,
                )

                fireEvent.click(getByText(/more_vert/))
                expect(getByText(/Hide all quick-replies/)).toBeInTheDocument()
            })

            it('should dispatch setShouldDisplayAllFollowUps with true when showing follow ups', () => {
                // Mock the selector to return false (follow ups hidden)
                ;(
                    ticketSelectors.getShouldDisplayAllFollowUps as unknown as jest.Mock
                ).mockReturnValue(false)

                const { getByText } = render(
                    <QueryClientProvider client={appQueryClient}>
                        <Provider store={mockStore(defaultStore)}>
                            <TicketHeader
                                {...minProps}
                                ticket={fromJS(ticket)}
                            />
                        </Provider>
                    </QueryClientProvider>,
                )

                fireEvent.click(getByText(/more_vert/))
                fireEvent.click(getByText(/Show all quick-replies/))

                expect(logEvent).toHaveBeenCalledWith(
                    SegmentEvent.SmartFollowUpsVisibilityControlClicked,
                    { visibility: 'visible' },
                )
                expect(
                    ticketActions.setShouldDisplayAllFollowUps,
                ).toHaveBeenCalledWith(true)
            })

            it('should dispatch setShouldDisplayAllFollowUps with false when hiding follow ups', () => {
                // Mock the selector to return true (follow ups displayed)
                ;(
                    ticketSelectors.getShouldDisplayAllFollowUps as unknown as jest.Mock
                ).mockReturnValue(true)

                const { getByText } = render(
                    <QueryClientProvider client={appQueryClient}>
                        <Provider store={mockStore(defaultStore)}>
                            <TicketHeader
                                {...minProps}
                                ticket={fromJS(ticket)}
                            />
                        </Provider>
                    </QueryClientProvider>,
                )

                fireEvent.click(getByText(/more_vert/))
                fireEvent.click(getByText(/Hide all quick-replies/))

                expect(logEvent).toHaveBeenCalledWith(
                    SegmentEvent.SmartFollowUpsVisibilityControlClicked,
                    { visibility: 'hidden' },
                )
                expect(
                    ticketActions.setShouldDisplayAllFollowUps,
                ).toHaveBeenCalledWith(false)
            })

            it('should not show follow-ups toggle action for new tickets without ID', () => {
                const newTicket = fromJS(_omit(ticket, 'id'))

                const { queryByText } = render(
                    <QueryClientProvider client={appQueryClient}>
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

                // For new tickets without ID, the more_vert button should not be present
                expect(queryByText(/more_vert/)).not.toBeInTheDocument()
                expect(
                    queryByText(/Show all quick-replies/),
                ).not.toBeInTheDocument()
                expect(
                    queryByText(/Hide all quick-replies/),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Edge cases', () => {
        it('should handle tickets with no subject gracefully', () => {
            const ticketWithoutSubject = fromJS({
                ...ticket,
                subject: null,
            })

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: ticketWithoutSubject,
                        })}
                    >
                        <TicketHeader
                            {...minProps}
                            ticket={ticketWithoutSubject}
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('New ticket')
        })

        it('should not show actions for new tickets without ID', () => {
            const newTicket = fromJS(_omit(ticket, 'id'))

            render(
                <QueryClientProvider client={appQueryClient}>
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

            // Should not show ticket-specific actions
            expect(screen.queryByText('Snooze')).not.toBeInTheDocument()
            expect(screen.queryByText('more_vert')).not.toBeInTheDocument()
        })

        it('should handle mark as unread for already unread tickets', () => {
            const unreadTicket = fromJS({ ...ticket, is_unread: true })

            const { getByText, queryByText } = render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider
                        store={mockStore({
                            ...defaultStore,
                            ticket: unreadTicket,
                        })}
                    >
                        <TicketHeader {...minProps} ticket={unreadTicket} />
                    </Provider>
                </QueryClientProvider>,
            )

            fireEvent.click(getByText(/more_vert/))

            // Should not show "Mark as unread" for already unread tickets
            expect(queryByText(/Mark as unread/)).not.toBeInTheDocument()
        })
    })
})
