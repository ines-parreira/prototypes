import {fromJS} from 'immutable'

import {UPSERT_MACRO, DELETE_MACRO, UPSERT_MACROS} from '../constants'
import reducer from '../reducer'

describe('macro reducer', () => {
    describe('UPSERT_MACRO', () => {
        it('should insert new macro', () => {
            const macro = fromJS({id: 1})
            const state = fromJS({})
            const newState = reducer(state, {
                type: UPSERT_MACRO,
                payload: macro
            })
            expect(newState).toEqual(state.set(1, macro))
        })

        it('should update existing macro', () => {
            const macro = fromJS({id: 1, name: 'bar'})
            const state = fromJS({}).set(1, fromJS({id: 1, name: 'foo'}))
            const newState = reducer(state, {
                type: UPSERT_MACRO,
                payload: macro
            })
            expect(newState).toEqual(state.set(1, macro))
        })
    })

    describe('UPSERT_MACROS', () => {
        it('should insert and update macros', () => {
            const macros = fromJS([{
                id: 1,
                name: 'foo'
            }, {
                id: 2,
                name: 'baz'
            }])
            const state = fromJS({}).set(2, fromJS({
                is: 2,
                name: 'bar'
            }))
            const newState = reducer(state, {
                type: UPSERT_MACROS,
                payload: macros
            })
            const expectedState = state.set(2, macros.get(1))
                .set(1, macros.get(0))
            expect(newState).toEqual(expectedState)
        })
    })

    describe('DELETE_MACRO', () => {
        it('should delete the macro', () => {
            const state = fromJS({}).set(1, fromJS({id: 1}))
            const newState = reducer(state, {
                type: DELETE_MACRO,
                payload: 1
            })
            expect(newState).toEqual(fromJS({}))
        })
    })
})
