import React from 'react'
import {render} from '@testing-library/react'

import {CampaignDetailsHeader} from '../CampaignDetailsHeader'

describe('<CampaignDetailsHeader />', () => {
    it('sets the right href', () => {
        const {getByText} = render(
            <CampaignDetailsHeader backToHref="/back-to-campaigns" />
        )

        expect(getByText('Back to Campaigns list').getAttribute('to')).toEqual(
            '/back-to-campaigns'
        )
    })

    describe('Header button shows back text', () => {
        it('renders the "Back to Campaigns list" title', () => {
            const {getByText} = render(<CampaignDetailsHeader backToHref="/" />)
            getByText('Back to Campaigns list')
        })
    })
})
