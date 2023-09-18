import {appQueryClient} from 'api/queryClient'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {channelsQueryKeys, useListChannels} from 'models/channel/queries'
import {listChannels} from 'models/channel/resources'
import {Channel, ChannelLike, LegacyChannel} from 'models/channel/types'
import {TicketChannel} from 'business/types/ticket'

export type {Channel, ChannelLike, LegacyChannel} from 'models/channel/types'

const STALE_TIME = 1 * 60 * 60 * 1000
const CACHE_TIME = STALE_TIME + 60 * 1000

const INITIAL_DATA = mockPaginatedChannelsList(window.GORGIAS_STATE.channels)

export const useChannels: () => Channel[] = () => {
    return (
        useListChannels({
            staleTime: STALE_TIME,
            cacheTime: CACHE_TIME,
            initialData: INITIAL_DATA,
        })?.data?.data ?? []
    )
}

export function getChannels(): Channel[] {
    const queryData = appQueryClient.getQueryData<
        Awaited<ReturnType<typeof listChannels>>
    >(channelsQueryKeys.list())

    return queryData?.data ?? INITIAL_DATA?.data ?? []
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

export function isLegacyChannel(
    channel: ChannelLike
): channel is LegacyChannel {
    const name = toChannel(channel)?.slug
    return name ? Object.values<string>(TicketChannel).includes(name) : false
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
