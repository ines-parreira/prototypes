import type React from 'react'
import { useMemo } from 'react'

import _get from 'lodash/get'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import { SharedDimension } from 'domains/reporting/pages/convert/clients/constants'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { useGetTableStat } from 'domains/reporting/pages/convert/hooks/stats/useGetTableStat'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import type { ABGroup } from 'models/convert/campaign/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import VariantActions from 'pages/convert/abVariants/components/VariantActions'
import type { TableColumn } from 'pages/convert/abVariants/components/VariantsList/types'
import { ABGroupValueFormat } from 'pages/convert/abVariants/components/VariantsList/types'
import { getDataFromTableCell } from 'pages/convert/abVariants/components/VariantsList/utils'
import { VARIANT_LIMIT } from 'pages/convert/abVariants/contants'
import type { VariantTableEntry } from 'pages/convert/abVariants/types/VariantTableEntry'
import {
    abVariantControlVariantUrl,
    abVariantEditorUrl,
} from 'pages/convert/abVariants/urls'
import { generateVariantName } from 'pages/convert/abVariants/utils/generateVariantName'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { ABGroupStatus } from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import { isActiveStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

import DataCell from './components/DataCell'

import css from './VariantList.less'

type Props = {
    canPerformActions: boolean
    campaign: Campaign
    integrationId: number
    onDelete: (variantId: string | null) => void
    onDuplicate: (variantId: string | null) => void
}

const variantTableCells: TableColumn[] = [
    {
        title: 'Variant Name',
        className: 'variantName',
    },
    {
        title: 'Start date',
        className: 'startDete',
    },
    {
        title: 'End date',
        className: 'endDate',
    },
    {
        title: 'Traffic Allocation',
        className: 'trafficAllocation',
        tooltip:
            'Traffic allocation is automatically distributed evenly across variants once a test is in progress.',
    },
    {
        title: 'Impressions',
        className: 'impressions',
        tooltip: 'How often the campaign was displayed',
    },
    {
        title: 'Click-through rate',
        className: 'clickRate',
        tooltip:
            'It measures the attractiveness of the campaign, calculated as engagement divided by impressions',
    },
    {
        title: 'Orders',
        className: 'campaignSalesCount',
        tooltip:
            'Numbers of orders following an engagement with the campaign variant',
    },
    {
        title: 'Conversion rate',
        className: 'conversionRate',
    },
]

const VariantsList: React.FC<Props> = ({
    canPerformActions,
    campaign,
    integrationId,
    onDelete,
    onDuplicate,
}) => {
    const isStarted = campaign.ab_group?.status === ABGroupStatus.Started
    const isCompleted = campaign.ab_group?.status === ABGroupStatus.Completed

    const namespacedShopName = useGetNamespacedShopNameForStore([
        integrationId as unknown as number,
    ])

    const { isFetching: isVariantFetching, data: variantData } =
        useGetTableStat({
            groupDimension: SharedDimension.abVariant,
            namespacedShopName,
            campaignIds: [campaign.id],
            startDate:
                campaign.ab_group?.started_datetime ??
                campaign.created_datetime,
            endDate:
                campaign.ab_group?.stopped_datetime ??
                moment().endOf('day').format(),
            timezone: DEFAULT_TIMEZONE,
            enabled: true,
        })

    const variants = useMemo<VariantTableEntry[]>(() => {
        const splitBetweenLength = (campaign.variants?.length || 0) + 1 // include control version
        const winnerId = campaign.ab_group?.winner_variant_id

        const variants: VariantTableEntry[] = [
            {
                variant: null, // Control Version
                metrics: _get(variantData, campaign.id, {}),
                abGroup: campaign.ab_group as ABGroup,
                isWinner: isCompleted && winnerId === null,
                variantName: 'Control Variant',
                link: abVariantControlVariantUrl(
                    integrationId.toString(),
                    campaign.id,
                ),
                trafficAllocation: !isStarted
                    ? isCompleted || !isActiveStatus(campaign.status)
                        ? 0
                        : 100
                    : Math.floor(100 / splitBetweenLength),
                canDelete: false,
            },
        ]

        campaign.variants?.forEach((variant, idx) => {
            variants.push({
                variant,
                metrics: _get(variantData, variant.id, {}),
                abGroup: campaign.ab_group as ABGroup,
                variantName: generateVariantName(idx),
                link: abVariantEditorUrl(
                    integrationId.toString(),
                    campaign.id,
                    variant.id,
                ),
                isWinner: winnerId === variant.id,
                trafficAllocation: !isStarted
                    ? 0
                    : Math.floor(100 / splitBetweenLength),
                canDelete: canPerformActions,
            })
        })

        return variants
    }, [
        campaign,
        variantData,
        isCompleted,
        integrationId,
        isStarted,
        canPerformActions,
    ])

    const isCreateDisabled = useMemo(() => {
        const limit = VARIANT_LIMIT + 1 // include control version
        return !canPerformActions || variants.length >= limit
    }, [variants, canPerformActions])

    return (
        <div className={css.tableContainer}>
            <TableWrapper className={css.variantTable}>
                <TableHead>
                    {variantTableCells.map((headerColumn) => {
                        return (
                            <HeaderCellProperty
                                key={headerColumn.title}
                                titleClassName={css.headerCellTitle}
                                title={headerColumn.title}
                                className={
                                    headerColumn.className
                                        ? css[headerColumn.className]
                                        : undefined
                                }
                                tooltip={
                                    headerColumn.tooltip
                                        ? headerColumn.tooltip
                                        : undefined
                                }
                            />
                        )
                    })}

                    <HeaderCellProperty
                        titleClassName={css.headerCellTitle}
                        title=""
                        style={{ width: 110 }}
                    />
                </TableHead>
                <TableBody>
                    {variants.map((variant, idx) => {
                        return (
                            <TableBodyRow key={idx}>
                                <BodyCell>
                                    <div className={css.nameWrapper}>
                                        <Link
                                            to={variant.link}
                                            className={css.nameLink}
                                        >
                                            {variant.variantName}
                                        </Link>
                                        {variant.isWinner && (
                                            <div className={css.winnerBadge}>
                                                <Badge type={'blue'}>
                                                    Winner
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        format={ABGroupValueFormat.Date}
                                        data={variant.abGroup.started_datetime}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        format={ABGroupValueFormat.Date}
                                        data={variant.abGroup.stopped_datetime}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        format={ABGroupValueFormat.Percentage}
                                        data={variant.trafficAllocation}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        isLoading={isVariantFetching}
                                        format={ABGroupValueFormat.Number}
                                        data={getDataFromTableCell(
                                            variant,
                                            CampaignTableKeys.Impressions,
                                        )}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        isLoading={isVariantFetching}
                                        format={ABGroupValueFormat.Percentage}
                                        data={getDataFromTableCell(
                                            variant,
                                            CampaignTableKeys.ClickThroughRate,
                                        )}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        isLoading={isVariantFetching}
                                        format={ABGroupValueFormat.Number}
                                        data={getDataFromTableCell(
                                            variant,
                                            CampaignTableKeys.Conversions,
                                        )}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <DataCell
                                        isLoading={isVariantFetching}
                                        format={ABGroupValueFormat.Percentage}
                                        data={getDataFromTableCell(
                                            variant,
                                            CampaignTableKeys.TotalConversionRate,
                                        )}
                                    />
                                </BodyCell>
                                <BodyCell style={{ width: 110 }}>
                                    <VariantActions
                                        data={variant}
                                        variantName={variant.variantName}
                                        isDeletingDisabled={!variant.canDelete}
                                        isDuplicatingDisabled={isCreateDisabled}
                                        onDelete={onDelete}
                                        onDuplicate={onDuplicate}
                                    />
                                </BodyCell>
                            </TableBodyRow>
                        )
                    })}
                </TableBody>
            </TableWrapper>
        </div>
    )
}

export default VariantsList
