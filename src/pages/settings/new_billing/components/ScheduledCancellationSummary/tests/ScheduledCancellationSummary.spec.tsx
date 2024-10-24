import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import ScheduledCancellationSummary from '../ScheduledCancellationSummary'

describe('ScheduledCancellationSummary component', () => {
    const cancelledProducts = ['product1', 'product2', 'product3']
    const scheduledToCancelAt = '2024-03-15T12:00:00Z'
    const handleContactUs = jest.fn()

    it('should render correctly with multiple cancelled products', () => {
        const {container, getByText} = render(
            <ScheduledCancellationSummary
                cancelledProducts={cancelledProducts}
                scheduledToCancelAt={scheduledToCancelAt}
                onContactUs={handleContactUs}
            />
        )

        expect(container).toHaveTextContent(
            'Your product1, product2 and product3 auto-renewal has been cancelled.' +
                "You'll continue to have full access to all your active products until the end of your billing " +
                "cycle on March 15, 2024.If you'd like to reactivate your subscription, please contact us."
        )
        expect(getByText('product1, product2')).toHaveClass(
            'body-semibold text-capitalize'
        )
        expect(getByText('product3')).toHaveClass(
            'body-semibold text-capitalize'
        )
    })

    it('should render correctly with single cancelled product', () => {
        const {container, getByText} = render(
            <ScheduledCancellationSummary
                cancelledProducts={['onlyproduct']}
                scheduledToCancelAt={scheduledToCancelAt}
                onContactUs={handleContactUs}
            />
        )
        expect(container).toHaveTextContent(
            'Your onlyproduct auto-renewal has been cancelled.' +
                "You'll continue to have full access to all your active products until the end of your billing " +
                "cycle on March 15, 2024.If you'd like to reactivate your subscription, please contact us."
        )
        expect(getByText('onlyproduct')).toHaveClass(
            'body-semibold text-capitalize'
        )
    })

    it('should trigger handleContactUs when contact us is clicked', () => {
        const {getByText} = render(
            <ScheduledCancellationSummary
                cancelledProducts={cancelledProducts}
                scheduledToCancelAt={scheduledToCancelAt}
                onContactUs={handleContactUs}
            />
        )

        const contactUsElement = getByText('contact us')
        expect(contactUsElement).toHaveClass('text-primary contactUs')

        fireEvent.click(contactUsElement)
        expect(handleContactUs).toHaveBeenCalledTimes(1)
    })
})
