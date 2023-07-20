import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import {Campaign} from 'models/integration/types'
import {CampaignTableContentCell} from 'pages/stats/revenue/types/CampaignTableContentCell'

import {TotalRevenueCell} from '../TotalRevenueCell'

describe('<TotalRevenueCell />', () => {
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
            totalRevenue: 100,
            ticketsRevenue: 25,
        },
    } as CampaignTableContentCell

    it('renders the amount with currency', () => {
        const {getByText} = render(<TotalRevenueCell cell={cell} data="100" />)

        expect(getByText('$100.00')).toBeInTheDocument()
    })

    it('shows tooltip when amount is hovered', async () => {
        const {getByText} = render(<TotalRevenueCell cell={cell} data="100" />)

        fireEvent.mouseOver(getByText('$100.00'))

        await waitFor(() => {
            expect(getByText('Store revenue share: 25%')).toBeInTheDocument()
        })
    })
})
