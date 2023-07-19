import React, {MouseEventHandler} from 'react'
import _kebabCase from 'lodash/kebabCase'

import history from 'pages/history'
import {formatNumber} from 'pages/stats/common/utils'

import BodyCell from 'pages/common/components/table/cells/BodyCell'

import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'

import {CampaignTableContentCell} from 'pages/stats/revenue/types/CampaignTableContentCell'

type Props = {
    cell: CampaignTableContentCell
    data: any
    isHighlighted?: boolean
}

export const TicketsCreatedCell = ({cell, data, ...props}: Props) => {
    const {selectedPeriod} = useCampaignStatsFilters()
    const startDate = new Date(selectedPeriod.start_datetime).toISOString()
    const endDate = new Date(selectedPeriod.end_datetime).toISOString()
    const viewName = `Tickets created by campaign "${cell.campaign.name}"`
    const linkTo = {
        pathname: `/app/tickets/new/public`,
        state: {
            filters: `containsAll(ticket.tags.name, ['Chat campaign - ${cell.campaign.name}']) && gte(ticket.created_datetime, '${startDate}') && lte(ticket.created_datetime, '${endDate}')`,
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
