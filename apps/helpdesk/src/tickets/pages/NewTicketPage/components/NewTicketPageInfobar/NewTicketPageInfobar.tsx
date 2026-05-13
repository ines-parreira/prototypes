import type { ComponentType } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { SearchAndPreviewCustomersPanel } from '@repo/tickets'
import { getInfobarSectionId } from '@repo/tickets/infobar-sections'

import type { TicketCustomer, TicketTag } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'
import type { Customer } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType as ModelIntegrationType } from 'models/integration/constants'
import { useCustomerProfileActions } from 'pages/common/components/infobar/Infobar/useCustomerProfileActions'
import CustomIntegrationsTabContent from 'pages/tickets/detail/CustomIntegrationsTabContent'
import IntegrationTabContent from 'pages/tickets/detail/IntegrationTabContent'
import {
    InfobarLayoutContainer,
    InfobarLayoutContent,
} from 'pages/tickets/detail/layout/InfobarLayout'
import { useCustomerFilteredIntegrations } from 'pages/tickets/detail/TicketCustomerSections/useCustomerFilteredIntegrations'
import { useTicketInfobarSectionFlags } from 'pages/tickets/detail/TicketCustomerSections/useTicketInfobarSectionFlags'
import { TimelineSidePanel } from 'pages/tickets/detail/TimelineSidePanel'
import WooCommerceTabContent from 'pages/tickets/detail/WooCommerceTabContent'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'
import * as widgetActions from 'state/widgets/actions'
import {
    getSourcesWithCustomer,
    getWidgetsState,
} from 'state/widgets/selectors'
import BigCommerceWidget from 'Widgets/modules/BigCommerce'
import Magento2Widget from 'Widgets/modules/Magento2'
import RechargeWidget from 'Widgets/modules/Recharge'
import SmileWidget from 'Widgets/modules/Smile'
import type { WidgetProps } from 'Widgets/modules/Widget'
import YotpoWidget from 'Widgets/modules/Yotpo'

import { NewTicketPageInfobarCustomerTab } from './NewTicketPageInfobarCustomerTab'
import { NewTicketPageInfobarShopifyTab } from './NewTicketPageInfobarShopifyTab'
import { useNewTicketPageShopifyCustomerData } from './useNewTicketPageShopifyCustomerData'

import css from './NewTicketPageInfobar.module.less'

type NewTicketPageInfobarProps = {
    tags: TicketTag[]
    onTagsChange: (tags: TicketTag[]) => void
    onCustomerChange: (customer: TicketCustomer) => void
    customer: TicketCustomer | null
}

const INTEGRATION_SECTION_CONFIGS: ReadonlyArray<{
    tab: TicketInfobarTab
    integrationType: IntegrationType
    WidgetComponent: ComponentType<WidgetProps>
    flagKey:
        | 'hasRecharge'
        | 'hasBigCommerce'
        | 'hasMagento'
        | 'hasSmile'
        | 'hasYotpo'
}> = [
    {
        tab: TicketInfobarTab.Recharge,
        integrationType: IntegrationType.Recharge,
        WidgetComponent: RechargeWidget,
        flagKey: 'hasRecharge',
    },
    {
        tab: TicketInfobarTab.BigCommerce,
        integrationType: IntegrationType.Bigcommerce,
        WidgetComponent: BigCommerceWidget,
        flagKey: 'hasBigCommerce',
    },
    {
        tab: TicketInfobarTab.Magento,
        integrationType: IntegrationType.Magento2,
        WidgetComponent: Magento2Widget,
        flagKey: 'hasMagento',
    },
    {
        tab: TicketInfobarTab.Smile,
        integrationType: IntegrationType.Smile,
        WidgetComponent: SmileWidget,
        flagKey: 'hasSmile',
    },
    {
        tab: TicketInfobarTab.Yotpo,
        integrationType: IntegrationType.Yotpo,
        WidgetComponent: YotpoWidget,
        flagKey: 'hasYotpo',
    },
]

export function NewTicketPageInfobar({
    tags,
    onTagsChange,
    onCustomerChange,
    customer,
}: NewTicketPageInfobarProps) {
    const dispatch = useAppDispatch()
    const { activeTab, onChangeTab } = useTicketInfobarNavigation()
    const [isSearchAndPreviewPanelOpen, setIsSearchAndPreviewPanelOpen] =
        useState(false)
    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)

    useEffect(() => {
        dispatch(widgetActions.selectContext())
        void dispatch(widgetActions.fetchWidgets())
    }, [dispatch])
    const hasShopifyIntegration = hasIntegrationsOfTypes(
        ModelIntegrationType.Shopify,
    )
    const { data: currentUser } = useGetCurrentUser({
        query: {
            select: (data) => data.data,
        },
    })
    const {
        handleEditCustomer,
        handleSyncToShopify,
        customerProfileActionModals,
    } = useCustomerProfileActions()
    const { associatedShopifyCustomerIds, externalIdMap } =
        useNewTicketPageShopifyCustomerData(customer)

    const sectionFlags = useTicketInfobarSectionFlags()
    const customerFilteredIntegrations = useCustomerFilteredIntegrations()
    const sources = useAppSelector(getSourcesWithCustomer)
    const widgets = useAppSelector(getWidgetsState)

    const handleSetCustomer = useCallback(
        (selectedCustomer: Customer) => {
            onCustomerChange(selectedCustomer as TicketCustomer)
        },
        [onCustomerChange],
    )

    const handleOpenSearchAndPreviewPanel = useCallback(() => {
        setIsSearchAndPreviewPanelOpen(true)
    }, [])

    const handleCloseSearchAndPreviewPanel = useCallback(() => {
        setIsSearchAndPreviewPanelOpen(false)
    }, [])

    const hasSelectedCustomer = customer != null
    const showShopifySection = hasSelectedCustomer && hasShopifyIntegration

    return (
        <InfobarLayoutContainer>
            <InfobarLayoutContent>
                <div className={css.scrollableSections}>
                    <section
                        id={getInfobarSectionId(TicketInfobarTab.Customer)}
                        className={css.section}
                    >
                        <NewTicketPageInfobarCustomerTab
                            tags={tags}
                            customer={customer}
                            hasShopifyIntegration={hasShopifyIntegration}
                            onTagsChange={onTagsChange}
                            onEditCustomer={handleEditCustomer}
                            onSyncToShopify={handleSyncToShopify}
                            onSearchCustomers={handleOpenSearchAndPreviewPanel}
                            onOpenMergePanel={handleOpenSearchAndPreviewPanel}
                        />
                    </section>
                    {showShopifySection && (
                        <section
                            id={getInfobarSectionId(TicketInfobarTab.Shopify)}
                            className={css.section}
                        >
                            <NewTicketPageInfobarShopifyTab
                                customer={customer}
                                associatedShopifyCustomerIds={
                                    associatedShopifyCustomerIds
                                }
                                externalIdMap={externalIdMap}
                                onSyncToShopify={handleSyncToShopify}
                                currentUser={currentUser}
                            />
                        </section>
                    )}
                    {hasSelectedCustomer &&
                        INTEGRATION_SECTION_CONFIGS.map((config) => {
                            if (!sectionFlags[config.flagKey]) return null
                            const matches =
                                customerFilteredIntegrations.get(config.tab) ??
                                []
                            if (matches.length === 0) return null
                            return (
                                <section
                                    key={config.tab}
                                    id={getInfobarSectionId(config.tab)}
                                    className={css.section}
                                >
                                    <IntegrationTabContent
                                        sources={sources}
                                        widgets={widgets}
                                        widgetType={config.integrationType}
                                        sourcePaths={matches.map(
                                            (integration) => [
                                                'ticket',
                                                'customer',
                                                'integrations',
                                                String(integration.id),
                                            ],
                                        )}
                                        WidgetComponent={config.WidgetComponent}
                                        customerId={customer?.id ?? null}
                                    />
                                </section>
                            )
                        })}
                    {hasSelectedCustomer && sectionFlags.hasWooCommerce && (
                        <section
                            id={getInfobarSectionId(
                                TicketInfobarTab.WooCommerce,
                            )}
                            className={css.section}
                        >
                            <WooCommerceTabContent
                                sources={sources}
                                widgets={widgets}
                            />
                        </section>
                    )}
                    {hasSelectedCustomer &&
                        sectionFlags.hasCustomIntegrations && (
                            <section
                                id={getInfobarSectionId(
                                    TicketInfobarTab.CustomIntegrations,
                                )}
                                className={css.section}
                            >
                                <CustomIntegrationsTabContent
                                    sources={sources}
                                    widgets={widgets}
                                    customerId={customer?.id ?? null}
                                />
                            </section>
                        )}
                </div>
                {customer?.id != null && (
                    <TimelineSidePanel
                        isOpen={activeTab === TicketInfobarTab.Timeline}
                        onClose={() => onChangeTab(TicketInfobarTab.Customer)}
                        shopperId={customer.id}
                    />
                )}
                {customerProfileActionModals}
                <SearchAndPreviewCustomersPanel
                    isOpen={isSearchAndPreviewPanelOpen}
                    onClose={handleCloseSearchAndPreviewPanel}
                    onSetCustomer={handleSetCustomer}
                    setCustomerLabel="Select customer"
                />
            </InfobarLayoutContent>
        </InfobarLayoutContainer>
    )
}
