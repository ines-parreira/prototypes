import { Panels } from '@repo/layout'
import { NavigationProvider } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Route, StaticRouter } from 'react-router-dom'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { mockStore } from 'utils/testing'

import { TicketsPage } from '../TicketsPage'

jest.mock('split-ticket-view-toggle', () => ({ useSplitTicketView: jest.fn() }))
const useSplitTicketViewMock = assumeMock(useSplitTicketView)

jest.mock('common/navigation/hooks/useNavBar/useNavBar')
const useNavBarMock = assumeMock(useNavBar)

jest.mock('tickets/navigation', () => ({
    TicketsNavbarPanel: () => <div>TicketsNavbarPanel</div>,
}))
jest.mock('tickets/ticket-detail', () => ({
    TicketDetailPanel: () => <div>TicketDetailPanel</div>,
}))
jest.mock('tickets/ticket-empty', () => ({
    TicketEmptyPanel: () => <div>TicketEmptyPanel</div>,
}))
jest.mock('tickets/ticket-infobar', () => ({
    TicketInfobarPanel: () => <div>TicketInfobarPanel</div>,
}))
jest.mock('tickets/tickets-list', () => ({
    TicketsListPanel: () => <div>TicketsListPanel</div>,
}))
jest.mock('tickets/view', () => ({
    ViewPanelEntrypoint: () => <div>ViewPanel</div>,
}))
jest.mock('../TicketDetailWithInfobar', () => ({
    TicketDetailWithInfobar: () => (
        <>
            <div>TicketDetailPanel</div>
            <div>TicketInfobarPanel</div>
        </>
    ),
}))

type STVValue = ReturnType<typeof useSplitTicketView>

describe('TicketsPage', () => {
    const baseState = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        ticket: fromJS({ id: 123, customer: { id: 456 } }),
    }

    const store = mockStore(baseState)

    const renderComponent = (location: string) => {
        return render(
            <Provider store={store}>
                <NavigationProvider>
                    <StaticRouter location={location}>
                        <Route path="/app/tickets">
                            <Panels size={1000}>
                                <TicketsPage />
                            </Panels>
                        </Route>
                    </StaticRouter>
                </NavigationProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: false } as STVValue)
        useNavBarMock.mockReturnValue({
            navBarDisplay: NavBarDisplayMode.Open,
            setNavBarDisplay: jest.fn(),
        } as any)
    })

    it('should render the corrent components for /app/tickets with DTP disabled', () => {
        renderComponent('/app/tickets')

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets with DTP enabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true } as STVValue)
        renderComponent('/app/tickets')

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId with DTP disabled', () => {
        renderComponent('/app/tickets/123')

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('ViewPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId with DTP enabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true } as STVValue)
        renderComponent('/app/tickets/123')

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketEmptyPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId/:ticketId with DTP disabled', () => {
        renderComponent('/app/tickets/123/456')

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })

    it('should render the corrent components for /app/tickets/:viewId/:ticketId with DTP enabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true } as STVValue)
        renderComponent('/app/tickets/123/456')

        expect(screen.getByText('TicketsNavbarPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketsListPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketDetailPanel')).toBeInTheDocument()
        expect(screen.getByText('TicketInfobarPanel')).toBeInTheDocument()
    })
})
