import React, { MouseEventHandler } from 'react'

import { history } from '@repo/routing'
import _kebabCase from 'lodash/kebabCase'

import { formatNumber } from 'domains/reporting/pages/common/utils'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

type Props = {
    cell: CampaignTableContentCell
    data: any
    isHighlighted?: boolean
}

export const TicketsCreatedCell = ({ cell, data, ...props }: Props) => {
    const { selectedPeriod } = useCampaignStatsFilters()
    const startDate = new Date(selectedPeriod.start_datetime).toISOString()
    const endDate = new Date(selectedPeriod.end_datetime).toISOString()
    const viewName = `Tickets created by campaign "${cell.campaign.name}"`
    const safeTag = JSON.stringify(`Chat campaign - ${cell.campaign.name}`)
    const safeStartDate = JSON.stringify(`${startDate}`)
    const safeEndDate = JSON.stringify(`${endDate}`)
    const linkTo = {
        pathname: `/app/tickets/new/public`,
        state: {
            filters: `containsAll(ticket.tags.name, [${safeTag}]) && gte(ticket.created_datetime, ${safeStartDate}) && lte(ticket.created_datetime, ${safeEndDate})`,
            viewName: viewName,
            slug: _kebabCase(viewName).toLowerCase(),
        },
    }

    const handleOnClick: MouseEventHandler = (event) => {
        event.preventDefault()
        history.push(linkTo)
    }

    if (data === 0) {
        return <BodyCell {...props}>{formatNumber(data)}</BodyCell>
    }

    return (
        <BodyCell {...props} onClickCapture={handleOnClick}>
            <a href="javascript:void(0)">{`${formatNumber(data)}`}</a>
        </BodyCell>
    )
}
