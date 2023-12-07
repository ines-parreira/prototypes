import React, {useCallback} from 'react'
import {Virtuoso} from 'react-virtuoso'

import useAppSelector from 'hooks/useAppSelector'
import {getViewPlainJS} from 'state/views/selectors'

import {TICKET_HEIGHT} from '../constants'
import useTickets from '../hooks/useTickets'
import {TicketPartial} from '../types'

import Ticket from './Ticket'
import css from './TicketListView.less'

type Props = {
    viewId: number
}

export default function TicketListView({viewId}: Props) {
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const tickets = useTickets(viewId)

    const getItemContent = useCallback(
        (_index: number, ticket: TicketPartial) => (
            <Ticket key={ticket.id} stale ticket={ticket} />
        ),
        []
    )

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>{view?.name}</div>
            </div>
            <div className={css.list}>
                <Virtuoso
                    className={css.scroller}
                    data={tickets}
                    fixedItemHeight={TICKET_HEIGHT}
                    itemContent={getItemContent}
                />
            </div>
        </div>
    )
}
