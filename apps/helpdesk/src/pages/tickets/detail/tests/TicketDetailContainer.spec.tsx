import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { localForageManager } from '@repo/browser-storage'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { assumeMock, flushPromises, render, userEvent } from '@repo/testing'
import { useRealtimeTicketUpdates } from '@repo/ticket-thread'
import { useLiveTicketTranslationsUpdates } from '@repo/tickets'
import { shortcutManager } from '@repo/utils'
import { act, fireEvent, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'
import { useAgentActivity } from '@gorgias/realtime'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { MacroActionName } from 'models/macroAction/types'
import * as voiceCallQueries from 'models/voiceCall/queries'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import useGoToPreviousTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { initialState as currentUser } from 'state/currentUser/reducers'
import {
    TicketMessageActionValidationError,
    TicketMessageIdentityMismatchError,
    TicketMessageInvalidSendDataError,
} from 'state/newMessage/errors'
import { triggerTicketFieldsErrors } from 'state/ticket/actions'
import * as ticketUtils from 'state/ticket/utils'
import * as customFieldsUtils from 'utils/customFields'
import { makeExecuteKeyboardAction } from 'utils/testing'

// oxlint-disable-next-line no-named-as-default
import type TicketView from '../components/TicketView'
import useTicketActivityTracking from '../hooks/useTicketActivityTracking'
import { TicketDetailContainer } from '../TicketDetailContainer'

const NavigateButton = ({ to }: { to: string }) => {
    const routerHistory = useHistory()

    return (
        <button type="button" onClick={() => routerHistory.push(to)}>
            Change ticket route
        </button>
    )
}
jest.useFakeTimers()

const mockSetItem = jest.fn().mockResolvedValue(true)
const mockGetItem = jest.fn()
const mockGetTableObject = {
    getItem: mockGetItem,
    setItem: mockSetItem,
} as unknown as LocalForage
jest.spyOn(localForageManager, 'getTable').mockReturnValue(mockGetTableObject)
jest.spyOn(localForageManager, 'clearTable')

const voiceCallsSpy = jest.spyOn(voiceCallQueries, 'useListVoiceCalls')

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = useCustomFieldDefinitions as jest.Mock

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        bind: jest.fn(),
        unbind: jest.fn(),
    },
}))
jest.mock('../components/TicketView', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TicketStatus } = require('business/types/ticket')
    return ({ submit, setStatus }: ComponentProps<typeof TicketView>) => (
        <div>
            <div
                data-testid="TicketView-submit"
                onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    submit({ status: TicketStatus.Closed })
                }}
            />
            <div
                data-testid="TicketView-submit-send"
                onClick={() => {
                    submit({ status: TicketStatus.Open })
                }}
            />
            <div
                data-testid="TicketView-change-status"
                onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    setStatus(TicketStatus.Closed)
                }}
            />
        </div>
    )
})
jest.mock('pages/tickets/detail/components/TicketThread/TicketThread', () => ({
    TicketThread: jest.fn(() => <div>TicketThread mock</div>),
}))
jest.mock(
    'pages/tickets/detail/components/TicketThread/TicketThreadLegacyBridge',
    () => ({
        TicketThreadLegacyBridge: ({ children }: { children?: ReactNode }) => (
            <div>{children}</div>
        ),
    }),
)

jest.mock('services/pendingMessageManager/pendingMessageManager', () => ({
    sendMessage: jest.fn(),
    skipExistingTimer: jest.fn(),
}))

jest.mock('@repo/logging')
const mockReportError = assumeMock(reportError)
jest.mock('state/ticket/actions', () => ({
    ...jest.requireActual<Record<string, unknown>>('state/ticket/actions'),
    triggerTicketFieldsErrors: jest.fn(),
}))

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.Mock

jest.mock('providers/OutboundTranslationProvider')
const mockUseOutboundTranslationContext =
    useOutboundTranslationContext as jest.Mock

const mockStore = configureMockStore<object>([thunk])
let mockedStore = mockStore({
    ticket: fromJS({
        tags: [],
    }),
    ui: {
        stats: {
            drillDown: {
                isOpen: false,
                currentPage: 1,
                metricData: null,
                export: {
                    isLoading: false,
                    isError: false,
                    isRequested: false,
                },
            },
        },
    },
})

const renderWithMockedStore = (
    ui: ReactElement,
    options?: Parameters<typeof render>[1],
) =>
    render(ui, {
        storeState: mockedStore.getState(),
        ...options,
    })

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>

const mockSetRecentItem = jest.fn()
jest.mock('hooks/useRecentItems/useRecentItems', () => () => ({
    setRecentItem: mockSetRecentItem,
}))

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('@repo/activity-tracker')

jest.spyOn(customFieldsUtils, 'mergeFieldsStateWithMacroValues')
const spiedMergeFieldsStateWithMacroValues = assumeMock(
    customFieldsUtils.mergeFieldsStateWithMacroValues,
)

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const useSplitTicketViewMock = useSplitTicketView as jest.Mock

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useIsMobileResolution: jest.fn(() => false),
}))
const mockUseIsMobileResolution = useIsMobileResolution as jest.Mock

const mockGoToPreviousTicket = jest.fn()
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket',
)
const mockUseGoToPreviousTicket = useGoToPreviousTicket as jest.Mock

const mockGoToNextTicket = jest.fn()
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket',
)
const mockUseGoToNextTicket = useGoToNextTicket as jest.Mock

jest.mock('pages/tickets/detail/hooks/useTicketActivityTracking')
const mockUseTicketActivityTracking = useTicketActivityTracking as jest.Mock

jest.mock(
    'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults',
    () => ({
        useCustomFieldsConditionsEvaluationResults: jest.fn(() => ({
            evaluationResults: {},
            conditionsLoading: false,
        })),
    }),
)

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockJoinTicket = jest.fn()
const mockLeaveTicket = jest.fn()

// Mock knowledge source sidebar components
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider',
    () => ({
        KnowledgeSourceSideBarProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => <div data-testid="knowledge-source-provider">{children}</div>,
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper',
    () => () => (
        <div data-testid="knowledge-source-sidebar">
            Knowledge Source Sidebar
        </div>
    ),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(() => ({ mode: null })),
    }),
)
const mockUseKnowledgeSourceSideBar =
    require('pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar')
        .useKnowledgeSourceSideBar as jest.Mock
const mockTicketThread =
    require('pages/tickets/detail/components/TicketThread/TicketThread')
        .TicketThread as jest.Mock

const mockValidateTicketFields = jest.fn()
const mockUseTicketFieldsValidation: jest.Mock<
    {
        validateTicketFields: typeof mockValidateTicketFields
        isValidating: boolean
    },
    [number?]
> = jest.fn(() => ({
    validateTicketFields: mockValidateTicketFields,
    isValidating: false,
}))
const mockUseHelpdeskV2MS1Flag = jest.fn(() => false)
const mockUseHelpdeskV2MS3Flag = jest.fn(() => false)

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useLiveTicketTranslationsUpdates: jest.fn(),
    useHelpdeskV2MS1Flag: () => mockUseHelpdeskV2MS1Flag(),
    useTicketFieldsValidation: (ticketId?: number) =>
        mockUseTicketFieldsValidation(ticketId),
}))
jest.mock('@repo/ticket-thread', () => ({
    ...jest.requireActual('@repo/ticket-thread'),
    useRealtimeTicketUpdates: jest.fn(),
}))

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: () => mockUseHelpdeskV2MS1Flag(),
    useHelpdeskV2MS3Flag: () => mockUseHelpdeskV2MS3Flag(),
}))

const mockUseLiveTicketTranslationsUpdates =
    useLiveTicketTranslationsUpdates as jest.Mock
const mockUseRealtimeTicketUpdates = useRealtimeTicketUpdates as jest.Mock

describe('TicketDetailContainer component', () => {
    const prepareTicketMessageMock = jest.fn()
    const newTicket = fromJS({
        messages: [],
        custom_fields: {},
    }) as Map<any, any>
    const existingTicket = fromJS({
        id: 1,
        messages: [],
        custom_fields: {},
    }) as Map<any, any>
    const setStatusMock = jest.fn() as jest.Mock<unknown, [string, () => void]>
    const minProps = {
        activeCustomer: fromJS({}),
        activeView: fromJS({}),
        canSendMessage: false,
        clearTicket: jest.fn(),
        customers: fromJS({}),
        fetchCustomer: jest.fn(),
        fetchCustomerHistory: jest.fn(),
        fetchTags: jest.fn(),
        fetchTicket: jest.fn(),
        findAndSetCustomer: jest.fn(),
        goToNextTicket: jest.fn(),
        newMessage: fromJS({
            newMessage: {
                source: {
                    to: [],
                },
            },
        }),
        newMessageSource: fromJS({}),
        prepareTicketMessage: prepareTicketMessageMock,
        sendTicketMessage: jest.fn(),
        setCustomer: jest.fn().mockResolvedValue(undefined),
        setReceivers: jest.fn(),
        setStatus: setStatusMock,
        submitTicket: jest.fn(),
        ticket: newTicket,
        updateCursor: jest.fn(),
        currentUser: fromJS({}),
        prepare: jest.fn(),
    } as unknown as ComponentProps<typeof TicketDetailContainer>
    const preparedData = {
        messageId: 1,
        messageToSend: {
            attachments: [],
            body_html: '<div>foo</div>',
            body_text: 'foo',
            channel: 'email',
            from_agent: true,
            macros: [],
            mention_ids: [],
            public: true,
            sender: {},
            source: {
                type: 'email',
                extra: {},
                from: {},
                to: [{}],
            },
            subject: '',
            via: 'helpdesk',
        },
        type: 'foo',
    }
    const newMessageState = fromJS({
        newMessage: {
            body_text: 'foobar',
            source: {
                cc: [
                    {
                        name: 'cc',
                        address: 'cc@gorgias.io',
                    },
                ],
                bcc: [
                    {
                        name: 'bcc',
                        address: 'bcc@gorgias.io',
                    },
                ],
                type: 'email',
            },
        },
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockedStore = mockStore({
            ticket: fromJS({
                tags: [],
            }),
            ui: {
                stats: {
                    drillDown: {
                        isOpen: false,
                        currentPage: 1,
                        metricData: null,
                        export: {
                            isLoading: false,
                            isError: false,
                            isRequested: false,
                        },
                    },
                },
            },
        })
        mockedStore.dispatch = jest.fn()
        useCustomFieldDefinitionsMock.mockReturnValue({
            isLoading: false,
            data: {
                data: [ticketDropdownFieldDefinition],
            },
        })
        prepareTicketMessageMock.mockReturnValue(preparedData)
        setStatusMock.mockImplementation((status, callback) => {
            act(callback)
        })
        useSplitTicketViewMock.mockReturnValue({ isEnabled: false })
        mockUseGoToPreviousTicket.mockReturnValue({
            goToTicket: mockGoToPreviousTicket,
            isEnabled: false,
        })
        mockUseGoToNextTicket.mockReturnValue({
            goToTicket: mockGoToNextTicket,
            isEnabled: false,
        })

        mockUseAgentActivity.mockReturnValue({
            joinTicket: mockJoinTicket,
            leaveTicket: mockLeaveTicket,
        })
        mockUseOutboundTranslationContext.mockReturnValue({
            isTranslationPending: false,
        })
        mockUseLiveTicketTranslationsUpdates.mockReturnValue({
            handleTicketMessageTranslationEvents: jest.fn(),
        })
        mockUseRealtimeTicketUpdates.mockReturnValue({
            handleTicketUpdateEvents: jest.fn(),
        })
        mockJoinTicket.mockClear()
        window.USER_IMPERSONATED = null
        mockUseFlag.mockReturnValue(false)
        mockUseHelpdeskV2MS1Flag.mockReturnValue(false)
        mockUseHelpdeskV2MS3Flag.mockReturnValue(false)
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })
        mockTicketThread.mockClear()
    })

    it('should render container for new ticket', () => {
        const { container } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should hide the ticket identity debug menu when the debug menu flag is off', () => {
        const { queryByRole } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        expect(
            queryByRole('button', {
                name: 'Toggle ticket identity debug menu',
            }),
        ).not.toBeInTheDocument()
    })

    it('should show ticket identity debug details when the debug menu flag is on', async () => {
        const consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(jest.fn())
        const writeTextSpy = jest
            .spyOn(window.navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)
        const toastSuccessSpy = jest
            .spyOn(toast, 'success')
            .mockImplementation(jest.fn())

        mockUseFlag.mockImplementation(
            (flag) => flag === FeatureFlagKey.DebugMenu,
        )

        const contentState = {
            getPlainText: () => 'draft body',
        }
        const originalContentState = {
            getPlainText: () => 'original draft',
        }
        const debugTicket = existingTicket
            .setIn(['_internal', 'loading', 'fetchTicket'], true)
            .setIn(['_internal', 'latestFetchTicketRequestedId'], 1)
        const debugNewMessage = fromJS({
            _internal: {
                loading: {
                    submitMessage: false,
                },
            },
            state: {
                dirty: true,
                emailExtraAdded: false,
                cacheAdded: true,
                forceUpdate: false,
                forceFocus: true,
                firstNewMessage: false,
                selectionState: {},
            },
            newMessage: {
                ticket_id: '1',
                source: {
                    type: 'email',
                    to: [],
                },
                channel: 'email',
                public: true,
                from_agent: true,
                subject: 'Debug subject',
                body_text: 'Hello',
                body_html: '<p>Hello</p>',
                attachments: [{ id: 1 }],
                actions: [{ name: 'tag' }],
            },
        })
            .setIn(['state', 'contentState'], contentState)
            .setIn(['state', 'originalContentState'], originalContentState)

        const { getByRole } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={debugTicket}
                newMessage={debugNewMessage}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        act(() => {
            fireEvent.click(
                getByRole('button', {
                    name: 'Toggle ticket identity debug menu',
                }),
            )
        })

        const dialog = getByRole('dialog', {
            name: 'Ticket identity debug details',
        })
        expect(dialog).toHaveTextContent('Redux ticket id')
        expect(dialog).toHaveTextContent('URL ticket id')
        expect(dialog).toHaveTextContent('Fetch loading')
        expect(dialog).toHaveTextContent('"latest_requested_ticket_id": 1')
        expect(dialog).toHaveTextContent('"content_text_length": 10')
        expect(dialog).toHaveTextContent('"attachments_count": 1')

        act(() => {
            fireEvent.click(
                getByRole('button', {
                    name: 'Copy ticket identity debug state',
                }),
            )
        })

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Ticket identity debug state',
            expect.objectContaining({
                ticket_id_redux: 1,
                ticket_id_url: '1',
            }),
        )
        await waitFor(() => {
            expect(writeTextSpy).toHaveBeenCalledWith(
                expect.stringContaining('"ticket_id_url": "1"'),
            )
            expect(toastSuccessSpy).toHaveBeenCalledWith(
                'Ticket debug state copied',
            )
        })

        toastSuccessSpy.mockRestore()
        writeTextSpy.mockRestore()
        consoleWarnSpy.mockRestore()
    })

    it('should skip copying ticket identity debug details when clipboard is unavailable', () => {
        const originalClipboard = window.navigator.clipboard
        const consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(jest.fn())
        const toastSuccessSpy = jest
            .spyOn(toast, 'success')
            .mockImplementation(jest.fn())

        Object.defineProperty(window.navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        })
        mockUseFlag.mockImplementation(
            (flag) => flag === FeatureFlagKey.DebugMenu,
        )

        const { getByRole } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        act(() => {
            fireEvent.click(
                getByRole('button', {
                    name: 'Toggle ticket identity debug menu',
                }),
            )
        })

        act(() => {
            fireEvent.click(
                getByRole('button', {
                    name: 'Copy ticket identity debug state',
                }),
            )
        })

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Ticket identity debug state',
            expect.objectContaining({
                ticket_id_redux: 1,
                ticket_id_url: '1',
            }),
        )
        expect(toastSuccessSpy).not.toHaveBeenCalled()

        Object.defineProperty(window.navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard,
        })
        toastSuccessSpy.mockRestore()
        consoleWarnSpy.mockRestore()
    })

    it('should show the ticket identity debug menu for impersonated sessions', () => {
        window.USER_IMPERSONATED = true

        const { getByRole } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        expect(
            getByRole('button', {
                name: 'Toggle ticket identity debug menu',
            }),
        ).toBeInTheDocument()
    })

    it('should fetch customer details from url', () => {
        renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            initialEntries: ['/foo/new?customer=1'],
        })

        expect(minProps.fetchCustomer).toBeCalledWith('1')
    })

    it('should set activeCustomer as customer', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        }) as Map<any, any>

        const { rerender } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new?customer=1'] },
        )

        rerender(
            <TicketDetailContainer
                {...minProps}
                activeCustomer={activeCustomer}
            />,
        )

        expect(minProps.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email')),
        )
    })

    it('should not go to next ticket when setting status closed and history is open', () => {
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                ticket={existingTicket.setIn(
                    ['_internal', 'displayHistory'],
                    true,
                )}
                newMessage={fromJS({
                    newMessage: {
                        source: {
                            to: [],
                        },
                    },
                })}
                submitTicket={() => Promise.resolve()}
            />,
            {
                path: '/foo/:ticketId',
                initialEntries: [`/foo/${existingTicket.get('id') as string}`],
            },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        expect(minProps.goToNextTicket).not.toHaveBeenCalled()
    })

    it('should go to next ticket when setting status closed and history is closed', async () => {
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                ticket={existingTicket.setIn(
                    ['_internal', 'displayHistory'],
                    false,
                )}
                newMessage={fromJS({
                    newMessage: {
                        source: {
                            to: [],
                        },
                    },
                })}
                submitTicket={() => Promise.resolve()}
            />,
            {
                path: '/foo/:ticketId',
                initialEntries: [`/foo/${existingTicket.get('id') as string}`],
            },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() => expect(minProps.goToNextTicket).toHaveBeenCalled())
    })

    it('should use the close callback prop when setting status closed and history is closed', async () => {
        const mockCallback = jest.fn()
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                ticket={existingTicket.setIn(
                    ['_internal', 'displayHistory'],
                    false,
                )}
                newMessage={fromJS({
                    newMessage: {
                        source: {
                            to: [],
                        },
                    },
                })}
                submitTicket={() => Promise.resolve()}
                onGoToNextTicket={mockCallback}
            />,
            {
                path: '/foo/:ticketId',
                initialEntries: [`/foo/${existingTicket.get('id') as string}`],
            },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() => expect(mockCallback).toHaveBeenCalled())
    })

    it('should set activeCustomer as receiver when receiver is in the location state', () => {
        const expectedReceiver = {
            name: 'Pizza Pepperoni',
            address: '+12345',
        }

        renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            initialEntries: [
                {
                    pathname: '/foo/new',
                    search: '?customer=1',
                    state: { receiver: expectedReceiver },
                } as any,
            ],
        })

        expect(minProps.setReceivers).toBeCalledWith(
            {
                to: [expectedReceiver],
            },
            false,
        )
    })

    it('should update cursor of the view when the id of the ticket changes', () => {
        const activeView = fromJS({ order_by: 'updated_datetime' }) as Map<
            any,
            any
        >
        const newTicket = fromJS({
            id: 9999,
            updated_datetime: '2018-12-20',
        }) as Map<any, any>
        const { rerender } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new?customer=1'] },
        )

        rerender(
            <TicketDetailContainer
                {...minProps}
                activeView={activeView}
                ticket={newTicket}
            />,
        )

        expect(minProps.updateCursor).toBeCalledWith(
            newTicket.get(activeView.get('order_by')),
        )
    })

    it("should NOT update the cursor of the view when ticket's attributes change", () => {
        const activeView = fromJS({ order_by: 'updated_datetime' })
        const props = {
            ...minProps,
            activeView,
        }
        const { rerender } = renderWithMockedStore(
            <TicketDetailContainer {...props} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new?customer=1'] },
        )
        rerender(
            <TicketDetailContainer
                {...props}
                ticket={minProps.ticket.set('updated_datetime', moment())}
            />,
        )

        expect(minProps.updateCursor).not.toHaveBeenCalled()
    })

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from no recipients to one recipient',
        () => {
            const id = 80
            const { rerender } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
            )

            rerender(
                <TicketDetailContainer
                    {...minProps}
                    newMessageSource={fromJS({
                        to: [
                            {
                                name: 'foo',
                                address: 'foo@gorgias.io',
                                id,
                            },
                        ],
                    })}
                />,
            )

            expect(minProps.findAndSetCustomer).toBeCalledWith(id)
        },
    )

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from multiple recipients to one recipient',
        () => {
            const id = 80
            const props = {
                ...minProps,
                newMessageSource: fromJS({
                    to: [
                        {
                            name: 'foo',
                            address: 'foo@gorgias.io',
                        },
                        {
                            name: 'bar',
                            address: 'bar@gorgias.io',
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [],
                }),
                newMessage: newMessageState,
            }
            const { rerender } = renderWithMockedStore(
                <TicketDetailContainer {...props} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
            )

            rerender(
                <TicketDetailContainer
                    {...props}
                    newMessageSource={fromJS({
                        to: [
                            {
                                name: 'foo',
                                address: 'foo@gorgias.io',
                                id,
                            },
                        ],
                    })}
                />,
            )
            expect(minProps.findAndSetCustomer).toBeCalledWith(id)
        },
    )

    it(
        'should not try to set the first recipient as customer because event though this ticket is new and the ' +
            'recipients have changed from multiple recipients to one recipient, this is the same customer',
        () => {
            const props = {
                ...minProps,
                ticket: fromJS({
                    messages: [],
                    customer: {
                        name: 'foo',
                        email: 'foo@gorgias.io',
                        channels: [
                            {
                                type: 'email',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    },
                }),
                newMessage: newMessageState,
            }
            const { rerender } = renderWithMockedStore(
                <TicketDetailContainer {...props} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
            )

            rerender(
                <TicketDetailContainer
                    {...props}
                    newMessageSource={fromJS({
                        to: [
                            {
                                name: 'foo',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    })}
                />,
            )

            expect(minProps.findAndSetCustomer).not.toHaveBeenCalled()
        },
    )

    it('should restore the original customer of the ticket', async () => {
        const activeCustomer = {
            id: 1,
            name: 'foo',
            email: 'foo@gorgias.io',
            channels: [
                {
                    type: 'email',
                    address: 'foo@gorgias.io',
                },
            ],
        }

        const customer = {
            id: 2,
            name: 'bar',
            email: 'bar@gorgias.io',
            address: 'bar@gorgias.io',
            channels: [
                {
                    type: 'email',
                    address: 'bar@gorgias.io',
                },
            ],
        }

        const newRecipient = {
            name: 'another recipient',
            address: 'another@gorgias.io',
        }

        const props = {
            ...minProps,
            ticket: fromJS({ messages: [], customer }),
            activeCustomer: fromJS(activeCustomer),
            newMessageSource: fromJS({ to: [newRecipient] }),
        }

        const { rerender } = renderWithMockedStore(
            <TicketDetailContainer {...props} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new?customer=1'] },
        )

        rerender(
            <TicketDetailContainer
                {...props}
                ticket={fromJS({
                    messages: [],
                    customer,
                })}
            />,
        )

        await waitFor(() => {
            expect(minProps.setCustomer).toHaveBeenCalledWith(
                fromJS({
                    ...activeCustomer,
                    address: activeCustomer.email,
                }),
            )
        })
    })

    it(
        'should not try to set the first recipient as customer because the only recipient is in the `cc` field, and ' +
            'not in the `to` field',
        () => {
            const props = {
                ...minProps,
                ticket: fromJS({
                    messages: [],
                    customer: {
                        name: 'foo',
                        email: 'foo@gorgias.io',
                        channels: [
                            {
                                type: 'email',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    },
                }),
                newMessage: newMessageState,
            }

            const { rerender } = renderWithMockedStore(
                <TicketDetailContainer {...props} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
            )

            rerender(
                <TicketDetailContainer
                    {...props}
                    newMessageSource={fromJS({
                        cc: [
                            {
                                name: 'bar',
                                address: 'bar@gorgias.io',
                            },
                        ],
                    })}
                />,
            )

            expect(minProps.findAndSetCustomer).not.toHaveBeenCalled()
        },
    )

    it('should set the customer to null because the ticket is new and the recipients have been removed', () => {
        const props = {
            ...minProps,
            ticket: fromJS({
                messages: [],
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        to: [
                            {
                                name: 'foo',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    },
                },
            }),
            newMessageSource: fromJS({
                to: [
                    {
                        name: 'foo',
                        address: 'foo@gorgias.io',
                    },
                ],
            }),
        }
        const { rerender } = renderWithMockedStore(
            <TicketDetailContainer {...props} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )
        rerender(
            <TicketDetailContainer
                {...props}
                newMessageSource={fromJS({ to: [] })}
            />,
        )

        expect(minProps.setCustomer).toBeCalledWith(null)
    })

    it('should not unset the customer because the ticket is new and the new message is an internal note', () => {
        renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    messages: [],
                })}
                newMessage={fromJS({
                    newMessage: {
                        source: {
                            type: 'internal-note',
                            to: [],
                        },
                    },
                })}
                newMessageSource={fromJS({
                    to: [],
                    type: 'internal-note',
                })}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        expect(minProps.setCustomer).not.toBeCalled()
    })

    it('should not set customer when ticket created has internal note action', async () => {
        const submitMock = jest.fn()

        const ticket = newTicket.setIn(
            ['state', 'appliedMacro', 'actions'],
            fromJS([{ name: MacroActionName.AddInternalNote }]),
        )

        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                canSendMessage={true}
                ticket={ticket}
                submitTicket={submitMock}
                newMessage={fromJS({
                    newMessage: {
                        receiver: {
                            name: 'foo',
                        },
                    },
                })}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            expect(submitMock.mock.calls[0][0].get('customer')).toBeUndefined(),
        )
    })

    it('should defer sending new message when new message is of type email', async () => {
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    action: undefined,
                    messageId: 1,
                    messageToSend: preparedData.messageToSend,
                    replyAreaState: undefined,
                    resetMessage: true,
                    ticketId: '1',
                    submissionContext: expect.objectContaining({
                        ticket_id_url: '1',
                        ticket_id_submitted: '1',
                        ticket_id_redux: 1,
                        source_type: 'email',
                    }),
                }),
            ),
        )
        expect(prepareTicketMessageMock).toHaveBeenCalledWith(
            expect.objectContaining({
                submittedTicketId: '1',
                submissionContext: expect.objectContaining({
                    ticket_id_url: '1',
                    ticket_id_submitted: '1',
                    ticket_id_redux: 1,
                }),
            }),
        )
    })

    it('should defer email sends using the submitted ticket id', async () => {
        const preparedEmailData = {
            ...preparedData,
            messageToSend: {
                ...preparedData.messageToSend,
                ticket_id: 2,
            },
        }
        prepareTicketMessageMock.mockResolvedValue(preparedEmailData)

        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    messageToSend: preparedEmailData.messageToSend,
                    ticketId: '1',
                }),
            ),
        )
    })

    it('should not report ticket identity mismatches when the reporting flag is disabled', async () => {
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/2'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))

        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    ticketId: '2',
                }),
            ),
        )
        expect(mockReportError).not.toHaveBeenCalled()
    })

    it('should submit using the route ticket id when the route ticket differs from Redux', async () => {
        mockUseFlag.mockImplementation(
            (flag) =>
                flag ===
                FeatureFlagKey.TicketMessagesAssignedToWrongTicketDebugging,
        )

        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/2'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))

        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    ticketId: '2',
                }),
            ),
        )
        expect(prepareTicketMessageMock).toHaveBeenCalledWith(
            expect.objectContaining({
                submittedTicketId: '2',
                submissionContext: expect.objectContaining({
                    ticket_id_url: '2',
                    ticket_id_submitted: '2',
                    ticket_id_redux: 1,
                }),
            }),
        )
        expect(mockReportError).toHaveBeenNthCalledWith(
            1,
            expect.any(Error),
            {
                extra: expect.objectContaining({
                    stage: 'submit_click',
                    ticket_id_url: '2',
                    ticket_id_redux: 1,
                    ticket_id_submitted: '2',
                    status: 'closed',
                    reset_message: true,
                    source_type: 'email',
                    is_helpdesk_v2: false,
                    ticket_message_submission_identity_reporting_enabled: true,
                }),
            },
            ['ticket-message-submission-identity-mismatch', 'submit_click'],
        )
        expect(mockReportError).toHaveBeenNthCalledWith(
            2,
            expect.any(Error),
            {
                extra: expect.objectContaining({
                    stage: 'after_prepare',
                    ticket_id_url: '2',
                    ticket_id_redux: 1,
                    ticket_id_submitted: '2',
                    source_type: 'email',
                    is_helpdesk_v2: false,
                    ticket_message_submission_identity_reporting_enabled: true,
                }),
            },
            ['ticket-message-submission-identity-mismatch', 'after_prepare'],
        )
    })

    it('should refetch the route ticket when message preparation detects an identity mismatch', async () => {
        const toastErrorSpy = jest
            .spyOn(toast, 'error')
            .mockImplementation(jest.fn())
        prepareTicketMessageMock.mockRejectedValue(
            new TicketMessageIdentityMismatchError(),
        )

        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))

        await waitFor(() =>
            expect(minProps.fetchTicket).toHaveBeenCalledWith('1', {
                isCurrentlyOnTicket: true,
            }),
        )
        expect(toastErrorSpy).toHaveBeenCalledWith(
            'Ticket is still loading. Please try again in a moment.',
        )
        expect(pendingMessageManager.sendMessage).not.toHaveBeenCalled()
        expect(minProps.sendTicketMessage).not.toHaveBeenCalled()

        toastErrorSpy.mockRestore()
    })

    it('should send non-email messages using the route ticket id', async () => {
        const preparedFacebookData = {
            messageId: 1,
            messageToSend: {
                attachments: [],
                body_html: '<div>foo</div>',
                body_text: 'foo',
                channel: 'email',
                from_agent: true,
                macros: [],
                mention_ids: [],
                public: true,
                sender: {},
                source: {
                    type: 'facebook',
                    extra: {},
                    from: {},
                    to: [{}],
                },
                subject: '',
                via: 'helpdesk',
            },
            type: 'foo',
        }
        prepareTicketMessageMock.mockResolvedValue(preparedFacebookData)
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/2'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(minProps.sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                1,
                preparedFacebookData.messageToSend,
                undefined,
                true,
                '2',
                expect.objectContaining({
                    ticket_id_url: '2',
                    ticket_id_submitted: '2',
                    ticket_id_redux: 1,
                    source_type: 'facebook',
                }),
            ),
        )
    })

    it('should send a deferred message when sending a new deferred message', async () => {
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    action: undefined,
                    messageId: 1,
                    messageToSend: preparedData.messageToSend,
                    replyAreaState: undefined,
                    resetMessage: true,
                    ticketId: '1',
                    submissionContext: expect.objectContaining({
                        ticket_id_url: '1',
                        ticket_id_submitted: '1',
                        ticket_id_redux: 1,
                        source_type: 'email',
                    }),
                }),
            ),
        )
    })

    it.each([
        ['new ticket', newTicket, 123],
        ['existing ticket', existingTicket, 1],
    ])(
        'should close the ticket and redirect to the next ticket on %s submit success',
        async (testName, ticket, expectedTicketId) => {
            let resolveSubmit: (value?: unknown) => void
            const submitMock = jest.fn().mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveSubmit = resolve
                    }),
            )
            const { getByTestId, getByText } = renderWithMockedStore(
                <>
                    <TicketDetailContainer
                        {...minProps}
                        currentUser={currentUser}
                        canSendMessage
                        ticket={ticket}
                        submitTicket={submitMock}
                        sendTicketMessage={submitMock}
                    />
                    <NavigateButton to="/foo/123" />
                </>,
                {
                    path: '/foo/:ticketId',
                    initialEntries: [
                        `/foo/${(ticket.get('id') as string) || 'new'}`,
                    ],
                },
            )

            userEvent.click(getByTestId('TicketView-submit'))
            act(() => {
                getByText('Change ticket route').click()
                resolveSubmit?.({ resp: { id: 123 } })
            })

            await waitFor(() => {
                expect(minProps.goToNextTicket).toHaveBeenLastCalledWith(
                    expectedTicketId,
                    expect.any(Promise),
                )
            })
        },
    )

    it.each<[string, Error]>([
        [
            'TicketMessageInvalidSendDataError',
            new TicketMessageInvalidSendDataError(),
        ],
        [
            'TicketMessageActionValidationError',
            new TicketMessageActionValidationError('Test error'),
        ],
    ])('should not throw %s', async (testName, error) => {
        prepareTicketMessageMock.mockRejectedValue(error)
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket}
                newMessage={newMessageState}
                canSendMessage
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await flushPromises()
    })

    it.each<
        [string, string, () => { goToTicket: jest.Mock; isEnabled: boolean }]
    >([
        [
            'next',
            'GO_FORWARD',
            () => {
                const mock = {
                    goToTicket: mockGoToNextTicket,
                    isEnabled: false,
                }
                mockUseGoToNextTicket.mockReturnValue(mock)
                return mock
            },
        ],
        [
            'next',
            'GO_FORWARD',
            () => {
                const mock = {
                    goToTicket: mockGoToNextTicket,
                    isEnabled: false,
                }
                mockUseGoToNextTicket.mockReturnValue(mock)
                return mock
            },
        ],
        [
            'prev',
            'GO_BACK',
            () => {
                const mock = {
                    goToTicket: mockGoToPreviousTicket,
                    isEnabled: false,
                }
                mockUseGoToPreviousTicket.mockReturnValue(mock)
                return mock
            },
        ],
        [
            'prev',
            'GO_BACK',
            () => {
                const mock = {
                    goToTicket: mockGoToPreviousTicket,
                    isEnabled: true,
                }
                mockUseGoToPreviousTicket.mockReturnValue(mock)
                return mock
            },
        ],
    ])(
        'should debounce %s ticket calls while call is already pending',
        (testName, actionName, testSetup) => {
            const execKeyboardAction =
                makeExecuteKeyboardAction(shortcutManagerMock)

            const callMock = testSetup()

            renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
                path: '/foo/:ticketId',
                initialEntries: ['/foo/1'],
            })

            execKeyboardAction(actionName)
            execKeyboardAction(actionName)

            expect(callMock.goToTicket).toHaveBeenCalledTimes(
                callMock.isEnabled ? 1 : 0,
            )
        },
    )

    it('should bind legacy previous and next keyboard shortcuts when hasUIVisionMS1 is disabled', () => {
        mockUseHelpdeskV2MS1Flag.mockReturnValue(false)

        renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        const lastBindCall = shortcutManagerMock.bind.mock.calls.at(-1)

        expect(lastBindCall?.[0]).toBe('TicketDetailContainer')
        expect(lastBindCall?.[1]).toEqual(
            expect.objectContaining({
                GO_BACK: expect.any(Object),
                GO_FORWARD: expect.any(Object),
                SUBMIT_TICKET: expect.any(Object),
                SUBMIT_CLOSE_TICKET: expect.any(Object),
            }),
        )
    })

    it('should not bind legacy previous and next keyboard shortcuts when hasUIVisionMS1 is enabled', () => {
        mockUseHelpdeskV2MS1Flag.mockReturnValue(true)

        renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        const lastBindCall = shortcutManagerMock.bind.mock.calls.at(-1)

        expect(lastBindCall?.[0]).toBe('TicketDetailContainer')
        expect(lastBindCall?.[1]).toEqual(
            expect.objectContaining({
                SUBMIT_TICKET: expect.any(Object),
                SUBMIT_CLOSE_TICKET: expect.any(Object),
            }),
        )
        expect(lastBindCall?.[1]).not.toEqual(
            expect.objectContaining({
                GO_BACK: expect.any(Object),
            }),
        )
        expect(lastBindCall?.[1]).not.toEqual(
            expect.objectContaining({
                GO_FORWARD: expect.any(Object),
            }),
        )
    })

    it('should track the control / cmd + f combo', () => {
        const { container } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        fireEvent.keyDown(container.firstChild!, { key: 'f', ctrlKey: true })
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.TicketMessageSearchKeyPressed,
        )
    })

    it('should not track the control / cmd + f combo if on a new ticket', () => {
        const { container } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        fireEvent.keyDown(container.firstChild!, { key: 'f', ctrlKey: true })
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should call ticket submit if can send message', () => {
        renderWithMockedStore(
            <TicketDetailContainer {...minProps} canSendMessage={true} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        makeExecuteKeyboardAction(shortcutManagerMock)('SUBMIT_TICKET')

        expect(minProps.submitTicket).toHaveBeenCalled()
    })

    it("should not call ticket submit if can't send message", () => {
        renderWithMockedStore(
            <TicketDetailContainer {...minProps} canSendMessage={false} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        makeExecuteKeyboardAction(shortcutManagerMock)('SUBMIT_TICKET')

        expect(minProps.submitTicket).not.toHaveBeenCalled()
    })

    it('should not call ticket submit if translation is pending', () => {
        mockUseOutboundTranslationContext.mockReturnValue({
            isTranslationPending: true,
        })
        renderWithMockedStore(
            <TicketDetailContainer {...minProps} canSendMessage={true} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        makeExecuteKeyboardAction(shortcutManagerMock)('SUBMIT_TICKET')

        expect(minProps.submitTicket).not.toHaveBeenCalled()
    })

    it('should not call ticket submit & close if translation is pending', () => {
        mockUseOutboundTranslationContext.mockReturnValue({
            isTranslationPending: true,
        })
        renderWithMockedStore(
            <TicketDetailContainer {...minProps} canSendMessage={true} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        makeExecuteKeyboardAction(shortcutManagerMock)('SUBMIT_CLOSE_TICKET')

        expect(minProps.submitTicket).not.toHaveBeenCalled()
    })

    it('should call setRecentItem on mount', () => {
        const mockCustomer = {
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        }
        const ticket = existingTicket.set('customer', fromJS(mockCustomer))

        renderWithMockedStore(
            <TicketDetailContainer {...minProps} ticket={ticket} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        expect(mockSetRecentItem).toHaveBeenCalledWith(
            expect.objectContaining({
                id: existingTicket.get('id'),
                customer: mockCustomer,
            }),
        )
    })

    it('should clear ticket draft stored in local forage when current ticket is new and successfully created', async () => {
        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} canSendMessage={true} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await flushPromises()
        expect(localForageManager.clearTable).toHaveBeenCalled()
    })

    it('should not clear ticket draft stored in local forage when current ticket is new but sending has failed', async () => {
        const error = new Error('ticket not created')

        const { getByTestId } = renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                canSendMessage={true}
                submitTicket={() => {
                    return Promise.resolve({ error })
                }}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await flushPromises()
        expect(localForageManager.clearTable).not.toHaveBeenCalled()
    })

    describe('ticket fields', () => {
        it('should not allow ticket to be set to close if errored', async () => {
            useCustomFieldDefinitionsMock.mockReturnValue({
                isLoading: false,
                data: {
                    data: [
                        ticketDropdownFieldDefinition,
                        { ...ticketInputFieldDefinition, required: true },
                    ],
                },
            })
            const { getByTestId } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        canSendMessage: true,
                        fieldsState: {},
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
            )

            // Wait for component to be fully loaded
            await waitFor(() => {
                expect(getByTestId('TicketView-submit')).toBeInTheDocument()
                expect(
                    getByTestId('TicketView-change-status'),
                ).toBeInTheDocument()
            })

            userEvent.click(getByTestId('TicketView-submit'))

            expect(
                useCustomFieldsConditionsEvaluationResults,
            ).toHaveBeenCalledWith(OBJECT_TYPES.TICKET, { tags: [] })
            expect(triggerTicketFieldsErrors).toHaveBeenNthCalledWith(1, [
                ticketInputFieldDefinition.id,
            ])
            userEvent.click(getByTestId('TicketView-change-status'))
            expect(triggerTicketFieldsErrors).toHaveBeenNthCalledWith(2, [
                ticketInputFieldDefinition.id,
            ])
            expect(spiedMergeFieldsStateWithMacroValues).toHaveBeenCalledTimes(
                1,
            )
            makeExecuteKeyboardAction(shortcutManagerMock)(
                'SUBMIT_CLOSE_TICKET',
            )
            expect(triggerTicketFieldsErrors).toHaveBeenNthCalledWith(3, [
                ticketInputFieldDefinition.id,
            ])
            expect(spiedMergeFieldsStateWithMacroValues).toHaveBeenCalledTimes(
                2,
            )
        })

        it('should use the route ticket id when checking ticket fields', async () => {
            useCustomFieldDefinitionsMock.mockReturnValue({
                isLoading: false,
                data: {
                    data: [
                        ticketDropdownFieldDefinition,
                        { ...ticketInputFieldDefinition, required: true },
                    ],
                },
            })
            const { getByTestId } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket,
                        canSendMessage: true,
                        fieldsState: {},
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/2'] },
            )

            userEvent.click(getByTestId('TicketView-submit'))

            expect(triggerTicketFieldsErrors).toHaveBeenCalledWith([
                ticketInputFieldDefinition.id,
            ])
        })

        it('should not trigger ticket field validation when sending a message without closing on existing ticket', async () => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            useCustomFieldDefinitionsMock.mockReturnValue({
                isLoading: false,
                data: {
                    data: [
                        ticketDropdownFieldDefinition,
                        { ...ticketInputFieldDefinition, required: true },
                    ],
                },
            })

            const { getByTestId } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket,
                        newMessage: newMessageState,
                        canSendMessage: true,
                        fieldsState: {},
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            userEvent.click(getByTestId('TicketView-submit-send'))

            await waitFor(() =>
                expect(pendingMessageManager.sendMessage).toHaveBeenCalled(),
            )

            expect(triggerTicketFieldsErrors).not.toHaveBeenCalled()
        })

        it('should not trigger ticket field validation in submit when closing an existing ticket with hasUIVisionMS1 flag', async () => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            useCustomFieldDefinitionsMock.mockReturnValue({
                isLoading: false,
                data: {
                    data: [
                        ticketDropdownFieldDefinition,
                        { ...ticketInputFieldDefinition, required: true },
                    ],
                },
            })

            const { getByTestId } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket,
                        newMessage: newMessageState,
                        canSendMessage: true,
                        fieldsState: {},
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            userEvent.click(getByTestId('TicketView-submit'))
            expect(triggerTicketFieldsErrors).not.toHaveBeenCalled()
        })

        it('should not submit via keyboard shortcut when ticket field validation fails on existing ticket', async () => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            mockValidateTicketFields.mockReturnValue({
                hasErrors: true,
                invalidFieldIds: [ticketInputFieldDefinition.id],
            })

            renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket,
                        newMessage: newMessageState,
                        canSendMessage: true,
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            makeExecuteKeyboardAction(shortcutManagerMock)(
                'SUBMIT_CLOSE_TICKET',
            )

            await flushPromises()

            expect(mockValidateTicketFields).toHaveBeenCalled()
            expect(pendingMessageManager.sendMessage).not.toHaveBeenCalled()
            expect(minProps.submitTicket).not.toHaveBeenCalled()
        })

        it('should use the route ticket id when validating ticket fields', async () => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            mockValidateTicketFields.mockReturnValue({
                hasErrors: true,
                invalidFieldIds: [ticketInputFieldDefinition.id],
            })

            renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket,
                        newMessage: newMessageState,
                        canSendMessage: true,
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/2'] },
            )

            makeExecuteKeyboardAction(shortcutManagerMock)(
                'SUBMIT_CLOSE_TICKET',
            )

            await flushPromises()

            expect(mockUseTicketFieldsValidation).toHaveBeenCalledWith(2)
            expect(mockValidateTicketFields).toHaveBeenCalled()
            expect(pendingMessageManager.sendMessage).not.toHaveBeenCalled()
        })

        it('should allow keyboard shortcut submit when ticket field validation passes on existing ticket', async () => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            mockValidateTicketFields.mockReturnValue({
                hasErrors: false,
                invalidFieldIds: [],
            })

            renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket,
                        newMessage: newMessageState,
                        canSendMessage: true,
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            makeExecuteKeyboardAction(shortcutManagerMock)(
                'SUBMIT_CLOSE_TICKET',
            )

            await waitFor(() => {
                expect(mockValidateTicketFields).toHaveBeenCalled()
                expect(pendingMessageManager.sendMessage).toHaveBeenCalled()
            })
        })

        it('should skip ticket field validation on new ticket even with hasUIVisionMS1 flag', async () => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            mockValidateTicketFields.mockReturnValue({
                hasErrors: true,
                invalidFieldIds: [ticketInputFieldDefinition.id],
            })

            renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: newTicket,
                        canSendMessage: true,
                    }}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
            )

            makeExecuteKeyboardAction(shortcutManagerMock)(
                'SUBMIT_CLOSE_TICKET',
            )

            await waitFor(() => {
                expect(minProps.submitTicket).toHaveBeenCalled()
            })
        })
    })

    describe('ticket voice calls', () => {
        it('should show loading spinner until voice calls are loaded when the ticket channel is Voice', () => {
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: true,
            })) as jest.MockedFn<any>)
            const { getByText } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket.set(
                            'channel',
                            TicketChannel.Phone,
                        ),
                    }}
                />,
            )

            expect(getByText('Loading ticket...')).toBeInTheDocument()
        })

        it('should not show loading spinner when voice calls are not loaded and ticket channel is not Voice', () => {
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: true,
            })) as jest.MockedFn<any>)
            const { queryByText } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket.set(
                            'channel',
                            TicketChannel.Email,
                        ),
                    }}
                />,
            )

            expect(queryByText('Loading ticket...')).not.toBeInTheDocument()
        })

        it('should not show loading spinner and prepare message when voice calls are loaded and ticket channel is Voice', () => {
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: false,
                data: { data: [{}] },
            })) as jest.MockedFn<any>)
            jest.spyOn(
                ticketUtils,
                'getSourceTypeOfResponse',
            ).mockReturnValueOnce(TicketMessageSourceType.Phone)
            const { queryByText } = renderWithMockedStore(
                <TicketDetailContainer
                    {...{
                        ...minProps,
                        ticket: existingTicket.set(
                            'channel',
                            TicketChannel.Phone,
                        ),
                    }}
                />,
            )

            expect(queryByText('Loading ticket...')).not.toBeInTheDocument()
            expect(minProps.prepare).toHaveBeenCalledWith(
                TicketMessageSourceType.Phone,
            )
        })
    })

    it('should use ticket activity tracking', () => {
        renderWithMockedStore(
            <TicketDetailContainer {...minProps} ticket={existingTicket} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        expect(mockUseTicketActivityTracking).toHaveBeenCalledWith(1)
    })

    it('should not use ticket activity tracking when the ticket is new', () => {
        renderWithMockedStore(
            <TicketDetailContainer {...minProps} ticket={newTicket} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/new'] },
        )

        expect(mockUseTicketActivityTracking).toHaveBeenCalledWith(undefined)
    })

    it('should not use ticket activity tracking when ticket is closed', () => {
        renderWithMockedStore(
            <TicketDetailContainer
                {...minProps}
                ticket={existingTicket.set('status', 'closed')}
            />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        expect(mockUseTicketActivityTracking).toHaveBeenCalledWith(undefined)
    })

    it('should call joinTicket and leaveTicket from realtime ably package on mount / unmount', () => {
        const { unmount } = renderWithMockedStore(
            <TicketDetailContainer {...minProps} />,
            { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
        )

        expect(mockJoinTicket).toHaveBeenCalledWith(1, {
            onEvent: expect.any(Function),
        })

        unmount()
        expect(mockLeaveTicket).toHaveBeenCalled()
    })

    it('should process translation and realtime ticket updates', () => {
        const mockHandleTicketMessageTranslationEvents = jest.fn()
        const mockHandleTicketUpdateEvents = jest.fn()
        mockUseHelpdeskV2MS3Flag.mockReturnValue(true)
        mockUseLiveTicketTranslationsUpdates.mockReturnValue({
            handleTicketMessageTranslationEvents:
                mockHandleTicketMessageTranslationEvents,
        })
        mockUseRealtimeTicketUpdates.mockReturnValue({
            handleTicketUpdateEvents: mockHandleTicketUpdateEvents,
        })

        renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        const onEventCall = mockJoinTicket.mock.calls[0][1].onEvent
        const mockDomainEvent = { type: 'test-event', data: {} }

        onEventCall(mockDomainEvent)

        expect(mockHandleTicketMessageTranslationEvents).toHaveBeenCalledWith(
            mockDomainEvent,
        )
        expect(mockHandleTicketUpdateEvents).toHaveBeenCalledWith(
            mockDomainEvent,
        )
    })

    it('should not process realtime updates when MS3 is disabled', () => {
        const mockHandleTicketUpdateEvents = jest.fn()
        mockUseHelpdeskV2MS3Flag.mockReturnValue(false)
        mockUseRealtimeTicketUpdates.mockReturnValue({
            handleTicketUpdateEvents: mockHandleTicketUpdateEvents,
        })

        renderWithMockedStore(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        const onEventCall = mockJoinTicket.mock.calls[0][1].onEvent
        const mockDomainEvent = { type: 'test-event', data: {} }

        onEventCall(mockDomainEvent)

        expect(mockHandleTicketUpdateEvents).not.toHaveBeenCalled()
    })

    describe('TicketThread rendering', () => {
        it('should render TicketThread on desktop when hasUIVisionMS3 is enabled', () => {
            mockUseIsMobileResolution.mockReturnValue(false)
            mockUseHelpdeskV2MS3Flag.mockReturnValue(true)

            const { getByText, queryByTestId } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByText('TicketThread mock')).toBeInTheDocument()
            expect(queryByTestId('TicketView-submit')).not.toBeInTheDocument()
            expect(mockTicketThread).toHaveBeenCalledWith(
                {
                    submit: expect.any(Function),
                    isLoading: false,
                },
                expect.objectContaining({}),
            )
        })

        it('should pass loading state to TicketThread on desktop when MS3 phone data is loading', () => {
            mockUseIsMobileResolution.mockReturnValue(false)
            mockUseHelpdeskV2MS3Flag.mockReturnValue(true)
            mockUseFlag.mockImplementation(
                (flag) => flag === FeatureFlagKey.TicketThreadLoadingState,
            )
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: true,
            })) as jest.MockedFn<any>)

            const { getByText, queryByText } = renderWithMockedStore(
                <TicketDetailContainer
                    {...minProps}
                    ticket={existingTicket.set('channel', TicketChannel.Phone)}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByText('TicketThread mock')).toBeInTheDocument()
            expect(queryByText('Loading ticket...')).not.toBeInTheDocument()
            expect(mockTicketThread).toHaveBeenCalledWith(
                {
                    submit: expect.any(Function),
                    isLoading: true,
                },
                expect.objectContaining({}),
            )
        })

        it('should keep the full page loader on desktop when MS3 phone data is loading and ticket thread loading state is disabled', () => {
            mockUseIsMobileResolution.mockReturnValue(false)
            mockUseHelpdeskV2MS3Flag.mockReturnValue(true)
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: true,
            })) as jest.MockedFn<any>)

            const { getByText, queryByText } = renderWithMockedStore(
                <TicketDetailContainer
                    {...minProps}
                    ticket={existingTicket.set('channel', TicketChannel.Phone)}
                />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByText('Loading ticket...')).toBeInTheDocument()
            expect(queryByText('TicketThread mock')).not.toBeInTheDocument()
            expect(mockTicketThread).not.toHaveBeenCalled()
        })

        it('should keep rendering the mobile TicketView when hasUIVisionMS3 is enabled', () => {
            mockUseIsMobileResolution.mockReturnValue(true)
            mockUseHelpdeskV2MS3Flag.mockReturnValue(true)

            const { getByTestId, queryByText } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByTestId('knowledge-source-provider')).toBeInTheDocument()
            expect(getByTestId('TicketView-submit')).toBeInTheDocument()
            expect(queryByText('TicketThread mock')).not.toBeInTheDocument()
            expect(mockTicketThread).not.toHaveBeenCalled()
        })
    })

    describe('Mobile view functionality', () => {
        beforeEach(() => {
            // Reset mocks
            mockUseKnowledgeSourceSideBar.mockReturnValue({ mode: null })
        })

        it('should render desktop view when not mobile resolution', () => {
            mockUseIsMobileResolution.mockReturnValue(false)

            const { queryByTestId } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(
                queryByTestId('knowledge-source-provider'),
            ).not.toBeInTheDocument()
        })

        it('should render mobile view with knowledge source provider when mobile resolution', () => {
            mockUseIsMobileResolution.mockReturnValue(true)

            const { getByTestId } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByTestId('knowledge-source-provider')).toBeInTheDocument()
        })

        it('should show knowledge source sidebar when mode is set on mobile', () => {
            mockUseIsMobileResolution.mockReturnValue(true)
            mockUseKnowledgeSourceSideBar.mockReturnValue({
                mode: 'sidebar' as any,
            })

            const { getByTestId } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByTestId('knowledge-source-sidebar')).toBeInTheDocument()
        })

        it('should not show knowledge source sidebar when mode is not set on mobile', () => {
            mockUseIsMobileResolution.mockReturnValue(true)
            mockUseKnowledgeSourceSideBar.mockReturnValue({ mode: null })

            const { queryByTestId } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(
                queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Additional coverage tests', () => {
        it('should handle mobile resolution changes', () => {
            mockUseIsMobileResolution.mockReturnValue(true)

            const { rerender, getByTestId } = renderWithMockedStore(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
                { path: '/foo/:ticketId', initialEntries: ['/foo/1'] },
            )

            expect(getByTestId('knowledge-source-provider')).toBeInTheDocument()

            // Change to desktop
            mockUseIsMobileResolution.mockReturnValue(false)

            rerender(
                <TicketDetailContainer {...minProps} ticket={existingTicket} />,
            )

            // Provider should not be present on desktop
            expect(() => getByTestId('knowledge-source-provider')).toThrow()
        })
    })
})
