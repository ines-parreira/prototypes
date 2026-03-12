import MockAdapter from 'axios-mock-adapter'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from 'models/api/resources'
import type { StoreDispatch } from 'state/types'
import { CancelToken } from 'tests/axiosRuntime'

import * as actions from '../actions'
import * as constants from '../constants'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})

describe('macro actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore()
        mockServer = new MockAdapter(client)
    })

    describe('fetchAllMacros', () => {
        it('should return formatted data', () => {
            const macros = [{ id: 1, name: 'Pizza Pepperoni' }]
            mockServer.onGet('/api/macros/').reply(200, {
                data: macros,
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            })

            return store
                .dispatch(
                    actions.fetchAllMacros({}, CancelToken.source().token),
                )
                .then((res) => {
                    expect(res).toEqual(fromJS(macros))
                    expect(store.getActions()).toEqual([
                        {
                            type: constants.UPSERT_MACROS,
                            payload: fromJS(macros),
                        },
                    ])
                })
        })
    })

    describe('createMacro', () => {
        it('should return created macro and dispatch UPSERT_MACRO action on success', async () => {
            const macro: Map<string, unknown> = fromJS({
                id: 1,
                name: 'Pizza Pepperoni',
            })
            mockServer.onPost('/api/macros/').reply(200, macro.toJS())
            const res = await store.dispatch(actions.createMacro(macro))
            expect(res).toEqual(macro.toJS())
            expect(store.getActions()[0]).toEqual({
                type: constants.UPSERT_MACRO,
                payload: macro,
            })
        })
    })

    describe('updateMacro', () => {
        it('should return updated macro and dispatch UPSERT_MACRO action on success', async () => {
            const macro: Map<string, unknown> = fromJS({
                id: 1,
                name: 'Pizza Pepperoni',
            })
            mockServer.onPut('/api/macros/1/').reply(200, macro.toJS())
            const res = await store.dispatch(actions.updateMacro(macro))
            expect(res).toEqual(macro.toJS())
            expect(store.getActions()[0]).toEqual({
                type: constants.UPSERT_MACRO,
                payload: macro,
            })
        })
    })

    describe('deleteMacro', () => {
        it('should dispatch a notify action on success', () => {
            mockServer.onDelete('/api/macros/1/').reply(200)

            return store
                .dispatch(actions.deleteMacro('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should dispatch DELETE_MACRO action on success', async () => {
            mockServer.onDelete('/api/macros/1/').reply(200)
            await store.dispatch(actions.deleteMacro('1'))
            expect(store.getActions()[0]).toEqual({
                type: constants.DELETE_MACRO,
                payload: '1',
            })
        })

        it('should dispatch an error action', () => {
            mockServer.onDelete('/api/integrations/1/').reply(400)

            return store
                .dispatch(actions.deleteMacro('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('getMacro', () => {
        it('should return macro and dispatch UPSERT_MACRO action on success', async () => {
            const macro: Map<string, unknown> = fromJS({
                id: 1,
                name: 'Pizza Pepperoni',
            })
            mockServer.onGet('/api/macros/1').reply(200, macro.toJS())
            const res = await store.dispatch(actions.getMacro('1'))
            expect(res).toEqual(macro)
            expect(store.getActions()[0]).toEqual({
                type: constants.UPSERT_MACRO,
                payload: macro,
            })
        })

        it('should return falsy value on error', async () => {
            mockServer.onGet('/api/macros/1').reply(500)
            const res = await store.dispatch(actions.getMacro('1'))
            expect(res).toBeFalsy()
        })

        it('should not make API call', async () => {
            const spy = jest.spyOn(client, 'get')
            const res = await store.dispatch(actions.getMacro(''))
            expect(res).toBeUndefined()
            expect(spy).toHaveBeenCalledTimes(0)
        })
    })
})
