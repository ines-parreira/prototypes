import { useCallback } from 'react'

import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    ButtonSize,
    ButtonVariant,
    Heading,
    IconName,
    Menu,
    MenuItem,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import css from './InfobarTicketCustomerHeader.less'

export interface InfobarTicketCustomerHeaderProps {
    customer?: TicketCustomer
    onOpenMergePanel?: () => void
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function InfobarTicketCustomerHeader({
    customer,
    onOpenMergePanel,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
}: InfobarTicketCustomerHeaderProps) {
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

    if (!customer) {
        return null
    }

    const customerDisplayName = customer.name || `Customer #${customer.id}`

    return (
        <div className={css.container}>
            <Box justifyContent="space-between" alignItems="center">
                <Link to={`/app/customer/${customer.id}`}>
                    <Heading size="sm">{customerDisplayName}</Heading>
                </Link>
                <Box>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant={ButtonVariant.Tertiary}
                                size={ButtonSize.Sm}
                                aria-label="Merge or switch customer profiles"
                                icon={IconName.ArrowMerging}
                                onClick={onOpenMergePanel}
                            />
                        </TooltipTrigger>
                        <TooltipContent
                            title=" Search for customers to merge or to switch the
                                ticket customer"
                            maxWidth={147}
                        />
                    </Tooltip>
                    <Menu
                        aria-label="Customer actions"
                        trigger={
                            <Button
                                slot="button"
                                variant={ButtonVariant.Tertiary}
                                size={ButtonSize.Sm}
                                aria-label="Customer menu"
                                icon={IconName.DotsMeatballsHorizontal}
                            />
                        }
                        placement="bottom right"
                    >
                        <MenuItem
                            label="Edit Customer"
                            leadingSlot={IconName.EditPencil}
                            onAction={() => {
                                handleActionSelect('edit')
                            }}
                        />
                        {hasShopifyIntegration && (
                            <MenuItem
                                label="Sync profile to Shopify"
                                leadingSlot={IconName.VendorShopifyColored}
                                onAction={() => {
                                    handleActionSelect('sync')
                                }}
                            />
                        )}
                    </Menu>
                </Box>
            </Box>
        </div>
    )
}
