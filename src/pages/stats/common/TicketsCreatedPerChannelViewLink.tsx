import React, {ReactNode, useMemo} from 'react'
import {useSelector} from 'react-redux'
import _findKey from 'lodash/findKey'

import {getChannelsStatsFilters} from '../../../state/stats/selectors'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import {ViewFilter} from '../../../state/views/types'
import {EqualityOperator} from '../../../state/rules/types'
import {reportError} from '../../../utils/errors'
import {
    logEvent,
    SegmentEvent,
    StatViewLinkClickedStat,
} from '../../../store/middlewares/segmentTracker'
import {TICKET_CHANNEL_NAMES} from '../../../state/ticket/constants'

import ViewLink from './ViewLink'
import {useStatsViewFilters} from './utils'

type Props = {
    children: ReactNode
    channelName: string
}

export default function TicketsCreatedPerChannelViewLink({
    children,
    channelName,
}: Props) {
    const channel = _findKey(
        TICKET_CHANNEL_NAMES,
        (name) => name === channelName
    )
    const statsFilters = useSelector(getChannelsStatsFilters)
    const statsViewFilters = useStatsViewFilters(
        getTicketViewFieldPath(getTicketViewField(ViewField.Created)),
        statsFilters
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
            <ViewLink viewName={`Channel: ${channelName}`} filters={filters}>
                {children}
            </ViewLink>
        </span>
    )
}
