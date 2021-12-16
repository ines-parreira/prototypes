import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import _isEqual from 'lodash/isEqual'
import axios from 'axios'

import client from '../../../models/api/resources'
import {StoreDispatch} from '../../types'
import * as actions from '../actions'
import * as types from '../constants'
import {initialState} from '../reducers'
import {Tag, TagDraft, TagSortableProperty} from '../types'

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})

type MockedRootState = {
    tags: Map<any, any>
}

describe('tags actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({tags: initialState})
        mockServer = new MockAdapter(client)
    })

    it('addTags', () => {
        store.dispatch(actions.addTags(['refund', 'rejected']))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetchTags', () => {
        it('success actions', () => {
            mockServer.onGet('/api/tags/').reply(200, {data: ['refund']})
            return store
                .dispatch(actions.fetchTags(2))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('params change page', () => {
            mockServer.onGet('/api/tags/').reply(({params}) => {
                expect(params).toMatchSnapshot()
                return [200]
            })
            return store.dispatch(actions.fetchTags(2))
        })

        it('params change reverse', () => {
            mockServer.onGet('/api/tags/').reply(({params}) => {
                expect(params).toMatchSnapshot()
                return [200]
            })
            return store.dispatch(
                actions.fetchTags(1, TagSortableProperty.Usage, false)
            )
        })

        it('params search', () => {
            mockServer.onGet('/api/tags/').reply(({params}) => {
                expect(params).toMatchSnapshot()
                return [200]
            })
            return store.dispatch(
                actions.fetchTags(
                    1,
                    TagSortableProperty.Name,
                    false,
                    'something'
                )
            )
        })

        it('fetch list also sorts', () => {
            mockServer.onGet('/api/tags/').reply(
                (config: {
                    params?: {
                        order_by: string
                        order_dir: string
                        page: number
                    }
                }) => {
                    if (
                        config.params?.order_by === 'name' &&
                        config.params?.order_dir === 'desc' &&
                        config.params?.page === 1
                    ) {
                        return [200, {data: ['rejected', 'refund']}]
                    }

                    return [400]
                }
            )

            const expectedActions = [
                {
                    type: types.FETCH_TAG_LIST_START,
                },
                {
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp: {
                        data: ['rejected', 'refund'],
                    },
                },
            ]

            return store
                .dispatch(actions.fetchTags(1, TagSortableProperty.Name, true))
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions)
                })
        })

        it('should reject when cancelled', async () => {
            mockServer.onGet('/api/tags/').reply(200, {})
            const source = axios.CancelToken.source()

            source.cancel()
            await expect(
                store.dispatch(
                    actions.fetchTags(
                        1,
                        undefined,
                        undefined,
                        undefined,
                        source.token
                    )
                )
            ).rejects.toEqual(new axios.Cancel())
        })
    })

    it('select', () => {
        store.dispatch(actions.select({id: 1} as Tag))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('selectAll', () => {
        store.dispatch(actions.selectAll())
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('edit', () => {
        store.dispatch(actions.edit({id: 1} as Tag))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('cancel', () => {
        store.dispatch(actions.cancel({id: 1} as Tag))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('save', () => {
        mockServer.onPut('/api/tags/1/').reply(200, {id: 1})
        return store
            .dispatch(actions.save({id: 1} as Tag))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('create', () => {
        mockServer.onPost('/api/tags/').reply(200, {id: 1})
        return store
            .dispatch(actions.create({id: 1} as unknown as TagDraft))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('remove', () => {
        mockServer.onDelete('/api/tags/1/').reply(200)
        return store
            .dispatch(actions.remove('1'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('remove error', () => {
        mockServer.onDelete('/api/tags/1/').reply(400)
        return store
            .dispatch(actions.remove('1'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('bulkDelete', () => {
        mockServer.onDelete('/api/tags/').reply((config) => {
            if (_isEqual(config.data, {ids: [1, 2]})) {
                return [204]
            }

            return [404]
        })

        return store
            .dispatch(actions.bulkDelete(['1', '2']))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('bulkDelete error', () => {
        mockServer.onDelete('/api/tags/').reply((config) => {
            if (_isEqual(config.data, {ids: [1, 2]})) {
                return [204]
            }

            return [404]
        })

        return store
            .dispatch(actions.bulkDelete(['5']))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('merge', () => {
        mockServer.onPut('/api/tags/3/merge/').reply((config) => {
            if (_isEqual(config.data, {source_tags_ids: [1, 2]})) {
                return [200]
            }

            return [400]
        })

        return store.dispatch(actions.merge(fromJS([1, 2, 3]))).then(() => {
            const expectedActions = store.getActions()
            expect(expectedActions[0]).toEqual({
                type: types.MERGE_TAGS,
                ids: fromJS([1, 2, 3]),
            })
            expect(expectedActions).toMatchSnapshot()
        })
    })

    it('merge error', () => {
        mockServer.onPut('/api/tags/3/merge/').reply((config) => {
            if (_isEqual(config.data, {source_tags_ids: [1, 2]})) {
                return [200]
            }

            return [400]
        })

        return store
            .dispatch(actions.merge(fromJS([2, 3])))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setPage', () => {
        store.dispatch(actions.setPage(1))
        return expect(store.getActions()).toMatchSnapshot()
    })
})
