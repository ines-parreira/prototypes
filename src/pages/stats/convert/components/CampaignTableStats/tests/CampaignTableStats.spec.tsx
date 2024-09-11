import React from 'react'

import {fromJS} from 'immutable'

import {fireEvent} from '@testing-library/react'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {CampaignPreview} from 'models/convert/campaign/types'
import {campaign, campaignVariant} from 'fixtures/campaign'
import {assumeMock, renderWithStore} from 'utils/testing'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {ConvertMetric} from 'state/ui/stats/types'
import {integrationsState} from 'fixtures/integrations'
import {GorgiasChatIntegration} from 'models/integration/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {CampaignTableStats} from 'pages/stats/convert/components/CampaignTableStats/CampaignTableStats'

const chatIntegration = {
    type: 'gorgias_chat',
    id: '8',
}

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

describe('CampaignTableStats', () => {
    const rows = [
        {
            campaign: campaign as CampaignPreview,
            chatIntegration:
                chatIntegration as unknown as GorgiasChatIntegration,
            currency: 'USD',
            metrics: {
                [CampaignTableKeys.TotalRevenue]: 123,
            },
            variantMetrics: {
                [campaignVariant.id]: {
                    [CampaignTableKeys.TotalRevenue]: 456,
                },
            },
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            drillDownMetricData: {
                [ConvertMetric.CampaignSalesCount]: {
                    title: 'test',
                    metricName: ConvertMetric.CampaignSalesCount,
                    campaignsOperator: LogicalOperatorEnum.ONE_OF,
                    shopName: 'test-store',
                    selectedCampaignIds: [campaign.id],
                    context: {
                        channel_connection_external_ids: ['31'],
                    },
                },
            },
        },
    ]

    beforeEach(() => {
        useCampaignStatsFiltersMock.mockReturnValue({
            selectedPeriod: {
                start_datetime: '2020-01-01T00:00:00.000Z',
                end_datetime: '2020-01-31T23:59:59.999Z',
            },
        } as any)
    })

    it('should render CampaignTableStats with campaigns and variants', () => {
        const {getByText, getByRole} = renderWithStore(
            <CampaignTableStats
                chatIntegrationId={8}
                isLoading={false}
                rows={rows}
                offset={0}
                onClickNextPage={jest.fn()}
                onClickPrevPage={jest.fn()}
            />,
            {
                integrations: fromJS(integrationsState),
            }
        )

        expect(getByText(campaign.name)).toBeInTheDocument()
        expect(getByText('$123.00')).toBeInTheDocument()

        const toggle = getByRole('button')
        fireEvent.click(toggle)

        expect(getByText('Variant A')).toBeInTheDocument()
        expect(getByText('$456.00')).toBeInTheDocument()
    })
})
