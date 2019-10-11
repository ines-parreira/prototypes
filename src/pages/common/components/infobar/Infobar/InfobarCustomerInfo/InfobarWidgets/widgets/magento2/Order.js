// @flow
import React, {type Node} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, type Map, type List} from 'immutable'
import {connect} from 'react-redux'
import {
    Badge,
    CardBody,
} from 'reactstrap'

import {getActiveCustomerIntegrationDataByIntegrationId} from '../../../../../../../../../state/customers/selectors'
import * as currentUserSelectors from '../../../../../../../../../state/currentUser/selectors'
import * as ticketSelectors from '../../../../../../../../../state/ticket/selectors'

import {devLog, humanizeString, isCurrentlyOnTicket} from '../../../../../../../../../utils'
import {getTrackingUrl} from '../../../../../../../../../utils/delivery'
import {DatetimeLabel} from '../../../../../../../utils/labels'
import {displayLabel, guessFieldValueFromRawData} from '../../../../../utils'


export default function Order() {
    return {
        BeforeContent,
        AfterContent,
        TitleWrapper,
    }
}

export const statusColors = {
    new: 'info',
    pending: 'info',
    processing: 'info',
    complete: 'success',
    on_hold: 'warning',
    canceled: 'danger',
    closed: 'danger'
}

type BeforeContentProps = {
    source: Map<*,*>
}

class BeforeContent extends React.Component<BeforeContentProps> {
    render() {
        const {source} = this.props

        const state = (source.get('state') || '').toLowerCase()

        return (
            <div>
                <div className="simple-field">
                    <span className="field-label">
                        State:
                    </span>
                    <span className="field-value">
                        <Badge
                            color={statusColors[state]}
                        >
                            {humanizeString(state)}
                        </Badge>
                    </span>
                </div>
            </div>
        )
    }
}


type ShipmentsProps = {
    shipments: List<Map<*,*>>,
    currentUserTimezone: string
}

@connect((state) => {
    return {
        currentUserTimezone: currentUserSelectors.getTimezone(state)
    }
})
// todo(@martin): remove this flow-fix-me when flow support decorators and props injection
// $FlowFixMe
class Shipments extends React.Component<ShipmentsProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {shipments, currentUserTimezone} = this.props
        const {integration} = this.context

        const storeUrl: string = integration.getIn(['meta', 'store_url'])
        const adminUrlSuffix: string = integration.getIn(['meta', 'admin_url_suffix'])

        return shipments.map((shipment) => {
            const lastTrack = shipment.get('tracks', fromJS([])).maxBy((track) => track.get('updated_at'))

            let trackComponent = null

            if (lastTrack) {
                const trackNumber = lastTrack.get('track_number')
                const carrierCode = lastTrack.get('carrier_code')
                const trackingUrl = getTrackingUrl(trackNumber, carrierCode)

                trackComponent = (
                    <div
                        key={trackNumber}
                    >
                        <div className="simple-field">
                            <span className="field-label">
                                Carrier code:
                            </span>
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
                            <span className="field-label">
                                Tracking URL:
                            </span>
                            <span className="field-value">
                                {displayLabel(guessFieldValueFromRawData(trackingUrl, 'url'))}
                            </span>
                        </div>
                    </div>
                )
            }

            const shipmentId = (shipment.get('entity_id') || '').toString()
            const link = `https://${storeUrl}/${adminUrlSuffix}/sales/shipment/view/shipment_id/${shipmentId}/`

            return (
                <div
                    key={shipment.get('entity_id')}
                    className="card"
                >
                    <CardBody className="header clearfix">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={adminUrlSuffix ? link : ''}
                        >
                            <span>🚚 Shipment</span>
                        </a>
                    </CardBody>
                    <CardBody className="content">
                        <div className="simple-field">
                            <span className="field-label">
                                Last updated:
                            </span>
                            <span className="field-value">
                                <DatetimeLabel
                                    dateTime={shipment.get('updated_at')}
                                    timezone={currentUserTimezone}
                                />
                            </span>
                        </div>
                        {trackComponent}
                        <div className="list mt-3">
                            {
                                shipment.get('items').map((item) => (
                                    <div
                                        key={item.get('order_item_id')}
                                        className="card"
                                    >
                                        <CardBody className="header clearfix">
                                            <span>{item.get('qty')} x {item.get('name')}</span>
                                        </CardBody>
                                    </div>
                                ))
                            }
                        </div>
                    </CardBody>
                </div>
            )
        })
    }
}


type CreditMemosProps = {
    creditMemos: List<Map<*,*>>,
    currentUserTimezone: string
}

@connect((state) => {
    return {
        currentUserTimezone: currentUserSelectors.getTimezone(state)
    }
})
// todo(@martin): remove this flow-fix-me when flow support decorators and props injection
// $FlowFixMe
class CreditMemos extends React.Component<CreditMemosProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {creditMemos, currentUserTimezone} = this.props
        const {integration} = this.context

        const storeUrl: string = integration.getIn(['meta', 'store_url'])
        const adminUrlSuffix: string = integration.getIn(['meta', 'admin_url_suffix'])

        return creditMemos.map((creditMemo) => {
            const creditMemoId = (creditMemo.get('entity_id') || '').toString()
            const link = `https://${storeUrl}/${adminUrlSuffix}/sales/creditmemo/view/creditmemo_id/${creditMemoId}/`

            return (
                <div
                    key={creditMemo.get('entity_id')}
                    className="card"
                >
                    <CardBody className="header clearfix">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={adminUrlSuffix ? link : ''}
                        >
                            <span>
                                💸 Credit memo: {creditMemo.get('base_grand_total')}{' '}
                                {creditMemo.get('base_currency_code')}
                            </span>
                        </a>
                    </CardBody>
                    <CardBody className="content">
                        <div className="simple-field">
                            <span className="field-label">
                                Last updated:
                            </span>
                            <span className="field-value">
                                <DatetimeLabel
                                    dateTime={creditMemo.get('updated_at')}
                                    timezone={currentUserTimezone}
                                />
                            </span>
                        </div>
                        <div className="list mt-3">
                            {
                                creditMemo.get('items').map((item) => (
                                    <div
                                        key={item.get('order_item_id')}
                                        className="card"
                                    >
                                        <CardBody className="header clearfix">
                                            <span>{item.get('qty')} x {item.get('name')}</span>
                                        </CardBody>
                                    </div>
                                ))
                            }
                        </div>
                    </CardBody>
                </div>
            )
        })
    }
}


type AfterContentProps = {
    source: Map<*,*>,
    getIntegrationData: (number, number) => Map<*,*>
}

@connect((state) => {
    return {
        getIntegrationData: (integrationId, customerId) => {
            const integrationData = isCurrentlyOnTicket()
                ? ticketSelectors.getIntegrationDataByIntegrationId(integrationId)(state)
                : getActiveCustomerIntegrationDataByIntegrationId(integrationId)(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog('[INFOBAR][magento2][order] Could not find integration data for customer.', {
                    customerId, integrationId
                })
                return fromJS({})
            }

            return integrationData
        }
    }
})
class AfterContent extends React.Component<AfterContentProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {source, getIntegrationData} = this.props
        const {integration} = this.context

        const customerIntegrationData = getIntegrationData(integration.get('id'), source.get('customer_id'))

        const shipments = customerIntegrationData.get('shipments') || fromJS([])
        const orderShipments = shipments.filter((shipment) => shipment.get('order_id') === source.get('entity_id'))

        const creditMemos = customerIntegrationData.get('credit_memos') || fromJS([])
        const orderCreditMemos = creditMemos
            .filter((creditMemo) => creditMemo.get('order_id') === source.get('entity_id'))

        if (orderShipments.isEmpty() && orderCreditMemos.isEmpty()) {
            return null
        }

        return (
            <div className="mt-3">
                {!orderShipments.isEmpty() ? <Shipments shipments={orderShipments}/> : null}
                {!orderCreditMemos.isEmpty() ? <CreditMemos creditMemos={orderCreditMemos}/> : null}
            </div>
        )
    }
}


type TitleWrapperProps = {
    children: ?Node,
    source: Map<*,*>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props

        const storeUrl: string = this.context.integration.getIn(['meta', 'store_url'])
        const adminUrlSuffix: string = this.context.integration.getIn(['meta', 'admin_url_suffix'])
        const orderId = (source.get('entity_id') || '').toString()

        const link = `https://${storeUrl}/${adminUrlSuffix}/sales/order/view/order_id/${orderId}/`

        if (!adminUrlSuffix) {
            return children
        }

        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}
