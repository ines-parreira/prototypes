import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<OrderLineItemSelectionNode />', () => {
    describe('Basic rendering', () => {
        it('should render an order line item selection node with content', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.orderLineItemSelection(
                        'Select items to return',
                    ),
                    nodeHelpers.end(),
                ],
            })

            expect(
                screen.getByText('Select items to return'),
            ).toBeInTheDocument()
        })
    })
})
