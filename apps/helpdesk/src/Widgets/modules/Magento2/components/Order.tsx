import type { ContextType, ReactNode } from 'react'
import React, { Component } from 'react'

import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import { LegacyBadge as Badge } from '@gorgias/axiom'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getActiveCustomerIntegrationDataByIntegrationId } from 'state/customers/selectors'
import { getIntegrationDataByIntegrationId } from 'state/ticket/selectors'
import type { RootState } from 'state/types'
import { devLog, humanizeString, isCurrentlyOnTicket } from 'utils'
import { getTrackingUrl } from 'utils/delivery'
import { getValueFromData } from 'Widgets/modules/Template/helpers/fieldDataMappers'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import css from './Order.less'

function getIntegrationData(
    state: RootState,
    integrationId: number,
    customerId: number,
) {
    const integrationData = isCurrentlyOnTicket()
        ? getIntegrationDataByIntegrationId(integrationId)(state)
        : getActiveCustomerIntegrationDataByIntegrationId(integrationId)(state)
    if (integrationData.getIn(['customer', 'id']) !== customerId) {
        devLog(
            '[INFOBAR][magento2][order] Could not find integration data for customer.',
            {
                customerId,
                integrationId,
            },
        )
        return fromJS({}) as Map<any, any>
    }

    return integrationData
}

export const statusColors: Record<string, ColorType> = {
    new: 'classic',
    pending: 'classic',
    processing: 'classic',
    complete: 'success',
    on_hold: 'warning',
    canceled: 'error',
    closed: 'error',
}

type BeforeContentProps = ConnectedProps<typeof connectorBeforeContent> & {
    source: Map<any, any>
}

class BeforeContentContainer extends Component<BeforeContentProps> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { source, getIntegrationData } = this.props

        const state = ((source.get('state') as string) || '').toLowerCase()

        const { integrationId } = this.context

        const customerIntegrationData = getIntegrationData(
            integrationId!,
            source.get('customer_id'),
        )

        const shipments = (customerIntegrationData.get('shipments') ||
            fromJS([])) as List<any>
        const orderShipments = shipments.filter(
            (shipment: Map<any, any>) =>
                shipment.get('order_id') === source.get('entity_id'),
        ) as List<any>

        return (
            <>
                <StaticField label="State">
                    <Badge type={statusColors[state]}>
                        {humanizeString(state)}
                    </Badge>
                </StaticField>

                <StaticField label="Created at">
                    <DatetimeLabel dateTime={source.get('created_at')} />
                </StaticField>

                {!orderShipments.isEmpty() ? (
                    <Shipments shipments={orderShipments} />
                ) : null}
            </>
        )
    }
}

const connectorBeforeContent = connect((state: RootState) => {
    return {
        getIntegrationData: (
            integrationId: number,
            customerId: number,
        ): Map<any, any> => {
            return getIntegrationData(state, integrationId, customerId)
        },
    }
})

const BeforeContent = connectorBeforeContent(BeforeContentContainer)

export class Shipments extends Component<{
    shipments: List<any>
}> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { shipments } = this.props
        const { integration } = this.context

        const storeUrl = integration.getIn(['meta', 'store_url']) as string
        const adminUrlSuffix = integration.getIn([
            'meta',
            'admin_url_suffix',
        ]) as string

        return shipments.toArray().map((shipment: Map<any, any>) => {
            const lastTrack = (
                shipment.get('tracks', fromJS([])) as List<any>
            ).maxBy(
                (track: Map<any, any>) => track.get('updated_at') as string,
            ) as Map<any, any>

            let trackComponent = null

            if (lastTrack) {
                const trackNumber = lastTrack.get('track_number')
                const carrierCode = lastTrack.get('carrier_code')
                const trackingUrl = getTrackingUrl(trackNumber, carrierCode)

                trackComponent = (
                    <div key={trackNumber}>
                        <StaticField label="Carrier code">
                            {carrierCode}
                        </StaticField>
                        <StaticField label="Tracking number">
                            {trackNumber}
                        </StaticField>
                        <StaticField label="Tracking URL">
                            {getValueFromData(trackingUrl, 'url')}
                        </StaticField>
                    </div>
                )
            }

            const shipmentId = (
                (shipment.get('entity_id') as number) || ''
            ).toString()
            const link = `https://${storeUrl}/${adminUrlSuffix}/sales/shipment/view/shipment_id/${shipmentId}/`

            return (
                <div key={shipment.get('entity_id')} className={css.section}>
                    <div className={css.linkWrapper}>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={adminUrlSuffix ? link : ''}
                        >
                            <i className="material-icons">local_shipping</i>{' '}
                            <span>Shipment</span>
                        </a>
                    </div>
                    <StaticField label="Last updated">
                        <DatetimeLabel dateTime={shipment.get('updated_at')} />
                    </StaticField>
                    {trackComponent}
                    {shipment
                        .get('items')
                        .toArray()
                        .map((item: Map<any, any>) => (
                            <StaticField key={item.get('order_item_id')}>
                                {item.get('qty')} x {item.get('name')}
                            </StaticField>
                        ))}
                </div>
            )
        })
    }
}

export class CreditMemos extends Component<{
    creditMemos: List<any>
}> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { creditMemos } = this.props
        const { integration } = this.context

        const storeUrl = integration.getIn(['meta', 'store_url']) as string
        const adminUrlSuffix: string = integration.getIn([
            'meta',
            'admin_url_suffix',
        ])

        return creditMemos.toArray().map((creditMemo: Map<any, any>) => {
            const creditMemoId = (
                (creditMemo.get('entity_id') as number) || ''
            ).toString()
            const link = `https://${storeUrl}/${adminUrlSuffix}/sales/creditmemo/view/creditmemo_id/${creditMemoId}/`

            return (
                <div
                    key={creditMemo.get('entity_id')}
                    className={css.delimiter}
                >
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={adminUrlSuffix ? link : ''}
                    >
                        <StaticField
                            label={
                                <>
                                    <i className="material-icons">redeem</i>{' '}
                                    Credit memo
                                </>
                            }
                        >
                            {creditMemo.get('base_grand_total')}{' '}
                            {creditMemo.get('base_currency_code')}
                        </StaticField>
                    </a>

                    <StaticField label="Last updated">
                        <DatetimeLabel
                            dateTime={creditMemo.get('updated_at')}
                        />
                    </StaticField>

                    {creditMemo
                        .get('items')
                        .toArray()
                        .map((item: Map<any, any>) => (
                            <StaticField key={item.get('order_item_id')}>
                                {item.get('qty')} x {item.get('name')}
                            </StaticField>
                        ))}
                </div>
            )
        })
    }
}

type AfterContentProps = ConnectedProps<typeof connectorAfterContent> & {
    source: Map<any, any>
}

class AfterContentContainer extends Component<AfterContentProps> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { source, getIntegrationData } = this.props
        const { integrationId } = this.context

        const customerIntegrationData = getIntegrationData(
            integrationId!,
            source.get('customer_id'),
        )

        const creditMemos = (customerIntegrationData.get('credit_memos') ||
            fromJS([])) as List<any>
        const orderCreditMemos = creditMemos.filter(
            (creditMemo: Map<any, any>) =>
                creditMemo.get('order_id') === source.get('entity_id'),
        ) as List<any>

        return !orderCreditMemos.isEmpty() ? (
            <CreditMemos creditMemos={orderCreditMemos} />
        ) : null
    }
}

const connectorAfterContent = connect((state: RootState) => {
    return {
        getIntegrationData: (integrationId: number, customerId: number) => {
            return getIntegrationData(state, integrationId, customerId)
        },
    }
})

const AfterContent = connectorAfterContent(AfterContentContainer)

type TitleWrapperProps = {
    children: ReactNode
    source: Map<any, any>
}

class TitleWrapper extends Component<TitleWrapperProps> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { children, source } = this.props
        const { integration } = this.context

        const storeUrl: string = integration.getIn(['meta', 'store_url'])
        const adminUrlSuffix: string = integration.getIn([
            'meta',
            'admin_url_suffix',
        ])
        const orderId = ((source.get('entity_id') as number) || '').toString()

        const link = `https://${storeUrl}/${adminUrlSuffix}/sales/order/view/order_id/${orderId}/`

        if (!adminUrlSuffix) {
            return children
        }

        return (
            <a href={link} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        )
    }
}

export const orderCustomization: CardCustomization = {
    BeforeContent,
    AfterContent,
    TitleWrapper,
}
