import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<ShopperAuthenticationNode />', () => {
    describe('Basic rendering', () => {
        it('should render a shopper authentication node', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [nodeHelpers.shopperAuthentication(), nodeHelpers.end()],
            })

            expect(
                screen.getByText('Confirm customer identity'),
            ).toBeInTheDocument()
        })
    })
})
