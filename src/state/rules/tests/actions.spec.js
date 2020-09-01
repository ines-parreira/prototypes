import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {fromJS} from 'immutable'

import * as actions from '../actions.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('rules actions', () => {
    describe('create', () => {
        let mockServer
        let store

        beforeEach(() => {
            mockServer = new MockAdapter(axios)
            store = mockStore({
                rules: fromJS({
                    rules: {},
                    openedRules: [],
                }),
            })
        })

        it('should create a new rule and open it', () => {
            const ruleData = {id: 12, code: 'if this then that'}
            mockServer.onPost('/api/rules/').reply(201, ruleData)

            return store.dispatch(actions.create(ruleData)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should dispatch a fail action because creating the rule failed', () => {
            const ruleData = {id: 12, code: 'if this then that'}
            mockServer.onPost('/api/rules/').reply(400, {msg: 'bad request'})

            return store.dispatch(actions.create(ruleData)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })
    })
})
