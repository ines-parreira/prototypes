import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { CampaignsSalesCountKPIChart } from 'domains/reporting/pages/convert/charts/CampaignsSalesCountKPIChart'
import { useCampaignTotalStats } from 'domains/reporting/pages/convert/hooks/useCampaignTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/convert/hooks/useCampaignTotalStats')
const useCampaignTotalStatsMock = assumeMock(useCampaignTotalStats)

describe('CampaignsSalesCountKPIChart', () => {
    it('should show loading state', () => {
        useCampaignTotalStatsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        renderWithStore(<CampaignsSalesCountKPIChart />, {})

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should show data', () => {
        const campaignSalesCount = '15'
        useCampaignTotalStatsMock.mockReturnValue({
            data: {
                [CampaignsTotalsMetricNames.impressions]: '0',
                [CampaignsTotalsMetricNames.engagement]: '0',
                [CampaignsTotalsMetricNames.revenue]: '0',
                [CampaignsTotalsMetricNames.campaignSalesCount]:
                    campaignSalesCount,
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '0',
                [CampaignsTotalsMetricNames.gmv]: '5',
            },
            isLoading: false,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        renderWithStore(<CampaignsSalesCountKPIChart />, {})

        expect(
            screen.getByText(campaignSalesCount, { exact: false }),
        ).toBeInTheDocument()
    })
})
