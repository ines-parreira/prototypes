import { createContext } from 'react'

import { renderHook } from 'utils/testing/renderHook'

import useSafeContext from '../useSafeContext'

describe('useSafeContext', () => {
    it('should return context value when used within provider', () => {
        const testValue = { data: 'test' }
        const TestContext = createContext<typeof testValue | undefined>(
            undefined,
        )
        TestContext.displayName = 'TestContext'

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <TestContext.Provider value={testValue}>
                {children}
            </TestContext.Provider>
        )

        const { result } = renderHook(() => useSafeContext(TestContext), {
            wrapper,
        })

        expect(result.current).toEqual(testValue)
    })

    it('should throw error when context is used outside provider', () => {
        const TestContext = createContext<string | undefined>(undefined)
        TestContext.displayName = 'TestContext'

        expect(() => renderHook(() => useSafeContext(TestContext))).toThrow(
            'TestContext must be used within a TestContext.Provider',
        )
    })

    it('should throw error when context has no displayName', () => {
        const TestContext = createContext<string | undefined>(undefined)
        TestContext.displayName = undefined

        expect(() => renderHook(() => useSafeContext(TestContext))).toThrow(
            'Context must have a displayName',
        )
    })
})
