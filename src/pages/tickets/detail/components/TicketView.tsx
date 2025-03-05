import React, { useMemo, useRef } from 'react'

import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useFlag from 'core/flags/hooks/useFlag'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import LegacyTimeline from 'pages/common/components/timeline/LegacyTimeline'
import Timeline from 'pages/common/components/timeline/Timeline'
import TicketBody from 'pages/tickets/detail/components/TicketBody'
import { getCustomersState } from 'state/customers/selectors'
import { displayHistoryOnNextPage, toggleHistory } from 'state/ticket/actions'
import {
    getBody,
    getDisplayHistory,
    getTicketState,
} from 'state/ticket/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import { SubmitArgs } from '../TicketDetailContainer'

import css from './TicketView.less'

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
    const hasNewTimeline = useFlag(FeatureFlagKey.CustomerTimeline, false)
    const dispatch = useAppDispatch()
    const pageRef = useRef<HTMLDivElement>(null)
    const ticketContentRef = useRef<HTMLDivElement>(null)

    const customers = useAppSelector(getCustomersState)
    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    const ticket = useAppSelector(getTicketState)
    const ticketBody = useAppSelector(getBody)

    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers],
    )

    // We are using useEffect here to sync state when ticket state changes :(
    useEffectOnce(() => {
        const shouldDisplayHistoryOnNextPage = ticket.getIn([
            '_internal',
            'shouldDisplayHistoryOnNextPage',
        ]) as boolean
        const displayHistory = ticket.getIn([
            '_internal',
            'displayHistory',
        ]) as boolean

        if (shouldDisplayHistoryOnNextPage !== displayHistory) {
            dispatch(toggleHistory(shouldDisplayHistoryOnNextPage))
        }

        if (shouldDisplayHistoryOnNextPage) {
            dispatch(displayHistoryOnNextPage(false))
        }
    })

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
                            onClick={handleHistoryToggle}
                        >
                            <i className="material-icons md-3 mr-3">close</i>
                            <span>Customer Timeline</span>
                        </div>
                    </div>

                    <div className={classnames(css.timelineContainer, 'pb-4')}>
                        {hasNewTimeline ? (
                            <Timeline
                                onTicketClick={() =>
                                    dispatch(displayHistoryOnNextPage())
                                }
                                ticketId={ticket.get('id')}
                            />
                        ) : (
                            <LegacyTimeline
                                displayHistoryOnNextPage={() =>
                                    dispatch(displayHistoryOnNextPage())
                                }
                                currentTicketId={ticket.get('id')}
                                customerHistory={customerHistory}
                            />
                        )}
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
