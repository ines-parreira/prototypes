import React from 'react'

import { render, screen } from '@testing-library/react'

import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { RevenueKpiChart } from 'pages/stats/convert/charts/RevenueKpiChart'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/convert/hooks/usePerformanceTotalStats')
const usePerformanceTotalStatsMock = assumeMock(usePerformanceTotalStats)

describe('RevenueKpiChart', () => {
    it('should show loading state', () => {
        usePerformanceTotalStatsMock.mockReturnValue({
            totalStatsData: undefined,
            totalStatsIsError: false,
            isLoading: true,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        render(<RevenueKpiChart />)

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should show data', () => {
        const gmv = '5'
        usePerformanceTotalStatsMock.mockReturnValue({
            totalStatsData: {
                [CampaignsTotalsMetricNames.revenue]: 1,
                [CampaignsTotalsMetricNames.campaignSalesCount]: '3',
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '3',
                [CampaignsTotalsMetricNames.gmv]: gmv,
                [CampaignsTotalsMetricNames.impressions]: '7',
                [CampaignsTotalsMetricNames.engagement]: '6',
            },
            totalStatsIsError: false,
            isLoading: false,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        render(<RevenueKpiChart />)

        expect(screen.getByText(gmv, { exact: false })).toBeInTheDocument()
    })
})
