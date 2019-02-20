import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('macro actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore()
        mockServer = new MockAdapter(axios)
    })

    describe('fetchMacros', () => {
        it('should return formatted data', () => {
            const macros = [
                {id: 1, name: 'Pizza Pepperoni'}
            ]
            mockServer.onGet('/api/macros/').reply(200, {
                data: macros,
                meta: {
                    page: 1,
                    nb_pages: 1
                }
            })

            return store.dispatch(actions.fetchMacros())
                .then((res) => {
                    expect(res).toEqual({
                        macros: fromJS(macros),
                        page: 1,
                        totalPages: 1
                    })
                })
        })

        it('should return merged macros for next page', () => {
            const currentMacros = fromJS([
                {id: 1, name: 'Pizza Pepperoni'}
            ])
            const macros = [
                {id: 2, name: 'Pizza Margherita'}
            ]

            mockServer.onGet('/api/macros/').reply(200, {
                data: macros,
                meta: {
                    page: 2,
                    nb_pages: 2
                }
            })

            return store.dispatch(actions.fetchMacros({
                currentMacros,
                currentPage: 1,
                page: 2
            }))
                .then((res) => {
                    expect(res).toEqual({
                        macros: fromJS(currentMacros).concat(fromJS(macros)),
                        page: 2,
                        totalPages: 2
                    })
                })
        })
    })

    it('should dispatch a notify action on success', () => {
        mockServer.onDelete('/api/macros/1/').reply(200)

        return store.dispatch(actions.deleteMacro(1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('should dispatch an error action', () => {
        mockServer.onDelete('/api/integrations/1/').reply(400)

        return store.dispatch(actions.deleteMacro(1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
