import { useCallback } from 'react'

import {
    Button,
    ButtonSize,
    ButtonVariant,
    Menu,
    MenuItem,
    MenuSection,
} from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

export interface InfobarTicketCustomerEditCustomerMenuProps {
    customer?: TicketCustomer
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function InfobarTicketCustomerEditCustomerMenu({
    customer,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
}: InfobarTicketCustomerEditCustomerMenuProps) {
    const handleActionSelect = useCallback(
        (action: 'edit' | 'sync') => {
            if (!customer) return

            switch (action) {
                case 'edit':
                    onEditCustomer(customer as TicketCustomer)
                    break
                case 'sync':
                    onSyncToShopify(customer as TicketCustomer)
                    break
            }
        },
        [customer, onEditCustomer, onSyncToShopify],
    )

    return (
        <Menu
            aria-label="Customer actions"
            trigger={
                <Button
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Sm}
                    aria-label="Customer menu"
                    icon="dots-meatballs-horizontal"
                />
            }
            placement="bottom right"
        >
            <MenuSection id="customer-profile-actions">
                <MenuItem
                    label="Edit Customer"
                    leadingSlot="edit-pencil"
                    onAction={() => {
                        handleActionSelect('edit')
                    }}
                />
                {hasShopifyIntegration && (
                    <MenuItem
                        label="Sync profile to Shopify"
                        leadingSlot="app-shopify"
                        onAction={() => {
                            handleActionSelect('sync')
                        }}
                    />
                )}
            </MenuSection>
        </Menu>
    )
}
