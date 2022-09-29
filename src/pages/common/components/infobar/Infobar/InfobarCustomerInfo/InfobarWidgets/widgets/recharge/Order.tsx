import React, {
    ContextType,
    ReactNode,
    createContext,
    useContext,
    FunctionComponent,
} from 'react'
import {fromJS, Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {devLog, humanizeString, isCurrentlyOnTicket} from 'utils'
import {RECHARGE_INTEGRATION_TYPE} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getActiveCustomerIntegrationDataByIntegrationId} from 'state/customers/selectors'
import {getIntegrationDataByIntegrationId} from 'state/ticket/selectors'
import {RootState} from 'state/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {renderTemplate} from 'pages/common/utils/template'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import ActionButtonsGroup from '../ActionButtonsGroup'
import {StaticField} from '../StaticField'
import css from './Order.less'

const OrderContext = createContext<{
    order: Map<string, unknown> | null
    orderId: number | null
    isOrderCancelled: boolean | null
    isOrderRefunded: boolean | null
    isChargeRefundable: boolean | null
    integrationId: number | null
    integration: Map<string, unknown>
}>({
    order: null,
    orderId: null,
    isOrderCancelled: null,
    isOrderRefunded: null,
    isChargeRefundable: null,
    integrationId: null,
    integration: fromJS({}),
})

const makeGetIntegrationData = (state: RootState) => {
    return {
        getIntegrationData: (integrationId: number, customerId: string) => {
            const integrationData = isCurrentlyOnTicket()
                ? getIntegrationDataByIntegrationId(integrationId)(state)
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
    static contextType = OrderContext
    context!: ContextType<typeof OrderContext>

    _getActions = () => {
        const {source, getIntegrationData} = this.props
        const {
            integrationId,
            isOrderCancelled,
            isOrderRefunded,
            isChargeRefundable,
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
                        <ButtonIconLabel icon="attach_money" /> Refund
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
        const {integrationId} = this.context

        if (isEditing || !integrationId) {
            return null
        }

        const payload = {
            order_id: source.get('id'),
        }

        return (
            <>
                <ActionButtonsGroup
                    actions={this._getActions()}
                    payload={payload}
                />
                <StaticField label="Created">
                    <DatetimeLabel
                        key="created-at"
                        dateTime={source.get('created_at')}
                        integrationType={RECHARGE_INTEGRATION_TYPE}
                    />
                </StaticField>
            </>
        )
    }
}

const connectorAfterTitle = connect(makeGetIntegrationData)

const ConnectedAfterTitle = connectorAfterTitle(AfterTitle)

const chargeStatusColors: Record<string, ColorType> = {
    success: ColorType.Success,
    error: ColorType.Error,
    queued: ColorType.Grey,
    partially_refunded: ColorType.Warning,
    refunded: ColorType.Warning,
    skipped: ColorType.Classic,
}

type BeforeContentProps = {
    source: Map<any, any>
} & ConnectedProps<typeof connectorBeforeContent>

export class BeforeContent extends React.Component<BeforeContentProps> {
    static contextType = OrderContext
    context!: ContextType<typeof OrderContext>
    render() {
        const {source, getIntegrationData} = this.props
        const {integrationId} = this.context

        const charges = getIntegrationData(
            integrationId!,
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

        return (
            <StaticField label="Total refunds on charge">
                {chargeTotalRefunds || '0.00'}
            </StaticField>
        )
    }
}

const connectorBeforeContent = connect(makeGetIntegrationData)

const ConnectedBeforeContent = connectorBeforeContent(BeforeContent)

type TitleWrapperProps = {
    children: ReactNode | null
    source: Map<any, any>
    template: Map<any, any>
} & ConnectedProps<typeof connectorTitleWrapper>

export function TitleWrapper({
    children,
    source,
    getIntegrationData,
    template,
}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration, integrationId} = useContext(IntegrationContext)
    const storeName = integration.getIn(['meta', 'store_name']) as string

    const customerHash = getIntegrationData(
        integrationId!,
        source.get('customer_id')
    ).getIn(['customer', 'hash']) as string
    const orderId = source.get('id') as string

    let link = undefined

    if (customerHash) {
        link = `https://${storeName}-sp.admin.rechargeapps.com/merchant/orders/${orderId}`
        const customLink = template.getIn(['meta', 'link']) as string

        if (customLink) {
            link = renderTemplate(
                customLink,
                source.set('customerHash', customerHash).toJS()
            )
        }
    }

    const chargeStatus = (
        (source.get('charge_status') as string) || ''
    ).toLowerCase()

    return (
        <>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    logEvent(SegmentEvent.RechargeOrderClicked, {
                        account_domain: currentAccount.get('domain'),
                    })
                }}
                className={css.orderTitle}
            >
                {children}
            </a>
            <div>
                <Badge
                    key="status"
                    type={chargeStatusColors[chargeStatus]}
                    className="mt-2"
                >
                    {humanizeString(chargeStatus)}
                </Badge>
            </div>
        </>
    )
}

const connectorTitleWrapper = connect(makeGetIntegrationData)

const ConnectedTitleWrapper = connectorTitleWrapper(TitleWrapper)

export const Wrapper: FunctionComponent<{source: Map<string, any>}> = ({
    source: order = fromJS({}) as Map<string, any>,
    children,
}) => {
    const {integrationId, integration} = useContext(IntegrationContext)

    const isOrderRefunded = order.get('status') === 'refunded'
    const isOrderCancelled = order.get('status') === 'cancelled'

    const isChargeRefundable = ['success', 'partially_refunded'].includes(
        ((order.get('charge_status') as string) || '').toLowerCase()
    )
    return (
        <OrderContext.Provider
            value={{
                order,
                orderId: order.get('id'),
                isOrderCancelled,
                isOrderRefunded,
                isChargeRefundable,
                integrationId,
                integration,
            }}
        >
            {children}
        </OrderContext.Provider>
    )
}
