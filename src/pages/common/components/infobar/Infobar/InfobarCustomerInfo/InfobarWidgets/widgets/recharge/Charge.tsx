import React, {
    ContextType,
    ReactNode,
    createContext,
    useContext,
    FunctionComponent,
} from 'react'
import {fromJS, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {CardBody} from 'reactstrap'
import _lowerCase from 'lodash/lowerCase'
import _groupBy from 'lodash/groupBy'

import {LineItem} from 'constants/integrations/types/shopify'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {renderTemplate} from 'pages/common/utils/template'
import {getActiveCustomerIntegrationDataByIntegrationId} from 'state/customers/selectors'
import {getIntegrationDataByIntegrationId} from 'state/ticket/selectors'
import {RootState} from 'state/types'
import {devLog, humanizeString, isCurrentlyOnTicket, toJS} from 'utils'

import ActionButtonsGroup from '../ActionButtonsGroup'
import {IntegrationContext} from '../IntegrationContext'

export default function Charge() {
    return {
        AfterTitle,
        BeforeContent,
        AfterContent,
        TitleWrapper,
        Wrapper,
    }
}

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

export class AfterTitle extends React.Component<{
    isEditing?: boolean
    source: Map<any, any>
}> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    render() {
        const {isEditing = false, source} = this.props
        const {integrationId} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        const total_price = parseFloat(source.get('total_price')) || 0
        const total_refunds = source.get('total_refunds') || 0

        let actions = [
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
                child: (
                    <>
                        <i className="material-icons">refresh</i> Refund
                    </>
                ),
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

export class SubscriptionAfterTitle extends React.Component<{
    isEditing?: boolean
    source: Map<any, any>
}> {
    static contextType = ChargeContext
    context!: ContextType<typeof ChargeContext>
    render() {
        const {isEditing = false, source} = this.props
        const {integrationId, chargeStatus} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        let actions = [
            {
                key: 'skip',
                options: [{value: 'rechargeSkipCharge'}],
                popover:
                    'Skip the charge for this subscription on Recharge. ' +
                    'No order will be created and no item will be shipped.',
                title: (
                    <div>
                        <i className="material-icons mr-1">block</i>
                        Skip charge on subscription
                    </div>
                ),
                child: (
                    <>
                        <i className="material-icons mr-1">block</i> Skip
                    </>
                ),
            },
            {
                key: 'unskip',
                options: [{value: 'rechargeUnskipCharge'}],
                popover: 'Unskip the charge for this subscription on Recharge.',
                title: (
                    <div>
                        <i className="material-icons mr-1">block</i>
                        Unskip charge on subscription
                    </div>
                ),
                child: (
                    <>
                        <i className="material-icons mr-1">autorenew</i> Unskip
                    </>
                ),
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
    success: ColorType.Success,
    error: ColorType.Error,
    queued: ColorType.Grey,
    partially_refunded: ColorType.Warning,
    refunded: ColorType.Warning,
    skipped: ColorType.Classic,
}

class BeforeContent extends React.Component<{
    source: Map<any, any>
}> {
    render() {
        const {source} = this.props

        const status = ((source.get('status') as string) || '').toLowerCase()

        return (
            <div>
                <div className="simple-field">
                    <span className="field-label">Status:</span>
                    <span className="field-value">
                        <Badge type={statusColors[status]}>
                            {humanizeString(status)}
                        </Badge>
                    </span>
                </div>
            </div>
        )
    }
}

export class AfterContent extends React.Component<{
    isEditing: boolean
    source: Map<any, any>
}> {
    render() {
        const {source, isEditing} = this.props

        const chargeSubscriptions = _groupBy(
            toJS(source.get('line_items')),
            (item: Record<string, unknown>) => item.subscription_id
        ) as {[key: string]: (LineItem & {id: string})[]}

        return (
            <div className="mt-2">
                {Object.keys(chargeSubscriptions).map((k) => {
                    return (
                        <div className="card" key={k}>
                            <CardBody className="header clearfix">
                                <a target="_blank">
                                    <span>
                                        <span
                                            role="img"
                                            aria-label="subscription emoji"
                                        >
                                            🔄
                                        </span>{' '}
                                        Subscription #{k}
                                    </span>
                                </a>
                                <SubscriptionAfterTitle
                                    isEditing={isEditing}
                                    source={fromJS({
                                        charge_id: source.get('id'),
                                        subscription_id: k,
                                    })}
                                />
                            </CardBody>
                            <CardBody className="content">
                                {chargeSubscriptions[k].map((item) => {
                                    return (
                                        <span key={`${k}-${item.id}`}>
                                            {item.title} ({item.quantity})
                                        </span>
                                    )
                                })}
                            </CardBody>
                        </div>
                    )
                })}
            </div>
        )
    }
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
    template: Map<any, any>
} & ConnectedProps<typeof connectorTitleWrapper>

export class TitleWrapperContainer extends React.Component<TitleWrapperProps> {
    static contextType = ChargeContext
    context!: ContextType<typeof ChargeContext>
    render() {
        const {children, template, source, getIntegrationData} = this.props
        const {integrationId} = this.context

        const customerHash = getIntegrationData(
            integrationId!,
            source.get('customer_id')
        ).getIn(['customer', 'hash'])

        let link = undefined
        const customLink = template.getIn(['meta', 'link'])

        if (customLink && customerHash) {
            link = renderTemplate(
                customLink,
                source.set('customerHash', customerHash).toJS()
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
                      integrationId
                  )(state)

            if (integrationData.getIn(['customer', 'id']) !== customerId) {
                devLog(
                    '[INFOBAR][recharge][charge] Could not find integration data for customer.',
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

const Wrapper: FunctionComponent<{source: Map<string, any>}> = ({
    source: charge = fromJS({}) as Map<string, any>,
    children,
}) => {
    const {integrationId} = useContext(IntegrationContext)
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
