import * as immutableMatchers from 'jest-immutable-matchers'

import {
    areMacrosVisible,
    getMacros, getMacrosOrderedByName, getMacrosOrderedByUsage,
    getMacrosState, isMacrosModalOpen
} from '../selectors'
import {macros} from '../../../fixtures/macro'
import {fromJS} from 'immutable'

jest.addMatchers(immutableMatchers)


describe('macro selectors', () => {
    let state

    beforeEach(() => {
        state = {
            macros: fromJS({
                items: macros,
                visible: false,
                isModalOpen: false,
            }),
        }
    })

    it('should get macros state', () => {
        const macrosState = getMacrosState(state)
        expect(macrosState).toEqualImmutable(state.macros)
    })

    it('should get macros', () => {
        const macros = getMacros(state)
        expect(macros).toEqualImmutable(state.macros.get('items'))
    })

    it('should get macros ordered by name', () => {
        const macros = getMacrosOrderedByName(state)
        expect(macros.map((m) => m.get('name')).toJS()).toEqual(['Cancel Order', 'Do Not Waive Fee', 'Waive Fee'])
    })

    it('should get macros ordered by usage', () => {
        const macros = getMacrosOrderedByUsage(state)
        expect(macros.first().get('name')).toEqual('Do Not Waive Fee')
    })

    it('should get macro visibility', () => {
        expect(areMacrosVisible(state)).toEqual(false)

        state.macros = state.macros.set('visible', true)
        expect(areMacrosVisible(state)).toEqual(true)
    })

    it('should get macro modal visibility', () => {
        expect(isMacrosModalOpen(state)).toEqual(false)

        state.macros = state.macros.set('isModalOpen', true)
        expect(isMacrosModalOpen(state)).toEqual(true)
    })
})
