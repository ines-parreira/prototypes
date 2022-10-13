import React, {ReactNode, useContext} from 'react'
import {Map} from 'immutable'

import {humanizeString} from 'utils'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {BIGCOMMERCE_INTEGRATION_TYPE} from 'constants/integration'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {StaticField} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/StaticField'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

export default function OrderWidget() {
    return {
        AfterTitle,
        TitleWrapper,
    }
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<any, any>
}

export function AfterTitle({isEditing, source}: AfterTitleProps) {
    const {integrationId} = useContext(IntegrationContext)

    if (isEditing || !integrationId) {
        return null
    }

    return (
        <>
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
    incomplete: ColorType.Warning,
    pending: ColorType.Warning,
    shipped: ColorType.Classic,
    partially_shipped: ColorType.Classic,
    refunded: ColorType.Grey,
    cancelled: ColorType.Error,
    declined: ColorType.Error,
    awaiting_payment: ColorType.Warning,
    awaiting_pickup: ColorType.Warning,
    completed: ColorType.Success,
    awaiting_fulfillment: ColorType.Warning,
    manual_verification_required: ColorType.Warning,
    disputed: ColorType.Error,
    partially_refunded: ColorType.Grey,
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
                {children}
            </a>
            <div>
                <Badge
                    key="status"
                    type={statusColors[orderStatus]}
                    className="mt-2"
                >
                    {humanizeString(orderStatus)}
                </Badge>
            </div>
        </>
    )
}
