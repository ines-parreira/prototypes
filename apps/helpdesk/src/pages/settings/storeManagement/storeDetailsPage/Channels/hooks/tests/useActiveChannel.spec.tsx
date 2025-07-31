import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { ChannelChange, ChannelWithMetadata } from '../../../../types'
import UseActiveChannel from '../useActiveChannel'

describe('useActiveChannel', () => {
    const mockChannels: ChannelWithMetadata[] = [
        {
            title: 'Email Channel',
            description: 'Email Description',
            count: 1,
            type: 'email',
            assignedChannels: [],
            unassignedChannels: [],
        },
        {
            title: 'SMS Channel',
            description: 'SMS Description',
            count: 2,
            type: 'sms',
            assignedChannels: [],
            unassignedChannels: [],
        },
    ]

    const mockChanges: ChannelChange[] = [
        { channelId: 1, action: 'add' },
        { channelId: 2, action: 'remove' },
    ]

    it('should initialize with undefined activeChannel and empty changes', () => {
        const { result } = renderHook(() => UseActiveChannel(mockChannels))

        expect(result.current.activeChannel).toBeUndefined()
        expect(result.current.changes).toEqual([])
    })

    it('should update activeChannel when setActiveChannelType is called', () => {
        const { result } = renderHook(() => UseActiveChannel(mockChannels))

        act(() => {
            result.current.setActiveChannelType('email')
        })

        expect(result.current.activeChannel).toEqual(mockChannels[0])
    })

    it('should update changes when setChanges is called', () => {
        const { result } = renderHook(() => UseActiveChannel(mockChannels))

        act(() => {
            result.current.setChanges(mockChanges)
        })

        expect(result.current.changes).toEqual(mockChanges)
    })

    it('should reset both activeChannel and changes when reset is called', () => {
        const { result } = renderHook(() => UseActiveChannel(mockChannels))

        act(() => {
            result.current.setActiveChannelType('sms')
            result.current.setChanges(mockChanges)
        })

        expect(result.current.activeChannel).toEqual(mockChannels[1])
        expect(result.current.changes).toEqual(mockChanges)

        act(() => {
            result.current.reset()
        })

        expect(result.current.activeChannel).toBeUndefined()
        expect(result.current.changes).toEqual([])
    })
})
