import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import _isEqual from 'lodash/isEqual'
import axios from 'axios'
import {ListTagsOrderBy, Tag} from '@gorgias/api-queries'

import client from 'models/api/resources'
import {OrderDirection} from 'models/api/types'
import {TagDraft} from 'models/tag/types'
import {StoreDispatch} from 'state/types'
import * as actions from 'state/tags/actions'
import * as types from 'state/tags/constants'
import {initialState} from 'state/tags/reducers'

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
        void expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetchTags', () => {
        it('success actions', async () => {
            mockServer.onGet('/api/tags/').reply(200, {
                data: {data: ['refund']},
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            })
            await store.dispatch(actions.fetchTags())
            expect(store.getActions()).toMatchSnapshot()
        })

        it('params change reverse', async () => {
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
            await store.dispatch(
                actions.fetchTags({
                    order_by: `${ListTagsOrderBy.Usage}:${OrderDirection.Asc}`,
                })
            )
        })

        it('params search', async () => {
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
            await store.dispatch(
                actions.fetchTags({
                    order_by: `${ListTagsOrderBy.Name}:${OrderDirection.Asc}`,
                    search: 'something',
                })
            )
        })

        it('fetch list also sorts', async () => {
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

            await store.dispatch(
                actions.fetchTags({
                    order_by: `${ListTagsOrderBy.Name}:${OrderDirection.Desc}`,
                })
            )

            expect(store.getActions()).toEqual(expectedActions)
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
        expect(store.getActions()).toMatchSnapshot()
    })

    it('selectAll', () => {
        store.dispatch(actions.selectAll([{id: 1} as Tag]))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('selectAll with provided value', () => {
        store.dispatch(actions.selectAll([{id: 1} as Tag], false))
        expect(
            (store.getActions()[0] as ReturnType<typeof actions.selectAll>)
                .payload.value
        ).toEqual(false)
    })

    it('edit', () => {
        store.dispatch(actions.edit({id: 1} as Tag))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('cancel', () => {
        store.dispatch(actions.cancel({id: 1} as Tag))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('save', async () => {
        mockServer.onPut('/api/tags/1/').reply(200, {id: 1})
        await store.dispatch(actions.save({id: 1} as Tag))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('create', async () => {
        mockServer.onPost('/api/tags/').reply(200, {id: 1})
        await store.dispatch(actions.create({name: 'tag'} as TagDraft))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('remove', async () => {
        mockServer.onDelete('/api/tags/1/').reply(200)
        await store.dispatch(actions.remove('1'))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('remove error', async () => {
        mockServer.onDelete('/api/tags/1/').reply(400)
        await store.dispatch(actions.remove('1'))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('bulkDelete', async () => {
        mockServer.onDelete('/api/tags/').reply((config) => {
            if (_isEqual(config.data, {ids: [1, 2]})) {
                return [204]
            }

            return [404]
        })

        await store.dispatch(actions.bulkDelete(['1', '2']))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('bulkDelete error', async () => {
        mockServer.onDelete('/api/tags/').reply((config) => {
            if (_isEqual(config.data, {ids: [1, 2]})) {
                return [204]
            }

            return [404]
        })

        await store.dispatch(actions.bulkDelete(['5']))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('merge', async () => {
        mockServer.onPut('/api/tags/3/merge/').reply((config) => {
            if (_isEqual(config.data, {source_tags_ids: [1, 2]})) {
                return [200]
            }

            return [400]
        })

        await store.dispatch(actions.merge(fromJS([1, 2, 3])))
        const expectedActions = store.getActions()
        expect(expectedActions[0]).toEqual({
            type: types.MERGE_TAGS,
            ids: fromJS([1, 2, 3]),
        })
        expect(expectedActions).toMatchSnapshot()
    })

    it('merge error', async () => {
        mockServer.onPut('/api/tags/3/merge/').reply((config) => {
            if (_isEqual(config.data, {source_tags_ids: [1, 2]})) {
                return [200]
            }

            return [400]
        })

        await store.dispatch(actions.merge(fromJS([2, 3])))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('reset meta of tags', () => {
        store.dispatch(actions.resetMeta())
        expect(store.getActions()).toMatchSnapshot()
    })
})
