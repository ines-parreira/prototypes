import {renderHook} from '@testing-library/react-hooks'

import {campaign, campaignId} from 'fixtures/campaign'
import {CampaignPreview} from 'models/convert/campaign/types'
import {useGetCampaignSalesDrillDownData} from 'pages/stats/convert/hooks/useGetCampaignSalesDrillDownData'
import {ConvertDrillDownRowData} from 'pages/stats/DrillDownFormatters'

describe('useGetCampaignSalesDrillDownData', () => {
    const exampleRow = {
        data: {
            id: 1,
            amount: '16.23',
            currency: 'USD',
            productIds: ['prodId1', 'prodId4'],
            customerName: 'Archibald Hackintosh',
            campaignId: campaignId,
            createdDatetime: '23/12/2023',
        },
        metricValue: 16.23,
    }
    const metricData: ConvertDrillDownRowData[] = [exampleRow]

    it('should return empty array if metricData is empty', () => {
        const campaigns = [campaign] as CampaignPreview[]

        const {result} = renderHook(() =>
            useGetCampaignSalesDrillDownData(
                [] as ConvertDrillDownRowData[],
                campaigns
            )
        )

        expect(result.current).toEqual([])
    })

    it('should return empty array if campaigns is empty', () => {
        const campaigns = [] as CampaignPreview[]

        const {result} = renderHook(() =>
            useGetCampaignSalesDrillDownData(metricData, campaigns)
        )

        expect(result.current).toEqual([])
    })

    it('should return array of CampaignSalesDrillDownData', () => {
        const campaigns = [campaign] as CampaignPreview[]

        const {result} = renderHook(() =>
            useGetCampaignSalesDrillDownData(metricData, campaigns)
        )

        expect(result.current).toEqual([
            {
                ...exampleRow.data,
                campaignName: campaign.name,
            },
        ])
    })

    it('should return array of CampaignSalesDrillDownData with campaignId if there is no campaign in campaignData', () => {
        const campaigns = [campaign] as CampaignPreview[]
        const row = {
            ...exampleRow,
            data: {
                ...exampleRow.data,
                campaignId: 'some-other-id',
            },
        }
        const metricData: ConvertDrillDownRowData[] = [row]

        const {result} = renderHook(() =>
            useGetCampaignSalesDrillDownData(metricData, campaigns)
        )

        expect(result.current).toEqual([
            {
                ...row.data,
                campaignName: row.data.campaignId,
            },
        ])
    })
})
