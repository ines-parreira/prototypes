import React from 'react'

import { render } from '@testing-library/react'

import { CardHeaderYotpoLoyaltyPoints } from '../CardHeaderYotpoLoyaltyPoints'

describe('<CardHeaderYotpoLoyaltyPoints/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const { container } = render(
                <CardHeaderYotpoLoyaltyPoints value="12345" />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
