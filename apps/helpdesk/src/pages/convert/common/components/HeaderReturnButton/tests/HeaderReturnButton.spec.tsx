import React from 'react'

import { render } from '@testing-library/react'

import { HeaderReturnButton } from '../HeaderReturnButton'

describe('<HeaderReturnButton />', () => {
    it('sets the right href', () => {
        const { getByText } = render(
            <HeaderReturnButton
                backToHref="/back-to-campaigns"
                title="Back to Campaigns list"
            />,
        )

        expect(getByText('Back to Campaigns list').getAttribute('to')).toEqual(
            '/back-to-campaigns',
        )
    })

    describe('Header button shows back text', () => {
        it('renders the "Back to Campaigns list" title', () => {
            const { getByText } = render(
                <HeaderReturnButton
                    backToHref="/"
                    title="Back to Campaigns list"
                />,
            )
            getByText('Back to Campaigns list')
        })
    })
})
