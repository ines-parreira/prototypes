import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box, Button, Text, toast } from '@gorgias/axiom'

import { CopyableField } from '@repo/ecommerce/shopify/components'

import type { Address } from '../../orders/addressUtils'
import { getAddressParts, getAddressPartsV2 } from '../../orders/addressUtils'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

type Props = {
    billingAddress: Address | null | undefined
}

export function BillingAddressSection({ billingAddress }: Props) {
    const { preferences } = useOrderFieldPreferences()
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)

    const sectionPrefs = preferences.sections.billingAddress
    if (sectionPrefs?.sectionVisible === false) return null

    if (!billingAddress) return null

    const addressParts = hasNewOrdersSidebar
        ? getAddressPartsV2(billingAddress)
        : getAddressParts(billingAddress)

    function handleCopyToClipboard() {
        navigator.clipboard.writeText(addressParts.join('\n'))
        toast.success('Address copied to clipboard')
    }

    return (
        <Box display="block" pt="sm" pb="sm">
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
                        variant="tertiary"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        aria-label="Copy billing address to clipboard"
                    />
                </Box>
            </Box>
            {addressParts.map((part, index) => (
                <CopyableField
                    key={index}
                    value={part}
                    ariaLabel="Copy"
                    alignCenter
                >
                    <Text size="md">{part}</Text>
                </CopyableField>
            ))}
        </Box>
    )
}
