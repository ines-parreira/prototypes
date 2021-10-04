import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import SubscriptionAmount from '../SubscriptionAmount'

describe('<SubscriptionAmount />', () => {
    const minProps: ComponentProps<typeof SubscriptionAmount> = {
        currency: 'eur',
        interval: 'week',
    }

    it('should render', () => {
        const {container} = render(<SubscriptionAmount {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should format amount', () => {
        const {container} = render(
            <SubscriptionAmount {...minProps} amount={1000} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
