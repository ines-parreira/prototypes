import React from 'react'

import { screen } from '@testing-library/react'

import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { CampaignsSalesCountKPIChart } from 'pages/stats/convert/charts/CampaignsSalesCountKPIChart'
import { useCampaignTotalStats } from 'pages/stats/convert/hooks/useCampaignTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/convert/hooks/useCampaignTotalStats')
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
