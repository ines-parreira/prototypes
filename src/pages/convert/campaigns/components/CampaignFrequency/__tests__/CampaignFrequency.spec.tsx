import React from 'react'

import { render, screen } from '@testing-library/react'

import CampaignFrequency from '../CampaignFrequency'

describe('<MaximumCampaignDisplayed />', () => {
    it('renders', () => {
        render(
            <CampaignFrequency
                integrationId={'1'}
                maximumCampaignsDisplayed={undefined}
                onChangeMaximumCampaignDisplayed={jest.fn()}
                timeBetweenCampaigns={undefined}
                onChangeTimeBetweenCampaigns={jest.fn()}
            />,
        )

        expect(screen.getByText('Frequency settings')).toBeInTheDocument()
    })
})
