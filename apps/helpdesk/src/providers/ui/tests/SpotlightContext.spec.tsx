import type { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { SpotlightContext, useSpotlightContext } from '../SpotlightContext'

describe('useSpotlightContext', () => {
    it('should throw error when used outside of provider', () => {
        expect(() => renderHook(useSpotlightContext)).toThrow(
            new Error(
                'useSpotlightContext must be used within a SpotlightProvider',
            ),
        )
    })

    it('should return context value when used within provider', () => {
        const mockSetIsOpen = jest.fn()
        const contextValue = {
            isOpen: true,
            setIsOpen: mockSetIsOpen,
        }

        const wrapper = ({ children }: { children: ReactNode }) => (
            <SpotlightContext.Provider value={contextValue}>
                {children}
            </SpotlightContext.Provider>
        )

        const { result } = renderHook(() => useSpotlightContext(), { wrapper })

        expect(result.current).toEqual(contextValue)
        expect(result.current.isOpen).toBe(true)
        expect(result.current.setIsOpen).toBe(mockSetIsOpen)
    })
})
