import { useState } from 'react'
import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box, Button, Text, toast } from '@gorgias/axiom'

import { CopyableField } from '@repo/ecommerce/shopify/components'

import type { Address } from '../../orders/addressUtils'
import { getAddressParts, getAddressPartsV2 } from '../../orders/addressUtils'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

export type ShippingAddress = Address

export type EditShippingAddressModalRenderProps = {
    isOpen: boolean
    orderId: string
    customerId: string
    integrationId: number | undefined
    currentShippingAddress: Record<string, unknown>
    onClose: () => void
    onSuccess: (newAddress: Record<string, unknown>) => void
}

type Props = {
    shippingAddress: ShippingAddress | null | undefined
    onEdit?: () => void
    orderId?: string
    customerId?: string
    integrationId?: number
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

export function ShippingAddressSection({
    shippingAddress,
    onEdit,
    orderId,
    customerId,
    integrationId,
    renderEditShippingAddressModal,
}: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [shippingAddressOverride, setShippingAddressOverride] = useState<
        ShippingAddress | undefined
    >(undefined)
    const { preferences } = useOrderFieldPreferences()
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)

    const sectionPrefs = preferences.sections.shippingAddress
    if (sectionPrefs?.sectionVisible === false) return null

    if (!shippingAddress) return null

    const displayedAddress = shippingAddressOverride ?? shippingAddress
    const addressParts = hasNewOrdersSidebar
        ? getAddressPartsV2(displayedAddress)
        : getAddressParts(displayedAddress)

    function handleCopyToClipboard() {
        navigator.clipboard.writeText(addressParts.join('\n'))
        toast.success('Address copied to clipboard')
    }

    function handleEditClick() {
        if (renderEditShippingAddressModal) {
            setIsEditModalOpen(true)
        } else {
            onEdit?.()
        }
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
                    Shipping address
                </Text>
                <Box flexDirection="row" gap="xxxs">
                    <Button
                        as="button"
                        icon="copy"
                        intent="regular"
                        variant="tertiary"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        aria-label="Copy to clipboard"
                    />
                    <Button
                        as="button"
                        icon="edit"
                        intent="regular"
                        variant="secondary"
                        onClick={handleEditClick}
                        aria-label="Edit shipping address"
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
            {renderEditShippingAddressModal &&
                renderEditShippingAddressModal({
                    isOpen: isEditModalOpen,
                    orderId: orderId ?? '',
                    customerId: customerId ?? '',
                    integrationId,
                    currentShippingAddress: displayedAddress as Record<
                        string,
                        unknown
                    >,
                    onClose: () => setIsEditModalOpen(false),
                    onSuccess: (newAddress: Record<string, unknown>) => {
                        setShippingAddressOverride({
                            ...displayedAddress,
                            ...newAddress,
                            name: `${newAddress.first_name ?? ''} ${newAddress.last_name ?? ''}`.trim(),
                            province_code: newAddress.province as
                                | string
                                | null
                                | undefined,
                        } as ShippingAddress)
                    },
                })}
        </Box>
    )
}
