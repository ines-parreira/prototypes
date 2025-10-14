import { FeatureFlagKey } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { usePlaygroundChannel } from '../usePlaygroundChannel'

jest.mock('core/flags/hooks/useFlag')

const mockUseFlag = require('core/flags/hooks/useFlag').default as jest.Mock

describe('usePlaygroundChannel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should initialize with email channel when standalone flag is false', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channel).toBe('email')
        expect(result.current.channelAvailability).toBe('online')
    })

    it('should initialize with chat channel when standalone flag is true', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channel).toBe('chat')
        expect(result.current.channelAvailability).toBe('online')
    })

    it('should check standalone handover feature flag', () => {
        mockUseFlag.mockReturnValue(false)

        renderHook(() => usePlaygroundChannel())

        expect(mockUseFlag).toHaveBeenCalledWith(
            FeatureFlagKey.StandaloneHandoverCapabilities,
            false,
        )
    })

    it('should change channel when onChannelChange is called', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channel).toBe('email')

        act(() => {
            result.current.onChannelChange('chat')
        })

        expect(result.current.channel).toBe('chat')
    })

    it('should change channel availability when onChannelAvailabilityChange is called', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channelAvailability).toBe('online')

        act(() => {
            result.current.onChannelAvailabilityChange('offline')
        })

        expect(result.current.channelAvailability).toBe('offline')
    })

    it('should switch between multiple channels', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelChange('chat')
        })

        expect(result.current.channel).toBe('chat')

        act(() => {
            result.current.onChannelChange('email')
        })

        expect(result.current.channel).toBe('email')
    })

    it('should handle channel availability changes correctly', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelAvailabilityChange('offline')
        })

        expect(result.current.channelAvailability).toBe('offline')

        act(() => {
            result.current.onChannelAvailabilityChange('online')
        })

        expect(result.current.channelAvailability).toBe('online')
    })

    it('should maintain independent state for channel and availability', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelChange('chat')
            result.current.onChannelAvailabilityChange('offline')
        })

        expect(result.current.channel).toBe('chat')
        expect(result.current.channelAvailability).toBe('offline')
    })
})
