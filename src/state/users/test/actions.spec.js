import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import expect from 'expect'
import * as actions from '../actions'
import * as types from '../constants'
import {usersInitial as initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('users', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore(initialState)
            mockServer = new MockAdapter(axios)
        })

        it('create user OK', () => {
            const userData = {
                name: 'Mario',
                email: 'mario@nintendo.com',
                role: 'agent'
            }

            mockServer
                .onPost('/api/users/')
                .reply(200, {
                    data: userData
                })

            return store
                .dispatch(actions.createUser(userData))
                .then(() => {
                    // we do not care here about system messages and other disruptions
                    const triggeredActions = store.getActions().filter(action => ~action.type.indexOf('NEW_USER'))

                    expect(triggeredActions.length).toEqual(2)

                    expect(triggeredActions[1].type).toEqual(types.CREATE_NEW_USER_SUCCESS)

                    expect(triggeredActions[1].resp).toExist()
                })
        })

        it('update user OK', () => {
            const userData = {
                id: 2,
                name: 'Mario',
                email: 'mario@nintendo.com',
                role: 'agent'
            }

            mockServer
                .onPut('/api/users/2/')
                .reply(200, {
                    data: userData
                })

            return store
                .dispatch(actions.updateUser(userData, userData.id))
                .then(() => {
                    // we do not care here about system messages and other disruptions
                    const triggeredActions = store.getActions().filter(action => ~action.type.indexOf('UPDATE_USER'))

                    expect(triggeredActions.length).toEqual(2)

                    expect(triggeredActions[1].type).toEqual(types.UPDATE_USER_SUCCESS)

                    expect(triggeredActions[1].resp).toExist()
                })
        })
    })
})
