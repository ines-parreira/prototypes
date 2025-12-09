import type { CellContext } from '@gorgias/axiom'

import type { Field } from '../MetafieldsTable/types'
import { getCheckboxContent } from './getCheckboxContent'

describe('getCheckboxContent', () => {
    const mockInfo = {} as CellContext<Field, unknown>

    it('should return result of originalCell when it is a function', () => {
        const mockResult = <div>Test Content</div>
        const mockOriginalCell = jest.fn().mockReturnValue(mockResult)

        const result = getCheckboxContent(mockOriginalCell, mockInfo)

        expect(mockOriginalCell).toHaveBeenCalledWith(mockInfo)
        expect(result).toBe(mockResult)
    })

    it('should return null when originalCell is not a function', () => {
        const result = getCheckboxContent(undefined, mockInfo)

        expect(result).toBeNull()
    })

    it('should return null when originalCell is a string', () => {
        const result = getCheckboxContent('not a function', mockInfo)

        expect(result).toBeNull()
    })

    it('should return null when originalCell is an object', () => {
        const result = getCheckboxContent({}, mockInfo)

        expect(result).toBeNull()
    })
})
