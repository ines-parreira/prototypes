import {isObject} from 'lodash'
import {appQueryClient} from 'api/queryClient'

import {ApiListResponseCursorPagination} from 'models/api/types'
import {channelsQueryKeys, useListChannels} from 'models/channel/queries'
import {listChannels} from 'models/channel/resources'
import {Channel, ChannelLike, LegacyChannel} from 'models/channel/types'
import {
    isTicketChannel,
    isTicketMessageSourceType,
} from 'models/ticket/predicates'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {getChannelFromSourceType} from 'state/ticket/utils'

export type {
    Channel,
    ChannelLike,
    LegacyChannel,
    ChannelIdentifier,
} from 'models/channel/types'

const STALE_TIME = 1 * 60 * 60 * 1000
const CACHE_TIME = STALE_TIME + 60 * 1000

const INITIAL_DATA = window?.GORGIAS_STATE?.channels ?? []

export const useChannels: () => Channel[] = () => {
    return (
        useListChannels({
            staleTime: STALE_TIME,
            cacheTime: CACHE_TIME,
            initialData: mockPaginatedChannelsList(INITIAL_DATA),
        })?.data?.data ?? []
    )
}

export function getChannels(): Channel[] {
    const queryData = appQueryClient.getQueryData<
        Awaited<ReturnType<typeof listChannels>>
    >(channelsQueryKeys.list())

    return queryData?.data ?? INITIAL_DATA
}

export function getChannelBySlug(slug: string): Channel | undefined {
    return getChannels().find((channel) => channel.slug === slug)
}

export function getChannelById(id: string): Channel | undefined {
    return getChannels().find((channel) => channel.id === id)
}

export function toChannel(channel: ChannelLike): Channel | undefined {
    if (isChannel(channel)) {
        return channel
    }

    if (typeof channel === 'string') {
        if (isTicketMessageSourceType(channel)) {
            return getChannelBySlug(getChannelFromSourceType(channel, []))
        }
        return getChannelBySlug(channel)
    }
}

export function toChannels(input: ChannelLike[]): Channel[] {
    return input.map(toChannel).filter(isChannel)
}

export function isChannel(input: unknown): input is Channel {
    const maybeChannel = input as Channel
    return (
        isObject(maybeChannel) &&
        typeof maybeChannel.id === 'string' &&
        typeof maybeChannel.slug === 'string' &&
        typeof maybeChannel.name === 'string'
    )
}

export function isLegacyChannel(
    channel: ChannelLike
): channel is TicketMessageSourceType | TicketChannel | LegacyChannel {
    if (isChannel(channel)) {
        return (
            isTicketMessageSourceType(channel.slug) ||
            isTicketChannel(channel.slug)
        )
    }

    return isTicketMessageSourceType(channel) || isTicketChannel(channel)
}

export function isNewChannel(channel: ChannelLike): boolean {
    if (isChannel(channel)) {
        return !isLegacyChannel(channel)
    }

    const matchingChannel = getChannelBySlug(channel)
    return matchingChannel ? !isLegacyChannel(matchingChannel) : false
}

function mockPaginatedChannelsList(
    entries: Channel[]
): ApiListResponseCursorPagination<Channel[]> {
    return {
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/channels',
        data: entries,
    }
}
