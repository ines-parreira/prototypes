import { renderHook } from '@repo/testing'
import { useParams } from 'react-router-dom'

import { useStoreManagementState } from '../../../../StoreManagementProvider'
import type { ChannelWithMetadata } from '../../../../types'
import { useChannels } from '../useChannels'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
jest.mock('../../../../StoreManagementProvider')

const mockUseParams = useParams as jest.Mock
const mockUseStoreManagementState = useStoreManagementState as jest.Mock

const mockStore = {
    store: { id: 1 },
    assignedChannels: [
        { type: 'email', id: 1 },
        { type: 'gorgias_chat', id: 2 },
        { type: 'helpCenter', id: 3 },
        { type: 'voice', id: 4 },
        { type: 'sms', id: 5 },
        { type: 'whatsApp', id: 6 },
        { type: 'facebook', id: 7 },
        { type: 'tiktokShop', id: 8 },
    ],
}

const mockUnassignedChannels = [
    { type: 'email', id: 9 },
    { type: 'gorgias_chat', id: 10 },
    { type: 'helpCenter', id: 11 },
]

describe('useChannels', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ id: '1' })
        mockUseStoreManagementState.mockReturnValue({
            stores: [mockStore],
            unassignedChannels: mockUnassignedChannels,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return channels with correct counts and assignments', () => {
        const { result } = renderHook(() => useChannels())

        const emailChannel = result.current.find(
            (channel: ChannelWithMetadata) => channel.type === 'email',
        )

        expect(emailChannel).toEqual({
            title: 'Email',
            description: '',
            count: 1,
            type: 'email',
            assignedChannels: [{ type: 'email', id: 1 }],
            unassignedChannels: [{ type: 'email', id: 9 }],
        })

        const chatChannel = result.current.find(
            (channel: ChannelWithMetadata) => channel.type === 'chat',
        )
        expect(chatChannel).toEqual({
            title: 'Chat',
            description: '',
            count: 1,
            type: 'chat',
            assignedChannels: [{ type: 'gorgias_chat', id: 2 }],
            unassignedChannels: [{ type: 'gorgias_chat', id: 10 }],
        })
    })

    it('should handle store not found', () => {
        mockUseParams.mockReturnValue({ id: '999' })

        const { result } = renderHook(() => useChannels())

        result.current.forEach((channel: ChannelWithMetadata) => {
            expect(channel.count).toBe(0)
            expect(channel.assignedChannels).toEqual([])
        })
    })

    it('should handle empty assigned and unassigned channels', () => {
        mockUseStoreManagementState.mockReturnValue({
            stores: [{ store: { id: 1 }, assignedChannels: [] }],
            unassignedChannels: [],
        })

        const { result } = renderHook(() => useChannels())

        result.current.forEach((channel: ChannelWithMetadata) => {
            expect(channel.count).toBe(0)
            expect(channel.assignedChannels).toEqual([])
            expect(channel.unassignedChannels).toEqual([])
        })
    })
})
