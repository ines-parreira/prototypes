import type { ContextType, FunctionComponent, ReactNode } from 'react'
import { Component, createContext, useContext } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _groupBy from 'lodash/groupBy'
import _lowerCase from 'lodash/lowerCase'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import { LegacyBadge as Badge } from '@gorgias/axiom'

import type { LineItem } from 'constants/integrations/types/shopify'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import type { InfobarAction } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import { renderTemplate } from 'pages/common/utils/template'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getActiveCustomerIntegrationDataByIntegrationId } from 'state/customers/selectors'
import { getIntegrationDataByIntegrationId } from 'state/ticket/selectors'
import type { RootState } from 'state/types'
import { devLog, humanizeString, isCurrentlyOnTicket, toJS } from 'utils'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

const ChargeContext = createContext<{
    charge: Map<string, unknown> | null
    chargeId: number | null
    chargeStatus: string | null
    integrationId: number | null
}>({
    charge: null,
    chargeId: null,
    chargeStatus: null,
    integrationId: null,
})

export class AfterTitle extends Component<{
    isEditing?: boolean
    source: Map<any, any>
}> {
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>
    render() {
        const { isEditing = false, source } = this.props
        const { integrationId } = this.context

        if (isEditing || !integrationId) {
            return null
        }

        const total_price = parseFloat(source.get('total_price')) || 0
        const total_refunds = source.get('total_refunds') || 0

        let actions: InfobarAction[] = [
            {
                key: 'refund',
                popover:
                    'This will refund the charge in Recharge with the amount specified below.',
                options: [
                    {
                        value: 'rechargeRefundCharge',
                        label: 'Refund charge',
                        parameters: [
                            {
                                name: 'amount',
                                type: 'number',
                                defaultValue: total_price - total_refunds,
                                placeholder: 'Amount',
                                required: true,
                                step: 0.01,
                                min: 0.01,
                                max: total_price - total_refunds,
                            },
                        ],
                    },
                ],
                title: (
                    <div>
                        <i className="material-icons mr-2">refresh</i>
                        Refund charge
                    </div>
                ),
                child: <>Refund</>,
                leadingIcon: 'attach_money',
            },
        ]

        const status = source.get('status')
        const removed = !['SUCCESS', 'PARTIALLY_REFUNDED'].includes(status)
            ? ['refund']
            : []

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !removed.includes(action.key))

        const payload = {
            charge_id: source.get('id'),
        }

        return <ActionButtonsGroup payload={payload} actions={actions} />
    }
}

export class SubscriptionAfterTitle extends Component<{
    isEditing?: boolean
    source: Map<any, any>
}> {
    static contextType = ChargeContext
    declare context: ContextType<typeof ChargeContext>
    render() {
        const { isEditing = false, source } = this.props
        const { integrationId, chargeStatus } = this.context

        if (isEditing || !integrationId) {
            return null
        }

        let actions: InfobarAction[] = [
            {
                key: 'skip',
                options: [{ value: 'rechargeSkipCharge' }],
                popover:
                    'Skip the charge for this subscription on Recharge. ' +
                    'No order will be created and no item will be shipped.',
                title: (
                    <div>
                        <i className="material-icons mr-1">block</i>
                        Skip charge on subscription
                    </div>
                ),
                child: <>Skip</>,
                leadingIcon: 'block',
            },
            {
                key: 'unskip',
                options: [{ value: 'rechargeUnskipCharge' }],
                popover: 'Unskip the charge for this subscription on Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-1">block</i>
                        Unskip charge on subscription
                    </div>
                ),
                child: <>Unskip</>,
                leadingIcon: 'autorenew',
            },
        ]

        let removed: string[] = []

        if (chargeStatus !== 'queued') {
            removed = removed.concat(['skip'])
        }

        if (chargeStatus !== 'skipped') {
            removed = removed.concat(['unskip'])
        }

        // remove removed actions from list of available actions
        actions = actions.filter((action) => !removed.includes(action.key))

        const payload = {
            charge_id: source.get('charge_id'),
            subscription_id: source.get('subscription_id'),
        }

        return <ActionButtonsGroup payload={payload} actions={actions} />
    }
}

const statusColors: Record<string, ColorType> = {
    success: 'success',
    error: 'error',
    queued: 'grey',
    partially_refunded: 'warning',
    refunded: 'warning',
    skipped: 'classic',
}

class BeforeContent extends Component<{
    source: Map<any, any>
}> {
    render() {
        const { source } = this.props

        const status = ((source.get('status') as string) || '').toLowerCase()

        return (
            <StaticField label="Status">
                <Badge type={statusColors[status]}>
                    {humanizeString(status)}
                </Badge>
            </StaticField>
        )
    }
}

export class AfterContent extends Component<{
    isEditing: boolean
    source: Map<any, any>
}> {
    render() {
        const { source, isEditing } = this.props

        const chargeSubscriptions = _groupBy(
            toJS(source.get('line_items')),
            (item: Record<string, unknown>) => item.subscription_id,
        ) as { [key: string]: (LineItem & { id: string })[] }

        return Object.keys(chargeSubscriptions).map((k) => {
            return (
                <div key={k}>
                    <StaticField>
                        <span role="img" aria-label="subscription emoji">
                            🔄
                        </span>{' '}
                        Subscription #{k}
                    </StaticField>
                    <SubscriptionAfterTitle
                        isEditing={isEditing}
                        source={fromJS({
                            charge_id: source.get('id'),
                            subscription_id: k,
                        })}
                    />
                    {chargeSubscriptions[k].map((item) => {
                        return (
                            <StaticField key={`${k}-${item.id}`}>
                                {item.title} ({item.quantity})
                            </StaticField>
                        )
                    })}
                </div>
            )
        })
    }
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
    template: Map<any, any>
} & ConnectedProps<typeof connectorTitleWrapper>

export class TitleWrapperContainer extends Component<TitleWrapperProps> {
    static contextType = ChargeContext
    declare context: ContextType<typeof ChargeContext>
    render() {
        const { children, template, source, getIntegrationData } = this.props
        const { integrationId } = this.context

        const customerHash = getIntegrationData(
            integrationId!,
            source.get('customer_id'),
        ).getIn(['customer', 'hash'])

        let link = undefined
        const customLink = template.getIn(['meta', 'link'])

        if (customLink && customerHash) {
            link = renderTemplate(
                customLink,
                source.set('customerHash', customerHash).toJS(),
            )
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
        getIntegrationData: (integrationId: number, customerId: string) => {
            const integrationData = isCurrentlyOnTicket()
                ? getIntegrationDataByIntegrationId(integrationId)(state)
                : getActiveCustomerIntegrationDataByIntegrationId(
                      integrationId,
                  )(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog(
                    '[INFOBAR][recharge][charge] Could not find integration data for customer.',
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

const Wrapper: FunctionComponent<{
    source: Map<string, any>
    children: ReactNode
}> = ({ source: charge = fromJS({}) as Map<string, any>, children }) => {
    const { integrationId } = useContext(IntegrationContext)
    return (
        <ChargeContext.Provider
            value={{
                charge,
                chargeId: charge.get('id', null),
                chargeStatus: _lowerCase(charge.get('status', null)),
                integrationId,
            }}
        >
            {children}
        </ChargeContext.Provider>
    )
}

export const chargeCustomization: CardCustomization = {
    AfterTitle,
    BeforeContent,
    AfterContent,
    TitleWrapper,
    Wrapper,
}
