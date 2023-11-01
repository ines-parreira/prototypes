import React, {ReactNode, useMemo} from 'react'

import {logEvent, SegmentEvent, StatViewLinkClickedStat} from 'common/segment'
import {getTicketViewField, getTicketViewFieldPath} from 'config/views'
import {ViewField} from 'models/view/types'
import {EqualityOperator} from 'state/rules/types'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {ViewFilter} from 'state/views/types'
import {reportError} from 'utils/errors'

import ViewLink from './ViewLink'
import {findChannelNameKey, useStatsViewFilters} from './utils'

type Props = {
    children: ReactNode
    channelName: string
}

export default function TicketsCreatedPerChannelViewLink({
    children,
    channelName,
}: Props) {
    const channel = findChannelNameKey(channelName)

    const statsViewFilters = useStatsViewFilters(
        getTicketViewFieldPath(getTicketViewField(ViewField.Created))
    )
    const filters = useMemo(() => {
        const channelFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Channel)
        )
        const channelFilter: ViewFilter = {
            left: channelFilterLeft,
            operator: EqualityOperator.Eq,
            right: JSON.stringify(channel),
        }
        return [
            channelFilter,
            ...statsViewFilters.filter(
                (filter) => filter.left !== channelFilterLeft
            ),
        ]
    }, [channel, statsViewFilters])

    if (!channel) {
        reportError(new Error(`Channel not found for the name: ${channelName}`))
        return <>{children}</>
    }

    return (
        <span
            onClick={() => {
                logEvent(SegmentEvent.StatViewLinkClicked, {
                    stat: StatViewLinkClickedStat.TicketsCreatedPerChannelTotal,
                })
            }}
        >
            <ViewLink
                viewName={`Channel: ${
                    TICKET_CHANNEL_NAMES[channel] ?? channelName
                }`}
                filters={filters}
            >
                {children}
            </ViewLink>
        </span>
    )
}
