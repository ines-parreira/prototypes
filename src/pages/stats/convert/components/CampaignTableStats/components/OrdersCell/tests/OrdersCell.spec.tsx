import React from 'react'
import {render} from '@testing-library/react'

import {CampaignTableContentCell} from 'pages/stats/convert/types/CampaignTableContentCell'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {assumeMock} from 'utils/testing'
import useAppDispatch from 'hooks/useAppDispatch'
import {ConvertMetric} from 'state/ui/stats/types'
import {CAMPAIGN_TABLE_COLUMN_TITLES} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {setMetricData} from 'state/ui/stats/drillDownSlice'
import {OrdersCell} from '../OrdersCell'

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
        drillDownMetricData: {
            [ConvertMetric.CampaignSalesCount]: {
                title: CAMPAIGN_TABLE_COLUMN_TITLES[
                    CampaignTableKeys.Conversions
                ],
                metricName: ConvertMetric.CampaignSalesCount,
                shopName: 'shopify:best-shop',
                selectedCampaignIds: [campaign.id],
                context: {
                    channel_connection_external_ids: ['567575'],
                },
            },
        },
    } as CampaignTableContentCell

    it('should not open modal when data is 0', async () => {
        const {findByText} = render(<OrdersCell cell={cell} data={0} />)

        const ordersCount = await findByText('0')
        ordersCount.click()

        expect(dispatchMock).not.toHaveBeenCalled()
    })

    it('should open modal on click', async () => {
        const {findByText} = render(<OrdersCell cell={cell} data={10} />)

        const ordersCount = await findByText('10')
        ordersCount.click()

        expect(dispatchMock).toHaveBeenCalledWith(
            setMetricData(
                expect.objectContaining({
                    metricName: ConvertMetric.CampaignSalesCount,
                    selectedCampaignIds: [campaignId],
                })
            )
        )
    })
})
