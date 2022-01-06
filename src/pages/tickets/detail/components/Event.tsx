import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import {Button, Card, CardBody} from 'reactstrap'
import _capitalize from 'lodash/capitalize'
import _isObject from 'lodash/isObject'
import JSONPretty from 'react-json-pretty'

import {IntegrationType} from '../../../../models/integration/types'
import {RootState} from '../../../../state/types'
import {getActionByName} from '../../../../config/actions'
import {AgentLabel, DatetimeLabel} from '../../../common/utils/labels'
import {humanizeString, stripErrorMessage} from '../../../../utils'

import {getIntegrationById} from '../../../../state/integrations/selectors'
import {getIntegrationDataByIntegrationId} from '../../../../state/ticket/selectors'

import css from './Event.less'

export function renderDetails(isError: boolean, eventData: Map<any, any>) {
    const payload = (eventData.get('payload') || fromJS({})) as Map<any, any>
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
                                        data={(value as Map<any, any>).toJS()}
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

type OwnProps = {
    event: Map<any, any>
    isLast: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    showDetails: boolean
}

export class EventContainer extends React.Component<Props, State> {
    static defaultProps: Pick<Props, 'isLast'> = {
        isLast: false,
    }

    state = {
        showDetails: false,
    }

    _getOrder = (orderId: number) => {
        const {integrationData: data} = this.props
        return (((data.get('orders') || fromJS([])) as List<any>).find(
            (order: Map<any, any>) =>
                (order.get('id') as number).toString() === orderId.toString()
        ) || fromJS({})) as Map<any, any>
    }

    _getItem = (orderId: number, itemId: number) => {
        const order = this._getOrder(orderId)
        return (((order.get('line_items') || fromJS([])) as List<any>).find(
            (item: Map<any, any>) =>
                (item.get('id') as number).toString() === itemId.toString()
        ) || fromJS({})) as Map<any, any>
    }

    _getSubscription = (subscriptionId: number) => {
        const {integrationData: data} = this.props
        return (((data.get('subscriptions') || fromJS([])) as List<any>).find(
            (subscription: Map<any, any>) =>
                (subscription.get('id') as number).toString() ===
                subscriptionId.toString()
        ) || fromJS({})) as Map<any, any>
    }

    _getCharge = (chargeId: number) => {
        const {integrationData: data} = this.props
        return (((data.get('charges') || fromJS([])) as List<any>).find(
            (charge: Map<any, any>) =>
                (charge.get('id') as number).toString() === chargeId.toString()
        ) || fromJS({})) as Map<any, any>
    }

    getDisplayableType(integrationType: IntegrationType) {
        if (integrationType === IntegrationType.SmoochInside) {
            return 'chat'
        }

        return integrationType
    }

    render() {
        const {event, isLast, integration, integrationData} = this.props
        const user = (event.get('user') || fromJS({})) as Map<any, any>
        const status = event.getIn(['data', 'status'])
        const actionName = event.getIn(['data', 'action_name'])
        const payload = (event.getIn(['data', 'payload']) || fromJS({})) as Map<
            any,
            any
        >

        const isError = status === 'error'
        const isSuccess = !isError

        const actionConfig = getActionByName(actionName)

        if (!actionConfig) {
            return null
        }

        const hasIntegration = !integration.isEmpty()

        let actionLabel =
            event.getIn(['data', 'action_label']) || actionConfig.label
        let objectLabel = ''
        let objectLink = ''
        const eventIcon = (
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

        const shouldDisplayIntegration = true

        if (hasIntegration) {
            if (integration.get('type') === 'shopify') {
                const shopName = integration.getIn([
                    'meta',
                    'shop_name',
                ]) as string
                const orderId = payload.get('order_id')

                if (actionConfig.objectType === 'draftOrder') {
                    objectLabel += payload.get('draft_order_name')
                    objectLink = `https://${shopName}.myshopify.com/admin/draft_orders/${
                        payload.get('draft_order_id') as number
                    }`
                } else if (orderId) {
                    const order = this._getOrder(orderId)

                    if (actionConfig.objectType === 'order') {
                        objectLabel += order.get('name')
                        objectLink = `https://${shopName}.myshopify.com/admin/orders/${
                            order.get('id') as number
                        }`
                    } else if (actionConfig.objectType === 'item') {
                        const item = this._getItem(
                            payload.get('order_id'),
                            payload.get('item_id')
                        )
                        objectLabel += `${
                            payload.get('quantity') as number
                        } × ${item.get('name') as string}`
                        objectLink = `https://${shopName}.myshopify.com/admin/orders/${
                            order.get('id') as number
                        }`
                    }
                }
            } else if (integration.get('type') === 'recharge') {
                const storeName = integration.getIn([
                    'meta',
                    'store_name',
                ]) as string
                const hash = integrationData.getIn([
                    'customer',
                    'hash',
                ]) as string

                if (actionConfig.objectType === 'subscription') {
                    const subscription = this._getSubscription(
                        payload.get('subscription_id')
                    )
                    objectLabel += subscription.get('id')
                    objectLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/subscriptions/${
                        subscription.get('id') as number
                    }`
                } else if (actionConfig.objectType === 'charge') {
                    const charge = this._getCharge(payload.get('charge_id'))
                    objectLabel += charge.get('id')
                    objectLink = `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/orders`
                }
            }
        } else {
            actionLabel += ` #${
                payload.get('order_id') as number
            } (deleted integration)`
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

                        <AgentLabel name={user.get('name') as string} />

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
                        className={classnames(css.date, 'text-faded')}
                    />
                </div>

                <Card
                    className={classnames(css.details, {
                        'd-none': !this.state.showDetails,
                    })}
                >
                    <CardBody>
                        {renderDetails(isError, event.get('data'))}
                    </CardBody>
                </Card>
            </div>
        )
    }
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    const {event} = ownProps

    const integration = getIntegrationById(
        event.getIn(['data', 'integration_id'])
    )(state)

    return {
        integrationData: getIntegrationDataByIntegrationId(
            integration.get('id', '') as number
        )(state),
        integration,
    }
})

export default connector(EventContainer)
