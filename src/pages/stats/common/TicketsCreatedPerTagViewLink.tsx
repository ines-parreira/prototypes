import React, {ReactNode, useMemo} from 'react'
import _isEqual from 'lodash/isEqual'

import {getTicketViewField, getTicketViewFieldPath} from 'config/views'
import {ViewField} from 'models/view/types'
import {
    logEvent,
    SegmentEvent,
    StatViewLinkClickedStat,
} from 'store/middlewares/segmentTracker'
import {ViewFilter} from 'state/views/types'
import {CollectionOperator} from 'state/rules/types'

import {useStatsViewFilters} from './utils'
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
    const statsViewFilters = useStatsViewFilters(
        getTicketViewFieldPath(getTicketViewField(ViewField.Created))
    )

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
        return [
            tagFilter,
            ...statsViewFilters.filter(
                (filter) => !_isEqual(filter, tagFilter)
            ),
        ]
    }, [statsViewFilters, tagName, untaggedName])

    return (
        <span
            onClick={() => {
                logEvent(SegmentEvent.StatViewLinkClicked, {
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
