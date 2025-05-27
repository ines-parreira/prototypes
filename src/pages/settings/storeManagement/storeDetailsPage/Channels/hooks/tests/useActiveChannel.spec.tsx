import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { ChannelChange, ChannelWithMetadata } from '../../../../types'
import UseActiveChannel from '../useActiveChannel'

describe('useActiveChannel', () => {
    const mockChannel: ChannelWithMetadata = {
        title: 'Test Channel',
        description: 'Test Description',
        count: 1,
        type: 'email',
        assignedChannels: [],
        unassignedChannels: [],
    }

    const mockChanges: ChannelChange[] = [
        { channelId: 1, action: 'add' },
        { channelId: 2, action: 'remove' },
    ]

    it('should initialize with null activeChannel and empty changes', () => {
        const { result } = renderHook(() => UseActiveChannel())

        expect(result.current.activeChannel).toBeNull()
        expect(result.current.changes).toEqual([])
    })

    it('should update activeChannel when setActiveChannel is called', () => {
        const { result } = renderHook(() => UseActiveChannel())

        act(() => {
            result.current.setActiveChannel(mockChannel)
        })

        expect(result.current.activeChannel).toEqual(mockChannel)
    })

    it('should update changes when setChanges is called', () => {
        const { result } = renderHook(() => UseActiveChannel())

        act(() => {
            result.current.setChanges(mockChanges)
        })

        expect(result.current.changes).toEqual(mockChanges)
    })

    it('should reset both activeChannel and changes when reset is called', () => {
        const { result } = renderHook(() => UseActiveChannel())

        act(() => {
            result.current.setActiveChannel(mockChannel)
            result.current.setChanges(mockChanges)
        })

        expect(result.current.activeChannel).toEqual(mockChannel)
        expect(result.current.changes).toEqual(mockChanges)

        act(() => {
            result.current.reset()
        })

        expect(result.current.activeChannel).toBeNull()
        expect(result.current.changes).toEqual([])
    })
})
