import React from 'react'
import {render} from '@testing-library/react'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import useSearch from 'hooks/useSearch'
import ConvertCampaignsTablePlaceholder from '../ConvertCampaignsTablePlaceholder'

jest.mock('hooks/useSearch')

const DATA_LENGTH = 20

const data = Array.from({length: DATA_LENGTH}, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
    status: i % 2 === 0 ? CampaignStatus.Active : CampaignStatus.Inactive,
})) as unknown[] as Campaign[]

describe('<ConvertCampaignsTablePlaceholder />', () => {
    beforeEach(() => {
        ;(useSearch as jest.Mock).mockImplementation(() => ({}))
    })

    it('renders the `perPage` items', () => {
        const {container} = render(
            <ConvertCampaignsTablePlaceholder
                data={data}
                isLoading={false}
                perPage={10}
            />
        )

        const rows = container.querySelectorAll('tr')

        expect(rows.length).toEqual(10)
    })

    it('renders all toggles as disabled', () => {
        const {container} = render(
            <ConvertCampaignsTablePlaceholder
                data={data}
                isLoading={false}
                perPage={DATA_LENGTH}
            />
        )

        const toggles = container.querySelectorAll('input[type="checkbox"]')

        toggles.forEach((toggle) => {
            expect(toggle).toBeDisabled()
        })
    })

    it('renders all toggles with real campaign status', () => {
        const {container} = render(
            <ConvertCampaignsTablePlaceholder
                data={data}
                isLoading={false}
                perPage={DATA_LENGTH}
            />
        )

        const toggles = container.querySelectorAll('input[type="checkbox"]')

        toggles.forEach((toggle, i) => {
            const campaign = data[i]
            const expectedStatus = campaign.status === CampaignStatus.Active
            expect(toggle).toHaveProperty('checked', expectedStatus)
        })
    })
})
