import { screen, waitFor } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<CancelOrderNode />', () => {
    describe('Basic rendering', () => {
        it('should render a cancel order node', async () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [nodeHelpers.cancelOrder(), nodeHelpers.end()],
            })

            await waitFor(() => {
                expect(screen.getByText('Cancel order.')).toBeInTheDocument()
            })
        })
    })
})
