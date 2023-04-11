import React from 'react'
import {render} from '@testing-library/react'

import {CampaignTableColumn} from 'pages/stats/revenue/types/CampaignTableColumn'
import {CampaignTableKeys} from 'pages/stats/revenue/types/enums/CampaignTableKeys.enum'
import {CampaignTableContentCell} from 'pages/stats/revenue/types/CampaignTableContentCell'
import {CampaignTableValueFormat} from 'pages/stats/revenue/types/enums/CampaignTableValueFormat.enum'

import {Campaign} from 'models/integration/types'
import {CampaignTableCell} from '../CampaignTableCell'

describe('<CampaignTableCell />', () => {
    const campaign = {
        id: '1234',
        message: {
            html: 'test',
            text: 'test',
        },
        name: 'Test campaign',
        triggers: [],
    } as unknown as Campaign
    const cell = {
        campaign: campaign,
        currency: 'USD',
        metrics: {
            conversionRate: 0.5,
        },
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
})
