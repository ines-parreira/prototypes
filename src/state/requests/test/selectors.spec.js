import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {requestsInitial as initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('requests selectors', () => {
    let state

    beforeEach(() => {
        state = {
            requests: initialState
                .mergeDeep({
                    items: [
                        {
                            id: 1,
                            name: 'a',
                        },
                        {
                            id: 2,
                            name: 'b',
                        },
                    ],
                    meta: {},
                })
        }
    })

    it('getRequestsState', () => {
        expect(selectors.getRequestsState(state)).toEqualImmutable(state.requests)
        expect(selectors.getRequestsState({})).toEqualImmutable(fromJS({}))
    })

    it('getRequests', () => {
        expect(selectors.getRequests(state)).toEqualImmutable(state.requests.get('items'))
        expect(selectors.getRequests({})).toEqualImmutable(fromJS([]))
    })

    it('getLatestRequest', () => {
        state.ticket = fromJS({
            messages: [
                {
                    id: 1,
                    request_id: 1,
                    created_datetime: '2017-01-01'
                },
                {
                    request_id: 2,
                    created_datetime: '2017-01-02'
                }
            ]
        })
        expect(selectors.getLatestRequest(state)).toEqualImmutable(fromJS({
            id: 2,
            name: 'b'
        }))
        expect(selectors.getLatestRequest({})).toEqualImmutable(fromJS({}))
    })
})
