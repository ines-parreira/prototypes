import React, {ReactNode} from 'react'
import {fromJS, Map, List} from 'immutable'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect, ConnectedProps} from 'react-redux'
import {Badge} from 'reactstrap'

import {getActiveCustomerIntegrationDataByIntegrationId} from '../../../../../../../../../state/customers/selectors'
import {
    devLog,
    humanizeString,
    isCurrentlyOnTicket,
} from '../../../../../../../../../utils'
import {getIntegrationDataByIntegrationId} from '../../../../../../../../../state/ticket/selectors'
import {renderTemplate} from '../../../../../../../utils/template'
import {DatetimeLabel} from '../../../../../../../utils/labels'
import {RootState} from '../../../../../../../../../state/types'
import ActionButtonsGroup from '../ActionButtonsGroup'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'

const makeGetIntegrationData = (state: RootState) => {
    return {
        getIntegrationData: (integrationId: string, customerId: string) => {
            const integrationData = isCurrentlyOnTicket()
                ? getIntegrationDataByIntegrationId(integrationId as any)(state)
                : getActiveCustomerIntegrationDataByIntegrationId(
                      integrationId
                  )(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog(
                    '[INFOBAR][recharge][order] Could not find integration data for customer.',
                    {
                        customerId,
                        integrationId,
                    }
                )
                return fromJS({}) as Map<any, any>
            }

            return integrationData
        },
    }
}

export default function Order() {
    return {
        AfterTitle: ConnectedAfterTitle,
        BeforeContent: ConnectedBeforeContent,
        TitleWrapper: ConnectedTitleWrapper,
        Wrapper,
    }
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<any, any>
} & ConnectedProps<typeof connectorAfterTitle>

export class AfterTitle extends React.Component<AfterTitleProps> {
    static contextTypes = {
        integrationId: PropTypes.number,
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
        isChargeRefundable: PropTypes.bool.isRequired,
    }

    _getActions = () => {
        const {source, getIntegrationData} = this.props
        const {
            integrationId,
            isOrderCancelled,
            isOrderRefunded,
            isChargeRefundable,
        }: {
            integrationId: number
            isOrderCancelled: boolean
            isOrderRefunded: boolean
            isChargeRefundable: boolean
        } = this.context

        const orderTotalPrice: number = parseFloat(
            source.get('total_price') || '0'
        )

        const charges = getIntegrationData(
            integrationId as any,
            source.get('customer_id')
        ).get('charges') as List<any>
        const associatedCharge = charges
            ? (charges.find(
                  (charge: Map<any, any>) =>
                      charge.get('id') === source.get('charge_id')
              ) as Map<any, any>)
            : null
        const chargeTotalRefunds: number = associatedCharge
            ? parseFloat(associatedCharge.get('total_refunds') || '0')
            : 0

        const actions = [
            {
                key: 'refund',
                options: [
                    {
                        value: 'rechargeRefundOrder',
                        parameters: [
                            {
                                name: 'amount',
                                type: 'number',
                                defaultValue: parseFloat(
                                    (
                                        orderTotalPrice - chargeTotalRefunds
                                    ).toFixed(2)
                                ),
                                label: 'Amount',
                                placeholder: 'Amount',
                                required: true,
                                step: 0.01,
                                min: 0.01,
                                max: parseFloat(
                                    (
                                        orderTotalPrice - chargeTotalRefunds
                                    ).toFixed(2)
                                ),
                            },
                        ],
                    },
                ],
                popover: 'This will refund the order in Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-2">refresh</i>
                        Refund order
                    </div>
                ),
                child: (
                    <>
                        <i className="material-icons">refresh</i> Refund
                    </>
                ),
            },
        ]

        let ignoredActions: string[] = []
        if (isOrderCancelled || isOrderRefunded || !isChargeRefundable) {
            ignoredActions = ['refund']
        }

        // remove removed actions from list of available actions
        return actions.filter((action) => !ignoredActions.includes(action.key))
    }

    render() {
        const {isEditing, source} = this.props
        const {integrationId}: {integrationId: number} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        const payload = {
            order_id: source.get('id'),
        }

        const chargeStatus = (
            (source.get('charge_status') as string) || ''
        ).toLowerCase() as keyof typeof chargeStatusColors

        return (
            <>
                <ActionButtonsGroup
                    actions={this._getActions()}
                    payload={payload}
                />
                <CardHeaderDetails>
                    <CardHeaderValue label="Created">
                        <DatetimeLabel
                            key="created-at"
                            dateTime={source.get('created_at')}
                        />
                    </CardHeaderValue>
                    <CardHeaderValue>
                        <Badge
                            key="status"
                            pill
                            color={chargeStatusColors[chargeStatus]}
                        >
                            {humanizeString(chargeStatus)}
                        </Badge>
                    </CardHeaderValue>
                </CardHeaderDetails>
            </>
        )
    }
}

const connectorAfterTitle = connect(makeGetIntegrationData)

const ConnectedAfterTitle = connectorAfterTitle(AfterTitle)

const chargeStatusColors = {
    success: 'success',
    error: 'danger',
    queued: 'default',
    partially_refunded: 'warning',
    refunded: 'warning',
    skipped: 'info',
}

type BeforeContentProps = {
    source: Map<any, any>
} & ConnectedProps<typeof connectorBeforeContent>

export class BeforeContent extends React.Component<BeforeContentProps> {
    static contextTypes = {
        integrationId: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {source, getIntegrationData} = this.props
        const {integrationId} = this.context
        const charges = getIntegrationData(
            integrationId,
            source.get('customer_id')
        ).get('charges') as List<any>
        const associatedCharge = charges
            ? (charges.find(
                  (charge: Map<any, any>) =>
                      charge.get('id') === source.get('charge_id')
              ) as Map<any, any>)
            : null
        const chargeTotalRefunds = associatedCharge
            ? associatedCharge.get('total_refunds')
            : '0'

        return [
            <div key="charge-total-refunds" className="simple-field">
                <span className="field-label">Total refunds on charge:</span>
                <span className="field-value">
                    ${chargeTotalRefunds || '0.00'}
                </span>
            </div>,
        ]
    }
}

const connectorBeforeContent = connect(makeGetIntegrationData)

const ConnectedBeforeContent = connectorBeforeContent(BeforeContent)

type TitleWrapperProps = {
    children: ReactNode | null
    source: Map<any, any>
    template: Map<any, any>
} & ConnectedProps<typeof connectorTitleWrapper>

export class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source, getIntegrationData, template} = this.props
        const {integration} = this.context as {integration: Map<any, any>}
        const storeName = integration.getIn(['meta', 'store_name']) as string
        const customerHash = getIntegrationData(
            integration.get('id'),
            source.get('customer_id')
        ).getIn(['customer', 'hash']) as string
        const customerId = source.get('customer_id') as string
        const orderId = source.get('id') as string

        let link = undefined

        if (customerHash) {
            link = `https://${storeName}-sp.admin.rechargeapps.com/admin/customers/${customerId}/orders/history/${orderId}`
            const customLink = template.getIn(['meta', 'link']) as string

            if (customLink) {
                link = renderTemplate(
                    customLink,
                    source.set('customerHash', customerHash).toJS()
                )
            }
        }

        return (
            <a href={link} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        )
    }
}

const connectorTitleWrapper = connect(makeGetIntegrationData)

const ConnectedTitleWrapper = connectorTitleWrapper(TitleWrapper)

type WrapperProps = {
    children: ReactNode
    source: Map<any, any>
}

class Wrapper extends React.Component<WrapperProps> {
    static childContextTypes = {
        order: ImmutablePropTypes.map.isRequired,
        orderId: PropTypes.number,
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
        isChargeRefundable: PropTypes.bool.isRequired,
    }

    getChildContext() {
        const order = this.props.source || fromJS({})

        const isOrderRefunded = order.get('status') === 'refunded'
        const isOrderCancelled = order.get('status') === 'cancelled'

        const isChargeRefundable = ['success', 'partially_refunded'].includes(
            ((order.get('charge_status') as string) || '').toLowerCase()
        )

        return {
            order,
            orderId: order.get('id'),
            isOrderCancelled,
            isOrderRefunded,
            isChargeRefundable,
        }
    }

    render() {
        return this.props.children
    }
}
