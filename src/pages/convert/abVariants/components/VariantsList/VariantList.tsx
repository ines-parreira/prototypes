import React, {useMemo} from 'react'
import classnames from 'classnames'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import {VARIANT_LIMIT} from 'pages/convert/abVariants/contants'
import VariantActions from 'pages/convert/abVariants/components/VariantActions'
import {TableColumn} from 'pages/convert/abVariants/components/VariantsList/types'

import {generateVariantName} from 'pages/convert/abVariants/utils/generateVariantName'

import css from './VariantList.less'

type Props = {
    canPerformActions: boolean
    variants: CampaignVariant[]
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
    variants,
    onDelete,
    onDuplicate,
}) => {
    const isCreateDisabled = useMemo(() => {
        return !canPerformActions || variants.length >= VARIANT_LIMIT
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
                <TableBodyRow>
                    <BodyCell>
                        <strong>Control Variant</strong>
                    </BodyCell>
                    <BodyCell>-</BodyCell>
                    <BodyCell>-</BodyCell>
                    <BodyCell>100%</BodyCell>
                    <BodyCell>0</BodyCell>
                    <BodyCell>0%</BodyCell>
                    <BodyCell>0%</BodyCell>
                    <BodyCell style={{width: 110}}>
                        <VariantActions
                            variantName="Control Variant"
                            variant={null}
                            isDeletingDisabled={true} // disabled by default
                            isDuplicatingDisabled={isCreateDisabled}
                            onDuplicate={onDuplicate}
                        />
                    </BodyCell>
                </TableBodyRow>
                {variants.map((variant, idx) => {
                    const variantName = generateVariantName(idx)
                    return (
                        <TableBodyRow key={idx}>
                            <BodyCell>
                                <strong>{variantName}</strong>
                            </BodyCell>
                            <BodyCell>-</BodyCell>
                            <BodyCell>-</BodyCell>
                            <BodyCell>100%</BodyCell>
                            <BodyCell>0</BodyCell>
                            <BodyCell>0%</BodyCell>
                            <BodyCell>0%</BodyCell>
                            <BodyCell style={{width: 110}}>
                                <VariantActions
                                    variant={variant}
                                    variantName={variantName}
                                    isDeletingDisabled={!canPerformActions}
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
