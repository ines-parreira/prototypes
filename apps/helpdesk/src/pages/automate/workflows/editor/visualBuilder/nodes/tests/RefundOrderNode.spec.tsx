import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<RefundOrderNode />', () => {
    describe('Basic rendering', () => {
        it('should render a refund order node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.refundOrder(), nodeHelpers.end()],
            })

            expect(screen.getAllByText('Refund order.').length).toBeGreaterThan(
                0,
            )
        })
    })
})
