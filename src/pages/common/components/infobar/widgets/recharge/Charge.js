// @flow
import React, {type Node} from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, type Map} from 'immutable'
import {
    Badge,
    CardBody,
} from 'reactstrap'

import _lowerCase from 'lodash/lowerCase'
import _groupBy from 'lodash/groupBy'

import {humanizeString, toJS} from '../../../../../../utils'

import ActionButtonsGroup from '../ActionButtonsGroup'

export default () => {
    return {
        AfterTitle, // eslint-disable-line
        BeforeContent, // eslint-disable-line
        AfterContent, // eslint-disable-line
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line
        Wrapper, // eslint-disable-line
    }
}

type AfterTitleProps = {
    isEditing: boolean,
    source: Map<*,*>
}

export class AfterTitle extends React.Component<AfterTitleProps> {
    static contextTypes = {
        integrationId: PropTypes.number,
    }

    render() {
        const {isEditing, source} = this.props
        const {integrationId} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        const total_price = parseFloat(source.get('total_price')) || 0
        const total_refunds = source.get('total_refunds') || 0

        let actions = [
            {
                key: 'refund',
                tooltip: 'Refund this charge, partially or totally.',
                options: [
                    {
                        value: 'rechargeRefundCharge',
                        label: 'Refund charge',
                        parameters: [
                            {
                                name: 'amount',
                                type: 'number',
                                defaultValue: total_price - total_refunds,
                                placeholder: 'Amount',
                                required: true,
                                step: 0.01,
                                min: 0.01,
                                max: total_price - total_refunds
                            }
                        ]
                    }
                ],
                title: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Refund charge
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Refund
                    </div>
                )
            }
        ]


        const status = source.get('status')
        let removed = !['SUCCESS', 'PARTIALLY_REFUNDED'].includes(status) ? ['refund'] : []

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !removed.includes(action.key))

        const payload = {
            charge_id: source.get('id')
        }

        return (
            <ActionButtonsGroup
                payload={payload}
                actions={actions}
            />
        )
    }
}


type SubscriptionAfterTitleProps = {
    isEditing: boolean,
    source: Map<*,*>
}

export class SubscriptionAfterTitle extends React.Component<SubscriptionAfterTitleProps> { // eslint-disable-line
    static contextTypes = {
        integrationId: PropTypes.number,
        isChargeNotQueued: PropTypes.bool.isRequired,
    }

    render() {
        const {isEditing, source} = this.props
        const {integrationId, isChargeNotQueued} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        let actions = [
            {
                key: 'skip',
                options: [{value: 'rechargeSkipCharge'}],
                tooltip: 'Skip the charge for this subscription on Recharge. ' +
                    'No order will be created and no item will be shipped.',
                title: (
                    <div>
                        <i className="material-icons mr-1">
                            block
                        </i>
                        Skip charge on subscription
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-1">
                            block
                        </i>
                        Skip
                    </div>
                )
            }
        ]

        let removed = isChargeNotQueued ? ['skip'] : []

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !removed.includes(action.key))

        const payload = {
            charge_id: source.get('charge_id'),
            subscription_id: source.get('subscription_id')
        }

        return (
            <ActionButtonsGroup
                payload={payload}
                actions={actions}
            />
        )
    }
}

const statusColors = {
    success: 'success',
    error: 'danger',
    queued: 'default',
    partially_refunded: 'warning',
    refunded: 'warning',
    skipped: 'info'
}

type BeforeContentProps = {
    source: Map<*,*>
}

class BeforeContent extends React.Component<BeforeContentProps> { // eslint-disable-line
    render() {
        const {source} = this.props

        const status = (source.get('status') || '').toLowerCase()

        return (
            <div>
                <div className="simple-field">
                    <span className="field-label">
                        Status:
                    </span>
                    <span className="field-value">
                        <Badge
                            color={statusColors[status]}
                        >
                            {humanizeString(status)}
                        </Badge>
                    </span>
                </div>
            </div>
        )
    }
}


type AfterContentProps = {
    isEditing: boolean,
    source: Map<*,*>
}

export class AfterContent extends React.Component<AfterContentProps> { // eslint-disable-line
    render() {
        const {source, isEditing} = this.props

        const chargeSubscriptions = _groupBy(toJS(source.get('line_items')), (item) => item.subscription_id)

        return (
            <div className="mt-2">
                {
                    Object.keys(chargeSubscriptions).map((k) => {
                        return (
                            <div
                                className="card"
                                key={k}
                            >
                                <CardBody className="header clearfix">
                                    <a target="_blank">
                                        <span>🔄 Subscription #{k}</span>
                                    </a>
                                    <SubscriptionAfterTitle
                                        isEditing={isEditing}
                                        source={fromJS({charge_id: source.get('id'), subscription_id: k})}
                                    />
                                </CardBody>
                                <CardBody className="content">
                                {
                                    chargeSubscriptions[k].map((item) => {
                                        return <span key={`${k}-${item.id}`}>{item.title} ({item.quantity})</span>
                                    })
                                }
                                </CardBody>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}


type TitleWrapperProps = {
    children: ?Node,
    source: Map<*,*>
}

class TitleWrapper extends React.Component<TitleWrapperProps> { // eslint-disable-line
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children} = this.props  // , source, getIntegrationData
        // const customerHash = getIntegrationData(this.context.integration.get('id')).getIn(['customer', 'hash'])

        return (
            <a
                // href={`https://shopifysubscriptions.com/customers/${customerHash}/subscriptions/items/${source.get('id')}/`}
                target="_blank"
            >
                {children}
            </a>
        )
    }
}


type WrapperProps = {
    children: ?Node,
    source: Map<*,*>
}

class Wrapper extends React.Component<WrapperProps> { // eslint-disable-line
    static childContextTypes = {
        charge: ImmutablePropTypes.map.isRequired,
        chargeId: PropTypes.number,
        isChargeNotQueued: PropTypes.bool.isRequired,
    }

    getChildContext() {
        const charge = this.props.source || fromJS({})

        return {
            charge,
            chargeId: charge.get('id'),
            isChargeNotQueued: _lowerCase(charge.get('status', '')) !== 'queued',
        }
    }

    render() {
        return this.props.children
    }
}
