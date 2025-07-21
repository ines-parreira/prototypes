import React, { useMemo } from 'react'

import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { formatNumber } from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/convert/components/CampaignTableStats/CampaignTableStats.less'
import { OrdersCell } from 'domains/reporting/pages/convert/components/CampaignTableStats/components/OrdersCell'
import { TicketsCreatedCell } from 'domains/reporting/pages/convert/components/CampaignTableStats/components/TicketsCreatedCell'
import { CampaignTableColumn } from 'domains/reporting/pages/convert/types/CampaignTableColumn'
import { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import { CampaignTableValueFormat } from 'domains/reporting/pages/convert/types/enums/CampaignTableValueFormat.enum'
import Badge, { BadgeColor } from 'gorgias-design-system/Badge/Badge'
import { InferredCampaignStatus } from 'models/convert/campaign/types'
import IconButton from 'pages/common/components/button/IconButton'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import { formatPercentage } from 'pages/common/utils/numbers'
import {
    abVariantControlVariantUrl,
    abVariantEditorUrl,
    abVariantsUrl,
} from 'pages/convert/abVariants/urls'

type Props = {
    column: CampaignTableColumn
    cell: CampaignTableContentCell
    isTableScrolled?: boolean
    data: any
    isLoading?: boolean
    variantId?: string
    variantName?: string
    variantToggleState: Record<string, boolean>
    setVariantToggleState: React.Dispatch<
        React.SetStateAction<Record<string, boolean>>
    >
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
    variantToggleState,
    setVariantToggleState,
    variantId,
    variantName,
}: Props) => {
    const bodyCellProps = useMemo(() => {
        return {
            isHighlighted: highlighted.includes(column.key),
        }
    }, [column])

    if (isLoading) {
        return (
            <BodyCell {...bodyCellProps}>
                <div style={{ width: '100%' }}>
                    <Skeleton count={1} width="100%" />
                </div>
            </BodyCell>
        )
    }

    if (column.key === CampaignTableKeys.Conversions) {
        return (
            <OrdersCell
                {...bodyCellProps}
                cell={cell}
                data={data}
                variantId={variantId}
            />
        )
    }

    if (column.key === CampaignTableKeys.TicketsCreated && !variantName) {
        return <TicketsCreatedCell {...bodyCellProps} cell={cell} data={data} />
    }

    if (column.key === CampaignTableKeys.CampaignName) {
        if (cell.chatIntegration) {
            if (variantId && variantName) {
                return (
                    <BodyCell
                        {...bodyCellProps}
                        className={classNames(
                            css.campaignName,
                            css.variantName,
                            {
                                [css.withShadow]: isTableScrolled,
                            },
                        )}
                    >
                        <Link
                            to={
                                variantId === cell.campaign.id
                                    ? abVariantControlVariantUrl(
                                          cell.chatIntegration.id.toString(),
                                          cell.campaign.id,
                                      )
                                    : abVariantEditorUrl(
                                          cell.chatIntegration.id.toString(),
                                          cell.campaign.id,
                                          variantId,
                                      )
                            }
                        >
                            <div>{variantName}</div>
                        </Link>
                    </BodyCell>
                )
            }

            const url = cell.campaign.ab_group
                ? abVariantsUrl(
                      cell.chatIntegration.id.toString(),
                      cell.campaign.id,
                  )
                : `/app/convert/${cell.chatIntegration.id}/campaigns/${cell.campaign.id}`
            return (
                <BodyCell
                    {...bodyCellProps}
                    className={classNames(css.campaignName, {
                        [css.withShadow]: isTableScrolled,
                    })}
                >
                    {cell.campaign.variants.length > 0 && (
                        <IconButton
                            fillStyle="ghost"
                            intent="secondary"
                            className={css.toggleBtn}
                            onClick={() => {
                                setVariantToggleState((state) => ({
                                    ...state,
                                    [cell.campaign.id]:
                                        !state[cell.campaign.id],
                                }))
                            }}
                        >
                            {!variantToggleState[cell.campaign.id]
                                ? 'arrow_right'
                                : 'arrow_drop_down'}
                        </IconButton>
                    )}

                    <Link to={url}>
                        <div>{data}</div>
                        {cell.campaign.is_light && (
                            <Badge
                                label="light"
                                color={'accessoryBlue'}
                                className={css.lightBadge}
                            />
                        )}
                    </Link>
                </BodyCell>
            )
        }
    }

    if (column.key === CampaignTableKeys.CampaignCurrentStatus) {
        if (!!variantName) return <BodyCell {...bodyCellProps}></BodyCell>

        const getColorForStatus = (status: InferredCampaignStatus) => {
            switch (status) {
                case InferredCampaignStatus.Active:
                    return 'accessoryGreen'
                case InferredCampaignStatus.Deleted:
                    return 'accessoryRed'
                case InferredCampaignStatus.Scheduled:
                    return 'accessoryYellow'
                default:
                    return 'neutralGrey1' as BadgeColor
            }
        }

        return (
            <BodyCell {...bodyCellProps}>
                <Badge label={data} color={getColorForStatus(data)} />
            </BodyCell>
        )
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
