import { useMemo } from 'react'

import { Box, Button, ButtonSize, Skeleton } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import type { ShopperEcommerceData } from '../../types'

type Props = {
    selectedIntegration: Integration | undefined
    shopper: ShopperEcommerceData | undefined
    isLoading: boolean
}

export function CustomerLink({
    selectedIntegration,
    shopper,
    isLoading,
}: Props) {
    const firstName = shopper?.data?.first_name
    const lastName = shopper?.data?.last_name

    const shopifyCustomerUrl = useMemo(() => {
        const shopName = (
            selectedIntegration?.meta as { shop_name?: string } | undefined
        )?.shop_name
        const customerId = shopper?.data?.id
        if (!shopName || !customerId) return undefined
        return `https://admin.shopify.com/store/${shopName}/customers/${customerId}`
    }, [selectedIntegration?.meta, shopper?.data?.id])

    const displayName = [firstName, lastName].filter(Boolean).join(' ')

    if (isLoading) {
        return <Skeleton />
    }

    return (
        <Box>
            <Button
                as="a"
                href={shopifyCustomerUrl}
                target="_blank"
                rel="noopener noreferrer"
                trailingSlot="external-link"
                variant="tertiary"
                size={ButtonSize.Sm}
            >
                {displayName || 'View in Shopify'}
            </Button>
        </Box>
    )
}
