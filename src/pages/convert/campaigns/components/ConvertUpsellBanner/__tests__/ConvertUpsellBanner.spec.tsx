import {render} from '@testing-library/react'
import React from 'react'

import ConvertUpsellBanner from '../ConvertUpsellBanner'

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

describe('ConvertUpsellBanner', () => {
    it('renders correctly', () => {
        const {getByText} = render(<ConvertUpsellBanner />)

        expect(getByText('Book Demo')).toBeInTheDocument()

        expect(getByText('Learn More')).toBeInTheDocument()
        expect(
            getByText(
                'Launch personalized campaigns based on visitor behavior for increased sales. Include product suggestions or a unique discount code with just one click!'
            )
        ).toBeInTheDocument()
    })
})
