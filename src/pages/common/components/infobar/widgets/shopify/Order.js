import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {UncontrolledButtonDropdown, Badge, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {humanizeString} from '../../../../../../utils'

import ActionButton from '../ActionButton'

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
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
    }

    render() {
        const {source} = this.props
        const {integrationId, isOrderCancelled, isOrderRefunded} = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        let actions = [
            {
                actionName: 'shopifyRefundShippingCostOfOrder',
                reason: 'refund the shipping cost of this order',
                child: (
                    <div>
                        <i className="fa fa-fw fa-truck mr-2" />
                        Refund shipping
                    </div>
                )
            },
            {
                actionName: 'shopifyCancelOrder',
                reason: 'cancel this order',
                tooltip: 'Cancel & refund the order on Shopify. Notify the customer via email',
                child: (
                    <div>
                        <i className="fa fa-fw fa-ban mr-1" />
                        Cancel
                    </div>
                )
            },
            {
                actionName: 'shopifyFullRefundOrder',
                reason: 'refund this order',
                tooltip: 'Refund order without restocking items',
                child: (
                    <div>
                        <i className="fa fa-fw fa-repeat mr-2" />
                        Full refund
                    </div>
                )
            },
            {
                actionName: 'shopifyDuplicateOrder',
                reason: 'duplicate this order',
                child: (
                    <div>
                        <i className="fa fa-fw fa-clone mr-2" />
                        Duplicate order
                    </div>
                )
            }
        ]

        let removed = []

        if (isOrderCancelled) {
            removed = removed.concat(['shopifyCancelOrder'])
        }

        if (isOrderRefunded) {
            removed = removed.concat(['shopifyRefundShippingCostOfOrder', 'shopifyFullRefundOrder'])
        }

        // remove removed actions from list of available actions
        actions = actions.filter(action => !removed.includes(action.actionName))

        const payload = {
            order_id: source.get('id'),
        }

        const buttons = actions.slice(0, 2)
        const dropdownOptions = actions.slice(2)

        return (
            <div className="action-buttons">
                {
                    buttons.map((action) => {
                        return (
                            <ActionButton
                                key={action.actionName}
                                tag="button"
                                className="btn btn-sm btn-secondary action-button"
                                actionName={action.actionName}
                                reason={action.reason}
                                payload={payload}
                                tooltip={action.tooltip}
                            >
                                {action.child}
                            </ActionButton>
                        )
                    })
                }
                {
                    dropdownOptions.length > 0 && (
                        <UncontrolledButtonDropdown className="action-dropdown">
                            <DropdownToggle
                                caret
                                className="caret-only"
                                type="button"
                                color="secondary"
                                size="sm"
                            />
                            <DropdownMenu right>
                                {
                                    dropdownOptions.map((action) => {
                                        return (
                                            <ActionButton
                                                key={action.actionName}
                                                className="dropdown-item"
                                                actionName={action.actionName}
                                                reason={action.reason}
                                                payload={payload}
                                                tag={DropdownItem}
                                            >
                                                {action.child}
                                            </ActionButton>
                                        )
                                    })
                                }
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    )
                }
            </div>
        )
    }
}

const statusColors = {
    pending: 'secondary',
    partially_paid: 'success',
    paid: 'success',
    partially_refunded: 'warning',
    refunded: 'warning',
}

class BeforeContent extends React.Component { // eslint-disable-line
    static propTypes = {
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        isOrderCancelled: PropTypes.bool.isRequired,
    }

    render() {
        const {source} = this.props
        const {isOrderCancelled} = this.context

        const status = source.get('financial_status')

        return (
            <div className="simple-field">
                <span className="field-label">
                    Status:
                </span>
                <span className="field-value">
                    <Badge color={statusColors[status] || 'secondary'}>
                        {humanizeString(status)}
                    </Badge>
                    {
                        isOrderCancelled && (
                            <Badge
                                color="danger"
                                className="ml-2"
                            >
                                Cancelled
                            </Badge>
                        )
                    }
                </span>
            </div>
        )
    }
}

class TitleWrapper extends React.Component { // eslint-disable-line
    static propTypes = {
        children: PropTypes.node,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName = this.context.integration.getIn(['meta', 'shop_name'])

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/orders/${source.get('id')}`}
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
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
    }

    getChildContext() {
        const order = this.props.source || fromJS({})

        const isCancelled = !!order.get('cancelled_at')

        const isRefunded = !order.get('refunds', fromJS([])).isEmpty()

        return {
            order,
            orderId: order.get('id'),
            isOrderCancelled: isCancelled,
            isOrderRefunded: isRefunded,
        }
    }

    render() {
        return this.props.children
    }
}
