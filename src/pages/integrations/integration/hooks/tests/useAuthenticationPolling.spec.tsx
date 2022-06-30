import React from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Map, fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {Router} from 'react-router-dom'
import {createMemoryHistory} from 'history'

import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
import * as actions from 'state/integrations/actions'
import useAuthenticationPolling from '../useAuthenticationPolling'

jest.useFakeTimers()

const mockStore = configureMockStore([thunk])

jest.mock('state/integrations/actions', () => ({
    fetchIntegration: jest.fn(() => () => undefined),
    triggerCreateSuccess: jest.fn(() => () => undefined),
}))

const fetchIntegration = actions.fetchIntegration as jest.Mock
const triggerCreateSuccess = actions.triggerCreateSuccess as jest.Mock

type Props = {
    integration: Map<string, unknown>
}

describe('useAuthenticationPolling()', () => {
    beforeEach(() => {
        fetchIntegration.mockClear()
        triggerCreateSuccess.mockClear()
    })
    it('should do nothing if it has no integration or no authentication action', () => {
        const history = createMemoryHistory({
            initialEntries: ['?action=authentication'],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        const {rerender} = renderHook(
            ({integration}: Props) => useAuthenticationPolling(integration),
            {
                initialProps: {
                    integration: fromJS({}),
                },
                wrapper: ({children}) => (
                    <Router history={history}>
                        <Provider store={mockStore({})}>{children}</Provider>
                    </Router>
                ),
            }
        )
        jest.runAllTimers()
        expect(triggerCreateSuccess).toHaveBeenCalledTimes(0)
        expect(fetchIntegration).toHaveBeenCalledTimes(0)
        history.push('/')
        rerender({
            integration: fromJS({id: 'someid'}),
        })
        expect(triggerCreateSuccess).toHaveBeenCalledTimes(0)
        expect(fetchIntegration).toHaveBeenCalledTimes(0)
    })

    it('should return if status is pending', () => {
        const history = createMemoryHistory({
            initialEntries: ['?action=authentication'],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        const {result, rerender} = renderHook(
            ({integration}: Props) => useAuthenticationPolling(integration),
            {
                initialProps: {
                    integration: fromJS({
                        id: 'someId',
                        type: 'someType',
                        meta: {oauth: {status: PENDING_AUTHENTICATION_STATUS}},
                    }),
                },
                wrapper: ({children}) => (
                    <Router history={history}>
                        <Provider store={mockStore({})}>{children}</Provider>
                    </Router>
                ),
            }
        )
        expect(result.current).toBe(true)
        rerender({
            integration: fromJS({
                id: 'someid',
                meta: {oauth: {status: 'not pending'}},
            }),
        })
        expect(result.current).toBe(false)
    })

    it('should trigger the correct actions and remove related search param', () => {
        const history = createMemoryHistory({
            initialEntries: ['test.com?action=authentication&something=see_me'],
        })
        const store = mockStore({})
        store.dispatch = jest.fn()
        const {rerender} = renderHook(
            ({integration}: Props) => useAuthenticationPolling(integration),
            {
                initialProps: {
                    integration: fromJS({
                        id: 'someId',
                        type: 'someType',
                        meta: {oauth: {status: PENDING_AUTHENTICATION_STATUS}},
                    }),
                },
                wrapper: ({children}) => (
                    <Router history={history}>
                        <Provider store={mockStore({})}>{children}</Provider>
                    </Router>
                ),
            }
        )
        expect(fetchIntegration).toHaveBeenCalledTimes(0)
        jest.runAllTimers()
        expect(fetchIntegration.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                "someId",
                "someType",
                true,
              ],
            ]
        `)
        rerender({
            integration: fromJS({
                id: 'someid',
                meta: {oauth: {status: 'not pending'}},
            }),
        })
        expect(fetchIntegration).toHaveBeenCalledTimes(1)
        expect(history.location.search).toBe('?something=see_me')
        expect(history.location.pathname).toBe('test.com')
        expect(triggerCreateSuccess.mock.calls).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "id": "someid",
                  "meta": Object {
                    "oauth": Object {
                      "status": "not pending",
                    },
                  },
                },
              ],
            ]
        `)
    })
})
