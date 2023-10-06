import {appQueryClient} from 'api/queryClient'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {channelsQueryKeys, useListChannels} from 'models/channel/queries'
import {listChannels} from 'models/channel/resources'
import {Channel, ChannelLike, LegacyChannel} from 'models/channel/types'
import {
    isTicketChannel,
    isTicketMessageSourceType,
} from 'models/ticket/predicates'

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
    if (!channel) {
        return
    }

    if (typeof channel === 'string') {
        return getChannelBySlug(channel)
    }

    return channel
}

export function toChannels(input: ChannelLike[]): Channel[] {
    return input.map(toChannel).filter(Boolean) as Channel[]
}

export function isLegacyChannel(
    channel: ChannelLike
): channel is LegacyChannel {
    return isTicketMessageSourceType(channel) || isTicketChannel(channel)
}

export function isNewChannel(channel: ChannelLike): channel is Channel {
    return !isLegacyChannel(channel)
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
