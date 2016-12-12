import expect from 'expect'
import configureMockStore from 'redux-mock-store'
import expectImmutable from 'expect-immutable'
import thunk from 'redux-thunk'
import * as types from '../constants'
import {updateAccount} from '../actions'
import {initialState} from '../reducers'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

expect.extend(expectImmutable)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('currentAccount', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore(initialState)
            mockServer = new MockAdapter(axios)
        })

        it('should update account', () => {
            const account = {
                channels: [{
                    id: 1,
                    type: 'email',
                    name: 'Acme Support',
                    address: 'support@acme.io',
                    preferred: true
                }]
            }
            const expectedActions = [{
                type: types.UPDATE_ACCOUNT_START
            }, {
                type: types.UPDATE_ACCOUNT_SUCCESS,
                resp: account
            }]

            mockServer.onPut('/api/account/').reply(202, account)

            return store.dispatch(updateAccount(account)).then(() => {
                expect(store.getActions()[0]).toEqual(expectedActions[0])
                expect(store.getActions()[1]).toEqual(expectedActions[1])
            })
        })
    })
})
