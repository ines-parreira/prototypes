import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { formatNumber } from 'domains/reporting/pages/common/utils'
import { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import { ConvertMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

type Props = {
    cell: CampaignTableContentCell
    data: any
    isHighlighted?: boolean
    variantId?: string
}

export const OrdersCell = ({ cell, data, variantId, ...props }: Props) => {
    const metricData: ConvertMetrics = {
        ...(cell.drillDownMetricData[
            ConvertMetric.CampaignSalesCount
        ] as ConvertMetrics),
        abVariant: variantId,
    }

    return (
        <BodyCell {...props}>
            <DrillDownModalTrigger
                enabled={!!data}
                highlighted
                metricData={metricData}
            >
                {formatNumber(data)}
            </DrillDownModalTrigger>
        </BodyCell>
    )
}
