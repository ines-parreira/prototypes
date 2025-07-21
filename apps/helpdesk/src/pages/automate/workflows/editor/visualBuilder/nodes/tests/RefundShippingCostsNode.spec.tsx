import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<RefundShippingCostsNode />', () => {
    describe('Basic rendering', () => {
        it('should render a refund shipping costs node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.refundShippingCosts(), nodeHelpers.end()],
            })

            expect(
                screen.getByText('Refund shipping costs.'),
            ).toBeInTheDocument()
        })
    })
})
