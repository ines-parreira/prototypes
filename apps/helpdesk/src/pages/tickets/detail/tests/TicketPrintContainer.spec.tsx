import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'
import { renderWithRouter } from 'utils/testing'

jest.mock('pages/tickets/detail/components/TicketBodyNonVirtualized', () => {
    return () => <div>TicketBodyNonVirtualized</div>
})

jest.mock(
    'state/queries/selectors',
    () =>
        ({
            ...jest.requireActual('state/queries/selectors'),
            getQueryTimestamp: jest.fn(() => jest.fn()),
        }) as Record<string, unknown>,
)

jest.mock('services/activityTracker')

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider',
    () => ({
        KnowledgeSourceSideBarProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => children,
    }),
)

jest.mock('common/navigation/hooks/useNavBar/useNavBar', () => ({
    useNavBar: () => ({
        setNavBarDisplay: jest.fn(),
        navBarDisplay: 'full',
    }),
}))

jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({
        setIsEnabled: jest.fn(),
        isEnabled: false,
    }),
}))

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

    const mockStoreState = {
        currentAccount: fromJS({ id: 1 }),
        currentUser: fromJS({ id: 1 }),
    }

    beforeEach(() => {
        window.document.title = 'Gorgias'
    })

    it('should render loader', () => {
        const { container } = renderWithRouter(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS(loadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            },
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render ticket body and call window.print when loading stops', () => {
        const { container, rerender } = renderWithRouter(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS(loadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            },
        )

        rerender(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS(nonLoadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(window.print).toHaveBeenCalled()
    })

    it('should not set document title when ticket is loading', () => {
        jest.useFakeTimers()
        renderWithRouter(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS(loadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            },
        )
        jest.runOnlyPendingTimers()
        expect(window.document.title).toEqual('Gorgias')
    })

    it('should set document title with ticket id', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS(nonLoadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            },
        )

        expect(window.document.title).toEqual('123')
    })

    it('should set document title with ticket id and subject', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS({ ...nonLoadingTicket, subject: 'foo' }),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            },
        )
        expect(window.document.title).toEqual('123_foo')
    })

    it('should render with KnowledgeSourceSideBarProvider wrapper', () => {
        const { container } = renderWithRouter(
            <Provider
                store={mockStore({
                    ...mockStoreState,
                    ticket: fromJS(nonLoadingTicket),
                })}
            >
                <TicketPrintContainer />
            </Provider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            },
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
