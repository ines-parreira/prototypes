import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import {Channel, ChannelIdentifier, toChannels} from 'services/channels'

export function filterChannels(
    channels: Channel[],
    filter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
): Channel[] {
    if (isArray(filter)) {
        return toChannels(filter)
    }

    if (isFunction(filter)) {
        return channels.filter(filter)
    }

    return channels
}
