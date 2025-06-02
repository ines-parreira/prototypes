import { ChannelWithMetadata } from '../../../../types'
import determineChannelLabels from '../determineChannelLabels'

describe('determineChannelLabels', () => {
    it('should return voice-specific labels when channel type is voice', () => {
        const voiceChannel: ChannelWithMetadata = {
            type: 'voice',
            title: 'Phone',
            description: 'Voice channel',
            count: 0,
            assignedChannels: [],
            unassignedChannels: [],
        }

        const result = determineChannelLabels(voiceChannel)

        expect(result).toEqual({
            selectorLabel: 'Assign Phone Line',
            listLabel: 'Assigned Phone Lines',
        })
    })

    it('should return dynamic labels based on channel title for non-voice channels', () => {
        const emailChannel: ChannelWithMetadata = {
            type: 'email',
            title: 'Email',
            description: 'Email channel',
            count: 0,
            assignedChannels: [],
            unassignedChannels: [],
        }

        const result = determineChannelLabels(emailChannel)

        expect(result).toEqual({
            selectorLabel: 'Assign Email',
            listLabel: 'Assigned Email',
        })
    })
})
