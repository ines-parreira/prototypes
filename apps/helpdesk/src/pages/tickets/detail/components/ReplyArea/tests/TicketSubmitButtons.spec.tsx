import type { ComponentProps } from 'react'

import { useFlag } from '@repo/feature-flags'
import { logEvent } from '@repo/logging'
import { TicketsLegacyBridgeProvider } from '@repo/tickets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map as ImmutableMap } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketStatus } from 'business/types/ticket'
import { ACTION_TEMPLATES } from 'config'
import { MacroActionName } from 'models/macroAction/types'
import type ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'

import TicketSubmitButtons from '../TicketSubmitButtons'

jest.mock('lodash/sample', () => (array: unknown[]) => array[0])
jest.mock('pages/common/components/button/ConfirmButton')
jest.mock('providers/OutboundTranslationProvider')
jest.mock('@repo/logging')

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

const mockValidateTicketFields = jest.fn()
const mockCloseTicket = jest.fn()
const mockUseHelpdeskV2MS1Flag = jest.fn(() => false)

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useTicketFieldsValidation: () => ({
        validateTicketFields: mockValidateTicketFields,
        isValidating: false,
    }),
}))

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: () => mockUseHelpdeskV2MS1Flag(),
}))

jest.mock(
    'pages/common/components/button/ConfirmButton',
    () =>
        ({
            children,
            id,
            isDisabled,
        }: Partial<ComponentProps<typeof ConfirmButton>>) => (
            <button disabled={isDisabled} id={id}>
                ConfirmButtonMock: {children}
            </button>
        ),
)

const mockStore = configureMockStore([thunk])
const mockUseOutboundTranslationContext =
    useOutboundTranslationContext as jest.Mock

const mockContext = {
    ticketIdToDraftIdMap: new Map(),
    translationCache: new Map(),
    getTranslationFromCache: jest.fn(),
    registerTranslationDraft: jest.fn(),
    getCurrentDraftId: jest.fn(),
    isTranslationPending: false,
}

const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 0,
            cacheTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
})

const legacyBridgeTestProps = {
    dispatchNotification: jest.fn(),
    dispatchDismissNotification: jest.fn(),
    dispatchAuditLogEvents: jest.fn(),
    dispatchHideAuditLogEvents: jest.fn(),
    toggleQuickReplies: jest.fn(),
    onToggleUnread: jest.fn(),
    ticketViewNavigation: {
        shouldDisplay: false,
        shouldUseLegacyFunctions: false,
        previousTicketId: undefined,
        nextTicketId: undefined,
        legacyGoToPrevTicket: jest.fn(),
        isPreviousEnabled: false,
        legacyGoToNextTicket: jest.fn(),
        isNextEnabled: false,
    },
    handleTicketDraft: {
        hasDraft: false,
        onResumeDraft: jest.fn(),
        onDiscardDraft: jest.fn(),
    },
    makeOutboundCall: jest.fn(),
    voiceDevice: {
        device: {},
        call: null,
    },
    dtpToggle: {
        isEnabled: false,
        setIsEnabled: jest.fn(),
        previousTicketId: undefined,
        nextTicketId: undefined,
        setPrevNextTicketIds: jest.fn(),
        shouldRedirectToSplitView: false,
        setShouldRedirectToSplitView: jest.fn(),
    },
    dtpEnabled: {
        isEnabled: false,
    },
    humanizeChannel: jest.fn(),
}

describe('<TicketSubmitButtons />', () => {
    const mockSubmit = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseOutboundTranslationContext.mockReturnValue(mockContext)
        mockUseFlag.mockReturnValue(false)
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })
        testQueryClient.clear()
    })

    const renderComponent = (
        store: any,
        props?: {
            submit?: jest.Mock
        },
    ) => {
        const user = userEvent.setup()
        return {
            user,
            ...render(
                <MemoryRouter>
                    <Provider store={store}>
                        <TicketsLegacyBridgeProvider {...legacyBridgeTestProps}>
                            <QueryClientProvider client={testQueryClient}>
                                <TicketSubmitButtons
                                    submit={props?.submit ?? mockSubmit}
                                />
                            </QueryClientProvider>
                        </TicketsLegacyBridgeProvider>
                    </Provider>
                </MemoryRouter>,
            ),
        }
    }

    const state = {
        newMessage: fromJS({
            newMessage: {
                body_text: 'abc',
            },
            _internal: {
                loading: {
                    submitMessage: false,
                },
            },
        }),
        currentAccount: fromJS({
            status: { status: 'active' },
        }),
        currentUser: fromJS({}),
        ticket: fromJS({}),
    }

    const createTicket = (actionNames: string[]) => {
        const actions = actionNames.map(
            (name) => ACTION_TEMPLATES.find((action) => action.name === name)!,
        )
        return fromJS({ state: { appliedMacro: { actions } } }) as ImmutableMap<
            any,
            any
        >
    }

    const ticketWithSubject = createTicket([MacroActionName.SetSubject])

    it('should render buttons with a filled ticket', () => {
        const { container } = renderComponent(mockStore(state))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should hide tips', () => {
        const { queryByText } = renderComponent(
            mockStore({
                ...state,
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                hide_tips: true,
                            },
                        },
                    ],
                }),
            }),
        )
        expect(queryByText(/Press/)).not.toBeInTheDocument()
    })

    it('should render buttons with an empty ticket', () => {
        const { getAllByText } = renderComponent(
            mockStore({
                ...state,
                newMessage: fromJS({
                    newMessage: {
                        body_text: '',
                    },
                }),
            }),
        )
        const disabledButtons = getAllByText(/ConfirmButtonMock/)
        expect(disabledButtons).toHaveLength(2)
        expect(disabledButtons[0]).toBeDisabled()
        expect(disabledButtons[1]).toBeDisabled()
    })

    it("should render buttons with content that can't be sent", () => {
        const { getAllByText } = renderComponent(
            mockStore({
                ...state,
                newMessage: fromJS({
                    newMessage: {
                        body_text: '',
                    },
                }),
            }),
        )
        const disabledButtons = getAllByText(/ConfirmButtonMock/)
        expect(disabledButtons).toHaveLength(2)
        expect(disabledButtons[0]).toBeDisabled()
        expect(disabledButtons[1]).toBeDisabled()
    })

    it('should render buttons with contentless action', () => {
        const { getAllByRole } = renderComponent(
            mockStore({
                ...state,
                newMessage: fromJS({
                    newMessage: {
                        body_text: '',
                    },
                }),
                ticket: ticketWithSubject,
            }),
        )
        const buttons = getAllByRole('button', { name: /Apply Macro/ })
        expect(buttons[0]).toBeInTheDocument()
        expect(buttons[0]).toBeAriaEnabled()
        expect(buttons[1]).toBeInTheDocument()
        expect(buttons[1]).toBeAriaEnabled()
    })

    it('should render buttons with contentless action and message content', () => {
        const { getAllByRole } = renderComponent(
            mockStore({
                ...state,
                newMessage: fromJS({
                    newMessage: {
                        body_text: 'abc',
                    },
                }),
                ticket: ticketWithSubject,
            }),
        )
        const buttons = getAllByRole('button', { name: /Send/ })
        expect(buttons[0]).toBeInTheDocument()
        expect(buttons[0]).toBeAriaEnabled()
        expect(buttons[1]).toBeInTheDocument()
        expect(buttons[1]).toBeAriaEnabled()
    })

    it('should not render confirm popover', () => {
        const { queryByText } = renderComponent(
            mockStore({
                ...state,
                ticket: ticketWithSubject,
            }),
        )

        expect(queryByText(/ConfirmButtonMock/)).not.toBeInTheDocument()
    })

    it('should disable buttons when translation is pending', () => {
        mockUseOutboundTranslationContext.mockReturnValue({
            ...mockContext,
            isTranslationPending: true,
        })

        const { getAllByRole } = renderComponent(mockStore(state))

        const buttons = getAllByRole('button', { name: /Send/ })

        expect(buttons[0]).toBeDisabled()
        expect(buttons[1]).toBeDisabled()
    })

    describe('handleSendAndCloseTicket', () => {
        const existingTicketState = {
            ...state,
            ticket: fromJS({
                id: 123,
                subject: 'Test ticket',
            }),
        }

        describe('when hasUIVisionMS1 flag is disabled (legacy behavior)', () => {
            beforeEach(() => {
                mockUseHelpdeskV2MS1Flag.mockReturnValue(false)
            })

            it('should call submit with Closed status when clicking Send & Close', async () => {
                const { user, getByRole } = renderComponent(
                    mockStore(existingTicketState),
                )

                const sendAndCloseButton = getByRole('button', {
                    name: /Send & Close/,
                })
                await user.click(sendAndCloseButton)

                expect(mockSubmit).toHaveBeenCalledWith({
                    status: TicketStatus.Closed,
                })
                expect(logEvent).toHaveBeenCalled()
            })

            it('should not call closeTicket in legacy mode', async () => {
                const { user, getByRole } = renderComponent(
                    mockStore(existingTicketState),
                )

                const sendAndCloseButton = getByRole('button', {
                    name: /Send & Close/,
                })
                await user.click(sendAndCloseButton)

                expect(mockCloseTicket).not.toHaveBeenCalled()
            })
        })

        describe('when hasUIVisionMS1 flag is enabled', () => {
            beforeEach(() => {
                mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
            })

            it('should return early if ticket has no id', async () => {
                const noIdTicketState = {
                    ...state,
                    ticket: fromJS({
                        subject: 'Test ticket',
                    }),
                }

                const { user, getByRole } = renderComponent(
                    mockStore(noIdTicketState),
                )

                const sendAndCloseButton = getByRole('button', {
                    name: /Send & Close/,
                })
                await user.click(sendAndCloseButton)

                expect(mockValidateTicketFields).toHaveBeenCalled()
                expect(mockSubmit).not.toHaveBeenCalled()
                expect(mockCloseTicket).not.toHaveBeenCalled()
            })

            it('should return early if ticket field validation fails', async () => {
                mockValidateTicketFields.mockReturnValue({
                    hasErrors: true,
                    invalidFieldIds: [1, 2],
                })

                const { user, getByRole } = renderComponent(
                    mockStore(existingTicketState),
                )

                const sendAndCloseButton = getByRole('button', {
                    name: /Send & Close/,
                })
                await user.click(sendAndCloseButton)

                expect(mockValidateTicketFields).toHaveBeenCalled()
                expect(mockSubmit).not.toHaveBeenCalled()
                expect(mockCloseTicket).not.toHaveBeenCalled()
                expect(logEvent).not.toHaveBeenCalled()
            })
        })
    })
})
