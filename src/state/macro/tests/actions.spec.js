import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions.ts'
import * as constants from '../constants'
import client from '../../../models/api/resources.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('macro actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore()
        mockServer = new MockAdapter(client)
    })

    describe('fetchMacros', () => {
        it('should return formatted data', () => {
            const macros = fromJS([{id: 1, name: 'Pizza Pepperoni'}])
            mockServer.onGet('/api/macros/').reply(200, {
                data: macros.toJS(),
                meta: {
                    page: 1,
                    nb_pages: 1,
                },
            })

            return store.dispatch(actions.fetchMacros()).then((res) => {
                expect(res).toEqual({
                    macros,
                    page: 1,
                    totalPages: 1,
                })
                expect(store.getActions()).toEqual([
                    {
                        type: constants.UPSERT_MACROS,
                        payload: macros,
                    },
                ])
            })
        })

        it('should return merged macros for next page', () => {
            const currentMacros = fromJS([{id: 1, name: 'Pizza Pepperoni'}])
            const macros = fromJS([{id: 2, name: 'Pizza Margherita'}])

            mockServer.onGet('/api/macros/').reply(200, {
                data: macros.toJS(),
                meta: {
                    page: 2,
                    nb_pages: 2,
                },
            })

            return store
                .dispatch(
                    actions.fetchMacros({
                        currentMacros,
                        currentPage: 1,
                        page: 2,
                    })
                )
                .then((res) => {
                    expect(res).toEqual({
                        macros: fromJS(currentMacros).concat(macros),
                        page: 2,
                        totalPages: 2,
                    })
                    expect(store.getActions()).toEqual([
                        {
                            type: constants.UPSERT_MACROS,
                            payload: macros,
                        },
                    ])
                })
        })
    })

    describe('createMacro', () => {
        it('should return created macro and dispatch UPSERT_MACRO action on success', async () => {
            const macro = fromJS({id: 1, name: 'Pizza Pepperoni'})
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
            const macro = fromJS({id: 1, name: 'Pizza Pepperoni'})
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
                .dispatch(actions.deleteMacro(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should dispatch DELETE_MACRO action on success', async () => {
            mockServer.onDelete('/api/macros/1/').reply(200)
            await store.dispatch(actions.deleteMacro(1))
            expect(store.getActions()[0]).toEqual({
                type: constants.DELETE_MACRO,
                payload: 1,
            })
        })

        it('should dispatch an error action', () => {
            mockServer.onDelete('/api/integrations/1/').reply(400)

            return store
                .dispatch(actions.deleteMacro(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('getMacro', () => {
        it('should return macro and dispatch UPSERT_MACRO action on success', async () => {
            const macro = fromJS({id: 1, name: 'Pizza Pepperoni'})
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
    })
})
