import React from 'react'
import {Link} from 'react-router-dom'

import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import {CampaignTableKeys} from 'pages/stats/revenue/types/enums/CampaignTableKeys.enum'
import {CampaignTableColumn} from 'pages/stats/revenue/types/CampaignTableColumn'
import {CampaignTableContentCell} from 'pages/stats/revenue/types/CampaignTableContentCell'
import {CampaignTableValueFormat} from 'pages/stats/revenue/types/enums/CampaignTableValueFormat.enum'

import css from '../../CampaignTableStats.less'

type Props = {
    column: CampaignTableColumn
    cell: CampaignTableContentCell
    data: any
}

export const CampaignTableCell = ({column, cell, data}: Props) => {
    if (column.key === CampaignTableKeys.CampaignName) {
        if (cell.chatIntegration) {
            const url = `/app/settings/channels/gorgias_chat/${cell.chatIntegration.id}/campaigns/${cell.campaign.id}`
            return (
                <BodyCell className={css.campaignName}>
                    <Link to={url}>{data}</Link>
                </BodyCell>
            )
        }
    }

    if (column.format === CampaignTableValueFormat.Currency) {
        return (
            <BodyCell>
                <MoneyAmount
                    renderIfZero
                    amount={data}
                    currencyCode={cell.currency}
                    currencyDisplay="narrowSymbol"
                />
            </BodyCell>
        )
    }

    if (column.format === CampaignTableValueFormat.Percentage) {
        return (
            <BodyCell>
                {new Intl.NumberFormat(window.navigator.language, {
                    style: 'percent',
                }).format(data)}
            </BodyCell>
        )
    }

    return <BodyCell>{data}</BodyCell>
}
