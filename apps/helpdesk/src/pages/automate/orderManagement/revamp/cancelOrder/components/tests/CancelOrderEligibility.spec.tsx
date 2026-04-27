import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { CancelOrderEligibility } from '../CancelOrderEligibility'

describe('<CancelOrderEligibility />', () => {
    it('should render with eligibility window label', () => {
        render(
            <CancelOrderEligibility
                onChange={jest.fn()}
                eligibility={undefined}
            />,
        )

        expect(screen.getByText('Eligibility window')).toBeInTheDocument()
        expect(screen.getByText('Order status is')).toBeInTheDocument()
    })

    it('should render the description text', () => {
        render(
            <CancelOrderEligibility
                onChange={jest.fn()}
                eligibility={undefined}
            />,
        )

        expect(
            screen.getByText(/Customers can request a cancellation/i),
        ).toBeInTheDocument()
    })
})
