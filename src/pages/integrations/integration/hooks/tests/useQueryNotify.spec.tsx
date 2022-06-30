import React from 'react'
import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {Router} from 'react-router-dom'
import {createMemoryHistory} from 'history'

import {NotificationStatus} from 'state/notifications/types'
import * as actions from 'state/notifications/actions'
import useQueryNotify from '../useQueryNotify'

const mockStore = configureMockStore([thunk])

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => undefined),
}))

const notify = actions.notify as jest.Mock

describe('useQueryNotify()', () => {
    beforeEach(() => {
        notify.mockClear()
    })
    it('should do nothing if it has no error or message', () => {
        const history = createMemoryHistory({
            initialEntries: [''],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        renderHook(() => useQueryNotify(), {
            wrapper: ({children}) => (
                <Router history={history}>
                    <Provider store={mockStore({})}>{children}</Provider>
                </Router>
            ),
        })
        expect(notify).toHaveBeenCalledTimes(0)
    })
    it('should call notify if it has an error', () => {
        const history = createMemoryHistory({
            initialEntries: ['?error=need_scope_update'],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        renderHook(() => useQueryNotify(), {
            wrapper: ({children}) => (
                <Router history={history}>
                    <Provider store={mockStore({})}>{children}</Provider>
                </Router>
            ),
        })
        expect(notify.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "message": "You need to update your app permissions in order to do that.",
                  "status": "error",
                },
              ],
            ]
        `)
    })
    it('should call notify if it has a message', () => {
        const history = createMemoryHistory({
            initialEntries: ['?message=you+should+see+me+in+snaps'],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        renderHook(() => useQueryNotify(), {
            wrapper: ({children}) => (
                <Router history={history}>
                    <Provider store={mockStore({})}>{children}</Provider>
                </Router>
            ),
        })
        expect(notify.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "message": "you should see me in snaps",
                  "status": "info",
                },
              ],
            ]
        `)
    })
    it('should call notify with the correct status if provided', () => {
        let history = createMemoryHistory({
            initialEntries: [
                `?message=you+should+see+me+in+snaps&message_type=${NotificationStatus.Warning}`,
            ],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        renderHook(() => useQueryNotify(), {
            wrapper: ({children}) => (
                <Router history={history}>
                    <Provider store={mockStore({})}>{children}</Provider>
                </Router>
            ),
        })
        expect(notify.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "message": "you should see me in snaps",
                  "status": "warning",
                },
              ],
            ]
        `)

        notify.mockClear()
        history = createMemoryHistory({
            initialEntries: [
                `?error=need_scope_update&message_type=${NotificationStatus.Warning}`,
            ],
        })
        renderHook(() => useQueryNotify(), {
            wrapper: ({children}) => (
                <Router history={history}>
                    <Provider store={mockStore({})}>{children}</Provider>
                </Router>
            ),
        })
        expect(notify.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "message": "You need to update your app permissions in order to do that.",
                  "status": "warning",
                },
              ],
            ]
        `)
    })
})
