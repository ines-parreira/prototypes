import type React from 'react'

import { render } from '@repo/testing'
import { act } from '@testing-library/react'
import { fromJS } from 'immutable'

import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'

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

jest.mock('@repo/activity-tracker')

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
        const { container } = render(<TicketPrintContainer />, {
            storeState: {
                ...mockStoreState,
                ticket: fromJS(loadingTicket),
            },
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render ticket body and call window.print when loading stops', () => {
        let storeState = {
            ...mockStoreState,
            ticket: fromJS(loadingTicket),
        }
        const { container, store } = render(<TicketPrintContainer />, {
            storeState: () => storeState,
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        storeState = {
            ...mockStoreState,
            ticket: fromJS(nonLoadingTicket),
        }
        act(() => {
            store.dispatch({ type: 'test/ticket-loaded' })
        })

        expect(container.firstChild).toMatchSnapshot()
        expect(window.print).toHaveBeenCalled()
    })

    it('should not set document title when ticket is loading', () => {
        jest.useFakeTimers()
        render(<TicketPrintContainer />, {
            storeState: {
                ...mockStoreState,
                ticket: fromJS(loadingTicket),
            },
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })
        jest.runOnlyPendingTimers()
        expect(window.document.title).toEqual('Gorgias')
    })

    it('should set document title with ticket id', () => {
        render(<TicketPrintContainer />, {
            storeState: {
                ...mockStoreState,
                ticket: fromJS(nonLoadingTicket),
            },
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        expect(window.document.title).toEqual('123')
    })

    it('should set document title with ticket id and subject', () => {
        render(<TicketPrintContainer />, {
            storeState: {
                ...mockStoreState,
                ticket: fromJS({ ...nonLoadingTicket, subject: 'foo' }),
            },
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })
        expect(window.document.title).toEqual('123_foo')
    })

    it('should render with KnowledgeSourceSideBarProvider wrapper', () => {
        const { container } = render(<TicketPrintContainer />, {
            storeState: {
                ...mockStoreState,
                ticket: fromJS(nonLoadingTicket),
            },
            path: '/foo/:ticketId',
            initialEntries: ['/foo/1'],
        })

        expect(container.firstChild).toMatchSnapshot()
    })
})
