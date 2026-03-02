import type { ContextType, FunctionComponent, ReactNode } from 'react'
import { Component, createContext, useContext } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import { LegacyBadge as Badge } from '@gorgias/axiom'

import {
    RECHARGE_CANCELLATION_REASONS,
    RECHARGE_DEFAULT_CANCELLATION_REASON,
} from 'config/integrations/constants/recharge'
import useAppSelector from 'hooks/useAppSelector'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import type { InfobarAction } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { renderTemplate } from 'pages/common/utils/template'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getActiveCustomerIntegrationDataByIntegrationId } from 'state/customers/selectors'
import * as ticketSelectors from 'state/ticket/selectors'
import type { RootState } from 'state/types'
import { devLog, humanizeString, isCurrentlyOnTicket } from 'utils'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import { formatRechargeDateTime } from '../helpers/formatRechargeDateTime'

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

const statusColors: Record<string, ColorType> = {
    active: 'success',
    cancelled: 'error',
}

export class AfterTitle extends Component<AfterTitleProps> {
    static contextType = OrderContext
    declare context: ContextType<typeof OrderContext>

    render() {
        const { isEditing, source } = this.props
        const { integrationId, isSubscriptionCancelled } = this.context

        if (isEditing || !integrationId) {
            return null
        }

        let actions: InfobarAction[] = [
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
                                    (option) => ({
                                        value: option,
                                        label: option,
                                    }),
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
                child: <>Cancel</>,
                leadingIcon: 'block',
            },
            {
                key: 'activate',
                options: [{ value: 'rechargeActivateSubscription' }],
                popover: 'This will activate the subscription in Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-2">refresh</i>
                        Activate subscription
                    </div>
                ),
                child: <>Activate</>,
                leadingIcon: 'attach_money',
            },
        ]

        const ignoredActions = [isSubscriptionCancelled ? 'cancel' : 'activate']

        // remove removed actions from list of available actions
        actions = actions.filter(
            (action) => !ignoredActions.includes(action.key),
        )
        const payload = {
            subscription_id: source.get('id'),
        }

        return (
            <>
                <ActionButtonsGroup actions={actions} payload={payload} />
                <StaticField label="Created">
                    <DatetimeLabel
                        dateTime={formatRechargeDateTime(
                            source.get('created_at'),
                        )}
                    />
                </StaticField>
            </>
        )
    }
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
    template: Map<any, any>
} & ConnectedProps<typeof connectorTitleWrapper>

export function TitleWrapperContainer({
    children,
    source,
    getIntegrationData,
    template,
}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { integration, integrationId } = useContext(IntegrationContext)
    const storeName = integration.getIn(['meta', 'store_name']) as string

    const customerHash = getIntegrationData(
        integrationId!,
        source.get('customer_id'),
    ).getIn(['customer', 'hash']) as string
    const subscriptionId = source.get('id') as string
    let link = undefined
    if (customerHash) {
        link = `https://${storeName}-sp.admin.rechargeapps.com/merchant/subscriptions/${subscriptionId}/details`

        const customLink = template.getIn(['meta', 'link'])

        if (customLink) {
            link = renderTemplate(
                customLink,
                source.set('customerHash', customerHash).toJS(),
            )
        }
    }

    const status = ((source.get('status') as string) || '').toLowerCase()

    return (
        <>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    logEvent(SegmentEvent.RechargeSubscriptionClicked, {
                        account_domain: currentAccount.get('domain'),
                    })
                }}
            >
                {children}
            </a>
            <div>
                <Badge
                    key="status"
                    type={statusColors[status]}
                    className="mt-2"
                >
                    {humanizeString(status)}
                </Badge>
            </div>
        </>
    )
}

const connectorTitleWrapper = connect((state: RootState) => {
    return {
        getIntegrationData: (integrationId: number, customerId: number) => {
            const integrationData = isCurrentlyOnTicket()
                ? ticketSelectors.getIntegrationDataByIntegrationId(
                      integrationId,
                  )(state)
                : getActiveCustomerIntegrationDataByIntegrationId(
                      integrationId as any,
                  )(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog(
                    '[INFOBAR][recharge][subscription] Could not find integration data for customer.',
                    {
                        customerId,
                        integrationId,
                    },
                )
                return fromJS({}) as Map<any, any>
            }

            return integrationData
        },
    }
})

export const TitleWrapper = connectorTitleWrapper(TitleWrapperContainer)

export const Wrapper: FunctionComponent<{
    source: Map<string, any>
    children: ReactNode
}> = ({ source: order = fromJS({}) as Map<string, any>, children }) => {
    const { integrationId, integration } = useContext(IntegrationContext)
    const isCancelled =
        !!order.get('cancelled_at') || order.get('status') === 'CANCELLED'
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

export const subscriptionCustomization: CardCustomization = {
    AfterTitle,
    TitleWrapper,
    Wrapper,
}
