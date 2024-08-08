import React from 'react'
import classnames from 'classnames'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import VariantActions from 'pages/convert/abVariants/components/VariantActions'
import {TableColumn} from 'pages/convert/abVariants/components/VariantsList/types'

import {generateVariantName} from 'pages/convert/abVariants/utils/generateVariantName'

import css from './VariantList.less'

type Props = {
    variants: CampaignVariant[]
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

const VariantsList: React.FC<Props> = ({variants}) => {
    const onDelete = () => {
        // eslint-disable-next-line no-console
        console.log('deleting variant')
    }

    const onDuplicate = () => {
        // eslint-disable-next-line no-console
        console.log('duplicating variant')
    }

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
                            isDeletingDisabled={false}
                            isDuplicatingDisabled={false}
                            onClickDelete={onDelete}
                            onClickDuplicate={onDuplicate}
                        />
                    </BodyCell>
                </TableBodyRow>
                {variants.map((_, idx) => {
                    return (
                        <TableBodyRow key={idx}>
                            <BodyCell>
                                <strong>{generateVariantName(idx)}</strong>
                            </BodyCell>
                            <BodyCell>-</BodyCell>
                            <BodyCell>-</BodyCell>
                            <BodyCell>100%</BodyCell>
                            <BodyCell>0</BodyCell>
                            <BodyCell>0%</BodyCell>
                            <BodyCell>0%</BodyCell>
                            <BodyCell style={{width: 110}}>
                                <VariantActions
                                    isDeletingDisabled={false}
                                    isDuplicatingDisabled={false}
                                    onClickDelete={onDelete}
                                    onClickDuplicate={onDuplicate}
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
