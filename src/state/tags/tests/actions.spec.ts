import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import _isEqual from 'lodash/isEqual'
import axios from 'axios'

import client from 'models/api/resources'
import {OrderDirection} from 'models/api/types'
import {TagSortableProperties} from 'models/tag/types'
import {StoreDispatch} from 'state/types'
import * as actions from 'state/tags/actions'
import * as types from 'state/tags/constants'
import {initialState} from 'state/tags/reducers'
import {Tag, TagDraft} from 'state/tags/types'

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

const meta = {
    next_cursor: null,
    prev_cursor: null,
}

jest.mock('state/notifications/actions', () => {
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
            mockServer.onGet('/api/tags/').reply(200, {
                data: {data: ['refund']},
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            })
            return store
                .dispatch(actions.fetchTags())
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('params change reverse', () => {
            mockServer.onGet('/api/tags/').reply(({params}) => {
                expect(params).toMatchSnapshot()
                return [
                    200,
                    {
                        data: {data: []},
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    },
                ]
            })
            return store.dispatch(
                actions.fetchTags({
                    orderBy: `${TagSortableProperties.Usage}:${OrderDirection.Asc}`,
                })
            )
        })

        it('params search', () => {
            mockServer.onGet('/api/tags/').reply(({params}) => {
                expect(params).toMatchSnapshot()
                return [
                    200,
                    {
                        data: {data: []},
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    },
                ]
            })
            return store.dispatch(
                actions.fetchTags({
                    orderBy: `${TagSortableProperties.Name}:${OrderDirection.Asc}`,
                    search: 'something',
                })
            )
        })

        it('fetch list also sorts', () => {
            mockServer.onGet('/api/tags/').reply(
                (config: {
                    params?: {
                        order_by: string
                    }
                }) => {
                    if (config.params?.order_by === 'name:desc') {
                        return [200, {data: ['rejected', 'refund'], meta}]
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
                .dispatch(
                    actions.fetchTags({
                        orderBy: `${TagSortableProperties.Name}:${OrderDirection.Desc}`,
                    })
                )
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions)
                })
        })

        it('should reject when cancelled', async () => {
            mockServer.onGet('/api/tags/').reply(200, {
                data: [],
                meta: {prev_cursor: null, next_cursor: null},
            })
            const source = axios.CancelToken.source()
            source.cancel()

            await expect(
                store.dispatch(
                    actions.fetchTags(undefined, {cancelToken: source.token})
                )
            ).rejects.toEqual(new axios.Cancel())
        })
    })

    it('select', () => {
        store.dispatch(actions.select({id: 1} as Tag))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('selectAll', () => {
        store.dispatch(actions.selectAll([{id: 1} as Tag]))
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

    it('reset meta of tags', () => {
        store.dispatch(actions.resetMeta())
        return expect(store.getActions()).toMatchSnapshot()
    })
})
