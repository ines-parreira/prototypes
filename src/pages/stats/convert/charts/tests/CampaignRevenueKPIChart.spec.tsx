import {render, screen} from '@testing-library/react'

import React from 'react'

import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {CampaignRevenueKPIChart} from 'pages/stats/convert/charts/CampaignRevenueKPIChart'
import {useCampaignTotalStats} from 'pages/stats/convert/hooks/useCampaignTotalStats'
import {CampaignsTotalsMetricNames} from 'pages/stats/convert/services/constants'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/convert/hooks/useCampaignTotalStats')
const useCampaignTotalStatsMock = assumeMock(useCampaignTotalStats)

describe('CampaignRevenueKPIChart', () => {
    it('should show loading state', () => {
        useCampaignTotalStatsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        render(<CampaignRevenueKPIChart />)

        expect(
            document.querySelector('.react-loading-skeleton')
        ).toBeInTheDocument()
    })

    it('should show data', () => {
        const gmv = '5'
        useCampaignTotalStatsMock.mockReturnValue({
            data: {
                [CampaignsTotalsMetricNames.impressions]: '0',
                [CampaignsTotalsMetricNames.engagement]: '0',
                [CampaignsTotalsMetricNames.revenue]: '0',
                [CampaignsTotalsMetricNames.campaignSalesCount]: '0',
                [CampaignsTotalsMetricNames.influencedRevenueShare]: '0',
                [CampaignsTotalsMetricNames.gmv]: gmv,
            },
            isLoading: false,
            namespacedShopName: '',
            selectedCampaignIds: null,
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            channelConnectionExternalIds: [],
        })

        render(<CampaignRevenueKPIChart />)

        expect(screen.getByText(gmv, {exact: false})).toBeInTheDocument()
    })
})
