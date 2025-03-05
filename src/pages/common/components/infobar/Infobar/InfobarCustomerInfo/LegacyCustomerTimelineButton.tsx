import React, { useMemo } from 'react'

import { fromJS, List, Map } from 'immutable'
import pluralize from 'pluralize'

import { Separator, Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import { getCustomersState, getLoading } from 'state/customers/selectors'
import { toggleHistory } from 'state/ticket/actions'
import { getDisplayHistory } from 'state/ticket/selectors'

import css from './InfobarCustomerInfo.less'

type Props = {
    isEditing: boolean
}

export function LegacyCustomerTimelineButton({ isEditing = false }: Props) {
    const dispatch = useAppDispatch()

    const customerTimelineButtonId = 'customer-timeline-button'
    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    const ticket = useAppSelector((state) => state.ticket)

    const customers = useAppSelector(getCustomersState)
    const customersLoading = useAppSelector(getLoading)
    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers],
    )
    const historyTickets = (customerHistory.get('tickets') ||
        fromJS([])) as List<any>
    const historyOpenedTickets = historyTickets
        // remove current ticket from history for the count
        .filter((t: Map<any, any>) => t.get('id') !== ticket.get('id'))
        // count only open and new tickets
        .filter((t: Map<any, any>) => t.get('status') !== 'closed')
    const historyClosedTickets = historyTickets
        // remove current ticket from history for the count
        .filter((t: Map<any, any>) => t.get('id') !== ticket.get('id'))
        // count only closed tickets
        .filter((t: Map<any, any>) => t.get('status') === 'closed')
    const openTicketsCounter = historyOpenedTickets.size
    const closedTicketsCounter = historyClosedTickets.size

    const isButtonRendered = isEditing || !ticket.get('id')

    const isHistoryLoading = !!customersLoading.get('history')

    const isHistoryDisabled =
        !customerHistory.get('hasHistory') || isHistoryLoading

    const handleCustomerTimelineButtonClick = () => {
        dispatch(toggleHistory(!isHistoryDisplayed))

        logEvent(SegmentEvent.UserHistoryToggled, {
            open: !isHistoryDisplayed,
            nbOfTicketsInTimeline: (
                customers.getIn(['customerHistory', 'tickets']) as List<any>
            ).size,
            channel: ticket.get('channel'),
            nbOfMessagesInTicket:
                (ticket.get('messages') as List<any>)?.size ?? 0,
        })
    }

    return (
        <>
            {!isButtonRendered && (
                <>
                    <Separator className={css.separator} />
                    <Button
                        id={customerTimelineButtonId}
                        intent={openTicketsCounter ? 'primary' : 'secondary'}
                        onClick={handleCustomerTimelineButtonClick}
                        isDisabled={isHistoryDisabled}
                        leadingIcon={
                            isHistoryDisplayed
                                ? 'close'
                                : 'format_list_bulleted'
                        }
                    >
                        {isHistoryDisplayed
                            ? 'Close timeline'
                            : 'Customer timeline'}
                        {openTicketsCounter > 0 &&
                            !isHistoryLoading &&
                            ` (${openTicketsCounter})`}
                    </Button>
                    {!isHistoryLoading && isHistoryDisabled && (
                        <Tooltip
                            target={customerTimelineButtonId}
                            placement={'bottom-start'}
                            offset="0, 4"
                        >
                            This customer does not have any other tickets
                        </Tooltip>
                    )}
                    {!isHistoryLoading &&
                        (openTicketsCounter > 0 ||
                            closedTicketsCounter > 0) && (
                            <Tooltip
                                target={customerTimelineButtonId}
                                placement={'top-end'}
                                offset="0, 4"
                            >
                                <>
                                    {openTicketsCounter > 0 &&
                                        `${openTicketsCounter} open ${pluralize(
                                            'ticket',
                                            openTicketsCounter,
                                        )}`}
                                    {openTicketsCounter > 0 &&
                                        closedTicketsCounter > 0 && <br />}
                                    {closedTicketsCounter > 0 &&
                                        `${closedTicketsCounter} closed ${pluralize(
                                            'ticket',
                                            closedTicketsCounter,
                                        )}`}
                                </>
                            </Tooltip>
                        )}
                </>
            )}
        </>
    )
}
