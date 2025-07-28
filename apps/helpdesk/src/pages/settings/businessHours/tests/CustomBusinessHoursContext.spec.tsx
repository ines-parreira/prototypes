import { renderHook } from '@testing-library/react'

import {
    CustomBusinessHoursContext,
    useCustomBusinessHoursContext,
} from '../CustomBusinessHoursContext'

describe('CustomBusinessHoursContext', () => {
    it('should throw an error if used outside of the provider', () => {
        expect(() =>
            renderHook(() => useCustomBusinessHoursContext()),
        ).toThrow()
    })

    it('should return the correct context', () => {
        const value = {
            integrationsToOverride: [],
            toggleIntegrationsToOverride: jest.fn(),
            resetIntegrationsToOverride: jest.fn(),
        }

        const { result } = renderHook(() => useCustomBusinessHoursContext(), {
            wrapper: ({ children }) => (
                <CustomBusinessHoursContext.Provider value={value}>
                    {children}
                </CustomBusinessHoursContext.Provider>
            ),
        })

        expect(result.current).toEqual(value)
    })
})
