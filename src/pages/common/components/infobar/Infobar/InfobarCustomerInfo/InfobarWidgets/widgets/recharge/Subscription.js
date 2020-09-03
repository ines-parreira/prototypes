// @flow
import React, {type Node} from 'react'
import {fromJS, type Map} from 'immutable'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Badge} from 'reactstrap'

import {
    devLog,
    humanizeString,
    isCurrentlyOnTicket,
} from '../../../../../../../../../utils'
import {renderTemplate} from '../../../../../../../utils/template'

import {
    RECHARGE_CANCELLATION_REASONS,
    RECHARGE_DEFAULT_CANCELLATION_REASON,
} from '../../../../../../../../../config/integrations/recharge'
import {getActiveCustomerIntegrationDataByIntegrationId} from '../../../../../../../../../state/customers/selectors.ts'
import * as ticketSelectors from '../../../../../../../../../state/ticket/selectors.ts'

import {DatetimeLabel} from '../../../../../../../utils/labels'
import ActionButtonsGroup from '../ActionButtonsGroup'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'

export default function Subscription() {
    return {
        AfterTitle,
        TitleWrapper,
        Wrapper,
    }
}

type AfterTitleProps = {
    isEditing: boolean,
    source: Map<*, *>,
}

const statusColors = {
    active: 'success',
    cancelled: 'danger',
}

export class AfterTitle extends React.Component<AfterTitleProps> {
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
                options: [
                    {
                        value: 'rechargeCancelSubscription',
                        parameters: [
                            {
                                name: 'cancellation_reason',
                                label: 'Cancellation reason',
                                type: 'select',
                                options: RECHARGE_CANCELLATION_REASONS.map(
                                    (option) => ({value: option, label: option})
                                ),
                                defaultValue: RECHARGE_DEFAULT_CANCELLATION_REASON,
                                allowCustomValue: true,
                                required: true,
                            },
                        ],
                    },
                ],
                popover: 'This will cancel the subscription in Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-2">block</i>
                        Cancel subscription
                    </div>
                ),
                child: (
                    <>
                        <i className="material-icons">block</i> Cancel
                    </>
                ),
            },
            {
                key: 'activate',
                options: [{value: 'rechargeActivateSubscription'}],
                popover: 'This will activate the subscription in Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-2">refresh</i>
                        Activate subscription
                    </div>
                ),
                child: (
                    <>
                        <i className="material-icons">refresh</i> Activate
                    </>
                ),
            },
        ]

        let ignoredActions = [isSubscriptionCancelled ? 'cancel' : 'activate']

        // remove removed actions from list of available actions
        actions = actions.filter(
            (action) => !ignoredActions.includes(action.key)
        )
        const payload = {
            subscription_id: source.get('id'),
        }

        const status = (source.get('status') || '').toLowerCase()

        return (
            <>
                <Badge
                    key="status"
                    pill
                    color={statusColors[status]}
                    className="ml-1"
                >
                    {humanizeString(status)}
                </Badge>
                <ActionButtonsGroup actions={actions} payload={payload} />
                <CardHeaderDetails>
                    <CardHeaderValue label="Created">
                        <DatetimeLabel
                            key="created-at"
                            dateTime={source.get('created_at')}
                        />
                    </CardHeaderValue>
                </CardHeaderDetails>
            </>
        )
    }
}

type TitleWrapperProps = {
    children: ?Node,
    source: Map<*, *>,
    template: Map<*, *>,
    getIntegrationData: (number, number) => Map<*, *>,
}

@connect((state) => {
    return {
        getIntegrationData: (integrationId, customerId) => {
            const integrationData = isCurrentlyOnTicket()
                ? ticketSelectors.getIntegrationDataByIntegrationId(
                      integrationId
                  )(state)
                : getActiveCustomerIntegrationDataByIntegrationId(
                      integrationId
                  )(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog(
                    '[INFOBAR][recharge][subscription] Could not find integration data for customer.',
                    {
                        customerId,
                        integrationId,
                    }
                )
                return fromJS({})
            }

            return integrationData
        },
    }
})
export class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source, getIntegrationData, template} = this.props
        const {integration} = this.context
        const storeName = integration.getIn(['meta', 'store_name'])
        const customerHash = getIntegrationData(
            integration.get('id'),
            source.get('customer_id')
        ).getIn(['customer', 'hash'])

        let link = null

        if (customerHash) {
            link = `https://${storeName}.myshopify.com/tools/recurring/customers/${customerHash}/`

            let customLink = template.getIn(['meta', 'link'])

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

type WrapperProps = {
    children: Node,
    source: Map<*, *>,
}

class Wrapper extends React.Component<WrapperProps> {
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
