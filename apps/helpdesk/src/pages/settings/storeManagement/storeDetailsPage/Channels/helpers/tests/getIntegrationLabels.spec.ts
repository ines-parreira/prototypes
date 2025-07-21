import { Integration } from 'models/integration/types'

import { ChannelWithMetadata } from '../../../../types'
import { getIntegrationLabels } from '../getIntegrationLabels'

describe('getIntegrationLabels', () => {
    const mockChannels = [
        {
            assignedChannels: [
                { id: 1, name: 'Integration 1' },
                { id: 2, name: 'Integration 2' },
            ] as Integration[],
            unassignedChannels: [
                { id: 3, name: 'Integration 3' },
            ] as Integration[],
        },
        {
            assignedChannels: [
                { id: 4, name: 'Integration 4' },
            ] as Integration[],
            unassignedChannels: [
                { id: 5, name: 'Integration 5' },
            ] as Integration[],
        },
    ] as ChannelWithMetadata[]

    it('should return empty string when no failed channel ids match', () => {
        const failedChannelIds = [10, 11]
        expect(getIntegrationLabels(mockChannels, failedChannelIds)).toBe('')
    })

    it('should return single integration name when one failed channel id matches', () => {
        const failedChannelIds = [1]
        expect(getIntegrationLabels(mockChannels, failedChannelIds)).toBe(
            'Integration 1',
        )
    })

    it('should return multiple integration names separated by comma when multiple failed channel ids match', () => {
        const failedChannelIds = [1, 3, 5]
        expect(getIntegrationLabels(mockChannels, failedChannelIds)).toBe(
            'Integration 1, Integration 3, Integration 5',
        )
    })

    it('should handle empty channels array', () => {
        const failedChannelIds = [1, 2, 3]
        expect(getIntegrationLabels([], failedChannelIds)).toBe('')
    })

    it('should handle empty failed channel ids array', () => {
        expect(getIntegrationLabels(mockChannels, [])).toBe('')
    })
})
