import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    STORE_MANAGEMENT_PATH,
} from '@repo/billing'
import { Link } from 'react-router-dom'

import { Banner, Box, Text } from '@gorgias/axiom'

import { useBillingState } from 'models/billing/queries'
import { SubscriptionStatus } from 'models/billing/types'

export const ShopifyBillingInactiveBanner = () => {
    const { data: billingState } = useBillingState()

    const isShopifyBillingInactive =
        billingState?.customer?.shopify_billing &&
        billingState?.customer?.shopify_billing.subscription_id === null

    const isPastDue =
        billingState?.subscription?.status === SubscriptionStatus.PAST_DUE

    if (!isShopifyBillingInactive) {
        return null
    }

    if (isPastDue) {
        return (
            <Box marginBottom="md" width="100%">
                <Banner
                    title="Subscription payment past due"
                    variant="fullWidth"
                    description="Your payment is overdue because your Shopify billing integration is inactive. Please activate it in Store Management to resume payment collection and avoid service interruption."
                    isClosable={false}
                    intent="warning"
                    icon="triangle-warning"
                >
                    <Link
                        to={STORE_MANAGEMENT_PATH}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Text variant="bold">Go to Store Management</Text>
                    </Link>
                </Banner>
            </Box>
        )
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
