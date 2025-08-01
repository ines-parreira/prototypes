import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { OrdersCell } from 'domains/reporting/pages/convert/components/CampaignTableStats/components/OrdersCell/OrdersCell'
import { CAMPAIGN_TABLE_COLUMN_TITLES } from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
const useAppDispatchMock = assumeMock(useAppDispatch)
useAppDispatchMock.mockReturnValue(dispatchMock)

describe('<OrdersCell />', () => {
    const campaignId = '1234'
    const campaign = {
        id: campaignId,
        message_html: 'test',
        message_text: 'test',
        name: 'Welcome visitors',
        triggers: [],
    } as unknown as Campaign
    const cell = {
        campaign: campaign,
        currency: 'USD',
        metrics: {
            conversionRate: 0.5,
        },
        variantMetrics: {},
        drillDownMetricData: {
            [ConvertMetric.CampaignSalesCount]: {
                title: CAMPAIGN_TABLE_COLUMN_TITLES[
                    CampaignTableKeys.Conversions
                ],
                metricName: ConvertMetric.CampaignSalesCount,
                campaignsOperator: LogicalOperatorEnum.ONE_OF,
                shopName: 'shopify:best-shop',
                selectedCampaignIds: [campaign.id],
                context: {
                    channel_connection_external_ids: ['567575'],
                },
            },
        },
    } as CampaignTableContentCell

    it('should not open modal when data is 0', async () => {
        const { findByText } = render(<OrdersCell cell={cell} data={0} />)

        const ordersCount = await findByText('0')
        ordersCount.click()

        expect(dispatchMock).not.toHaveBeenCalled()
    })

    it('should open modal on click', async () => {
        const { findByText } = render(<OrdersCell cell={cell} data={10} />)

        const ordersCount = await findByText('10')
        ordersCount.click()

        expect(dispatchMock).toHaveBeenCalledWith(
            setMetricData(
                expect.objectContaining({
                    metricName: ConvertMetric.CampaignSalesCount,
                    selectedCampaignIds: [campaignId],
                }),
            ),
        )
    })
})
