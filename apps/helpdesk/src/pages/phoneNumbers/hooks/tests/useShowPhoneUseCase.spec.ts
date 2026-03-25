import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { PhoneCountry } from 'business/twilio'

import { useShowPhoneUseCase } from '../useShowPhoneUseCase'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.Mock

describe('useShowPhoneUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return false when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() =>
            useShowPhoneUseCase(PhoneCountry.US),
        )

        expect(result.current).toBe(false)
        expect(mockUseFlag).toHaveBeenCalledWith(
            FeatureFlagKey.MarketingPhoneNumber,
        )
    })

    it('should return false when country is not US or CA', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() =>
            useShowPhoneUseCase(PhoneCountry.AU),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when country is undefined', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() => useShowPhoneUseCase(undefined))

        expect(result.current).toBe(false)
    })

    it('should return true when feature flag is enabled and country is US', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() =>
            useShowPhoneUseCase(PhoneCountry.US),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when feature flag is enabled and country is CA', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() =>
            useShowPhoneUseCase(PhoneCountry.CA),
        )

        expect(result.current).toBe(true)
    })
})
