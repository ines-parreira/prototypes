import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {Channel, getChannels} from 'services/channels'
import {ChannelsSlice, getChannelsSorting} from 'state/ui/stats/channelsSlice'

const sortBySlugCustomOrderedWithEmptyLast =
    (order: string[]) =>
    (
        a: {slug: string},
        b: {
            slug: string
        }
    ) => {
        const aIndex = order.indexOf(a.slug)
        const bIndex = order.indexOf(b.slug)
        if (aIndex < 0 && bIndex < 0) {
            return 0
        }
        if (aIndex < 0) {
            return 1
        }
        return aIndex - bIndex
    }

export const sortChannels = (
    channels: Channel[],
    sorting: ChannelsSlice['sorting']
) => {
    if (sorting.field === ChannelsTableColumns.Channel) {
        return sorting.direction === OrderDirection.Asc
            ? channels
            : [...channels].reverse()
    }

    if (sorting.lastSortingMetric !== null) {
        return channels.sort(
            sortBySlugCustomOrderedWithEmptyLast(sorting.lastSortingMetric)
        )
    }
    return channels
}

export const useSortedChannels = () => {
    const channelsSorting = useAppSelector(getChannelsSorting)
    const channels = getChannels()
    const sortedChannels = useMemo(
        () => sortChannels([...channels], channelsSorting),
        [channels, channelsSorting]
    )

    return {
        sortedChannels,
        isLoading: channelsSorting.isLoading,
    }
}
