import { Integration } from 'models/integration/types'

import { ChannelWithMetadata } from '../../../../types'
import { trackChannelChanges } from '../trackChannelChanges'

describe('trackChannelChanges', () => {
    const makeChannel = (assignedIds: number[]): ChannelWithMetadata => ({
        title: 'Test',
        description: '',
        count: assignedIds.length,
        type: 'email',
        assignedChannels: assignedIds.map(
            (id) =>
                ({
                    id,
                    name: `Channel ${id}`,
                    type: 'email',
                    meta: { address: `test${id}@mail.com` },
                }) as Integration,
        ),
        unassignedChannels: [],
    })

    it('returns empty array if activeChannel is null', () => {
        expect(trackChannelChanges([1, 2], null)).toEqual([])
    })

    it('returns empty array if no changes', () => {
        const channel = makeChannel([1, 2, 3])
        expect(trackChannelChanges([1, 2, 3], channel)).toEqual([])
    })

    it('detects added channels', () => {
        const channel = makeChannel([1, 2])
        const result = trackChannelChanges([1, 2, 3], channel)
        expect(result).toEqual([{ channelId: 3, action: 'add' }])
    })

    it('detects removed channels', () => {
        const channel = makeChannel([1, 2, 3])
        const result = trackChannelChanges([1, 3], channel)
        expect(result).toEqual([{ channelId: 2, action: 'remove' }])
    })

    it('detects both added and removed channels', () => {
        const channel = makeChannel([1, 2, 3])
        const result = trackChannelChanges([2, 4], channel)
        expect(result).toEqual([
            { channelId: 4, action: 'add' },
            { channelId: 1, action: 'remove' },
            { channelId: 3, action: 'remove' },
        ])
    })

    it('handles empty assignedChannelIds', () => {
        const channel = makeChannel([1, 2])
        expect(trackChannelChanges([], channel)).toEqual([
            { channelId: 1, action: 'remove' },
            { channelId: 2, action: 'remove' },
        ])
    })

    it('handles empty originalAssignedIds', () => {
        const channel = makeChannel([])
        expect(trackChannelChanges([1, 2], channel)).toEqual([
            { channelId: 1, action: 'add' },
            { channelId: 2, action: 'add' },
        ])
    })

    it('should handle duplicate changes and remove them', () => {
        const channel = makeChannel([1, 2])
        expect(trackChannelChanges([1, 2, 1, 2], channel)).toEqual([])
    })

    it('should handle conflicting changes and remove them', () => {
        const channel = makeChannel([1, 2])
        expect(trackChannelChanges([1, 2], channel)).toEqual([])
    })
})
