import expect from 'expect'
import expectImmutable from 'expect-immutable'
import * as types from '../constants'
import reducer, {initialState} from '../reducers'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('currentAccount', () => {
        it('should return the initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })

        it('should handle UPDATE_ACCOUNT_START', () => {
            const action = {
                type: types.UPDATE_ACCOUNT_START
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'updateAccount'], true)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle UPDATE_ACCOUNT_ERROR', () => {
            const action = {
                type: types.UPDATE_ACCOUNT_ERROR
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'updateAccount'], false)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle UPDATE_ACCOUNT_SUCCESS', () => {
            const action = {
                type: types.UPDATE_ACCOUNT_SUCCESS,
                resp: {
                    id: 1,
                    domain: 'acme',
                    channels: [{
                        id: 1,
                        type: 'email',
                        name: 'Acme Support',
                        address: 'support@acme.io',
                        preferred: true
                    }]
                }
            }
            const expectedState = initialState.setIn(['_internal', 'loading', 'updateAccount'], false)
                .merge(action.resp)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })
    })
})
