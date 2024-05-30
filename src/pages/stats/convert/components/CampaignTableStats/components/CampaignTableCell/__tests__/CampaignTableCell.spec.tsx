import React from 'react'
import {render} from '@testing-library/react'

import {CampaignTableColumn} from 'pages/stats/convert/types/CampaignTableColumn'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {CampaignTableContentCell} from 'pages/stats/convert/types/CampaignTableContentCell'
import {CampaignTableValueFormat} from 'pages/stats/convert/types/enums/CampaignTableValueFormat.enum'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {GorgiasChatIntegration} from 'models/integration/types'
import {CampaignTableCell} from '../CampaignTableCell'

describe('<CampaignTableCell />', () => {
    const campaign = {
        id: '1234',
        message_html: 'test',
        message_text: 'test',
        name: 'Test campaign',
        is_light: false,
        triggers: [],
    } as unknown as Campaign
    const cell = {
        campaign: campaign,
        currency: 'USD',
        metrics: {
            conversionRate: 0.5,
        },
        chatIntegration: {
            id: '1234',
            name: 'Test integration',
        } as unknown as GorgiasChatIntegration,
    } as CampaignTableContentCell

    it.each([
        [
            {
                key: CampaignTableKeys.ClicksRate,
                format: CampaignTableValueFormat.Percentage,
            },
            100,
            '100%',
        ],
        [
            {
                key: CampaignTableKeys.ClicksRate,
                format: CampaignTableValueFormat.Number,
            },
            123456789,
            '123,456,789',
        ],
        [
            {
                key: CampaignTableKeys.ClicksRate,
                format: CampaignTableValueFormat.Currency,
            },
            1234.12,
            '$1,234.12',
        ],
        [
            {
                key: CampaignTableKeys.ClicksRate,
            },
            'string',
            'string',
        ],
        [
            {
                key: CampaignTableKeys.CampaignName,
            },
            'My cool campaign',
            'My cool campaign',
        ],
    ])(
        'should render the cell with value',
        async (column, value, expectedResult) => {
            const {findByText} = render(
                <CampaignTableCell
                    column={column as CampaignTableColumn}
                    cell={cell}
                    data={value}
                />
            )

            await findByText(expectedResult)
        }
    )

    it('should render campaign name with light campaign label', async () => {
        const {findByText} = render(
            <CampaignTableCell
                column={
                    {
                        key: CampaignTableKeys.CampaignName,
                    } as CampaignTableColumn
                }
                cell={{
                    ...cell,
                    campaign: {
                        ...campaign,
                        is_light: true,
                    },
                }}
                data="Super converting campaign"
            />
        )

        await findByText('Super converting campaign (light)')
    })
})
