import { macros } from 'fixtures/macro'
import { getDefaultMacro } from 'state/macro/utils'

import {
    getCurrentMacro,
    getDefaultSelectedMacroId,
    isMacroDisabled,
} from '../utils'

describe('isMacroDisabled', () => {
    const macro = macros[0]

    it('should return false for macro with non disabled external actions', () => {
        expect(isMacroDisabled(macro, false)).toEqual(false)
    })

    it('should return true for macro with external actions', () => {
        expect(isMacroDisabled(macro, true)).toEqual(true)
    })
})

describe('getDefaultSelectedMacroId', () => {
    it('should return id', () => {
        expect(getDefaultSelectedMacroId(macros, 77, true)).toEqual(77)
    })

    it('should return null when macros are empty', () => {
        expect(getDefaultSelectedMacroId([], 1, false)).toEqual(null)
    })

    it('should return id of current macro', () => {
        expect(getDefaultSelectedMacroId(macros, 2, false)).toEqual(
            macros[1].id,
        )
    })

    it('should fallback to id of first macro', () => {
        expect(getDefaultSelectedMacroId(macros, 77, false)).toEqual(
            macros[0].id,
        )
    })
})

describe('getCurrentMacro', () => {
    it('should return default macro if creating macro', () => {
        expect(getCurrentMacro(macros, 18, true)).toEqual(getDefaultMacro())
    })

    it('should return undefined when not finding macro', () => {
        expect(getCurrentMacro(macros, 11)).toEqual(undefined)
    })

    it('should return undefined when macros are undefined', () => {
        expect(getCurrentMacro([undefined], 1)).toEqual(undefined)
    })

    it('should return matching macro', () => {
        expect(getCurrentMacro(macros, 3)).toEqual(macros[2])
    })
})
