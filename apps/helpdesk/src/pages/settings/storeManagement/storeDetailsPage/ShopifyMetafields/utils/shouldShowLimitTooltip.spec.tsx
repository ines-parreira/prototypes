import type { CellContext } from '@gorgias/axiom'

import type { Field } from '../MetafieldsTable/types'
import { getCheckboxContent } from './getCheckboxContent'
import { shouldShowLimitTooltip } from './shouldShowLimitTooltip'

describe('shouldShowLimitTooltip', () => {
    it('should return true when all conditions are met', () => {
        const result = shouldShowLimitTooltip({
            isDisabled: true,
            isCurrentlySelected: false,
            isSupportedType: true,
            hasReachedLimit: true,
        })

        expect(result).toBe(true)
    })

    it('should return false when isDisabled is false', () => {
        const result = shouldShowLimitTooltip({
            isDisabled: false,
            isCurrentlySelected: false,
            isSupportedType: true,
            hasReachedLimit: true,
        })

        expect(result).toBe(false)
    })

    it('should return false when isCurrentlySelected is true', () => {
        const result = shouldShowLimitTooltip({
            isDisabled: true,
            isCurrentlySelected: true,
            isSupportedType: true,
            hasReachedLimit: true,
        })

        expect(result).toBe(false)
    })

    it('should return false when isSupportedType is false', () => {
        const result = shouldShowLimitTooltip({
            isDisabled: true,
            isCurrentlySelected: false,
            isSupportedType: false,
            hasReachedLimit: true,
        })

        expect(result).toBe(false)
    })

    it('should return false when hasReachedLimit is false', () => {
        const result = shouldShowLimitTooltip({
            isDisabled: true,
            isCurrentlySelected: false,
            isSupportedType: true,
            hasReachedLimit: false,
        })

        expect(result).toBe(false)
    })
})

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
