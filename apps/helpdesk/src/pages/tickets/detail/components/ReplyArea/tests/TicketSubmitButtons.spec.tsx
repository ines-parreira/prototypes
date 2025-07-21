import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ACTION_TEMPLATES } from 'config'
import { MacroActionName } from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import TicketSubmitButtons from '../TicketSubmitButtons'

jest.mock('lodash/sample', () => (array: unknown[]) => array[0])
jest.mock('pages/common/components/button/ConfirmButton')

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

describe('<TicketSubmitButtons />', () => {
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
        return fromJS({ state: { appliedMacro: { actions } } }) as Map<any, any>
    }

    const ticketWithSubject = createTicket([MacroActionName.SetSubject])

    it('should render buttons with a filled ticket', () => {
        const { container } = render(
            <Provider store={mockStore(state)}>
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should hide tips', () => {
        const { queryByText } = render(
            <Provider
                store={mockStore({
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
                })}
            >
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )
        expect(queryByText(/Press/)).not.toBeInTheDocument()
    })

    it('should render buttons with an empty ticket', () => {
        const { getAllByText } = render(
            <Provider
                store={mockStore({
                    ...state,
                    newMessage: fromJS({
                        newMessage: {
                            body_text: '',
                        },
                    }),
                })}
            >
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )
        const disabledButtons = getAllByText(/ConfirmButtonMock/)
        expect(disabledButtons).toHaveLength(2)
        expect(disabledButtons[0]).toBeDisabled()
        expect(disabledButtons[1]).toBeDisabled()
    })

    it("should render buttons with content that can't be sent", () => {
        const { getAllByText } = render(
            <Provider
                store={mockStore({
                    ...state,
                    newMessage: fromJS({
                        newMessage: {
                            body_text: '',
                        },
                    }),
                })}
            >
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )
        const disabledButtons = getAllByText(/ConfirmButtonMock/)
        expect(disabledButtons).toHaveLength(2)
        expect(disabledButtons[0]).toBeDisabled()
        expect(disabledButtons[1]).toBeDisabled()
    })

    it('should render buttons with contentless action', () => {
        const { getAllByRole } = render(
            <Provider
                store={mockStore({
                    ...state,
                    newMessage: fromJS({
                        newMessage: {
                            body_text: '',
                        },
                    }),
                    ticket: ticketWithSubject,
                })}
            >
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )
        const buttons = getAllByRole('button', { name: /Apply Macro/ })
        expect(buttons[0]).toBeInTheDocument()
        expect(buttons[0]).toBeAriaEnabled()
        expect(buttons[1]).toBeInTheDocument()
        expect(buttons[1]).toBeAriaEnabled()
    })

    it('should render buttons with contentless action and message content', () => {
        const { getAllByRole } = render(
            <Provider
                store={mockStore({
                    ...state,
                    newMessage: fromJS({
                        newMessage: {
                            body_text: 'abc',
                        },
                    }),
                    ticket: ticketWithSubject,
                })}
            >
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )
        const buttons = getAllByRole('button', { name: /Send/ })
        expect(buttons[0]).toBeInTheDocument()
        expect(buttons[0]).toBeAriaEnabled()
        expect(buttons[1]).toBeInTheDocument()
        expect(buttons[1]).toBeAriaEnabled()
    })

    it('should not render confirm popover', () => {
        const { queryByText } = render(
            <Provider
                store={mockStore({
                    ...state,
                    ticket: ticketWithSubject,
                })}
            >
                <TicketSubmitButtons setTicketStatus={jest.fn()} />
            </Provider>,
        )

        expect(queryByText(/ConfirmButtonMock/)).not.toBeInTheDocument()
    })
})
