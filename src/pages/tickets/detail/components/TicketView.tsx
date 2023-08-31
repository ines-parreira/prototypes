import React, {useEffect, useMemo, useRef} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'

import Timeline from 'pages/common/components/timeline/Timeline'
import {RootState} from 'state/types'
import {displayHistoryOnNextPage, toggleHistory} from 'state/ticket/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCustomersState} from 'state/customers/selectors'
import {getBody, getDisplayHistory} from 'state/ticket/selectors'
import TicketBody from 'pages/tickets/detail/components/TicketBody'

import {SubmitArgs} from '../TicketDetailContainer'
import css from './TicketView.less'

type OwnProps = {
    hideTicket: () => Promise<void>
    isTicketHidden: boolean
    submit: (params: SubmitArgs) => any
    setStatus: (status: string) => any
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const TicketViewContainer = ({
    customers,
    displayHistoryOnNextPage,
    hideTicket,
    isHistoryDisplayed,
    isTicketHidden,
    setStatus,
    submit,
    ticket,
    ticketBody,
    toggleHistory,
}: Props) => {
    const pageRef = useRef<HTMLDivElement>(null)
    const ticketContentRef = useRef<HTMLDivElement>(null)

    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers]
    )

    useEffect(() => {
        const shouldDisplayHistoryOnNextPage = ticket.getIn([
            '_internal',
            'shouldDisplayHistoryOnNextPage',
        ]) as boolean
        const displayHistory = ticket.getIn([
            '_internal',
            'displayHistory',
        ]) as boolean

        if (shouldDisplayHistoryOnNextPage !== displayHistory) {
            toggleHistory(shouldDisplayHistoryOnNextPage)
        }

        if (shouldDisplayHistoryOnNextPage) {
            displayHistoryOnNextPage(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleHistoryToggle = () => {
        const shouldOpenHistory =
            ticket.get('id') &&
            customers.getIn(['customerHistory', 'hasHistory']) &&
            !isHistoryDisplayed

        toggleHistory(shouldOpenHistory)

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
        [ticket]
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
                                'align-items-center'
                            )}
                            onClick={handleHistoryToggle}
                        >
                            <i className="material-icons md-3 mr-3">close</i>
                            <span>Customer Timeline</span>
                        </div>
                    </div>

                    <div className={classnames(css.timelineContainer, 'pb-4')}>
                        <Timeline
                            displayHistoryOnNextPage={displayHistoryOnNextPage}
                            currentTicketId={ticket.get('id')}
                            customerHistory={customerHistory}
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
                />
            </div>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        customers: getCustomersState(state),
        isHistoryDisplayed: getDisplayHistory(state),
        ticket: state.ticket,
        ticketBody: getBody(state),
    }),
    {
        displayHistoryOnNextPage,
        toggleHistory,
    }
)

export default connector(TicketViewContainer)
