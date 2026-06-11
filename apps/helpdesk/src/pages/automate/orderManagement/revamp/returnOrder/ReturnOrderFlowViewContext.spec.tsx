import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing'

import {
    ReturnOrderFlowViewContext,
    usePropagateError,
    useReturnOrderFlowViewContext,
} from './ReturnOrderFlowViewContext'

describe('useReturnOrderFlowViewContext', () => {
    it('should return default context values', () => {
        const { result } = renderHook(() => useReturnOrderFlowViewContext())

        expect(result.current.storeIntegration).toBeUndefined()
        expect(result.current.setError).toBeDefined()
    })

    it('should return provided context values', () => {
        const mockSetError = jest.fn()
        const mockStoreIntegration = { id: 1, name: 'test-store' }

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <ReturnOrderFlowViewContext.Provider
                value={{
                    storeIntegration: mockStoreIntegration as any,
                    setError: mockSetError,
                }}
            >
                {children}
            </ReturnOrderFlowViewContext.Provider>
        )

        const { result } = renderHook(() => useReturnOrderFlowViewContext(), {
            wrapper,
        })

        expect(result.current.storeIntegration).toEqual(mockStoreIntegration)
        expect(result.current.setError).toBe(mockSetError)
    })
})

describe('usePropagateError', () => {
    it('should call setError with true when hasError is true', () => {
        const mockSetError = jest.fn()

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <ReturnOrderFlowViewContext.Provider
                value={{
                    storeIntegration: undefined,
                    setError: mockSetError,
                }}
            >
                {children}
            </ReturnOrderFlowViewContext.Provider>
        )

        renderHook(() => usePropagateError('test_path', true), { wrapper })

        expect(mockSetError).toHaveBeenCalledWith('test_path', true)
    })

    it('should not call setError when hasError is false and hadError is false', () => {
        const mockSetError = jest.fn()

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <ReturnOrderFlowViewContext.Provider
                value={{
                    storeIntegration: undefined,
                    setError: mockSetError,
                }}
            >
                {children}
            </ReturnOrderFlowViewContext.Provider>
        )

        renderHook(() => usePropagateError('test_path', false), { wrapper })

        expect(mockSetError).not.toHaveBeenCalled()
    })

    it('should call setError with false when error is cleared', () => {
        const mockSetError = jest.fn()

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <ReturnOrderFlowViewContext.Provider
                value={{
                    storeIntegration: undefined,
                    setError: mockSetError,
                }}
            >
                {children}
            </ReturnOrderFlowViewContext.Provider>
        )

        const { rerender } = renderHook(
            ({ hasError }) => usePropagateError('test_path', hasError),
            { wrapper, initialProps: { hasError: true } },
        )

        expect(mockSetError).toHaveBeenCalledWith('test_path', true)
        mockSetError.mockClear()

        rerender({ hasError: false })

        expect(mockSetError).toHaveBeenCalledWith('test_path', false)
    })

    it('should clean up error on unmount when hadError is true', () => {
        const mockSetError = jest.fn()

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <ReturnOrderFlowViewContext.Provider
                value={{
                    storeIntegration: undefined,
                    setError: mockSetError,
                }}
            >
                {children}
            </ReturnOrderFlowViewContext.Provider>
        )

        const { unmount, rerender } = renderHook(
            ({ hasError }) => usePropagateError('test_path', hasError),
            { wrapper, initialProps: { hasError: true } },
        )

        mockSetError.mockClear()

        rerender({ hasError: false })
        mockSetError.mockClear()

        unmount()

        expect(mockSetError).toHaveBeenCalledWith('test_path', false)
    })
})
