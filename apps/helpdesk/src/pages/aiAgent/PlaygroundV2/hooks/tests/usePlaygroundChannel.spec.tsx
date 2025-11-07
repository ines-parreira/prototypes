import { act, renderHook } from '@testing-library/react'

import { usePlaygroundChannel } from '../usePlaygroundChannel'

describe('usePlaygroundChannel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should initialize with chat channel by default', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channel).toBe('chat')
        expect(result.current.channelAvailability).toBe('online')
    })

    it('should change channel when onChannelChange is called', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channel).toBe('chat')

        act(() => {
            result.current.onChannelChange('email')
        })

        expect(result.current.channel).toBe('email')
    })

    it('should change channel availability when onChannelAvailabilityChange is called', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        expect(result.current.channelAvailability).toBe('online')

        act(() => {
            result.current.onChannelAvailabilityChange('offline')
        })

        expect(result.current.channelAvailability).toBe('offline')
    })

    it('should switch between multiple channels', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelChange('email')
        })

        expect(result.current.channel).toBe('email')

        act(() => {
            result.current.onChannelChange('sms')
        })

        expect(result.current.channel).toBe('sms')
    })

    it('should handle channel availability changes correctly', () => {
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
        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelChange('email')
            result.current.onChannelAvailabilityChange('offline')
        })

        expect(result.current.channel).toBe('email')
        expect(result.current.channelAvailability).toBe('offline')
    })

    it('should reset channel to default when resetToDefaultChannel is called', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelChange('email')
        })

        expect(result.current.channel).toBe('email')

        act(() => {
            result.current.resetToDefaultChannel()
        })

        expect(result.current.channel).toBe('chat')
    })

    it('should expose resetToDefaultChannel function', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        expect(typeof result.current.resetToDefaultChannel).toBe('function')
    })

    it('should not affect channel availability when resetting channel', () => {
        const { result } = renderHook(() => usePlaygroundChannel())

        act(() => {
            result.current.onChannelChange('email')
            result.current.onChannelAvailabilityChange('offline')
        })

        expect(result.current.channel).toBe('email')
        expect(result.current.channelAvailability).toBe('offline')

        act(() => {
            result.current.resetToDefaultChannel()
        })

        expect(result.current.channel).toBe('chat')
        expect(result.current.channelAvailability).toBe('offline')
    })
})
