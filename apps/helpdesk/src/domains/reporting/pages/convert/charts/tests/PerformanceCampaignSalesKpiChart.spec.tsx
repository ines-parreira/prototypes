import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { PerformanceCampaignSalesKpiChart } from 'domains/reporting/pages/convert/charts/PerformanceCampaignSalesKpiChart'
import { usePerformanceTotalStats } from 'domains/reporting/pages/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/convert/hooks/usePerformanceTotalStats')
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
            document.querySelector('.react-loading-skeleton'),
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
