import type { ReactNode } from 'react'
import React, { useContext, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import logo from 'assets/img/infobar/shopify.svg'
import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import type { InfobarAction } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'
import type { RootState } from 'state/types'
import DraftOrderModal from 'Widgets/modules/Shopify/modules/DraftOrderModal'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'
import {
    CardHeaderIcon,
    CardHeaderSubtitle,
    CardHeaderTitle,
    ExpandAllButton,
} from 'Widgets/modules/Template/modules/Card'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card/types'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import { CustomizationContext } from '../../Template'
import { ShopifyContext } from '../contexts/ShopifyContext'
import { getShopifyResourceIds } from '../helpers/getShopifyResourceIds'
import { getMetafieldsFromSource } from '../modules/Metafields/helpers/getMetafieldsFromSource'
import CustomerMetafieldsSection from './CustomerMetafieldsSection'

function Wrapper({
    source,
    children,
}: {
    source: Map<any, any>
    children: ReactNode
}) {
    const { target_id, customer_id } = getShopifyResourceIds(source.toJS())
    const shopifyContextData = useMemo(
        () => ({
            data_source: 'Customer' as const,
            widget_resource_ids: {
                target_id,
                customer_id,
            },
        }),
        [target_id, customer_id],
    )
    return (
        <ShopifyContext.Provider value={shopifyContextData}>
            {children}
        </ShopifyContext.Provider>
    )
}

type AfterTitleProps = {
    source: Map<any, any>
    isEditing: boolean
}

const AfterTitleContainer = ({
    source,
    integrations,
    isEditing,
}: AfterTitleProps & ConnectedProps<typeof connector>) => {
    const { integration } = useContext(IntegrationContext)
    const { hideActionsForCustomer = false } =
        useContext(CustomizationContext) || {}
    const actions: Array<InfobarAction> = [
        {
            key: 'createOrder',
            options: [
                {
                    value: ShopifyActionType.CreateOrder,
                    label: 'Create order',
                    parameters: [
                        { name: 'draft_order_id', type: 'hidden' },
                        { name: 'payment_pending', type: 'hidden' },
                    ],
                },
            ],
            title: 'Create order',
            child: <>Create order</>,
            leadingIcon: 'add',
            modal: DraftOrderModal,
            modalData: {
                actionName: ShopifyActionType.CreateOrder,
                customer: fromJS({
                    id: source.get('id'),
                    admin_graphql_api_id: source.get('admin_graphql_api_id'),
                    email: source.get('email'),
                    default_address: source.get('default_address'),
                    currency: source.get('currency'),
                }),
            },
        },
    ]

    const getActions = () => {
        if (hideActionsForCustomer) {
            return []
        }

        return actions
    }
    const shopName: string = integration.getIn(['meta', 'shop_name'])
    const payload = {
        customer_id: source.get('id'),
    }

    return (
        <>
            <ActionButtonsGroup actions={getActions()} payload={payload} />
            <StaticField label="Total spent">
                <MoneyAmount
                    amount={source.get('total_spent')}
                    currencyCode={integration.getIn(['meta', 'currency'])}
                />
            </StaticField>
            <StaticField label="Orders">
                {source.get('orders_count')}
            </StaticField>
            {integrations.length > 1 && (
                <StaticField label="Store">{shopName}</StaticField>
            )}
            <CustomerMetafieldsSection
                metafields={getMetafieldsFromSource(source)}
                isEditing={isEditing}
            />
        </>
    )
}

const connector = connect((state: RootState) => ({
    integrations:
        integrationsSelectors.getIntegrationsByType<ShopifyIntegration>(
            IntegrationType.Shopify,
        )(state),
}))

const AfterTitle = connector(AfterTitleContainer)

type TitleWrapperProps = {
    children: ReactNode
    source: Map<any, any>
    isEditing: boolean
}

function TitleWrapper({ children, source, isEditing }: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { integration } = useContext(IntegrationContext)
    const shopName: string = integration.getIn(['meta', 'shop_name'])
    const href = `${shopifyAdminBaseUrl(shopName)}/customers/${(
        (source.get('id') as string) || ''
    ).toString()}`

    return (
        <>
            {!isEditing && <ExpandAllButton />}
            <CardHeaderTitle>
                <CardHeaderIcon src={logo} alt="Shopify" />
                Shopify
                <CardHeaderSubtitle>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            logEvent(SegmentEvent.ShopifyProfileClicked, {
                                account_domain: currentAccount.get('domain'),
                            })
                        }}
                    >
                        {children}
                    </a>
                </CardHeaderSubtitle>
            </CardHeaderTitle>
        </>
    )
}

export const customerCustomization: CardCustomization = {
    editionHiddenFields: ['link'],
    TitleWrapper,
    AfterTitle,
    Wrapper,
}
