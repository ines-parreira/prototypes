import {render} from '@testing-library/react'
import React from 'react'

import {variants as variantFixture} from 'fixtures/abGroup'

import ABGroupVariants from '../ABGroupVariants'

describe('<ABGroupVariants />', () => {
    it('renders', () => {
        const {getByText} = render(
            <ABGroupVariants
                variants={variantFixture}
                integrationId="3"
                campaignId="23346ZZ6BTW3EMDE8BF6ACH2A1"
            />
        )

        expect(getByText('Control Variant')).toBeInTheDocument()
        expect(getByText('Variant A')).toBeInTheDocument()
        expect(getByText('Variant B')).toBeInTheDocument()
    })
})
