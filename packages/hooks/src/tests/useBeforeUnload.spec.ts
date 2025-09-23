import { renderHook } from '@repo/testing'

import { useBeforeUnload } from '../useBeforeUnload'

describe('useBeforeUnload', () => {
    it('should add and remove event listener on mount and unmount', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

        const { unmount } = renderHook(() => useBeforeUnload(true))

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'beforeunload',
            expect.any(Function),
        )

        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'beforeunload',
            expect.any(Function),
        )
    })

    it('should not add event listener if enabled is false', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

        renderHook(() => useBeforeUnload(false))

        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
            'beforeunload',
            expect.any(Function),
        )
    })

    it('should call the provided message function when preventing unload', () => {
        const mockMessage = 'Are you sure you want to leave?'

        const event = new Event('beforeunload')
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
        const setReturnValueSpy = jest.spyOn(event, 'returnValue', 'set')

        renderHook(() => useBeforeUnload(true, mockMessage))

        window.dispatchEvent(event)

        expect(preventDefaultSpy).toHaveBeenCalled()
        expect(setReturnValueSpy).toHaveBeenCalledWith(mockMessage)
    })

    it('should not preventDefault the event enabled function returns false', () => {
        renderHook(() => useBeforeUnload(() => false))

        const event = new Event('beforeunload')
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

        window.dispatchEvent(event)

        expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
})
