import { renderHook } from '@repo/testing'

import { useSelectedEmailsBeforeRedirect } from '../useSelectedEmailsBeforeRedirect'

describe('useSelectedEmailsBeforeRedirect', () => {
    it('should initialize with an empty array', () => {
        const { result } = renderHook(() => useSelectedEmailsBeforeRedirect())
        expect(result.current.selectedEmailsBeforeRedirect).toEqual([])
    })

    it('should update selected emails when setSelectedEmailsBeforeRedirect is called', () => {
        const { result, rerender } = renderHook(() =>
            useSelectedEmailsBeforeRedirect(),
        )

        result.current.setSelectedEmailsBeforeRedirect([4, 5])
        rerender()

        expect(result.current.selectedEmailsBeforeRedirect).toEqual([4, 5])
    })

    it('should return empty array after clearSelectedEmailsBeforeRedirect is called', () => {
        const { result, rerender } = renderHook(() =>
            useSelectedEmailsBeforeRedirect(),
        )

        result.current.setSelectedEmailsBeforeRedirect([4, 5])
        rerender()

        expect(result.current.selectedEmailsBeforeRedirect).toEqual([4, 5])

        result.current.clearSelectedEmailsBeforeRedirect()
        rerender()

        expect(result.current.selectedEmailsBeforeRedirect).toEqual([])
    })
})
