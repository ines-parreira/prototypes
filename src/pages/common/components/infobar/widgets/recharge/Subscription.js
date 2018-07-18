import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {
    Badge
} from 'reactstrap'

import {humanizeString} from '../../../../../../utils'

import * as ticketSelectors from './../../../../../../state/ticket/selectors'
import {getActiveCustomerIntegrationDataByIntegrationId} from '../../../../../../state/customers/selectors'

import ActionButtonsGroup from '../ActionButtonsGroup'

export default () => {
    return {
        AfterTitle, // eslint-disable-line
        BeforeContent, // eslint-disable-line
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line
        Wrapper, // eslint-disable-line
    }
}

class AfterTitle extends React.Component { // eslint-disable-line
    static propTypes = {
        isEditing: PropTypes.bool.isRequired,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        integrationId: PropTypes.number,
        isSubscriptionCancelled: PropTypes.bool.isRequired,
    }

    render() {
        const {source} = this.props
        const {integrationId, isSubscriptionCancelled} = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        let actions = [
            {
                key: 'cancel',
                options: [{value: 'rechargeCancelSubscription'}],
                title: (
                    <div>
                        <i className="fa fa-fw fa-ban mr-1" />
                        Cancel subscription
                    </div>
                ),
                child: (
                    <div>
                        <i className="fa fa-fw fa-ban mr-1" />
                        Cancel
                    </div>
                )
            },
        ]

        let removed = []

        if (isSubscriptionCancelled) {
            removed = removed.concat(['cancel'])
        }

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !removed.includes(action.key))

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
class TitleWrapper extends React.Component { // eslint-disable-line
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
        const customerHash = getIntegrationData(this.context.integration.get('id'), source.get('customer_id'))
            .getIn(['customer', 'hash'])

        return (
            <a
                href={`https://shopifysubscriptions.com/customers/${customerHash}/subscriptions/${source.get('id')}/`}
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
