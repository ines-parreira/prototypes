import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<CancelSubscriptionNode />', () => {
    describe('Basic rendering', () => {
        it('should render a cancel subscription node', () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.cancelSubscription(), nodeHelpers.end()],
            })

            expect(
                screen.getByText('Cancel active subscription.'),
            ).toBeInTheDocument()
        })
    })
})
