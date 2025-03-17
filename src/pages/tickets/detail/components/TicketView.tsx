import React, { useEffect, useMemo, useRef } from 'react'

import classnames from 'classnames'
import { List } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Timeline from 'pages/common/components/timeline/Timeline'
import TicketBody from 'pages/tickets/detail/components/TicketBody'
import { getCustomersState } from 'state/customers/selectors'
import { toggleHistory } from 'state/ticket/actions'
import {
    getBody,
    getDisplayHistory,
    getTicketState,
} from 'state/ticket/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'
import { handleButtonLikeClick } from 'utils/accessibility'

import { SubmitArgs } from '../TicketDetailContainer'

import css from './TicketView.less'

const TIMELINE_CLOSE_BUTTON_ID = 'timelineCloseButton'

type Props = {
    hideTicket: () => Promise<void>
    isTicketHidden: boolean
    submit: (params: SubmitArgs) => any
    setStatus: (status: string) => any
    onGoToNextTicket?: () => void
    onToggleUnread?: OnToggleUnreadFn
}

export const TicketView = ({
    hideTicket,
    isTicketHidden,
    setStatus,
    submit,
    onGoToNextTicket,
    onToggleUnread,
}: Props) => {
    const dispatch = useAppDispatch()
    const pageRef = useRef<HTMLDivElement>(null)
    const ticketContentRef = useRef<HTMLDivElement>(null)

    const customers = useAppSelector(getCustomersState)
    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    const ticket = useAppSelector(getTicketState)
    const ticketBody = useAppSelector(getBody)

    useEffect(() => {
        const ticketContent = ticketContentRef.current
        if (isHistoryDisplayed) {
            document.getElementById(TIMELINE_CLOSE_BUTTON_ID)?.focus()
        }
        return () => {
            if (!isHistoryDisplayed) ticketContent?.focus()
        }
    }, [isHistoryDisplayed])

    const handleHistoryToggle = () => {
        const shouldOpenHistory =
            ticket.get('id') &&
            customers.getIn(['customerHistory', 'hasHistory']) &&
            !isHistoryDisplayed

        dispatch(toggleHistory(shouldOpenHistory))

        // TODO(customers-migration): ask confirmation to update this event
        logEvent(SegmentEvent.UserHistoryToggled, {
            open: shouldOpenHistory,
            nbOfTicketsInTimeline: (
                customers.getIn(['customerHistory', 'tickets']) as List<any>
            ).size,
            channel: ticket.get('channel'),
            nbOfMessagesInTicket: (ticket.get('messages') as List<any>).size,
        })
    }

    const isShopperTyping = useMemo(
        () => ticket.getIn(['_internal', 'isShopperTyping']) as boolean,
        [ticket],
    )

    return (
        <div
            className={classnames(css.page, {
                'transition out fade right': isTicketHidden,
            })}
            ref={pageRef}
        >
            {isHistoryDisplayed && (
                <div className={classnames(css.timeline)}>
                    <div className={css.timelineHeader}>
                        <div
                            className={classnames(
                                css.closeTrigger,
                                'd-flex',
                                'align-items-center',
                            )}
                            {...handleButtonLikeClick(handleHistoryToggle)}
                            id={TIMELINE_CLOSE_BUTTON_ID}
                        >
                            <i className="material-icons md-3 mr-3">close</i>
                            <span>Customer Timeline</span>
                        </div>
                    </div>

                    <div className={classnames(css.timelineContainer, 'pb-4')}>
                        <Timeline
                            ticketId={ticket.get('id')}
                            onLoaded={() => {
                                // Make sure react has the time to render the list before scrolling
                                window.setTimeout(() => {
                                    pageRef.current?.scrollTo({ top: 0 })
                                })
                            }}
                        />
                    </div>
                </div>
            )}

            <div
                className={classnames(css.ticketContent, {
                    [css.historyDisplayed]: isHistoryDisplayed,
                })}
                ref={ticketContentRef}
                tabIndex={1}
            >
                <TicketBody
                    elements={ticketBody}
                    setStatus={setStatus}
                    customScrollParentRef={pageRef}
                    submit={submit}
                    hideTicket={hideTicket}
                    isShopperTyping={isShopperTyping}
                    shopperName={
                        (ticket.getIn(['customer', 'name']) as string) ??
                        'Customer'
                    }
                    onGoToNextTicket={onGoToNextTicket}
                    onToggleUnread={onToggleUnread}
                />
            </div>
        </div>
    )
}

export default TicketView
