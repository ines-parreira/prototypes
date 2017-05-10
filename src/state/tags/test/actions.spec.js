import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import * as types from '../constants'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('tags', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore(initialState)
            mockServer = new MockAdapter(axios)
        })

        it('dispatch add OK', () => {
            store.dispatch(actions.addTags(['refund', 'rejected']))
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.ADD_TAGS,
                tags: ['refund', 'rejected']
            }])
        })

        it('fetch list OK', () => {
            mockServer
                .onGet('/api/tags/')
                .reply(200, {
                    data: ['refund', 'rejected']
                })

            const expectedActions = [
                {
                    type: types.FETCH_TAG_LIST_START
                },
                {
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp: {
                        data: ['refund', 'rejected']
                    }
                }
            ]

            return store
                .dispatch(actions.fetchTags())
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions)
                })
        })
    })
})
