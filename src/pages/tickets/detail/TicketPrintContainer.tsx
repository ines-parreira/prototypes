import React from 'react'
import {useParams} from 'react-router-dom'
import {useEffectOnce, useUpdateEffect} from 'react-use'

import TicketBodyNonVirtualized from 'pages/tickets/detail/components/TicketBodyNonVirtualized'
import Loader from 'pages/common/components/Loader/Loader'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {getBody} from 'state/ticket/selectors'
import {fetchTicket} from 'state/ticket/actions'

import css from './TicketPrintContainer.less'

const TicketPrintContainer = () => {
    const ticketBody = useAppSelector(getBody)
    const ticket = useAppSelector((state) => state.ticket)
    const {ticketId: ticketIdParam} = useParams<{ticketId: string}>()
    const dispatch = useAppDispatch()

    useEffectOnce(() => {
        void dispatch(fetchTicket(ticketIdParam || ''))
    })

    const isLoading =
        (ticketIdParam !== 'new' && !ticket.get('id')) ||
        !!ticket.getIn(['_internal', 'loading', 'fetchTicket'])

    useUpdateEffect(() => {
        if (!isLoading) {
            window.print()
        }
    }, [isLoading])

    return (
        <div>
            {isLoading ? (
                <div>
                    <Loader className={css.loader} minHeight="unset" />
                </div>
            ) : (
                <TicketBodyNonVirtualized elements={ticketBody} />
            )}
        </div>
    )
}

export default TicketPrintContainer
