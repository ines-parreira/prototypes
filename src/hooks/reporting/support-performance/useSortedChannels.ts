import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {Channel, getChannels} from 'services/channels'
import {ChannelsSlice, getChannelsSorting} from 'state/ui/stats/channelsSlice'
import {ChannelsTableColumns} from 'state/ui/stats/types'

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
        if (bIndex < 0) {
            return -1
        }
        return aIndex - bIndex
    }

export const sortChannels = (
    channels: Channel[],
    sorting: ChannelsSlice['sorting']
) => {
    const sortedChannels = [...channels]
    if (sorting.field === ChannelsTableColumns.Channel) {
        return sorting.direction === OrderDirection.Asc
            ? sortedChannels
            : sortedChannels.reverse()
    }

    if (sorting.lastSortingMetric !== null) {
        return sortedChannels.sort(
            sortBySlugCustomOrderedWithEmptyLast(sorting.lastSortingMetric)
        )
    }
    return sortedChannels
}

export const useSortedChannels = () => {
    const channelsSorting = useAppSelector(getChannelsSorting)
    const channels = getChannels()
    const sortedChannels = useMemo(() => {
        return sortChannels([...channels], channelsSorting)
    }, [channels, channelsSorting])

    return {
        sortedChannels,
        isLoading: channelsSorting.isLoading,
    }
}
