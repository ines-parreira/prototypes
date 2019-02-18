import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import _isEqual from 'lodash/isEqual'

import * as actions from '../actions'
import * as types from '../constants'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('tags actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({tags: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('addTags', () => {
        store.dispatch(actions.addTags(['refund', 'rejected']))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetchTags', () => {
        it('success actions', () => {
            mockServer.onGet('/api/tags/').reply(200, {data: ['refund']})
            return store.dispatch(actions.fetchTags(2))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('params change page', () => {
            mockServer.onGet('/api/tags/')
                .reply(({params}) => {
                    expect(params).toMatchSnapshot()
                    return [200]
                })
            return store.dispatch(actions.fetchTags(2))
        })

        it('params change sort', () => {
            mockServer.onGet('/api/tags/')
                .reply(({params}) => {
                    expect(params).toMatchSnapshot()
                    return [200]
                })
            return store.dispatch(actions.fetchTags(1, 'custom_sort'))
        })

        it('params change reverse', () => {
            mockServer.onGet('/api/tags/')
                .reply(({params}) => {
                    expect(params).toMatchSnapshot()
                    return [200]
                })
            return store.dispatch(actions.fetchTags(1, 'usage', false))
        })

        it('params search', () => {
            mockServer.onGet('/api/tags/')
                .reply(({params}) => {
                    expect(params).toMatchSnapshot()
                    return [200]
                })
            return store.dispatch(actions.fetchTags(1, 'name', false, 'something'))
        })

        it('fetch list also sorts', () => {
            mockServer
                .onGet('/api/tags/')
                .reply((config) => {
                    if (config.params.order_by === 'name' &&
                        config.params.order_dir === 'desc' &&
                        config.params.page === 1) {
                        return [200, {data: ['rejected', 'refund']}]
                    }

                    return [400]
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
    })

    it('select', () => {
        store.dispatch(actions.select({id: 1}))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('selectAll', () => {
        store.dispatch(actions.selectAll())
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('edit', () => {
        store.dispatch(actions.edit({id: 1}))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('cancel', () => {
        store.dispatch(actions.cancel({id: 1}))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('save', () => {
        mockServer.onPut('/api/tags/1/').reply(200, {id: 1})
        return store.dispatch(actions.save({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create', () => {
        mockServer.onPost('/api/tags/').reply(200, {id: 1})
        return store.dispatch(actions.create({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('remove', () => {
        mockServer.onDelete('/api/tags/1/').reply(200)
        return store.dispatch(actions.remove(1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('bulkDelete', () => {
        mockServer.onDelete('/api/tags/')
            .reply((config) => {
                if (_isEqual(config.data, {ids: [1, 2]})) {
                    return [204]
                }

                return [404]
            })

        return store.dispatch(actions.bulkDelete([1, 2]))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('merge', () => {
        mockServer.onPut('/api/tags/3/merge/')
            .reply((config) => {
                if (_isEqual(config.data, {source_tags_ids: [1, 2]})) {
                    return [200]
                }

                return [400]
            })

        return store.dispatch(actions.merge(fromJS([1, 2, 3])))
            .then(() => {
                const expectedActions = store.getActions()
                expect(expectedActions[0]).toEqual({
                    type: types.MERGE_TAGS,
                    ids: fromJS([1, 2, 3])
                })
                expect(expectedActions).toMatchSnapshot()
            })
    })

    it('setPage', () => {
        store.dispatch(actions.setPage(1))
        return expect(store.getActions()).toMatchSnapshot()
    })
})
