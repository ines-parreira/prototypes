import { screen, waitFor } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<SkipChargeNode />', () => {
    describe('Basic rendering', () => {
        it('should render a skip charge node', async () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [
                    nodeHelpers.skipCharge('skip1'),
                    nodeHelpers.end('end'),
                ],
            })

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Skip next shipment of an ongoing subscription.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
