import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<CreateDiscountCodeNode />', () => {
    describe('Basic rendering', () => {
        it('should render a create discount code node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.createDiscountCode(), nodeHelpers.end()],
            })

            expect(
                screen.getByText('Create discount code.'),
            ).toBeInTheDocument()
        })
    })
})
