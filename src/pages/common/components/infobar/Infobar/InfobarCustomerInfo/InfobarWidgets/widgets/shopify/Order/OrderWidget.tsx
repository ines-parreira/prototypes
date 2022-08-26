import React, {
    Component,
    ContextType,
    createContext,
    FunctionComponent,
    ReactNode,
    useContext,
} from 'react'
import {fromJS, Map} from 'immutable'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {
    FulfillmentStatus,
    FinancialStatus,
} from 'constants/integrations/types/shopify'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {DatetimeLabel} from 'pages/common/utils/labels'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import DraftOrderModal from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/DraftOrderModal/DraftOrderModal'
import {StaticField} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/StaticField'
import {InfobarAction} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {ShopifyActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import CancelOrderModal from './CancelOrderModal/CancelOrderModal'
import RefundOrderModal from './RefundOrderModal/RefundOrderModal'
import EditOrderModal from './EditOrderModal/EditOrderModal'
import OrderStatus from './OrderStatus'
import css from './OrderWidgets.less'

export default function OrderWidget() {
    return {
        AfterTitle,
        editionHiddenFields: ['link'],
        TitleWrapper,
        Wrapper,
    }
}

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

class AfterTitle extends Component<AfterTitleProps> {
    static contextType = OrderContext
    context!: ContextType<typeof OrderContext>

    _getActions = () => {
        const {source}: AfterTitleProps = this.props
        const {
            isOrderCancelled,
            isOldOrder,
            isOrderRefunded,
            isOrderFulfilled,
            isOrderPartiallyFulfilled,
        } = this.context
        const actions: Array<InfobarAction> = [
            {
                key: 'duplicate',
                options: [
                    {
                        value: ShopifyActionType.DuplicateOrder,
                        label: 'Duplicate',
                        parameters: [
                            {name: 'order_id', type: 'hidden'},
                            {name: 'draft_order_id', type: 'hidden'},
                            {name: 'payment_pending', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Duplicate order',
                child: (
                    <>
                        <ButtonIconLabel icon="content_copy" /> Duplicate
                    </>
                ),
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
                            {name: 'order_id', type: 'hidden'},
                            {name: 'payload', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Refund order',
                child: (
                    <>
                        <ButtonIconLabel icon="attach_money" /> Refund
                    </>
                ),
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
                            {name: 'order_id', type: 'hidden'},
                            {name: 'payload', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Cancel order',
                child: (
                    <>
                        <ButtonIconLabel icon="block" /> Cancel
                    </>
                ),
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
                            {name: 'edited_order_id', type: 'hidden'},
                            {name: 'note', type: 'hidden'},
                            {name: 'notify', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Edit order',
                child: (
                    <>
                        <ButtonIconLabel icon="mode_edit" /> Edit
                    </>
                ),
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
            (action: InfobarAction) => !removed.includes(action.key)
        )
    }

    render() {
        const {source}: AfterTitleProps = this.props
        const {integrationId} = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        const payload = {
            order_id: (source.get('id') as number) || '',
        }

        return (
            <>
                <ActionButtonsGroup
                    actions={this._getActions()}
                    payload={payload}
                />
                <StaticField label="Created">
                    <DatetimeLabel
                        key="created-at"
                        dateTime={source.get('created_at') as string}
                    />
                </StaticField>
                <StaticField label="Total">
                    <MoneyAmount
                        amount={source.getIn(['current_total_price'])}
                        currencyCode={source.getIn([
                            'total_price_set',
                            'presentment_money',
                            'currency_code',
                        ])}
                    />
                </StaticField>
            </>
        )
    }
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
}
function TitleWrapper({children, source}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration} = useContext(IntegrationContext)
    const {isOrderCancelled} = useContext(OrderContext)
    const shopName: string = integration.getIn(['meta', 'shop_name']) as string

    return (
        <>
            <a
                href={`https://${shopName}.myshopify.com/admin/orders/${(
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
                {children}
            </a>
            <div>
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

const Wrapper: FunctionComponent<{source: Map<string, any>}> = ({
    source: order = fromJS({}) as Map<string, any>,
    children,
}) => {
    const {integration, integrationId} = useContext(IntegrationContext)

    const isCancelled = !!order.get('cancelled_at')
    const isRefunded = order.get('financial_status') === 'refunded'
    const isFulfilled = order.get('fulfillment_status') === 'fulfilled'
    const isPartiallyFulfilled = order.get('fulfillment_status') === 'partial'

    const createdDate = order.get('created_at')
    const orderAge = new Date().getTime() - new Date(createdDate).getTime()
    const isOldOrder = Math.round(orderAge / (1000 * 3600 * 24)) >= 60
    return (
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
    )
}
