import {useMemo} from 'react'
import _get from 'lodash/get'
import {
    CampaignSaleDetails,
    ConvertDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'
import {CampaignPreview} from 'models/convert/campaign/types'

export type CampaignSalesDrillDownData = CampaignSaleDetails & {
    campaignName: string
}

export const useGetCampaignSalesDrillDownData = (
    metricData: ConvertDrillDownRowData[],
    campaigns: CampaignPreview[]
): CampaignSalesDrillDownData[] => {
    return useMemo(() => {
        if (!metricData.length || !campaigns.length) return []

        const campaignData = campaigns.reduce((acc, campaign) => {
            acc[campaign.id] = campaign.name
            return acc
        }, {} as Record<string, string>)

        return metricData.map((row) => {
            return {
                ...row.data,
                campaignName: _get(
                    campaignData,
                    row.data.campaignId,
                    row.data.campaignId
                ),
            }
        })
    }, [metricData, campaigns])
}
