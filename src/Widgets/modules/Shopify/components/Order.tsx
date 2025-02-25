import React, {
    createContext,
    FunctionComponent,
    ReactNode,
    useContext,
    useMemo,
} from 'react'

import { fromJS, Map } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import {
    FinancialStatus,
    FulfillmentStatus,
} from 'constants/integrations/types/shopify'
import useAppSelector from 'hooks/useAppSelector'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import { InfobarAction } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { EditionContext } from 'providers/infobar/EditionContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import DraftOrderModal from 'Widgets/modules/Shopify/modules/DraftOrderModal'
import {
    OrderMetafields,
    OrderStatus,
} from 'Widgets/modules/Shopify/modules/Order'
import CancelOrderModal from 'Widgets/modules/Shopify/modules/Order/modules/CancelOrderModal'
import EditOrderModal from 'Widgets/modules/Shopify/modules/Order/modules/EditOrderModal'
import RefundOrderModal from 'Widgets/modules/Shopify/modules/Order/modules/RefundOrderModal'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'
import { CardCustomization } from 'Widgets/modules/Template/modules/Card/types'
import { CopyButton, StaticField } from 'Widgets/modules/Template/modules/Field'

import { CustomizationContext } from '../../Template'
import { ShopifyContext } from '../contexts/ShopifyContext'
import { getShopifyResourceIds } from '../helpers/getShopifyResourceIds'

import css from './Order.less'

export const OrderContext = createContext<{
    order: Map<string, unknown>
    orderId: number | null
    isOrderCancelled: boolean | null
    isOrderRefunded: boolean | null
    isOrderFulfilled: boolean | null
    isOrderPartiallyFulfilled: boolean | null
    isOldOrder: boolean | null
    integrationId: number | null
    integration: Map<string, unknown>
}>({
    order: fromJS({}),
    orderId: null,
    isOrderCancelled: null,
    isOrderRefunded: null,
    isOrderFulfilled: null,
    isOrderPartiallyFulfilled: null,
    isOldOrder: null,
    integrationId: null,
    integration: fromJS({}),
})

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

export function AfterTitle({ isEditing, source }: AfterTitleProps) {
    const context = useContext(OrderContext)
    const { integrationId } = context
    const { hideActionsForCustomer = false } =
        useContext(CustomizationContext) || {}

    if (isEditing) {
        return null
    }

    if (!integrationId) {
        return null
    }

    const getActions = () => {
        const {
            isOrderCancelled,
            isOldOrder,
            isOrderRefunded,
            isOrderFulfilled,
            isOrderPartiallyFulfilled,
        } = context

        if (hideActionsForCustomer) {
            return []
        }

        const actions: Array<InfobarAction> = [
            {
                key: 'duplicate',
                options: [
                    {
                        value: ShopifyActionType.DuplicateOrder,
                        label: 'Duplicate',
                        parameters: [
                            { name: 'order_id', type: 'hidden' },
                            { name: 'draft_order_id', type: 'hidden' },
                            { name: 'payment_pending', type: 'hidden' },
                        ],
                    },
                ],
                title: 'Duplicate order',
                child: <>Duplicate</>,
                leadingIcon: 'content_copy',
                modal: DraftOrderModal,
                modalData: {
                    actionName: ShopifyActionType.DuplicateOrder,
                    order: source,
                    customer: fromJS({
                        id: source.getIn(['customer', 'id']),
                        admin_graphql_api_id: source.getIn([
                            'customer',
                            'admin_graphql_api_id',
                        ]),
                        email: source.getIn(['customer', 'email']),
                        default_address: source.get('default_address'),
                        currency: source.get('currency'),
                    }),
                },
            },
            {
                key: 'refund',
                options: [
                    {
                        value: ShopifyActionType.RefundOrder,
                        label: 'Refund order',
                        parameters: [
                            { name: 'order_id', type: 'hidden' },
                            { name: 'payload', type: 'hidden' },
                        ],
                    },
                ],
                title: 'Refund order',
                child: <>Refund</>,
                leadingIcon: 'attach_money',
                modal: RefundOrderModal,
                modalData: {
                    actionName: ShopifyActionType.RefundOrder,
                    order: source,
                },
            },
            {
                key: 'cancel',
                options: [
                    {
                        value: ShopifyActionType.CancelOrder,
                        label: 'Cancel order',
                        parameters: [
                            { name: 'order_id', type: 'hidden' },
                            { name: 'payload', type: 'hidden' },
                        ],
                    },
                ],
                title: 'Cancel order',
                child: <>Cancel</>,
                leadingIcon: 'block',
                modal: CancelOrderModal,
                modalData: {
                    actionName: ShopifyActionType.CancelOrder,
                    order: source,
                },
            },
            {
                key: 'edit',
                options: [
                    {
                        value: ShopifyActionType.EditOrder,
                        label: 'Edit',
                        parameters: [
                            { name: 'edited_order_id', type: 'hidden' },
                            { name: 'note', type: 'hidden' },
                            { name: 'notify', type: 'hidden' },
                        ],
                    },
                ],
                title: 'Edit order',
                child: <>Edit</>,
                leadingIcon: 'mode_edit',
                modal: EditOrderModal,
                modalData: {
                    actionName: ShopifyActionType.EditOrder,
                    order: source,
                    customer: fromJS({
                        id: source.getIn(['customer', 'id']),
                        admin_graphql_api_id: source.getIn([
                            'customer',
                            'admin_graphql_api_id',
                        ]),
                        email: source.getIn(['customer', 'email']),
                        currency: source.get('currency'),
                    }),
                },
            },
        ]

        const removed: string[] = []

        if (isOrderCancelled || isOrderFulfilled || isOrderPartiallyFulfilled) {
            removed.push('cancel')
        }

        if (isOrderCancelled || isOldOrder) {
            removed.push('edit')
        }

        if (isOrderRefunded) {
            removed.push('refund')
        }

        // remove removed actions from list of available actions
        return actions.filter(
            (action: InfobarAction) => !removed.includes(action.key),
        )
    }

    const payload = {
        order_id: (source.get('id') as number) || '',
    }

    return (
        <>
            <ActionButtonsGroup actions={getActions()} payload={payload} />
            <StaticField label="Created">
                <DatetimeLabel
                    key="created-at"
                    dateTime={source.get('created_at') as string}
                />
            </StaticField>
            <StaticField label="Total">
                <MoneyAmount
                    amount={source.getIn([
                        'current_total_price_set',
                        'shop_money',
                        'amount',
                    ])}
                    currencyCode={source.getIn([
                        'current_total_price_set',
                        'shop_money',
                        'currency_code',
                    ])}
                />
            </StaticField>
        </>
    )
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
}
function TitleWrapper({ children, source }: TitleWrapperProps) {
    const { isEditing } = useContext(EditionContext)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { integration } = useContext(IntegrationContext)
    const { isOrderCancelled } = useContext(OrderContext)
    const shopName: string = integration.getIn(['meta', 'shop_name']) as string

    return (
        <>
            <div className={css.orderTitleContainer}>
                <a
                    href={`${shopifyAdminBaseUrl(shopName)}/orders/${(
                        (source.get('id') as number) || ''
                    ).toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        logEvent(SegmentEvent.ShopifyOrderClicked, {
                            account_domain: currentAccount.get('domain'),
                        })
                    }}
                    className={css.orderTitle}
                >
                    <>{children}</>
                </a>
                {!isEditing && (
                    <span className={css.copyButton}>
                        <CopyButton
                            value={source.get('name')}
                            onCopyMessage="Order Number copied to clipboard"
                        />
                    </span>
                )}
            </div>
            <div className={css.orderStatus}>
                <OrderStatus
                    fulfillmentStatus={
                        source.get('fulfillment_status') as FulfillmentStatus
                    }
                    financialStatus={
                        source.get('financial_status') as FinancialStatus
                    }
                    isCancelled={!!isOrderCancelled}
                />
            </div>
        </>
    )
}

export const Wrapper: FunctionComponent<{ source: Map<string, any> }> = ({
    source: order = fromJS({}) as Map<string, any>,
    children,
}) => {
    const { integration, integrationId } = useContext(IntegrationContext)

    const isCancelled = !!order.get('cancelled_at')
    const isRefunded = ['refunded', 'voided'].includes(
        order.get('financial_status'),
    )
    const isFulfilled = order.get('fulfillment_status') === 'fulfilled'
    const isPartiallyFulfilled = order.get('fulfillment_status') === 'partial'

    const createdDate = order.get('created_at')
    const orderAge = new Date().getTime() - new Date(createdDate).getTime()
    const isOldOrder = Math.round(orderAge / (1000 * 3600 * 24)) >= 60
    const { target_id, customer_id } = getShopifyResourceIds(order.toJS())
    const shopifyContextData = useMemo(
        () => ({
            data_source: 'Order' as const,
            widget_resource_ids: {
                target_id,
                customer_id,
            },
        }),
        [target_id, customer_id],
    )
    return (
        <ShopifyContext.Provider value={shopifyContextData}>
            <OrderContext.Provider
                value={{
                    order,
                    orderId: order.get('id'),
                    isOrderCancelled: isCancelled,
                    isOldOrder: isOldOrder,
                    isOrderRefunded: isRefunded,
                    isOrderFulfilled: isFulfilled,
                    isOrderPartiallyFulfilled: isPartiallyFulfilled,
                    integrationId,
                    integration,
                }}
            >
                {children}
            </OrderContext.Provider>
        </ShopifyContext.Provider>
    )
}

type AfterContentProps = {
    isEditing: boolean
}

export function AfterContent({ isEditing }: AfterContentProps) {
    const orderContext = useContext(OrderContext)
    const integrationContext = useContext(IntegrationContext)
    return !isEditing ? (
        <OrderMetafields
            orderId={orderContext.orderId as number}
            integrationId={integrationContext.integrationId as number}
        />
    ) : null
}

export const orderCustomization: CardCustomization = {
    AfterTitle,
    editionHiddenFields: ['link'],
    TitleWrapper,
    Wrapper,
    AfterContent,
}
