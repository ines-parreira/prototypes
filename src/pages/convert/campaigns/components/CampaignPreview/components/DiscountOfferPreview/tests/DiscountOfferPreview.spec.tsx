import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {testIds} from 'pages/convert/campaigns/components/CampaignPreview/components/DiscountOfferPreview/utils'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {DiscountOfferPreview} from '../DiscountOfferPreview'

const mockStore = configureMockStore([thunk])()

describe('<DiscountOfferPreview />', () => {
    const offer: CampaignDiscountOffer = {
        prefix: 'Hello2024',
        id: '3',
    }
    it('reveals offer on click', () => {
        const {getByTestId} = render(
            <Provider store={mockStore}>
                <DiscountOfferPreview offer={offer} />
            </Provider>
        )
        const revealBtn = getByTestId(testIds.revealBtn)

        expect(revealBtn).toBeInTheDocument()

        userEvent.click(revealBtn)

        const revealedWrapper = getByTestId(testIds.revealedWrapper)

        expect(revealedWrapper.textContent).toContain(offer.prefix)
    })
})
