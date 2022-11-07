import React from 'react'
import {render} from '@testing-library/react'

import {CampaignDetailsHeader} from '../CampaignDetailsHeader'

describe('<CampaignDetailsHeader />', () => {
    it('sets the right href', () => {
        const {getByText} = render(
            <CampaignDetailsHeader backToHref="/back-to-campaigns" />
        )

        expect(getByText('New Campaign').getAttribute('to')).toEqual(
            '/back-to-campaigns'
        )
    })

    describe('Header is for a new campaign', () => {
        it('renders the "New Campaign" title', () => {
            const {getByText} = render(<CampaignDetailsHeader backToHref="/" />)
            getByText('New Campaign')
        })
    })

    describe('Header is to update campaign', () => {
        it('renders the "Edit Campaign" title', () => {
            const {getByText} = render(
                <CampaignDetailsHeader isUpdate backToHref="/" />
            )
            getByText('Edit Campaign')
        })
    })
})
