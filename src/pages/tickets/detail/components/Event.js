import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'

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

    const customer = ticketSelectors.getCustomer(state)

    // todo(jebarjonet) use integrationId instead of integration type
    // see https://github.com/gorgias/gorgias/issues/1334#issuecomment-290482595
    const customerForIntegration = customer.getIn([`_${integration.get('type')}`]) || fromJS({})

    return {
        currentUser: currentUserSelectors.getCurrentUser(state),
        customer,
        customerForIntegration,
        integration,
    }
})
export default class Event extends React.Component {
    static propTypes = {
        currentUser: ImmutablePropTypes.map.isRequired,
        customer: ImmutablePropTypes.map.isRequired,
        customerForIntegration: ImmutablePropTypes.map.isRequired,
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
        const {customerForIntegration: data} = this.props
        return data.get('orders', fromJS([])).find(order => order.get('id') === orderId) || fromJS({})
    }

    _getItem = (orderId, itemId) => {
        const order = this._getOrder(orderId)
        return order.get('line_items', fromJS([])).find(item => item.get('id') === itemId) || fromJS({})
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
                                return (
                                    <div>
                                        <b>{humanizeString(key)}</b>: {value}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )
        }

        return content
    }

    render() {
        const {currentUser, event, isLast, integration} = this.props
        const user = event.get('user')
        const status = event.getIn(['data', 'status'])
        const actionName = event.getIn(['data', 'action_name'])
        const payload = event.getIn(['data', 'payload'])

        const isError = status === 'error'
        const isSuccess = !isError

        const actionConfig = getActionByName(actionName)

        if (!actionConfig) {
            return null
        }

        const hasIntegration = !integration.isEmpty()

        let label = actionConfig.label
        let labelLink = ''
        let order = fromJS({})
        let item = fromJS({})

        if (hasIntegration) {
            // following code is made for Shopify events
            // split this when future integration events come
            order = this._getOrder(payload.get('order_id'))
            if (actionName.endsWith('Order')) {
                labelLink += order.get('name')
            } else if (actionName.endsWith('Item')) {
                item = this._getItem(payload.get('order_id'), payload.get('item_id'))
                labelLink += `${payload.get('quantity')} × ${item.get('name')}`
            }
        } else {
            label += ` #${payload.get('order_id')} (deleted integration)`
        }

        const shopName = integration.getIn(['meta', 'shop_name'])

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
                            <i
                                className={classnames('fitted icon', {
                                    remove: isError,
                                    check: isSuccess,
                                })}
                            />
                        </div>

                        <span className={css.actionName}>
                            {label} {' '}
                            {
                                !!labelLink && (
                                    <a
                                        href={`https://${shopName}.myshopify.com/admin/orders/${order.get('id')}`}
                                        target="_blank"
                                    >
                                        {labelLink}
                                    </a>
                                )
                            }
                        </span>

                        <span className={css.filler}>
                            by
                        </span>

                        <AgentLabel name={user.get('name')} />

                        <a
                            className="ml5i"
                            onClick={() => this.setState({showDetails: !this.state.showDetails})}
                        >
                            (details)
                        </a>
                    </div>

                    <div className={classnames('ticket-message-time', css.date)}>
                        <DatetimeLabel
                            dateTime={event.get('created_datetime')}
                            settings={{
                                position: 'top left'
                            }}
                            timezone={currentUser.get('timezone')}
                        />
                    </div>
                </div>
                <div
                    className={classnames('ui secondary segment', css.details, {
                        [css.hidden]: !this.state.showDetails,
                    })}
                >
                    {this._renderDetails(isError, event.get('data'))}
                </div>
            </div>
        )
    }
}
