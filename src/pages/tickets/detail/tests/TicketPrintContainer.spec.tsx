import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'
import {renderWithRouter} from 'utils/testing'

jest.mock('pages/tickets/detail/components/TicketBodyNonVirtualized', () => {
    return () => <div>TicketBodyNonVirtualized</div>
})
window.print = jest.fn()

const mockStore = configureMockStore([thunk])

describe('<TicketPrintContainer/>', () => {
    const loadingTicket = {
        id: 123,
        _internal: {
            loading: {
                fetchTicket: true,
            },
        },
    }

    const nonLoadingTicket = {
        id: 123,
        _internal: {
            loading: {
                fetchTicket: false,
            },
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render loader', () => {
        const {container} = renderWithRouter(
            <Provider
                store={mockStore({
                    ticket: fromJS(loadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render ticket body and call window.print when loading stops', () => {
        const {container, rerender} = renderWithRouter(
            <Provider store={mockStore({ticket: fromJS(loadingTicket)})}>
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        rerender(
            <Provider store={mockStore({ticket: fromJS(nonLoadingTicket)})}>
                <TicketPrintContainer />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(window.print).toHaveBeenCalled()
    })

    it('should not set document title when ticket is loading', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    ticket: fromJS(loadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(window.document.title).toEqual('Gorgias')
    })

    it('should set document title with ticket id', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    ticket: fromJS(nonLoadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(window.document.title).toEqual('123')
    })

    it('should set document title with ticket id and subject', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    ticket: fromJS({...nonLoadingTicket, subject: 'foo'}),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(window.document.title).toEqual('123_foo')
    })
})
