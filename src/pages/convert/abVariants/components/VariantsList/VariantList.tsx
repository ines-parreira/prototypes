import React, {useMemo} from 'react'
import classnames from 'classnames'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import {ABGroupStatus} from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import {DateAndTimeFormatting} from 'constants/datetime'
import {isActiveStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

import {VARIANT_LIMIT} from 'pages/convert/abVariants/contants'
import VariantActions from 'pages/convert/abVariants/components/VariantActions'
import {TableColumn} from 'pages/convert/abVariants/components/VariantsList/types'
import {ABGroup} from 'models/convert/campaign/types'

import {VariantTableEntry} from 'pages/convert/abVariants/types/VariantTableEntry'

import {generateVariantName} from 'pages/convert/abVariants/utils/generateVariantName'

import {formatPercent} from 'pages/stats/common/utils'

import {formatDatetime} from 'utils'

import css from './VariantList.less'

type Props = {
    canPerformActions: boolean
    campaign: Campaign
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
        title: 'Conversion rate',
        className: 'conversionRate',
    },
]

const VariantsList: React.FC<Props> = ({
    canPerformActions,
    campaign,
    onDelete,
    onDuplicate,
}) => {
    const isStarted = campaign.ab_group?.status === ABGroupStatus.Started
    const isCompleted = campaign.ab_group?.status === ABGroupStatus.Completed

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    const variants = useMemo<VariantTableEntry[]>(() => {
        const splitBetweenLength = (campaign.variants?.length || 0) + 1 // include control version
        const winnerId = campaign.ab_group?.winner_variant_id

        const variants: VariantTableEntry[] = [
            {
                variant: null, // Control Version
                abGroup: campaign.ab_group as ABGroup,
                isWinner: isCompleted && winnerId === null,
                variantName: 'Control Variant',
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
                abGroup: campaign.ab_group as ABGroup,
                variantName: generateVariantName(idx),
                isWinner: winnerId === variant.id,
                trafficAllocation: !isStarted
                    ? 0
                    : Math.floor(100 / splitBetweenLength),
                canDelete: canPerformActions,
            })
        })

        return variants
    }, [campaign, isStarted, isCompleted, canPerformActions])

    const isCreateDisabled = useMemo(() => {
        const limit = VARIANT_LIMIT + 1 // include control version
        return !canPerformActions || variants.length >= limit
    }, [variants, canPerformActions])

    return (
        <TableWrapper
            className={classnames('table-integrations', css.variantTable)}
        >
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
                    style={{width: 110}}
                />
            </TableHead>
            <TableBody>
                {variants.map((variant, idx) => {
                    return (
                        <TableBodyRow key={idx}>
                            <BodyCell>
                                <div className={css.nameWrapper}>
                                    <strong>{variant.variantName}</strong>
                                    {variant.isWinner && (
                                        <div className={css.winnerBadge}>
                                            <Badge type={ColorType.Blue}>
                                                Winner
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </BodyCell>
                            <BodyCell>
                                {variant.abGroup.started_datetime
                                    ? formatDatetime(
                                          variant.abGroup.started_datetime,
                                          datetimeFormat
                                      )
                                    : '-'}
                            </BodyCell>
                            <BodyCell>
                                {variant.abGroup.stopped_datetime
                                    ? formatDatetime(
                                          variant.abGroup.stopped_datetime,
                                          datetimeFormat
                                      )
                                    : '-'}
                            </BodyCell>
                            <BodyCell>
                                {formatPercent(variant.trafficAllocation)}
                            </BodyCell>
                            <BodyCell>0</BodyCell>
                            <BodyCell>0%</BodyCell>
                            <BodyCell>0%</BodyCell>
                            <BodyCell style={{width: 110}}>
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
    )
}

export default VariantsList
