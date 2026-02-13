import { describe, expect, it } from 'vitest'

import {
    makeUserRealtimeChannel,
    makeUserRealtimeChannels,
} from '../makeUserRealtimeChannel'

describe('makeUserRealtimeChannel', () => {
    const mockAccountId = 12345
    const mockUserId = 67890

    it('should create a user-specific channel configuration', () => {
        const channel = makeUserRealtimeChannel(mockAccountId, mockUserId)

        expect(channel).toEqual({
            name: 'user',
            accountId: mockAccountId,
            userId: mockUserId,
        })
    })
})

describe('makeUserRealtimeChannels', () => {
    const mockAccountId = 12345
    const mockUserIds = [67890, 11111, 22222]

    it('should create multiple user-specific channel configurations', () => {
        const channels = makeUserRealtimeChannels(mockAccountId, mockUserIds)

        expect(channels).toEqual([
            { name: 'user', accountId: mockAccountId, userId: 67890 },
            { name: 'user', accountId: mockAccountId, userId: 11111 },
            { name: 'user', accountId: mockAccountId, userId: 22222 },
        ])
    })

    it('should handle empty user IDs array', () => {
        const channels = makeUserRealtimeChannels(mockAccountId, [])

        expect(channels).toEqual([])
    })
})
