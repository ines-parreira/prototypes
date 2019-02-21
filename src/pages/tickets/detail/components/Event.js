import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody, Button} from 'reactstrap'
import _capitalize from 'lodash/capitalize'

import {getActionByName} from '../../../../config/actions'
import {AgentLabel, DatetimeLabel} from '../../../common/utils/labels'
import {stripErrorMessage, humanizeString} from '../../../../utils'

import * as currentUserSelectors from '../../../../state/currentUser/selectors'
import * as integrationsSelectors from '../../../../state/integrations/selectors'
import * as ticketSelectors from '../../../../state/ticket/selectors'

import css from './Event.less'


@connect((state, ownProps) => {
    const {event} = ownProps

    const integration = integrationsSelectors.getIntegrationById(event.getIn(['data', 'integration_id']))(state)

    const integrationData = ticketSelectors
        .getIntegrationDataByIntegrationId(integration.get('id', '').toString())(state)

    return {
        currentUser: currentUserSelectors.getCurrentUser(state),
        integrationData,
        integration,
    }
})
export default class Event extends React.Component {
    static propTypes = {
        currentUser: ImmutablePropTypes.map.isRequired,
        integrationData: ImmutablePropTypes.map.isRequired,
        event: ImmutablePropTypes.map.isRequired,
        isLast: PropTypes.bool.isRequired,
        integration: ImmutablePropTypes.map.isRequired,
    }

    static defaultProps = {
        isLast: false,
    }

    state = {
        showDetails: false,
    }

    _getOrder = (orderId) => {
        const {integrationData: data} = this.props
        return (data.get('orders') || fromJS([]))
            .find((order) => order.get('id').toString() === orderId.toString()) || fromJS({})
    }

    _getItem = (orderId, itemId) => {
        const order = this._getOrder(orderId)
        return (order.get('line_items') || fromJS([]))
            .find((item) => item.get('id').toString() === itemId.toString()) || fromJS({})
    }

    _getSubscription = (subscriptionId) => {
        const {integrationData: data} = this.props
        return (data.get('subscriptions') || fromJS([]))
                .find((subscription) => subscription.get('id').toString() === subscriptionId.toString())
            || fromJS({})
    }

    _getCharge = (chargeId) => {
        const {integrationData: data} = this.props
        return (data.get('charges') || fromJS([]))
            .find((charge) => charge.get('id').toString() === chargeId.toString()) || fromJS({})
    }

    _renderDetails = (isError, eventData) => {
        const payload = eventData.get('payload') || fromJS({})
        const content = []

        if (isError) {
            content.push(
                <div key="error">
                    <b className="text-danger">Error:</b> {stripErrorMessage(eventData.get('msg'))}
                </div>
            )
        }

        if (!payload.isEmpty()) {
            content.push(
                <div key="payload">
                    <div>
                        {
                            payload.map((value, key) => {
                                let stringValue = value

                                // Necessary to display correctly booleans
                                if (value !== undefined && value !== null) {
                                    stringValue = value.toString()
                                }

                                return (
                                    <div key={key}>
                                        <b>{humanizeString(key)}</b>: {stringValue}
                                    </div>
                                )
                            }).toList()
                        }
                    </div>
                </div>
            )
        }

        return content
    }

    getDisplayableType(integrationType) {
        if (integrationType === 'smooch_inside') {
            return 'chat'
        }

        return integrationType
    }

    render() {
        const {currentUser, event, isLast, integration, integrationData} = this.props
        const user = event.get('user') || fromJS({})
        const status = event.getIn(['data', 'status'])
        const actionName = event.getIn(['data', 'action_name'])
        const payload = event.getIn(['data', 'payload']) || fromJS({})

        const isError = status === 'error'
        const isSuccess = !isError

        const actionConfig = getActionByName(actionName)

        if (!actionConfig) {
            return null
        }

        const hasIntegration = !integration.isEmpty()

        let actionLabel = actionConfig.label
        let objectLabel = ''
        let objectLink = ''

        if (hasIntegration) {
            if (integration.get('type') === 'shopify') {
                const shopName = integration.getIn(['meta', 'shop_name'])
                const order = this._getOrder(payload.get('order_id'))

                if (actionConfig.objectType === 'order') {
                    objectLabel += order.get('name')
                } else if (actionConfig.objectType === 'item') {
                    const item = this._getItem(payload.get('order_id'), payload.get('item_id'))
                    objectLabel += `${payload.get('quantity')} × ${item.get('name')}`
                }

                objectLink = `https://${shopName}.myshopify.com/admin/orders/${order.get('id')}`
            } else if (integration.get('type') === 'recharge') {
                const storeName = integration.getIn(['meta', 'store_name'])
                const hash = integrationData.getIn(['customer', 'hash'])

                if (actionConfig.objectType === 'subscription') {
                    const subscription = this._getSubscription(payload.get('subscription_id'))
                    objectLabel += subscription.get('id')
                    objectLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/subscriptions/${subscription.get('id')}`
                } else if (actionConfig.objectType === 'charge') {
                    const charge = this._getCharge(payload.get('charge_id'))
                    objectLabel += charge.get('id')
                    objectLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/orders`
                }

            }
        } else {
            actionLabel += ` #${payload.get('order_id')} (deleted integration)`
        }

        return (
            <div
                className={classnames(css.component, {
                    [css.last]: isLast,
                })}
            >
                <div className={css.event}>
                    <div className={css.content}>


                        <div
                            className={classnames(css.icon, {
                                [css.danger]: isError,
                                [css.success]: isSuccess,
                            })}
                            title={isError ? 'Fail' : 'Success'}
                        >
                            <i className="material-icons">
                                {isError ? 'close' : 'check'}
                            </i>
                        </div>

                        <span className={css.actionName}>
                            {actionLabel} {' '}
                            {
                                !!objectLabel && (
                                    <a
                                        href={objectLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {objectLabel}
                                    </a>
                                )
                            }
                        </span>

                        <span className={css.equalFiller}>
                            on
                        </span>

                        <span className={css.actionName}>
                            {_capitalize(this.getDisplayableType(integration.get('type')))} ({integration.get('name')})
                        </span>

                        <span className={css.filler}>
                            by
                        </span>

                        <AgentLabel name={user.get('name')} />

                        <Button
                            color="link"
                            className={css.more}
                            onClick={() => this.setState({showDetails: !this.state.showDetails})}
                            title="More details"
                        >
                            <i className="material-icons md-2">
                                {this.state.showDetails ? 'expand_less' : 'expand_more'}
                            </i>
                        </Button>
                    </div>

                    <DatetimeLabel
                        dateTime={event.get('created_datetime')}
                        settings={{
                            position: 'top left'
                        }}
                        timezone={currentUser.get('timezone')}
                        className={classnames(css.date, 'text-faded')}
                    />
                </div>

                <Card
                    className={classnames(css.details, {
                        'd-none': !this.state.showDetails,
                    })}
                >
                    <CardBody>
                        {this._renderDetails(isError, event.get('data'))}
                    </CardBody>
                </Card>
            </div>
        )
    }
}
