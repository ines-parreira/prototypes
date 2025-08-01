import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { RevenueKpiChart } from 'domains/reporting/pages/convert/charts/RevenueKpiChart'
import { usePerformanceTotalStats } from 'domains/reporting/pages/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'

jest.mock('domains/reporting/pages/convert/hooks/usePerformanceTotalStats')
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
