import React, {
    ContextType,
    ReactNode,
    createContext,
    useContext,
    FunctionComponent,
} from 'react'
import {fromJS, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
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
import {getActiveCustomerIntegrationDataByIntegrationId} from '../../../../../../../../../state/customers/selectors'
import * as ticketSelectors from '../../../../../../../../../state/ticket/selectors'
import {RootState} from '../../../../../../../../../state/types'

import {DatetimeLabel} from '../../../../../../../utils/labels'
import ActionButtonsGroup from '../ActionButtonsGroup'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {IntegrationContext} from '../IntegrationContext'

export default function Subscription() {
    return {
        AfterTitle,
        TitleWrapper,
        Wrapper,
    }
}

const OrderContext = createContext<{
    order: Map<string, unknown> | null
    orderId: number | null
    isSubscriptionCancelled: boolean | null
    integrationId: number | null
    integration: Map<string, unknown>
}>({
    order: null,
    orderId: null,
    isSubscriptionCancelled: null,
    integrationId: null,
    integration: fromJS({}),
})

type AfterTitleProps = {
    isEditing: boolean
    source: Map<any, any>
}

const statusColors = {
    active: 'success',
    cancelled: 'danger',
}

export class AfterTitle extends React.Component<AfterTitleProps> {
    static contextType = OrderContext
    context!: ContextType<typeof OrderContext>

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
                                defaultValue:
                                    RECHARGE_DEFAULT_CANCELLATION_REASON,
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

        const ignoredActions = [isSubscriptionCancelled ? 'cancel' : 'activate']

        // remove removed actions from list of available actions
        actions = actions.filter(
            (action) => !ignoredActions.includes(action.key)
        )
        const payload = {
            subscription_id: source.get('id'),
        }

        const status = (
            (source.get('status') as string) || ''
        ).toLowerCase() as keyof typeof statusColors

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
    children: ReactNode
    source: Map<any, any>
    template: Map<any, any>
} & ConnectedProps<typeof connectorTitleWrapper>

export class TitleWrapperContainer extends React.Component<TitleWrapperProps> {
    static contextType = OrderContext
    context!: ContextType<typeof OrderContext>

    render() {
        const {children, source, getIntegrationData, template} = this.props
        const {integration, integrationId} = this.context
        const storeName = integration.getIn(['meta', 'store_name']) as string

        const customerHash = getIntegrationData(
            integrationId!,
            source.get('customer_id')
        ).getIn(['customer', 'hash']) as string
        const subscriptionId = source.get('id') as string
        let link = undefined
        if (customerHash) {
            link = `https://${storeName}-sp.admin.rechargeapps.com/admin/customers/${customerHash}/subscriptions/${subscriptionId}`

            const customLink = template.getIn(['meta', 'link'])

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

const connectorTitleWrapper = connect((state: RootState) => {
    return {
        getIntegrationData: (integrationId: number, customerId: number) => {
            const integrationData = isCurrentlyOnTicket()
                ? ticketSelectors.getIntegrationDataByIntegrationId(
                      integrationId
                  )(state)
                : getActiveCustomerIntegrationDataByIntegrationId(
                      integrationId as any
                  )(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog(
                    '[INFOBAR][recharge][subscription] Could not find integration data for customer.',
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
})

export const TitleWrapper = connectorTitleWrapper(TitleWrapperContainer)

export const Wrapper: FunctionComponent<{source: Map<string, any>}> = ({
    source: order = fromJS({}) as Map<string, any>,
    children,
}) => {
    const {integrationId, integration} = useContext(IntegrationContext)
    const isCancelled = !!order.get('cancelled_at')
    return (
        <OrderContext.Provider
            value={{
                order,
                orderId: order.get('id'),
                isSubscriptionCancelled: isCancelled,
                integrationId,
                integration,
            }}
        >
            {children}
        </OrderContext.Provider>
    )
}
