import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Button, Card, CardBody} from 'reactstrap'
import _capitalize from 'lodash/capitalize'
import _isObject from 'lodash/isObject'
import JSONPretty from 'react-json-pretty'

import {getActionByName} from '../../../../config/actions.ts'
import {AgentLabel, DatetimeLabel} from '../../../common/utils/labels'
import {humanizeString, stripErrorMessage} from '../../../../utils.ts'

import {getIntegrationById} from '../../../../state/integrations/selectors.ts'
import {getIntegrationDataByIntegrationId} from '../../../../state/ticket/selectors.ts'

import facebookMessengerEvent from '../../../../../img/integrations/facebook-messenger-blue-icon.svg'

import css from './Event.less'

export class EventContainer extends React.Component {
    static propTypes = {
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
        return (
            (data.get('orders') || fromJS([])).find(
                (order) => order.get('id').toString() === orderId.toString()
            ) || fromJS({})
        )
    }

    _getItem = (orderId, itemId) => {
        const order = this._getOrder(orderId)
        return (
            (order.get('line_items') || fromJS([])).find(
                (item) => item.get('id').toString() === itemId.toString()
            ) || fromJS({})
        )
    }

    _getSubscription = (subscriptionId) => {
        const {integrationData: data} = this.props
        return (
            (data.get('subscriptions') || fromJS([])).find(
                (subscription) =>
                    subscription.get('id').toString() ===
                    subscriptionId.toString()
            ) || fromJS({})
        )
    }

    _getCharge = (chargeId) => {
        const {integrationData: data} = this.props
        return (
            (data.get('charges') || fromJS([])).find(
                (charge) => charge.get('id').toString() === chargeId.toString()
            ) || fromJS({})
        )
    }

    _renderDetails = (isError, eventData) => {
        const payload = eventData.get('payload') || fromJS({})
        const content = []

        if (isError) {
            content.push(
                <div key="error">
                    <b className="text-danger">Error:</b>{' '}
                    {stripErrorMessage(eventData.get('msg'))}
                </div>
            )
        }

        if (!payload.isEmpty()) {
            content.push(
                <div key="payload">
                    <div>
                        {payload
                            .map((value, key) => {
                                let formattedValue

                                // Necessary to display correctly booleans
                                if (typeof value === 'boolean') {
                                    formattedValue = value.toString()
                                } else if (_isObject(value)) {
                                    formattedValue = (
                                        <JSONPretty
                                            data={value.toJS()}
                                            className="d-inline-flex"
                                        />
                                    )
                                } else {
                                    formattedValue = value
                                }

                                return (
                                    <div key={key}>
                                        <b>{humanizeString(key)}</b>:{' '}
                                        {formattedValue}
                                    </div>
                                )
                            })
                            .toList()}
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
        const {event, isLast, integration, integrationData} = this.props
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
        let eventIcon = (
            <div
                className={classnames(css.icon, {
                    [css.danger]: isError,
                    [css.success]: isSuccess,
                })}
                title={isError ? 'Fail' : 'Success'}
            >
                <i className="material-icons">{isError ? 'close' : 'check'}</i>
            </div>
        )

        let shouldDisplayIntegration = true

        if (hasIntegration) {
            if (integration.get('type') === 'shopify') {
                const shopName = integration.getIn(['meta', 'shop_name'])
                const orderId = payload.get('order_id')

                if (actionConfig.objectType === 'draftOrder') {
                    objectLabel += payload.get('draft_order_name')
                    objectLink = `https://${shopName}.myshopify.com/admin/draft_orders/${payload.get(
                        'draft_order_id'
                    )}`
                } else if (orderId) {
                    const order = this._getOrder(orderId)

                    if (actionConfig.objectType === 'order') {
                        objectLabel += order.get('name')
                        objectLink = `https://${shopName}.myshopify.com/admin/orders/${order.get(
                            'id'
                        )}`
                    } else if (actionConfig.objectType === 'item') {
                        const item = this._getItem(
                            payload.get('order_id'),
                            payload.get('item_id')
                        )
                        objectLabel += `${payload.get('quantity')} × ${item.get(
                            'name'
                        )}`
                        objectLink = `https://${shopName}.myshopify.com/admin/orders/${order.get(
                            'id'
                        )}`
                    }
                }
            } else if (integration.get('type') === 'recharge') {
                const storeName = integration.getIn(['meta', 'store_name'])
                const hash = integrationData.getIn(['customer', 'hash'])

                if (actionConfig.objectType === 'subscription') {
                    const subscription = this._getSubscription(
                        payload.get('subscription_id')
                    )
                    objectLabel += subscription.get('id')
                    objectLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/subscriptions/${subscription.get(
                        'id'
                    )}`
                } else if (actionConfig.objectType === 'charge') {
                    const charge = this._getCharge(payload.get('charge_id'))
                    objectLabel += charge.get('id')
                    objectLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/orders`
                }
            } else if (integration.get('type') === 'facebook') {
                shouldDisplayIntegration = false
                objectLabel += `Messenger`

                const messengerTicketId = event.getIn([
                    'data',
                    'messenger_ticket_id',
                ])

                objectLink = `${
                    messengerTicketId != null ? messengerTicketId : '#'
                }`

                if (isError === false) {
                    eventIcon = (
                        <div className={css.replyViaMessengerIcon}>
                            <img
                                src={facebookMessengerEvent}
                                alt="Reply via Messenger"
                                key="reply-via-messenger-event"
                            />
                        </div>
                    )
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
                        {eventIcon}
                        <span className={css.actionName}>
                            {actionLabel}{' '}
                            {!!objectLabel && (
                                <a
                                    href={objectLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {objectLabel}
                                </a>
                            )}
                        </span>

                        {hasIntegration && shouldDisplayIntegration && (
                            <span className={css.equalFiller}>on</span>
                        )}

                        {hasIntegration && shouldDisplayIntegration && (
                            <span className={css.actionName}>
                                {_capitalize(
                                    this.getDisplayableType(
                                        integration.get('type')
                                    )
                                )}{' '}
                                ({integration.get('name')})
                            </span>
                        )}

                        <span className={css.filler}>by</span>

                        <AgentLabel name={user.get('name')} />

                        <Button
                            color="link"
                            className={css.more}
                            onClick={() =>
                                this.setState({
                                    showDetails: !this.state.showDetails,
                                })
                            }
                            title="More details"
                        >
                            <i className="material-icons md-2">
                                {this.state.showDetails
                                    ? 'expand_less'
                                    : 'expand_more'}
                            </i>
                        </Button>
                    </div>

                    <DatetimeLabel
                        dateTime={event.get('created_datetime')}
                        settings={{
                            position: 'top left',
                        }}
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

const connector = connect((state, ownProps) => {
    const {event} = ownProps

    const integration = getIntegrationById(
        event.getIn(['data', 'integration_id'])
    )(state)

    return {
        integrationData: getIntegrationDataByIntegrationId(
            integration.get('id', '').toString()
        )(state),
        integration,
    }
})

export default connector(EventContainer)
