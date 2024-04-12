import React, {forwardRef, ForwardedRef, ComponentType} from 'react'
import {Virtuoso, VirtuosoHandle, VirtuosoProps} from 'react-virtuoso'
import {
    CustomerWithHighlights,
    PickedCustomer,
    TicketWithHighlights,
} from 'models/search/types'

import SkeletonLoader from 'pages/common/components/SkeletonLoader'

import css from './SpotlightScrollArea.less'
import {PickedTicket} from './SpotlightTicketRow'

const HEADER_HEIGHT = 32
const ITEM_HEIGHT = 56
export const MAX_HEIGHT = 56 * 5

type VirtuosoContext = {
    isLoading: boolean
}

type Props = {
    data:
        | PickedTicket[]
        | PickedCustomer[]
        | (CustomerWithHighlights | TicketWithHighlights)[]
        | undefined
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

const SpotlightScrollArea = (
    {
        data,
        canLoadMore,
        loadMore,
        isLoading,
        scrollerRef,
        itemContent,
        header,
    }: Props,
    ref: ForwardedRef<VirtuosoHandle>
) => {
    const Header = header
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
                    ITEM_HEIGHT * (data?.length ?? 0) +
                        (header ? HEADER_HEIGHT : 0),
                    MAX_HEIGHT
                ),
            }}
            endReached={() => {
                if (canLoadMore) {
                    void loadMore()
                }
            }}
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

export default forwardRef<VirtuosoHandle, Props>(SpotlightScrollArea)
