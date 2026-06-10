import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react'

import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2MS2Flag,
} from '@repo/feature-flags'
import {
    EditFieldsType,
    TicketInfobarTab,
    useTicketInfobarNavigation,
} from '@repo/navigation'
import { getInfobarSectionId } from '@repo/tickets/infobar-sections'
import classNames from 'classnames'
import type { Map as ImmutableMap } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import Infobar from 'pages/common/components/infobar/Infobar/Infobar'
import CustomIntegrationsTabContent from 'pages/tickets/detail/CustomIntegrationsTabContent'
import IntegrationTabContent from 'pages/tickets/detail/IntegrationTabContent'
import WooCommerceTabContent from 'pages/tickets/detail/WooCommerceTabContent'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import BigCommerceWidget from 'Widgets/modules/BigCommerce'
import Magento2Widget from 'Widgets/modules/Magento2'
import RechargeWidget from 'Widgets/modules/Recharge'
import SmileWidget from 'Widgets/modules/Smile'
import type { WidgetProps } from 'Widgets/modules/Widget'
import YotpoWidget from 'Widgets/modules/Yotpo'

import type { useCreateOrder } from '../hooks/useCreateOrder'
import { ShopifyInfobarSection } from './ShopifyInfobarSection'
import { useCustomerFilteredIntegrations } from './useCustomerFilteredIntegrations'
import { useTicketInfobarSectionFlags } from './useTicketInfobarSectionFlags'

import css from '../TicketInfobarContainer.less'

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

type CurrentUser = {
    name: string
    firstname: string
    lastname: string
    email: string
}

type Props = {
    sources: ImmutableMap<string, unknown>
    widgets: WidgetsState
    customer: ImmutableMap<string, unknown>
    identifier: string
    isEditingWidgets: boolean
    isOnNewLayout?: boolean
    customerId: number | null
    currentUser: CurrentUser
    createOrder: ReturnType<typeof useCreateOrder>
    handleSyncProfile: () => void
    renderEditShippingAddressModal: (
        props: EditShippingAddressModalRenderProps,
    ) => React.ReactNode
    isCustomerSyncFormOpen: boolean
    setIsCustomerSyncFormOpen: Dispatch<SetStateAction<boolean>>
}

export function TicketCustomerSections({
    sources,
    widgets,
    customer,
    identifier,
    isEditingWidgets,
    isOnNewLayout,
    customerId,
    currentUser,
    createOrder,
    handleSyncProfile,
    renderEditShippingAddressModal,
    isCustomerSyncFormOpen,
    setIsCustomerSyncFormOpen,
}: Props) {
    const hasUIVisionMS2 = useHelpdeskV2MS2Flag()
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    const flags = useTicketInfobarSectionFlags()
    const customerFilteredIntegrations = useCustomerFilteredIntegrations()
    const { activeTab, editingWidgetType } = useTicketInfobarNavigation()
    const isEditMode = editingWidgetType != null

    const sectionsByTab = new Map<TicketInfobarTab, ReactNode>()

    sectionsByTab.set(
        TicketInfobarTab.Customer,
        <section
            key={TicketInfobarTab.Customer}
            id={getInfobarSectionId(TicketInfobarTab.Customer)}
            className={css.section}
        >
            <Infobar
                sources={sources}
                isRouteEditingWidgets={isEditingWidgets}
                identifier={identifier}
                customer={customer}
                widgets={widgets}
                context={WidgetEnvironment.Ticket}
                isOnNewLayout={isOnNewLayout}
            />
        </section>,
    )

    if (hasUIVisionMS2 && flags.hasShopify) {
        sectionsByTab.set(
            TicketInfobarTab.Shopify,
            <section
                key={TicketInfobarTab.Shopify}
                id={getInfobarSectionId(TicketInfobarTab.Shopify)}
                className={css.section}
            >
                <ShopifyInfobarSection
                    customer={customer}
                    customerId={customerId}
                    currentUser={currentUser}
                    createOrder={createOrder}
                    handleSyncProfile={handleSyncProfile}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                    isCustomerSyncFormOpen={isCustomerSyncFormOpen}
                    setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                />
            </section>,
        )
    }

    if (hasUIVisionMS2) {
        for (const config of INTEGRATION_SECTION_CONFIGS) {
            if (!flags[config.flagKey]) continue
            const matches = customerFilteredIntegrations.get(config.tab) ?? []
            if (matches.length === 0) continue
            sectionsByTab.set(
                config.tab,
                <section
                    key={config.tab}
                    id={getInfobarSectionId(config.tab)}
                    className={css.section}
                >
                    <IntegrationTabContent
                        sources={sources}
                        widgets={widgets}
                        widgetType={config.integrationType}
                        sourcePaths={matches.map((integration) => [
                            'ticket',
                            'customer',
                            'integrations',
                            String(integration.id),
                        ])}
                        WidgetComponent={config.WidgetComponent}
                        customerId={customerId}
                    />
                </section>,
            )
        }
    }

    if (hasUIVisionMS2 && flags.hasWooCommerce) {
        sectionsByTab.set(
            TicketInfobarTab.WooCommerce,
            <section
                key={TicketInfobarTab.WooCommerce}
                id={getInfobarSectionId(TicketInfobarTab.WooCommerce)}
                className={css.section}
            >
                <WooCommerceTabContent sources={sources} widgets={widgets} />
            </section>,
        )
    }

    const shouldRenderCustomIntegrations =
        hasUIVisionMS2 &&
        (flags.hasCustomIntegrations ||
            editingWidgetType === EditFieldsType.Custom)

    if (shouldRenderCustomIntegrations) {
        sectionsByTab.set(
            TicketInfobarTab.CustomIntegrations,
            <section
                key={TicketInfobarTab.CustomIntegrations}
                id={getInfobarSectionId(TicketInfobarTab.CustomIntegrations)}
                className={css.section}
            >
                <CustomIntegrationsTabContent
                    sources={sources}
                    widgets={widgets}
                    customerId={customerId}
                />
            </section>,
        )
    }

    const customerSection = sectionsByTab.get(TicketInfobarTab.Customer)
    const sectionsWithSpacers = Array.from(sectionsByTab.values()).flatMap(
        (section, i) =>
            i === 0
                ? [section]
                : [
                      <div key={`spacer-${i}`} className={css.sectionSpacer} />,
                      section,
                  ],
    )
    const renderedSections = isEditMode
        ? (sectionsByTab.get(activeTab) ?? customerSection)
        : sectionsWithSpacers

    return (
        <div
            className={classNames(css.scrollableSections, {
                [css.editMode]: isEditMode,
                [css.newOrdersSidebar]: hasNewOrdersSidebar,
            })}
        >
            {renderedSections}
        </div>
    )
}
