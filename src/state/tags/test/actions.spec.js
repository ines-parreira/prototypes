import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
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

        it('dispatch add', () => {
            store.dispatch(actions.addTags(['refund', 'rejected']))
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.ADD_TAGS,
                tags: ['refund', 'rejected']
            }])
        })

        it('fetch list', () => {
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

        it('fetch list also sorts', () => {
            mockServer
                .onGet('/api/tags/')
                .reply(config => {
                    if (config.params.order_by === 'name' &&
                        config.params.order_dir === 'desc' &&
                        config.params.page === 1) {
                        return [200, {data: ['rejected', 'refund']}]
                    } else {
                        return [400]
                    }

                })

            const expectedActions = [
                {
                    type: types.FETCH_TAG_LIST_START
                },
                {
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp: {
                        data: ['rejected', 'refund']
                    }
                }
            ]

            return store
                .dispatch(actions.fetchTags(1, 'name', true))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions)
                })
        })

        it('deletes multiple tags', () => {
            mockServer.onDelete('/api/tags/')
                .reply(config => {
                    if (config.data === '{"ids":[1,2]}') {
                        return [204]
                    } else {
                        return [404]
                    }
                })

            return store
                .dispatch(actions.bulkDelete([1, 2]))
                .then(() => {
                    expect(store.getActions()[0].payload).toHaveProperty('message', '2 tags deleted successfully')
                })
        })

        it('dispatches merge actions', () => {
            mockServer
                .onPut('/api/tags/3/merge/')
                .reply(config => {
                    if (config.data === '{"source_tags_ids":[1,2]}') {
                        return [200]
                    } else {
                        return [400]
                    }
                })

            store.dispatch(actions.merge(fromJS([1, 2, 3])))
            const expectedActions = store.getActions()

            expect(expectedActions[0]).toEqual({
                type: types.MERGE_TAGS,
                ids: fromJS([1, 2, 3])
            })
        })
    })
})
