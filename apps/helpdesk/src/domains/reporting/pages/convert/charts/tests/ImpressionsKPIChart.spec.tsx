import React from 'react'

import { render, screen } from '@testing-library/react'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { ImpressionsKPIChart } from 'domains/reporting/pages/convert/charts/ImpressionsKPIChart'
import { useCampaignTotalStats } from 'domains/reporting/pages/convert/hooks/useCampaignTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/convert/hooks/useCampaignTotalStats')
const useCampaignTotalStatsMock = assumeMock(useCampaignTotalStats)

describe('ImpressionsKPIChart', () => {
    it('should show loading state', () => {
        useCampaignTotalStatsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        render(<ImpressionsKPIChart />)

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should show data', () => {
        const impressions = '8'
        useCampaignTotalStatsMock.mockReturnValue({
            data: {
                [CampaignsTotalsMetricNames.impressions]: impressions,
                [CampaignsTotalsMetricNames.engagement]: '0',
                [CampaignsTotalsMetricNames.revenue]: '0',
                [CampaignsTotalsMetricNames.campaignSalesCount]: '0',
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '0',
                [CampaignsTotalsMetricNames.gmv]: '5',
            },
            isLoading: false,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        render(<ImpressionsKPIChart />)

        expect(
            screen.getByText(impressions, { exact: false }),
        ).toBeInTheDocument()
    })
})
