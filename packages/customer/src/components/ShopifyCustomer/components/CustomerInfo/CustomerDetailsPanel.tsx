import type { ReactNode } from 'react'

import { normalizeMetafields } from '@repo/ecommerce/shopify/components'

import { Box, Icon, Text } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import type { ShopperEcommerceData } from '../../types'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { CustomActions, TemplateResolverProvider } from './CustomActions'
import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { CollapsibleFieldSection } from './editPanels/CollapsibleFieldSection'
import { resolveSectionFields } from './fieldDefinitions/resolveSectionFields'
import { MetafieldsSection } from './MetafieldsSection'
import { CustomerDetailsBodySkeleton } from './skeletons/CustomerDetailsBodySkeleton'
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
    isLoadingShopper: boolean
    isLoadingPurchaseSummary: boolean
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
    isLoadingShopper,
    isLoadingPurchaseSummary,
    customerFields,
    context,
    sections,
    ordersListIndex,
    customerId,
    ticketId,
    shopper,
    children,
}: Props) {
    const isLoadingDetails =
        !hasData &&
        (isLoadingShopper ||
            isLoadingPurchaseSummary ||
            isLoadingIntegrations ||
            !!isLoadingTicket)

    return (
        <Box
            flex={1}
            minHeight={0}
            flexDirection="column"
            className={css.customerDetailsPanel}
        >
            <Box flexDirection="column" gap="sm" padding="md">
                <Box
                    marginTop="-8px"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="xs"
                >
                    <Box flexDirection="row" gap="xs">
                        <Icon name="app-shopify" size="md" />
                        <Text size="md" variant="bold">
                            Shopify
                        </Text>
                    </Box>

                    <StorePicker
                        integrations={filteredIntegrations}
                        selectedIntegrationId={selectedIntegration?.id}
                        onChange={onStoreChange}
                        isLoading={isLoadingIntegrations || isLoadingTicket}
                        onSyncProfile={onSyncProfile}
                    />
                </Box>

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
                {isLoadingDetails ? (
                    <CustomerDetailsBodySkeleton />
                ) : hasData ? (
                    <>
                        <Box flexDirection="column" gap="xxs">
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
                        </Box>
                        {sections.map((section) => {
                            const addresses =
                                context.shopper?.data?.addresses ?? []
                            return resolveSectionFields(section, addresses).map(
                                (rs) => (
                                    <CollapsibleFieldSection
                                        key={rs.key}
                                        label={rs.label}
                                        fields={rs.fields}
                                        context={context}
                                    />
                                ),
                            )
                        })}
                    </>
                ) : null}
            </Box>

            {children}
        </Box>
    )
}
