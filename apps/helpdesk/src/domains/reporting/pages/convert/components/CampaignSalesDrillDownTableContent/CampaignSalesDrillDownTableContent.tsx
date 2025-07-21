import { useEnrichedDrillDownData } from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { DrillDownTableContentSkeleton } from 'domains/reporting/pages/common/components/Table/DrillDownTableContentSkeleton'
import { formatConvertCampaignSalesDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import {
    formatCurrency,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/convert/components/CampaignSalesDrillDownTableContent/CampaignSalesDrillDownTableContent.less'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetCampaignSalesDrillDownData } from 'domains/reporting/pages/convert/hooks/useGetCampaignSalesDrillDownData'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

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
    const { data, isFetching } = useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        [EnrichmentFields.CustomerIntegrationDataByExternalId],
        formatConvertCampaignSalesDrillDownRowData,
        EnrichmentFields.OrderCustomerId,
    )

    const { campaigns } = useCampaignStatsFilters()

    const enrichedData = useGetCampaignSalesDrillDownData(data, campaigns)

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
                                          item.currency,
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
