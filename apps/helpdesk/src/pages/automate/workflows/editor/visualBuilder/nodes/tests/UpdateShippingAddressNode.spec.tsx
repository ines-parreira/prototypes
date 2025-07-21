import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<UpdateShippingAddressNode />', () => {
    describe('Basic rendering', () => {
        it('should render an update shipping address node', async () => {
            renderVisualBuilder({
                builderType: 'actions',
                nodes: [
                    nodeHelpers.updateShippingAddress(
                        'update_shipping_address',
                    ),
                ],
            })

            expect(
                screen.getByText('Edit order shipping address.'),
            ).toBeInTheDocument()
        })
    })
})
