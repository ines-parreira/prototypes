import React, {ReactNode, useMemo} from 'react'
import {useSelector} from 'react-redux'

import {getChannelsStatsFilters} from '../../../state/stats/selectors'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import {ViewFilter} from '../../../state/views/types'
import {EqualityOperator} from '../../../state/rules/types'
import {getTicketChannelFromName} from '../../../state/ticket/utils'
import {reportError} from '../../../utils/errors'
import * as segmentTracker from '../../../store/middlewares/segmentTracker.js'

import ViewLink from './ViewLink'
import {getStatsViewFilters} from './utils'

type Props = {
    children: ReactNode
    channelName: string
}

export default function TicketsCreatedPerChannelViewLink({
    children,
    channelName,
}: Props) {
    const channel = getTicketChannelFromName(channelName)
    const statsFilters = useSelector(getChannelsStatsFilters)
    const filters = useMemo(() => {
        const channelFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Channel)
        )
        const channelFilter: ViewFilter = {
            left: channelFilterLeft,
            operator: EqualityOperator.Eq,
            right: JSON.stringify(channel),
        }
        const statsViewFilters = getStatsViewFilters(
            getTicketViewFieldPath(getTicketViewField(ViewField.Created)),
            statsFilters
        ).filter((filter) => filter.left !== channelFilterLeft)
        return [channelFilter].concat(statsViewFilters)
    }, [channel, statsFilters])

    if (!channel) {
        reportError(new Error(`Channel not found for the name: ${channelName}`))
        return <>{children}</>
    }

    return (
        <span
            onClick={() => {
                segmentTracker.logEvent(
                    segmentTracker.EVENTS.STAT_VIEW_LINK_CLICKED,
                    {
                        stat: 'tickets-created-per-channel-total',
                    }
                )
            }}
        >
            <ViewLink viewName={`Channel: ${channelName}`} filters={filters}>
                {children}
            </ViewLink>
        </span>
    )
}
