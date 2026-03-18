import React, { useContext } from 'react'

import { Box, Button, Text } from '@gorgias/axiom'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../ShopifyCustomerContext'
import { useOrderFieldPreferences } from './useOrderFieldPreferences'

import css from './OrderSidePanelPreview.less'

type BillingAddress = {
    name?: string
    address1?: string | null
    address2?: string | null
    city?: string | null
    province_code?: string | null
    country_code?: string
    country?: string | null
    zip?: string | null
}

type BillingAddressSectionProps = {
    billingAddress: BillingAddress | null | undefined
}

function getBillingAddressParts(address: BillingAddress): string[] {
    const cityLine =
        [address.city, address.province_code].filter(Boolean).join(', ') + ','

    return [
        address.name,
        address.address1 ? `${address.address1},` : null,
        address.address2 ? `${address.address2},` : null,
        cityLine,
        `${address.country_code ?? address.country ?? ''} ${address.zip ?? ''}`.trim(),
    ].filter(Boolean) as string[]
}

export function BillingAddressSection({
    billingAddress,
}: BillingAddressSectionProps) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)
    const { preferences } = useOrderFieldPreferences()

    const sectionPrefs = preferences.sections.billingAddress
    if (sectionPrefs?.sectionVisible === false) return null

    if (!billingAddress) return null

    const addressParts = getBillingAddressParts(billingAddress)

    function handleCopyToClipboard() {
        navigator.clipboard.writeText(addressParts.join('\n'))
        dispatchNotification({
            status: NotificationStatus.Success,
            message: 'Address copied to clipboard',
        })
    }

    return (
        <Box className={css.section} p="sm" display="block">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mb="xs"
            >
                <Text size="md" variant="bold">
                    Billing address
                </Text>
                <Box flexDirection="row" gap="xxxs">
                    <Button
                        as="button"
                        icon="copy"
                        intent="regular"
                        size="sm"
                        variant="tertiary"
                        onClick={handleCopyToClipboard}
                        aria-label="Copy billing address to clipboard"
                    />
                </Box>
            </Box>
            {addressParts.map((part, index) => (
                <React.Fragment key={index}>
                    <Text size="md">{part}</Text>
                    <br />
                </React.Fragment>
            ))}
        </Box>
    )
}
