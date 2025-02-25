import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'

import { DiscountOfferPreview } from '../DiscountOfferPreview'

const mockStore = configureMockStore([thunk])()

describe('<DiscountOfferPreview />', () => {
    const offer: CampaignDiscountOffer = {
        prefix: 'Hello2024',
        id: '3',
    }

    it('reveals offer on click', () => {
        render(
            <Provider store={mockStore}>
                <DiscountOfferPreview offer={offer} />
            </Provider>,
        )

        const revealBtn = screen.getByText('Reveal Your Unique Code')

        expect(revealBtn).toBeInTheDocument()

        userEvent.click(revealBtn)

        expect(
            screen.getByLabelText('Copy discount code').textContent,
        ).toContain(offer.prefix)
    })
})
