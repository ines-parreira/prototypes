import type { ReactNode } from 'react'

import { normalizeMetafields } from '@repo/ecommerce/shopify/components'

import { Box, Icon, StickyLayer, StickyStack, Text } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import type { ShopperEcommerceData } from '../../types'
import { CustomerLink } from '../CustomerLink'
import { StorePicker } from '../StorePicker'
import { CustomActions } from './CustomActions'
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
    hasData: boolean
    isLoadingShopper: boolean
    isLoadingPurchaseSummary: boolean
    customerFields: FieldConfig[]
    context: FieldRenderContext
    sections: SectionFieldData[]
    customerId?: number
    ticketId?: string
    shopper: ShopperEcommerceData | undefined
    hasNewOrdersSidebar?: boolean
    children?: ReactNode
}

export function CustomerDetailsPanel({
    filteredIntegrations,
    selectedIntegration,
    isLoadingIntegrations,
    isLoadingTicket,
    onStoreChange,
    onSyncProfile,
    hasData,
    isLoadingShopper,
    isLoadingPurchaseSummary,
    customerFields,
    context,
    sections,
    customerId,
    ticketId,
    shopper,
    hasNewOrdersSidebar,
    children,
}: Props) {
    const isLoadingDetails =
        !hasData &&
        (isLoadingShopper ||
            isLoadingPurchaseSummary ||
            isLoadingIntegrations ||
            !!isLoadingTicket)

    const headerContent = (
        <Box
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
    )

    const body = (
        <Box
            flex={1}
            minHeight={0}
            flexDirection="column"
            className={css.customerDetailsPanel}
        >
            {hasNewOrdersSidebar ? (
                <StickyLayer group="shopify-header">
                    {({ ref, stickyProps }) => (
                        <div
                            ref={ref}
                            {...stickyProps}
                            className={`${css.header} ${css.headerSticky}`}
                        >
                            {headerContent}
                        </div>
                    )}
                </StickyLayer>
            ) : (
                <div className={css.header}>{headerContent}</div>
            )}

            <Box flexDirection="column" gap="sm" padding="md">
                <CustomerLink
                    selectedIntegration={selectedIntegration}
                    shopper={shopper}
                    isLoading={isLoadingIntegrations}
                />
                <CustomActions
                    integrationId={selectedIntegration?.id}
                    customerId={customerId}
                    ticketId={ticketId}
                />
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

    return hasNewOrdersSidebar ? <StickyStack>{body}</StickyStack> : body
}
