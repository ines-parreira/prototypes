import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'

import {formatPercentage} from 'pages/common/utils/numbers'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {CampaignTableColumn} from 'pages/stats/convert/types/CampaignTableColumn'
import {CampaignTableContentCell} from 'pages/stats/convert/types/CampaignTableContentCell'
import {CampaignTableValueFormat} from 'pages/stats/convert/types/enums/CampaignTableValueFormat.enum'

import {formatNumber} from 'pages/stats/common/utils'

import {TotalRevenueCell} from '../TotalRevenueCell'
import {TicketsCreatedCell} from '../TicketsCreatedCell'

import css from '../../CampaignTableStats.less'

type Props = {
    column: CampaignTableColumn
    cell: CampaignTableContentCell
    isTableScrolled?: boolean
    data: any
    isLoading?: boolean
}

const highlighted = [
    CampaignTableKeys.TicketsCreated,
    CampaignTableKeys.TicketsCreationRate,
    CampaignTableKeys.TicketsConverted,
    CampaignTableKeys.TicketConversionRate,
    CampaignTableKeys.RevenueGeneratedTickets,
    CampaignTableKeys.DiscountCodeUsed,
    CampaignTableKeys.RevenueGeneratedDiscountCode,
]

export const CampaignTableCell = ({
    column,
    cell,
    data,
    isTableScrolled = false,
    isLoading,
}: Props) => {
    const bodyCellProps = useMemo(() => {
        return {
            isHighlighted: highlighted.includes(column.key),
        }
    }, [column])

    if (isLoading) {
        return (
            <BodyCell {...bodyCellProps}>
                <div style={{width: '100%'}}>
                    <Skeleton count={1} width="100%" />
                </div>
            </BodyCell>
        )
    }

    if (column.key === CampaignTableKeys.TotalRevenue) {
        return <TotalRevenueCell {...bodyCellProps} cell={cell} data={data} />
    }

    if (column.key === CampaignTableKeys.TicketsCreated) {
        return <TicketsCreatedCell {...bodyCellProps} cell={cell} data={data} />
    }

    if (column.key === CampaignTableKeys.CampaignName) {
        if (cell.chatIntegration) {
            const url = `/app/convert/${cell.chatIntegration.id}/campaigns/${cell.campaign.id}`
            return (
                <BodyCell
                    {...bodyCellProps}
                    className={classNames(css.campaignName, {
                        [css.withShadow]: isTableScrolled,
                    })}
                >
                    <Link to={url}>{data}</Link>
                </BodyCell>
            )
        }
    }

    if (column.format === CampaignTableValueFormat.Currency) {
        return (
            <BodyCell {...bodyCellProps}>
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
        return <BodyCell {...bodyCellProps}>{formatPercentage(data)}</BodyCell>
    }

    if (column.format === CampaignTableValueFormat.Number) {
        return <BodyCell {...bodyCellProps}>{formatNumber(data)}</BodyCell>
    }

    return <BodyCell {...bodyCellProps}>{data}</BodyCell>
}
