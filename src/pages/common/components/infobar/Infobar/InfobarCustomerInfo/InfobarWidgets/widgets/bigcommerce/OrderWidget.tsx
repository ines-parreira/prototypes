import React, {ReactNode, useContext, useState} from 'react'
import {Map} from 'immutable'
import copy from 'copy-to-clipboard'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {logEvent, SegmentEvent} from 'common/segment'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'
import {humanizeString} from 'utils'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {BIGCOMMERCE_INTEGRATION_TYPE} from 'constants/integration'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {DatetimeLabel} from 'pages/common/utils/labels'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import StaticField from 'infobar/components/StaticField'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {getBigCommerceDraftOrderUrl} from 'models/integration/resources/bigcommerce'
import Tooltip from 'pages/common/components/Tooltip'
import {getCustomersState} from 'state/customers/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import Loader from 'pages/common/components/Loader/Loader'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import {InfobarAction} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {BigCommerceActionType} from 'models/integration/types/index'
import {FeatureFlagKey} from 'config/featureFlags'
import css from './OrderWidget.less'
import {CustomStaticField} from './CustomStaticField'
import OrderModalRenderWrapper from './AddOrderModal/OrderModal'
import RefundOrderModalRenderWrapper from './RefundOrderModal/RefundOrderModal'
import {isOrderFullyRefunded} from './RefundOrderModal/utils'

export default function OrderWidget() {
    return {
        AfterTitle,
        TitleWrapper,
    }
}

type GenerateDraftOrderUrlProps = {
    integrationId: number
    cartId: string
    customerId: number
    setDraftOrderUrl: (draftOrderUrl: string) => void
    setIsRefreshCooldown: (state: boolean) => void
    setIsLoadingGenerate: (state: boolean) => void
    dispatch: StoreDispatch
}

async function generateDraftOrderUrl({
    integrationId,
    cartId,
    customerId,
    setDraftOrderUrl,
    setIsRefreshCooldown,
    setIsLoadingGenerate,
    dispatch,
}: GenerateDraftOrderUrlProps) {
    setIsLoadingGenerate(true)
    const draftOrderUrl = await getBigCommerceDraftOrderUrl({
        integrationId,
        cartId,
        customerId,
    })
    setIsLoadingGenerate(false)
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            title: 'New URL has been successfully generated.',
        })
    )
    setDraftOrderUrl(draftOrderUrl)
    copy(draftOrderUrl)
    setIsRefreshCooldown(true)
    setTimeout(() => {
        setIsRefreshCooldown(false)
    }, 2000)
}

type WidgetIconProps = {
    id: string
    icon: string
    tooltipMessage: string
    onClick?: () => void
    className?: string
}

function WidgetIcon({
    id,
    icon,
    tooltipMessage,
    onClick,
    className,
}: WidgetIconProps) {
    return (
        <>
            <div className={className ? className : css.icon}>
                <i className="material-icons" id={id} onClick={onClick}>
                    {icon}
                </i>
                {tooltipMessage && (
                    <Tooltip placement="top" target={id} autohide={true}>
                        {tooltipMessage}
                    </Tooltip>
                )}
            </div>
        </>
    )
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<any, any>
}

export function AfterTitle({isEditing, source}: AfterTitleProps) {
    const dispatch = useAppDispatch()
    const {integrationId} = useContext(IntegrationContext)
    const bigcommerceRefundOrderAccessFlags =
        useFlags()[FeatureFlagKey.BigCommerceRefundOrder]
    const [draftOrderUrl, setDraftOrderUrl] = useState(
        source.get('draft_order_url') || ''
    )
    const [isRefreshCooldown, setIsRefreshCooldown] = useState(false)
    const [isLoadingGenerate, setIsLoadingGenerate] = useState(false)
    const customer = useAppSelector(getCustomersState).get('active')
    if (!customer) {
        return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const customerId = customer.get('id')

    if (isEditing || !integrationId) {
        return null
    }
    const cartId = source.get('cart_id')

    const orderPayload = {
        order_id: (source.get('id') as number) || '',
    }

    const getActions = () => {
        const actions: Array<InfobarAction> = [
            {
                key: 'duplicate',
                options: [
                    {
                        value: BigCommerceActionType.DuplicateOrder,
                        label: 'Duplicate',
                        parameters: [
                            {name: 'bigcommerce_checkout_id', type: 'hidden'},
                            {name: 'bigcommerce_order_payload', type: 'hidden'},
                            {
                                name: 'bigcommerce_draft_order_url',
                                type: 'hidden',
                            },
                        ],
                    },
                ],
                title: 'Duplicate order',
                child: (
                    <>
                        <ButtonIconLabel icon="content_copy" /> Duplicate
                    </>
                ),
                modal: OrderModalRenderWrapper,
                modalData: {
                    actionName: BigCommerceActionType.DuplicateOrder,
                    order: source,
                    customer: {
                        id: source.get('customer_id'),
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                        email: customer.get('email'),
                    },
                },
            },
            {
                key: 'refund',
                options: [
                    {
                        value: BigCommerceActionType.RefundOrder,
                        label: 'Refund',
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
                modal: RefundOrderModalRenderWrapper,
                modalData: {
                    actionName: BigCommerceActionType.RefundOrder,
                    order: source,
                },
            },
        ]

        const removed: string[] = []

        if (
            draftOrderUrl ||
            isOrderFullyRefunded(source) ||
            !bigcommerceRefundOrderAccessFlags
        ) {
            removed.push('refund')
        }

        // remove removed actions from list of available actions
        return actions.filter(
            (action: InfobarAction) => !removed.includes(action.key)
        )
    }

    return (
        <>
            {draftOrderUrl && (
                <div className={css.container}>
                    <CustomStaticField label="URL">
                        <div className={css.container}>
                            <div className={css.draftOrderUrl}>
                                {draftOrderUrl}
                            </div>
                            <WidgetIcon
                                id="copy-id"
                                icon="content_copy"
                                tooltipMessage="Copy URL to clipboard"
                                onClick={() => {
                                    copy(draftOrderUrl)
                                    void dispatch(
                                        notify({
                                            status: NotificationStatus.Success,
                                            title: 'Order URL copied to clipboard.',
                                        })
                                    )
                                }}
                            />
                            {isLoadingGenerate && (
                                <div className={css.icon}>
                                    <Loader
                                        minHeight="15px"
                                        size="15px"
                                        inline={true}
                                    />
                                </div>
                            )}
                            {!isLoadingGenerate && isRefreshCooldown && (
                                <WidgetIcon
                                    id="check-id"
                                    icon="check"
                                    tooltipMessage="URL has been generated"
                                    className={classNames(
                                        css.icon,
                                        css.checkIcon
                                    )}
                                />
                            )}
                            {!isLoadingGenerate && !isRefreshCooldown && (
                                <WidgetIcon
                                    id="regenerate-id"
                                    icon="refresh"
                                    tooltipMessage="Regenerate URL"
                                    onClick={() =>
                                        void generateDraftOrderUrl({
                                            integrationId,
                                            cartId,
                                            customerId,
                                            setDraftOrderUrl,
                                            setIsRefreshCooldown,
                                            setIsLoadingGenerate,
                                            dispatch,
                                        })
                                    }
                                />
                            )}
                        </div>
                    </CustomStaticField>
                </div>
            )}
            <ActionButtonsGroup actions={getActions()} payload={orderPayload} />
            <StaticField label="Created">
                <DatetimeLabel
                    key="created"
                    dateTime={source.get('date_created')}
                    integrationType={BIGCOMMERCE_INTEGRATION_TYPE}
                />
            </StaticField>
            <StaticField label="Total">
                <MoneyAmount
                    amount={source.get('total_inc_tax')}
                    currencyCode={source.get('default_currency_code')}
                />
            </StaticField>
        </>
    )
}

const statusColors: Record<string, ColorType> = {
    incomplete: ColorType.LightWarning,
    pending: ColorType.Warning,
    shipped: ColorType.Classic,
    partially_shipped: ColorType.Classic,
    refunded: ColorType.LightWarning,
    cancelled: ColorType.Error,
    declined: ColorType.Error,
    awaiting_payment: ColorType.Warning,
    awaiting_pickup: ColorType.Warning,
    awaiting_shipment: ColorType.Warning,
    completed: ColorType.Success,
    awaiting_fulfillment: ColorType.Warning,
    manual_verification_required: ColorType.Warning,
    disputed: ColorType.Error,
    partially_refunded: ColorType.LightWarning,
}

type TitleWrapperProps = {
    children: ReactNode | null
    source: Map<any, any>
    template: Map<any, any>
}

export function TitleWrapper({children, source}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration} = useContext(IntegrationContext)
    const storeHash = integration.getIn(['meta', 'store_hash']) as string

    const orderId = (source.get('id') || '') as string

    const link = `https://store-${storeHash}.mybigcommerce.com/manage/orders/${orderId}`

    const orderStatus = ((source.get('status') as string) || '')
        .toLowerCase()
        .split(' ')
        .join('_')

    const draftOrderUrl = source.get('draft_order_url') || null

    return (
        <>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    logEvent(SegmentEvent.BigCommerceOrderClicked, {
                        account_domain: currentAccount.get('domain'),
                    })
                }}
            >
                {draftOrderUrl ? 'Draft Order ' + orderId : children}
            </a>
            <div>
                <Badge
                    key="status"
                    type={statusColors[orderStatus]}
                    className="mt-2"
                >
                    {draftOrderUrl ? 'Draft' : humanizeString(orderStatus)}
                </Badge>
            </div>
        </>
    )
}
