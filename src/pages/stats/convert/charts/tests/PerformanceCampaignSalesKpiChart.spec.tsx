import {screen} from '@testing-library/react'

import React from 'react'

import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

import {PerformanceCampaignSalesKpiChart} from 'pages/stats/convert/charts/PerformanceCampaignSalesKpiChart'
import {usePerformanceTotalStats} from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import {CampaignsTotalsMetricNames} from 'pages/stats/convert/services/constants'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/convert/hooks/usePerformanceTotalStats')
const usePerformanceTotalStatsMock = assumeMock(usePerformanceTotalStats)

describe('CampaignRevenueKPIChart', () => {
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

        renderWithStore(<PerformanceCampaignSalesKpiChart />, {})

        expect(
            document.querySelector('.react-loading-skeleton')
        ).toBeInTheDocument()
    })

    it('should render data', () => {
        const campaignSalesCount = '2'
        usePerformanceTotalStatsMock.mockReturnValue({
            totalStatsIsError: false,
            totalStatsData: {
                [CampaignsTotalsMetricNames.revenue]: 1,
                [CampaignsTotalsMetricNames.campaignSalesCount]:
                    campaignSalesCount,
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '3',
                [CampaignsTotalsMetricNames.gmv]: 5,
                [CampaignsTotalsMetricNames.impressions]: '7',
                [CampaignsTotalsMetricNames.engagement]: '6',
            },
            isLoading: false,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        renderWithStore(<PerformanceCampaignSalesKpiChart />, {})

        expect(screen.getByText(campaignSalesCount)).toBeInTheDocument()
    })
})
