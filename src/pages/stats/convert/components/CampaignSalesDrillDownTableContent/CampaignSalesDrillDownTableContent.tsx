import React from 'react'
import {formatConvertCampaignSalesDrillDownRowData} from 'pages/stats/DrillDownFormatters'

import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import {useEnrichedDrillDownData} from 'hooks/reporting/useDrillDownData'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {
    formatCurrency,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {DrillDownTableContentSkeleton} from 'pages/stats/common/components/Table/DrillDownTableContentSkeleton'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useGetCampaignSalesDrillDownData} from 'pages/stats/convert/hooks/useGetCampaignSalesDrillDownData'

import {EnrichmentFields} from 'models/reporting/types'
import css from './CampaignSalesDrillDownTableContent.less'

// should add up to table width from CSS
const COLUMN_WIDTHS = {
    orderId: 160,
    date: 180,
    campaign: 360,
    customer: 260,
    amount: 100,
    items: 80,
}
const COLUMN_WIDTHS_ORDERED = [
    COLUMN_WIDTHS.orderId,
    COLUMN_WIDTHS.date,
    COLUMN_WIDTHS.campaign,
    COLUMN_WIDTHS.customer,
    COLUMN_WIDTHS.amount,
    COLUMN_WIDTHS.items,
].map((width) => width - 40)

export const CampaignSalesDrillDownTableContent = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const {data, isFetching} = useEnrichedDrillDownData(
        metricData,
        [EnrichmentFields.CustomerIntegrationDataByExternalId],
        formatConvertCampaignSalesDrillDownRowData
    )

    const {allCampaigns} = useCampaignStatsFilters()

    const enrichedData = useGetCampaignSalesDrillDownData(data, allCampaigns)

    return (
        <>
            <TableHead>
                <HeaderCellProperty
                    title="Order"
                    width={COLUMN_WIDTHS.orderId}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Date"
                    width={COLUMN_WIDTHS.date}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Campaign attributed"
                    width={COLUMN_WIDTHS.campaign}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Customer"
                    width={COLUMN_WIDTHS.customer}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Amount"
                    width={COLUMN_WIDTHS.amount}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Items"
                    width={COLUMN_WIDTHS.items}
                    className={css.headerCell}
                />
            </TableHead>
            <TableBody>
                {isFetching ? (
                    <DrillDownTableContentSkeleton
                        columnWidths={COLUMN_WIDTHS_ORDERED}
                    />
                ) : (
                    enrichedData.map((item) => (
                        <TableBodyRow key={item.id}>
                            <BodyCell width={COLUMN_WIDTHS.orderId}>
                                {item.id
                                    ? `#${item.id}`
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.date}>
                                {item.createdDatetime ? (
                                    <DatetimeLabel
                                        dateTime={item.createdDatetime}
                                    />
                                ) : (
                                    NOT_AVAILABLE_PLACEHOLDER
                                )}
                            </BodyCell>
                            <BodyCell
                                width={COLUMN_WIDTHS.campaign}
                                className={css.longCellContent}
                            >
                                {item.campaignName
                                    ? item.campaignName
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.customer}>
                                {item.customerName
                                    ? item.customerName
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.amount}>
                                {item.amount && item.currency
                                    ? formatCurrency(
                                          parseFloat(item.amount),
                                          item.currency
                                      )
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.items}>
                                {item.productIds
                                    ? item.productIds.length
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                        </TableBodyRow>
                    ))
                )}
            </TableBody>
        </>
    )
}
