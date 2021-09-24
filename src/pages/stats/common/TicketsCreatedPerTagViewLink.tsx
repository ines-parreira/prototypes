import React, {ReactNode, useMemo} from 'react'
import {useSelector} from 'react-redux'

import {getTagsStatsFilters} from '../../../state/stats/selectors'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import * as segmentTracker from '../../../store/middlewares/segmentTracker.js'
import {
    SegmentEvent,
    StatViewLinkClickedStat,
} from '../../../store/middlewares/types/segmentTracker'
import {ViewFilter} from '../../../state/views/types'
import {CollectionOperator} from '../../../state/rules/types'

import {getStatsViewFilters} from './utils'
import ViewLink from './ViewLink'

type Props = {
    tagName: string
    untaggedName?: string
    children: ReactNode
}

export default function TicketsCreatedPerTagViewLink({
    tagName,
    children,
    untaggedName = 'Untagged',
}: Props) {
    const statsFilters = useSelector(getTagsStatsFilters)
    const filters = useMemo(() => {
        const tagFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Tags)
        )
        const tagFilter: ViewFilter =
            tagName === untaggedName
                ? {
                      left: tagFilterLeft,
                      operator: CollectionOperator.IsEmpty,
                  }
                : {
                      left: tagFilterLeft,
                      operator: CollectionOperator.ContainsAny,
                      right: JSON.stringify([tagName]),
                  }
        const statsViewFilters = getStatsViewFilters(
            getTicketViewFieldPath(getTicketViewField(ViewField.Created)),
            statsFilters
        )
        return [tagFilter].concat(statsViewFilters)
    }, [statsFilters, tagName, untaggedName])

    return (
        <span
            onClick={() => {
                segmentTracker.logEvent(SegmentEvent.StatViewLinkClicked, {
                    stat: StatViewLinkClickedStat.TicketsCreatedPerTagTotal,
                })
            }}
        >
            <ViewLink
                viewName={
                    tagName === untaggedName
                        ? 'Untagged'
                        : `Tagged with: ${tagName}`
                }
                filters={filters}
            >
                {children}
            </ViewLink>
        </span>
    )
}
