import React, {Component, ContextType, ReactNode} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {CardBody} from 'reactstrap'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {
    displayLabel,
    guessFieldValueFromRawData,
} from 'pages/common/components/infobar/utils'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {getActiveCustomerIntegrationDataByIntegrationId} from 'state/customers/selectors'
import {getIntegrationDataByIntegrationId} from 'state/ticket/selectors'
import {RootState} from 'state/types'
import {devLog, humanizeString, isCurrentlyOnTicket} from 'utils'
import {getTrackingUrl} from 'utils/delivery'

import {IntegrationContext} from '../IntegrationContext'

export default function Order() {
    return {
        BeforeContent,
        AfterContent,
        TitleWrapper,
    }
}

function getIntegrationData(
    state: RootState,
    integrationId: number,
    customerId: number
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
            }
        )
        return fromJS({}) as Map<any, any>
    }

    return integrationData
}

export const statusColors: Record<string, ColorType> = {
    new: ColorType.Classic,
    pending: ColorType.Classic,
    processing: ColorType.Classic,
    complete: ColorType.Success,
    on_hold: ColorType.Warning,
    canceled: ColorType.Error,
    closed: ColorType.Error,
}

type BeforeContentProps = ConnectedProps<typeof connectorBeforeContent> & {
    source: Map<any, any>
    currentUserTimezone: string
}

class BeforeContentContainer extends Component<BeforeContentProps> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {source, getIntegrationData} = this.props

        const state = ((source.get('state') as string) || '').toLowerCase()

        const {integrationId} = this.context

        const customerIntegrationData = getIntegrationData(
            integrationId!,
            source.get('customer_id')
        )

        const shipments = (customerIntegrationData.get('shipments') ||
            fromJS([])) as List<any>
        const orderShipments = shipments.filter(
            (shipment: Map<any, any>) =>
                shipment.get('order_id') === source.get('entity_id')
        ) as List<any>

        return (
            <div>
                <div className="simple-field">
                    <span className="field-label">State:</span>
                    <span className="field-value">
                        <Badge type={statusColors[state]}>
                            {humanizeString(state)}
                        </Badge>
                    </span>
                </div>
                <div className="simple-field">
                    <span className="field-label">Created at:</span>
                    <span className="field-value">
                        <DatetimeLabel dateTime={source.get('created_at')} />
                    </span>
                </div>
                <div className="mt-3">
                    {!orderShipments.isEmpty() ? (
                        <Shipments shipments={orderShipments} />
                    ) : null}
                </div>
            </div>
        )
    }
}

const connectorBeforeContent = connect((state: RootState) => {
    return {
        getIntegrationData: (
            integrationId: number,
            customerId: number
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
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {shipments} = this.props
        const {integration} = this.context

        const storeUrl = integration.getIn(['meta', 'store_url']) as string
        const adminUrlSuffix = integration.getIn([
            'meta',
            'admin_url_suffix',
        ]) as string

        return shipments.map((shipment: Map<any, any>) => {
            const lastTrack = (
                shipment.get('tracks', fromJS([])) as List<any>
            ).maxBy(
                (track: Map<any, any>) => track.get('updated_at') as string
            ) as Map<any, any>

            let trackComponent = null

            if (lastTrack) {
                const trackNumber = lastTrack.get('track_number')
                const carrierCode = lastTrack.get('carrier_code')
                const trackingUrl = getTrackingUrl(trackNumber, carrierCode)

                trackComponent = (
                    <div key={trackNumber}>
                        <div className="simple-field">
                            <span className="field-label">Carrier code:</span>
                            <span className="field-value">
                                {displayLabel(carrierCode)}
                            </span>
                        </div>
                        <div className="simple-field">
                            <span className="field-label">
                                Tracking number:
                            </span>
                            <span className="field-value">
                                {displayLabel(trackNumber)}
                            </span>
                        </div>
                        <div className="simple-field">
                            <span className="field-label">Tracking URL:</span>
                            <span className="field-value">
                                {displayLabel(
                                    guessFieldValueFromRawData(
                                        trackingUrl,
                                        'url'
                                    )
                                )}
                            </span>
                        </div>
                    </div>
                )
            }

            const shipmentId = (
                (shipment.get('entity_id') as number) || ''
            ).toString()
            const link = `https://${storeUrl}/${adminUrlSuffix}/sales/shipment/view/shipment_id/${shipmentId}/`

            return (
                <div key={shipment.get('entity_id')} className="card">
                    <CardBody className="header clearfix">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={adminUrlSuffix ? link : ''}
                        >
                            <i className="material-icons">local_shipping</i>{' '}
                            <span>Shipment</span>
                        </a>
                    </CardBody>
                    <CardBody className="content">
                        <div className="simple-field">
                            <span className="field-label">Last updated:</span>
                            <span className="field-value">
                                <DatetimeLabel
                                    dateTime={shipment.get('updated_at')}
                                />
                            </span>
                        </div>
                        {trackComponent}
                        <div className="list mt-3">
                            {(shipment.get('items') as List<any>).map(
                                (item: Map<any, any>) => (
                                    <div
                                        key={item.get('order_item_id')}
                                        className="card"
                                    >
                                        <CardBody className="header clearfix">
                                            <span>
                                                {item.get('qty')} x{' '}
                                                {item.get('name')}
                                            </span>
                                        </CardBody>
                                    </div>
                                )
                            )}
                        </div>
                    </CardBody>
                </div>
            )
        })
    }
}

export class CreditMemos extends Component<{
    creditMemos: List<any>
}> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {creditMemos} = this.props
        const {integration} = this.context

        const storeUrl = integration.getIn(['meta', 'store_url']) as string
        const adminUrlSuffix: string = integration.getIn([
            'meta',
            'admin_url_suffix',
        ])

        return creditMemos.map((creditMemo: Map<any, any>) => {
            const creditMemoId = (
                (creditMemo.get('entity_id') as number) || ''
            ).toString()
            const link = `https://${storeUrl}/${adminUrlSuffix}/sales/creditmemo/view/creditmemo_id/${creditMemoId}/`

            return (
                <div key={creditMemo.get('entity_id')} className="card">
                    <CardBody className="header clearfix">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={adminUrlSuffix ? link : ''}
                        >
                            <span>
                                <i className="material-icons">redeem</i> Credit
                                memo: {creditMemo.get('base_grand_total')}{' '}
                                {creditMemo.get('base_currency_code')}
                            </span>
                        </a>
                    </CardBody>
                    <CardBody className="content">
                        <div className="simple-field">
                            <span className="field-label">Last updated:</span>
                            <span className="field-value">
                                <DatetimeLabel
                                    dateTime={creditMemo.get('updated_at')}
                                />
                            </span>
                        </div>
                        <div className="list mt-3">
                            {(creditMemo.get('items') as List<any>).map(
                                (item: Map<any, any>) => (
                                    <div
                                        key={item.get('order_item_id')}
                                        className="card"
                                    >
                                        <CardBody className="header clearfix">
                                            <span>
                                                {item.get('qty')} x{' '}
                                                {item.get('name')}
                                            </span>
                                        </CardBody>
                                    </div>
                                )
                            )}
                        </div>
                    </CardBody>
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
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {source, getIntegrationData} = this.props
        const {integrationId} = this.context

        const customerIntegrationData = getIntegrationData(
            integrationId!,
            source.get('customer_id')
        )

        const creditMemos = (customerIntegrationData.get('credit_memos') ||
            fromJS([])) as List<any>
        const orderCreditMemos = creditMemos.filter(
            (creditMemo: Map<any, any>) =>
                creditMemo.get('order_id') === source.get('entity_id')
        ) as List<any>

        if (orderCreditMemos.isEmpty()) {
            return null
        }

        return (
            <div className="mt-3">
                {!orderCreditMemos.isEmpty() ? (
                    <CreditMemos creditMemos={orderCreditMemos} />
                ) : null}
            </div>
        )
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
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {children, source} = this.props
        const {integration} = this.context

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
