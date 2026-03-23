import type { ReactNode } from 'react'

import { normalizeMetafields } from '@repo/ecommerce/shopify/components'

import { Box } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import type { ShopperEcommerceData } from '../../types'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { CustomActions, TemplateResolverProvider } from './CustomActions'
import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { CollapsibleFieldSection } from './editPanels/CollapsibleFieldSection'
import { createAddressFieldDefinitions } from './fieldDefinitions/addressFieldDefinitions'
import { MetafieldsSection } from './MetafieldsSection'
import type { FieldConfig, FieldRenderContext } from './types'
import type { SectionFieldData } from './widget/useCustomerFieldPreferences'

import css from './CustomerDetailsPanel.module.less'

type Props = {
    filteredIntegrations: Integration[]
    selectedIntegration: Integration | undefined
    isLoadingIntegrations: boolean
    isLoadingTicket?: boolean
    onStoreChange: (integration: Integration) => void
    onSyncProfile?: () => void
    ticketData: { data?: Record<string, unknown> } | undefined
    enrichedCustomer: Record<string, unknown>
    currentUser?: {
        name?: string
        firstname?: string
        lastname?: string
        email?: string
    }
    hasData: boolean
    customerFields: FieldConfig[]
    context: FieldRenderContext
    sections: SectionFieldData[]
    ordersListIndex: string | undefined
    customerId?: number
    ticketId?: string
    shopper: ShopperEcommerceData | undefined
    children?: ReactNode
}

export function CustomerDetailsPanel({
    filteredIntegrations,
    selectedIntegration,
    isLoadingIntegrations,
    isLoadingTicket,
    onStoreChange,
    onSyncProfile,
    ticketData,
    enrichedCustomer,
    currentUser,
    hasData,
    customerFields,
    context,
    sections,
    ordersListIndex,
    customerId,
    ticketId,
    shopper,
    children,
}: Props) {
    return (
        <Box
            flex={1}
            minHeight={0}
            flexDirection="column"
            className={css.customerDetailsPanel}
        >
            <Box flexDirection="column" gap="sm" padding="md">
                <StorePicker
                    integrations={filteredIntegrations}
                    selectedIntegrationId={selectedIntegration?.id}
                    onChange={onStoreChange}
                    isLoading={isLoadingIntegrations || isLoadingTicket}
                    onSyncProfile={onSyncProfile}
                />

                <CustomerLink
                    selectedIntegration={selectedIntegration}
                    shopper={shopper}
                    isLoading={isLoadingIntegrations}
                />
                <TemplateResolverProvider
                    ticket={
                        ticketData?.data as Record<string, unknown> | undefined
                    }
                    customer={
                        enrichedCustomer as Record<string, unknown> | undefined
                    }
                    currentUser={currentUser}
                    variables={{
                        integrationId: selectedIntegration?.id?.toString(),
                        listIndex: ordersListIndex,
                    }}
                >
                    <CustomActions
                        integrationId={selectedIntegration?.id}
                        customerId={customerId}
                        ticketId={ticketId}
                    />
                </TemplateResolverProvider>
                {hasData && (
                    <>
                        <CustomerInfoFieldList
                            fields={customerFields}
                            context={context}
                        />
                        <MetafieldsSection
                            integrationId={selectedIntegration?.id}
                            metafields={normalizeMetafields(
                                shopper?.data?.metafields,
                            )}
                            storeName={selectedIntegration?.name}
                        />
                        {sections.map((section) => {
                            if (section.key === 'addresses') {
                                const addresses =
                                    context.shopper?.data?.addresses ?? []
                                return addresses.map((_, index) => {
                                    const fieldDefs =
                                        createAddressFieldDefinitions(index)
                                    const fields = section.fields
                                        .map((f) => fieldDefs[f.id])
                                        .filter(Boolean)
                                    return (
                                        <CollapsibleFieldSection
                                            key={`address-${index}`}
                                            label="Address"
                                            fields={fields}
                                            context={context}
                                        />
                                    )
                                })
                            }
                            return (
                                <CollapsibleFieldSection
                                    key={section.key}
                                    label={section.label}
                                    fields={section.fields}
                                    context={context}
                                />
                            )
                        })}
                    </>
                )}
            </Box>

            {children}
        </Box>
    )
}
