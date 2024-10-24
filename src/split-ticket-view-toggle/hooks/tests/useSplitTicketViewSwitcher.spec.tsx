import {renderHook} from '@testing-library/react-hooks'

import {createMemoryHistory, MemoryHistory} from 'history'
import React from 'react'
import {Provider} from 'react-redux'
import {Route, Router} from 'react-router-dom'

import {SplitTicketViewProvider} from 'split-ticket-view-toggle'
import {mockStore} from 'utils/testing'

import useSplitTicketViewSwitcher from '../useSplitTicketViewSwitcher'

function renderSwitcherHook(route: string, path: string = '/'): MemoryHistory {
    const history = createMemoryHistory({initialEntries: [route]})
    const store = mockStore({})
    const wrapper = ({children}: any) => (
        <Provider store={store}>
            <Router history={history}>
                <Route path={path}>
                    <SplitTicketViewProvider>
                        {children}
                    </SplitTicketViewProvider>
                </Route>
            </Router>
        </Provider>
    )
    renderHook(() => useSplitTicketViewSwitcher(), {wrapper})
    return history
}

describe('useSplitTicketViewSwitcher', () => {
    afterAll(() => {
        localStorage.removeItem('split-ticket-view-enabled')
    })

    describe('Split view enabled', () => {
        beforeEach(() => {
            localStorage.setItem('split-ticket-view-enabled', 'true')
        })

        it('should redirect from /app to /app/views', () => {
            const history = renderSwitcherHook('/app')

            expect(history.location.pathname).toBe('/app/views')
        })

        it('should keep query parameters', () => {
            const history = renderSwitcherHook('/app?query=value')

            expect(history.location.pathname).toBe('/app/views')
            expect(history.location.search).toBe('?query=value')
        })

        it('should redirect from /app/tickets/VIEW_ID to /app/views/VIEW_ID', () => {
            const history = renderSwitcherHook(
                '/app/tickets/123',
                '/app/tickets/:viewId/:ticketId?'
            )

            expect(history.location.pathname).toBe('/app/views/123')
        })
    })

    describe('Split view disabled', () => {
        beforeEach(() => {
            localStorage.setItem('split-ticket-view-enabled', 'false')
        })

        it('should redirect from /app/views to /app', () => {
            const history = renderSwitcherHook('/app/views')

            expect(history.location.pathname).toBe('/app')
        })

        it('should keep query parameters', () => {
            const history = renderSwitcherHook('/app/views?query=value')

            expect(history.location.pathname).toBe('/app')
            expect(history.location.search).toBe('?query=value')
        })

        it('should redirect from /app/views/VIEW_ID to /app/tickets/VIEW_ID', () => {
            const history = renderSwitcherHook(
                '/app/views/123',
                '/app/views/:viewId/:ticketId?'
            )

            expect(history.location.pathname).toBe('/app/tickets/123')
        })

        it('should redirect from /app/views/VIEW_ID/TICKET_ID to /app/ticket/TICKET_ID', () => {
            const history = renderSwitcherHook(
                '/app/views/123/456',
                '/app/views/:viewId/:ticketId?'
            )

            expect(history.location.pathname).toBe('/app/ticket/456')
        })
    })
})
