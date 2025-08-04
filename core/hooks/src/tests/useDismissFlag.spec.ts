import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useDismissFlag } from '../useDismissFlag'

describe('useDismissFlag', () => {
    it('should return the default visibility', () => {
        const { result } = renderHook(() => useDismissFlag('key'))
        expect(result.current.isDismissed).toBe(true)
    })

    it('should return the set visibility', () => {
        const { result } = renderHook(() => useDismissFlag('key', true))
        expect(result.current.isDismissed).toBe(false)
    })

    describe('flag is dismissed using the api', () => {
        it('saves the dismiss state in localStorage', () => {
            const lsSpy = jest.spyOn(Storage.prototype, 'setItem')
            const { result } = renderHook(() => useDismissFlag('key'))

            act(() => {
                result.current.dismiss()
            })

            expect(lsSpy).toHaveBeenCalledWith('key', 'true')
        })

        it('updates the visibility', () => {
            const { result } = renderHook(() => useDismissFlag('key'))

            act(() => {
                result.current.dismiss()
            })

            expect(result.current.isDismissed).toBe(true)
        })
    })

    describe('given flag is permanently hidden in the storage', () => {
        beforeAll(() => {
            localStorage.setItem('key', 'true')
        })

        afterAll(() => {
            localStorage.removeItem('key')
        })

        it('should return the visibility from localStorage', () => {
            const { result } = renderHook(() => useDismissFlag('key', true))
            expect(result.current.isDismissed).toBe(true)
        })
    })
})
