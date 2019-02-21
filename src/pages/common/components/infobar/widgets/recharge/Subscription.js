import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {
    Badge
} from 'reactstrap'

import {humanizeString} from '../../../../../../utils'

import {getActiveCustomerIntegrationDataByIntegrationId} from '../../../../../../state/customers/selectors'

import ActionButtonsGroup from '../ActionButtonsGroup'

import * as ticketSelectors from './../../../../../../state/ticket/selectors'

export default function Subscription() {
    return {
        AfterTitle, // eslint-disable-line
        BeforeContent, // eslint-disable-line
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line
        Wrapper, // eslint-disable-line
    }
}

export class AfterTitle extends React.Component { // eslint-disable-line
    static propTypes = {
        isEditing: PropTypes.bool.isRequired,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        integrationId: PropTypes.number,
        isSubscriptionCancelled: PropTypes.bool.isRequired,
    }

    render() {
        const {isEditing, source} = this.props
        const {integrationId, isSubscriptionCancelled} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        let actions = [
            {
                key: 'cancel',
                options: [{value: 'rechargeCancelSubscription'}],
                tooltip: 'This will cancel the subscription in Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Cancel subscription
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Cancel
                    </div>
                )
            },
            {
                key: 'activate',
                options: [{value: 'rechargeActivateSubscription'}],
                tooltip: 'This will activate the subscription in Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Activate subscription
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Activate
                    </div>
                )
            },
        ]

        let ignoredActions = [isSubscriptionCancelled ? 'cancel' : 'activate']

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !ignoredActions.includes(action.key))
        const payload = {
            subscription_id: source.get('id'),
        }

        return (
            <ActionButtonsGroup
                actions={actions}
                payload={payload}
            />
        )
    }
}

const statusColors = {
    active: 'success',
    cancelled: 'danger',
}

class BeforeContent extends React.Component { // eslint-disable-line
    static propTypes = {
        source: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {source} = this.props

        const status = (source.get('status') || '').toLowerCase()

        return (
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
        )
    }
}

@connect((state) => {
    return {
        getIntegrationData: (integrationId, customerId) => {
            // Here we don't know if we're in a ticket- or customer- context.
            // So we get both data from the ticket.customer and the active customer, and if any match
            // the subscription's customer_id, then it means it's the correct data.
            const ticketData = ticketSelectors.getIntegrationDataByIntegrationId(integrationId)(state)
            const customerData = getActiveCustomerIntegrationDataByIntegrationId(integrationId)(state)

            if (ticketData.getIn(['customer', 'id']) === customerId) {
                return ticketData
            }

            if (customerData.getIn(['customer', 'id']) === customerId) {
                return customerData
            }

            return fromJS({})
        }
    }
})
export class TitleWrapper extends React.Component { // eslint-disable-line
    static propTypes = {
        children: PropTypes.node,
        source: ImmutablePropTypes.map.isRequired,
        getIntegrationData: PropTypes.func.isRequired
    }

    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source, getIntegrationData} = this.props
        const {integration} = this.context
        const storeName = integration.getIn(['meta', 'store_name'])
        const customerHash = getIntegrationData(integration.get('id'), source.get('customer_id'))
            .getIn(['customer', 'hash'])

        return (
            <a
                href={`https://${storeName}.myshopify.com/tools/recurring/customers/${customerHash}/subscriptions/${source.get('id')}/`}
                target="_blank"
                rel="noopener noreferrer"
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
        order: ImmutablePropTypes.map.isRequired,
        orderId: PropTypes.number,
        isSubscriptionCancelled: PropTypes.bool.isRequired,
    }

    getChildContext() {
        const order = this.props.source || fromJS({})

        const isCancelled = !!order.get('cancelled_at')

        return {
            order,
            orderId: order.get('id'),
            isSubscriptionCancelled: isCancelled,
        }
    }

    render() {
        return this.props.children
    }
}
