import React from 'react'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {formatNumber} from 'pages/stats/common/utils'
import {CampaignTableContentCell} from 'pages/stats/convert/types/CampaignTableContentCell'
import {ConvertMetric} from 'state/ui/stats/types'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

type Props = {
    cell: CampaignTableContentCell
    data: any
    isHighlighted?: boolean
}

export const OrdersCell = ({cell, data, ...props}: Props) => {
    return (
        <BodyCell {...props}>
            <DrillDownModalTrigger
                enabled={!!data}
                metricData={
                    cell.drillDownMetricData[ConvertMetric.CampaignSalesCount]
                }
            >
                {formatNumber(data)}
            </DrillDownModalTrigger>
        </BodyCell>
    )
}
