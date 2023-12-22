import React, {useCallback} from 'react'
import {Virtuoso} from 'react-virtuoso'

import useAppSelector from 'hooks/useAppSelector'
import {getViewPlainJS} from 'state/views/selectors'

import {TICKET_HEIGHT} from '../constants'
import useTickets from '../hooks/useTickets'
import {TicketSummary} from '../types'

import Ticket from './Ticket'
import css from './TicketListView.less'

type Props = {
    viewId: number
}

export default function TicketListView({viewId}: Props) {
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const {loadMore, setElement, staleTickets, tickets} = useTickets(viewId)

    const getItemContent = useCallback(
        (_index: number, ticket: TicketSummary) => (
            <Ticket
                key={ticket.id}
                stale={!!staleTickets[ticket.id]}
                ticket={ticket}
                viewId={viewId}
            />
        ),
        [staleTickets, viewId]
    )

    const setScrollerRef = useCallback(
        (ref: HTMLElement | Window | null) => {
            if (!ref || ref === window) return

            setElement(ref as HTMLElement)
        },
        [setElement]
    )

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>{view?.name}</div>
            </div>
            <div className={css.list}>
                <Virtuoso
                    atBottomThreshold={TICKET_HEIGHT * 2}
                    className={css.scroller}
                    data={tickets}
                    endReached={loadMore}
                    fixedItemHeight={TICKET_HEIGHT}
                    itemContent={getItemContent}
                    scrollerRef={setScrollerRef}
                />
            </div>
        </div>
    )
}
