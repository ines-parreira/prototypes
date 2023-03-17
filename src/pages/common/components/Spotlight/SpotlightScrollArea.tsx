import React, {forwardRef, ForwardedRef} from 'react'
import {Virtuoso, VirtuosoHandle, VirtuosoProps} from 'react-virtuoso'

import {Ticket} from 'models/ticket/types'
import {Customer} from 'models/customer/types'
import SpotlightLoader from 'pages/common/components/Spotlight/SpotlightLoader'

import css from './SpotlightScrollArea.less'

const ITEM_HEIGHT = 56
export const MAX_HEIGHT = 56 * 5

type VirtuosoContext = {
    isLoading: boolean
}

type Props = {
    data: Ticket[] | Customer[] | undefined
    canLoadMore: boolean
    loadMore: () => Promise<void>
    isLoading: boolean
    scrollerRef: React.RefObject<HTMLDivElement>
    itemContent: VirtuosoProps<Ticket | Customer, unknown>['itemContent']
}

const SpotlightScrollArea = (
    {data, canLoadMore, loadMore, isLoading, scrollerRef, itemContent}: Props,
    ref: ForwardedRef<VirtuosoHandle>
) => {
    return (
        <Virtuoso<Ticket | Customer>
            data={data}
            ref={ref}
            customScrollParent={scrollerRef.current || undefined}
            defaultItemHeight={ITEM_HEIGHT}
            fixedItemHeight={ITEM_HEIGHT}
            style={{
                // height will be recalculated by Virtuoso
                // on first interaction with the scrollable content
                // it's needed for the initial render
                height: Math.min(ITEM_HEIGHT * (data?.length ?? 0), MAX_HEIGHT),
            }}
            endReached={() => {
                if (canLoadMore) {
                    void loadMore()
                }
            }}
            itemContent={itemContent}
            context={{isLoading}}
            components={{Footer}}
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
            <SpotlightLoader />
        </div>
    )
}

export default forwardRef(SpotlightScrollArea)
