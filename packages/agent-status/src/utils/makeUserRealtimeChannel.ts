import type { ChannelNameOptions } from '@gorgias/realtime-ably'

/**
 * Creates a user-specific realtime channel configuration.
 *
 * @param accountId - The account ID
 * @param userId - The user ID to subscribe to
 * @returns Channel configuration for a single user
 */
export function makeUserRealtimeChannel(
    accountId: number,
    userId: number,
): ChannelNameOptions {
    return {
        name: 'user',
        accountId,
        userId,
    }
}

/**
 * Creates multiple user-specific realtime channel configurations.
 *
 * @param accountId - The account ID
 * @param userIds - Array of user IDs to subscribe to
 * @returns Array of channel configurations
 */
export function makeUserRealtimeChannels(
    accountId: number,
    userIds: number[],
): ChannelNameOptions[] {
    return userIds.map((userId) => makeUserRealtimeChannel(accountId, userId))
}
