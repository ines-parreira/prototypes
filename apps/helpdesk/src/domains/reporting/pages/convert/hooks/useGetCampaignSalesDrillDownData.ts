import { useMemo } from 'react'

import _get from 'lodash/get'

import type {
    CampaignSaleDetails,
    ConvertDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { CampaignPreview } from 'models/convert/campaign/types'

export type CampaignSalesDrillDownData = CampaignSaleDetails & {
    campaignName: string
}

export const useGetCampaignSalesDrillDownData = (
    metricData: ConvertDrillDownRowData[],
    campaigns: CampaignPreview[],
): CampaignSalesDrillDownData[] => {
    return useMemo(() => {
        if (!metricData.length || !campaigns.length) return []

        const campaignData = campaigns.reduce(
            (acc, campaign) => {
                acc[campaign.id] = campaign.name
                return acc
            },
            {} as Record<string, string>,
        )

        return metricData.map((row) => {
            return {
                ...row.data,
                campaignName: _get(
                    campaignData,
                    row.data.campaignId,
                    row.data.campaignId,
                ),
            }
        })
    }, [metricData, campaigns])
}
