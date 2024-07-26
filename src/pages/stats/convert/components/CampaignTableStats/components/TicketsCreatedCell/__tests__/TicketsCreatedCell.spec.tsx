import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import history from 'pages/history'

import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'

import {CampaignTableContentCell} from 'pages/stats/convert/types/CampaignTableContentCell'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {TicketsCreatedCell} from '../TicketsCreatedCell'

jest.mock('pages/history')
jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')

describe('<TicketsCreatedCell />', () => {
    const campaign = {
        id: '1234',
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
    } as unknown as CampaignTableContentCell

    let historySpy: jest.SpyInstance

    beforeEach(() => {
        ;(useCampaignStatsFilters as jest.Mock).mockReturnValue({
            selectedPeriod: {
                start_datetime: '2020-01-01T00:00:00.000Z',
                end_datetime: '2020-01-31T23:59:59.999Z',
            },
        })

        historySpy = jest.spyOn(history, 'push')
    })

    afterEach(() => {
        historySpy.mockRestore()
    })

    it('should not redirect the page if there are no tickets created yet', () => {
        const {container, getByText} = render(
            <TicketsCreatedCell cell={cell} data={0} />
        )

        expect(container.querySelector('a')).toBeNull()

        fireEvent.click(getByText('0'))

        expect(historySpy).not.toHaveBeenCalled()
    })

    it('should redirect the page if there are tickets created', () => {
        const {container, getByText} = render(
            <TicketsCreatedCell cell={cell} data={2} />
        )

        expect(container.querySelector('a')).not.toBeNull()

        fireEvent.click(getByText('2'))

        expect(historySpy).toHaveBeenCalledWith({
            pathname: `/app/tickets/new/public`,
            state: {
                filters: `containsAll(ticket.tags.name, ['Chat campaign - ${cell.campaign.name}']) && gte(ticket.created_datetime, '2020-01-01T00:00:00.000Z') && lte(ticket.created_datetime, '2020-01-31T23:59:59.999Z')`,
                viewName: 'Tickets created by campaign "Welcome visitors"',
                slug: 'tickets-created-by-campaign-welcome-visitors',
            },
        })
    })
})
