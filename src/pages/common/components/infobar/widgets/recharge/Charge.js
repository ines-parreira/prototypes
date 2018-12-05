import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
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
        // AfterTitle, // eslint-disable-line  todo(@martin): uncomment that when we've figured what to do with Skip
        BeforeContent, // eslint-disable-line
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line
        Wrapper, // eslint-disable-line
    }
}

export class SubscriptionAfterTitle extends React.Component { // eslint-disable-line
    static propTypes = {
        isEditing: PropTypes.bool.isRequired,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        integrationId: PropTypes.number,
        isChargeNotQueued: PropTypes.bool.isRequired,
    }

    render() {
        const {source} = this.props
        const {integrationId, isChargeNotQueued} = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        let actions = [
            {
                key: 'skip',
                options: [{value: 'rechargeSkipCharge'}],
                tooltip: 'Skip the charge for this subscription on Recharge',
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
            },
        ]

        let removed = []

        if (isChargeNotQueued) {
            removed = removed.concat(['rechargeSkipCharge'])
        }

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !removed.includes(action.actionName))

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

class BeforeContent extends React.Component { // eslint-disable-line
    static propTypes = {
        source: ImmutablePropTypes.map.isRequired,
        isEditing: PropTypes.bool.isRequired
    }

    render() {
        const {source, isEditing} = this.props

        const status = (source.get('status') || '').toLowerCase()
        const chargeSubscriptions = _groupBy(toJS(source.get('line_items')), (item) => item.subscription_id)

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
                {
                    Object.keys(chargeSubscriptions).map((k) => {
                        return (
                            <div className="card" key={k}>
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

class TitleWrapper extends React.Component { // eslint-disable-line
    static propTypes = {
        children: PropTypes.node,
        source: ImmutablePropTypes.map.isRequired,
        // getIntegrationData: PropTypes.func.isRequired
    }

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

class Wrapper extends React.Component { // eslint-disable-line
    static propTypes = {
        children: PropTypes.node,
        source: ImmutablePropTypes.map.isRequired,
    }

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
