import { Link } from 'react-router-dom'

import { Banner, Box, Text } from '@gorgias/axiom'

import { useBillingState } from 'models/billing/queries'

import { ACTIVATE_PAYMENT_WITH_SHOPIFY_URL } from '../../constants'

export const ShopifyBillingInactiveBanner = () => {
    const { data: billingState } = useBillingState()

    const isShopifyBillingInactive =
        billingState?.customer?.shopify_billing &&
        billingState.customer.shopify_billing.subscription_id === null

    if (!isShopifyBillingInactive) {
        return null
    }

    return (
        <Box marginBottom="md" width="100%">
            <Banner
                title="Your Shopify billing integration is inactive."
                variant="fullWidth"
                description="This may cause payment collection issues, please follow the link to activate the integration."
                isClosable={false}
                intent="warning"
                icon="triangle-warning"
            >
                <Link
                    to={ACTIVATE_PAYMENT_WITH_SHOPIFY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Text variant="bold">Activate Billing with Shopify</Text>
                </Link>
            </Banner>
        </Box>
    )
}
