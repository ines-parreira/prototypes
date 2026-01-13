import { Box } from '@gorgias/axiom'

import { CustomerInfo } from './components/CustomerInfo'

export function ShopifyCustomer() {
    return (
        <Box padding="sm" flexDirection="column">
            <CustomerInfo />
        </Box>
    )
}
