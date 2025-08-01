import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { HELPDESK_CANCELLATION_SCENARIO } from '../../scenarios'
import Feature from '../../UI/Feature'
import ProductFeaturesFOMO from '../ProductFeaturesFOMO'

jest.mock('../../UI/Feature', () =>
    jest.fn(() => <div data-testid="feature"></div>),
)
const MockFeature = assumeMock(Feature)

describe('ProductFeaturesFOMO', () => {
    it('renders with given Helpdesk features and period end', () => {
        const { getAllByTestId, getByText, container } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={HELPDESK_CANCELLATION_SCENARIO.features}
            />,
        )

        expect(container).toHaveTextContent(
            "Please be aware that by opting out of Helpdesk's auto-renewal, you're also discontinuing it " +
                "for any other products you're currently using. You'll continue to have full access " +
                'to all your active products until the end of your billing cycle on February 14, 2024. ' +
                "Here's what you'll lose after that date:",
        )
        const periodEndText = getByText('February 14, 2024')
        expect(periodEndText).toHaveClass('body-semibold')

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(
            HELPDESK_CANCELLATION_SCENARIO.features.length,
        )
        HELPDESK_CANCELLATION_SCENARIO.features.forEach((feature, index) => {
            expect(MockFeature).toHaveBeenNthCalledWith(index + 1, feature, {})
        })
    })
})
