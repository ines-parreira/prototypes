import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

import { normalizeMetafields } from '@repo/ecommerce/shopify/components'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classNames from 'classnames'

import {
    Box,
    Button,
    Icon,
    StickyLayer,
    StickyStack,
    Text,
} from '@gorgias/axiom'
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
    children,
}: Props) {
    const isLoadingDetails =
        !hasData &&
        (isLoadingShopper ||
            isLoadingPurchaseSummary ||
            isLoadingIntegrations ||
            !!isLoadingTicket)

    const addresses = context.shopper?.data?.addresses ?? []
    const resolvedSections = hasData
        ? sections.flatMap((section) =>
              resolveSectionFields(section, addresses),
          )
        : []

    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    const showToggle = hasNewOrdersSidebar

    const [isExpanded, setIsExpanded] = useState(true)
    const toggle = useCallback(() => setIsExpanded((v) => !v), [])

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

            <Box flexDirection="row" alignItems="center" gap="xxs">
                <StorePicker
                    integrations={filteredIntegrations}
                    selectedIntegrationId={selectedIntegration?.id}
                    onChange={onStoreChange}
                    isLoading={isLoadingIntegrations || isLoadingTicket}
                    onSyncProfile={onSyncProfile}
                />
                {showToggle && (
                    <Button
                        as="button"
                        icon={
                            isExpanded
                                ? 'arrow-chevron-up'
                                : 'arrow-chevron-down'
                        }
                        variant="tertiary"
                        size="md"
                        aria-expanded={isExpanded}
                        aria-label={
                            isExpanded ? 'Collapse Shopify' : 'Expand Shopify'
                        }
                        onClick={toggle}
                    />
                )}
            </Box>
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
                            className={css.headerSticky}
                        >
                            {headerContent}
                        </div>
                    )}
                </StickyLayer>
            ) : (
                <div className={css.header}>{headerContent}</div>
            )}

            {(!showToggle || isExpanded) && (
                <>
                    {hasNewOrdersSidebar ? (
                        <>
                            <Box
                                flexDirection="column"
                                gap="sm"
                                pt={0}
                                pb="md"
                                className={css.panelBody}
                            >
                                <div>
                                    <CustomerLink
                                        selectedIntegration={
                                            selectedIntegration
                                        }
                                        shopper={shopper}
                                        isLoading={isLoadingIntegrations}
                                    />
                                </div>

                                <CustomActions
                                    integrationId={selectedIntegration?.id}
                                    customerId={customerId}
                                    ticketId={ticketId}
                                />
                                {isLoadingDetails ? (
                                    <CustomerDetailsBodySkeleton />
                                ) : hasData ? (
                                    <Box flexDirection="column" gap="xxs">
                                        <CustomerInfoFieldList
                                            fields={customerFields}
                                            context={context}
                                        />

                                        <MetafieldsSection
                                            integrationId={
                                                selectedIntegration?.id
                                            }
                                            metafields={normalizeMetafields(
                                                shopper?.data?.metafields,
                                            )}
                                            storeName={
                                                selectedIntegration?.name
                                            }
                                        />
                                    </Box>
                                ) : null}
                            </Box>
                            {hasData &&
                                !isLoadingDetails &&
                                resolvedSections.map((rs) => (
                                    <div key={rs.key}>
                                        <div
                                            className={classNames(
                                                css.sectionSpacer,
                                                css.narrow,
                                            )}
                                        />
                                        <div className={css.sectionContent}>
                                            <CollapsibleFieldSection
                                                label={rs.label}
                                                fields={rs.fields}
                                                context={context}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </>
                    ) : (
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
                                            integrationId={
                                                selectedIntegration?.id
                                            }
                                            metafields={normalizeMetafields(
                                                shopper?.data?.metafields,
                                            )}
                                            storeName={
                                                selectedIntegration?.name
                                            }
                                        />
                                    </Box>
                                    {resolvedSections.map((rs) => (
                                        <CollapsibleFieldSection
                                            key={rs.key}
                                            label={rs.label}
                                            fields={rs.fields}
                                            context={context}
                                        />
                                    ))}
                                </>
                            ) : null}
                        </Box>
                    )}

                    {children}
                </>
            )}
        </Box>
    )

    return hasNewOrdersSidebar ? <StickyStack>{body}</StickyStack> : body
}
