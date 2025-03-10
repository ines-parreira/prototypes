import React from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import { formatNumber } from 'pages/stats/common/utils'
import { CampaignTableContentCell } from 'pages/stats/convert/types/CampaignTableContentCell'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import { ConvertMetrics } from 'state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'state/ui/stats/types'

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
