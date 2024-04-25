import React, {forwardRef, ForwardedRef, ComponentType, ReactNode} from 'react'
import {
    GroupContent,
    GroupedVirtuoso,
    GroupedVirtuosoHandle,
    Virtuoso,
    VirtuosoHandle,
    VirtuosoProps,
} from 'react-virtuoso'
import {
    CustomerWithHighlights,
    PickedCustomer,
    TicketWithHighlights,
} from 'models/search/types'

import SkeletonLoader from 'pages/common/components/SkeletonLoader'

import css from 'pages/common/components/Spotlight/SpotlightScrollArea.less'
import {PickedTicket} from 'pages/common/components/Spotlight/SpotlightTicketRow'

const HEADER_HEIGHT = 32
const ITEM_HEIGHT = 80
const MAX_ITEMS_TO_SHOW = 6
export const MAX_HEIGHT = 56 * MAX_ITEMS_TO_SHOW + HEADER_HEIGHT

type VirtuosoContext = {
    isLoading: boolean
}

type Props = {
    data:
        | PickedTicket[]
        | PickedCustomer[]
        | (
              | PickedTicket
              | PickedCustomer
              | CustomerWithHighlights
              | TicketWithHighlights
          )[]
    canLoadMore: boolean
    loadMore: () => Promise<void>
    isLoading: boolean
    scrollerRef: React.RefObject<HTMLDivElement>
    itemContent: VirtuosoProps<
        | PickedTicket
        | PickedCustomer
        | (CustomerWithHighlights | TicketWithHighlights),
        unknown
    >['itemContent']
    header?: ComponentType
}

type GroupedProps = Omit<Props, 'itemContent' | 'data' | 'loadMore'> & {
    itemContent?: (
        index: number,
        groupIndex: number,
        data:
            | PickedTicket
            | PickedCustomer
            | (CustomerWithHighlights | TicketWithHighlights)
    ) => ReactNode
    groupCounts: number[]
    groupContent?: GroupContent
}

const SpotlightScrollArea = (
    {
        data,
        canLoadMore,
        loadMore,
        isLoading,
        scrollerRef,
        itemContent,
        header: Header,
    }: Props,
    ref: ForwardedRef<VirtuosoHandle>
) => {
    return (
        <Virtuoso<
            | PickedTicket
            | PickedCustomer
            | (CustomerWithHighlights | TicketWithHighlights)
        >
            data={data}
            ref={ref}
            customScrollParent={scrollerRef.current || undefined}
            defaultItemHeight={ITEM_HEIGHT}
            style={{
                // height will be recalculated by Virtuoso
                // on first interaction with the scrollable content
                // it's needed for the initial render
                height: Math.min(
                    ITEM_HEIGHT * data.length + (Header ? HEADER_HEIGHT : 0),
                    MAX_HEIGHT
                ),
            }}
            endReached={() => {
                if (canLoadMore && !isLoading) {
                    void loadMore()
                }
            }}
            itemContent={itemContent}
            context={{isLoading}}
            components={{Footer, Header}}
        />
    )
}

export const GroupedSpotlightScrollAreaComponent = (
    {
        isLoading,
        scrollerRef,
        itemContent,
        header: Header,
        groupCounts,
        groupContent,
    }: GroupedProps,
    ref: ForwardedRef<GroupedVirtuosoHandle>
) => {
    return (
        <GroupedVirtuoso<
            | PickedTicket
            | PickedCustomer
            | (CustomerWithHighlights | TicketWithHighlights)
        >
            ref={ref}
            customScrollParent={scrollerRef.current || undefined}
            defaultItemHeight={ITEM_HEIGHT}
            style={{
                // height will be recalculated by Virtuoso
                // on first interaction with the scrollable content
                // it's needed for the initial render
                height: Math.min(
                    ITEM_HEIGHT *
                        groupCounts.reduce<number>(
                            (acc, item) => item + acc,
                            0
                        ) +
                        (Header ? HEADER_HEIGHT : 0),
                    MAX_HEIGHT
                ),
            }}
            groupCounts={groupCounts}
            groupContent={groupContent}
            itemContent={itemContent}
            context={{isLoading}}
            components={{Footer, Header}}
        />
    )
}

const Footer = ({context}: {context?: VirtuosoContext}) => {
    const {isLoading} = context!

    if (!isLoading) {
        return null
    }

    return (
        <div className={css.loader}>
            <SkeletonLoader />
        </div>
    )
}

export const GroupedSpotlightScrollArea = forwardRef<
    GroupedVirtuosoHandle,
    GroupedProps
>(GroupedSpotlightScrollAreaComponent)
export default forwardRef<VirtuosoHandle, Props>(SpotlightScrollArea)
