import {Map} from 'immutable'
import {formatDatetime} from 'utils'
import {StoreState} from 'state/types'
import {IntegrationType} from 'models/integration/types'
import {
    DateAndTimeFormatting,
    DateTimeFormatMapper,
    DateTimeFormatType,
} from 'constants/datetime'
import {getDateAndTimeFormatter} from 'state/currentUser/selectors'
import {DATE_VARIABLE_TOOLTIP_TEXT} from 'config/integrations/constants'
import {momentToLDMLFormat} from 'pages/common/utils/template'

/**
 * Format last Recharge subscription datetime according to user's date and time formatting settings.
 * **/
function getLastSubscriptionFormattedDatetime(
    context: Map<any, any>,
    integrationId: number,
    currentUser: Map<any, any>
) {
    const lastSubscription = context.getIn([
        'ticket',
        'customer',
        'integrations',
        integrationId,
        'subscriptions',
        0,
    ]) as Map<any, any>

    if (
        !lastSubscription ||
        !lastSubscription.get('next_charge_scheduled_at')
    ) {
        return ''
    }

    return formatDatetime(
        lastSubscription.get('next_charge_scheduled_at'),
        getDateAndTimeFormatter({
            currentUser: currentUser,
        } as unknown as StoreState)(DateAndTimeFormatting.CompactDate)
    )
}

export const MACRO_VARIABLES = {
    type: IntegrationType.Recharge,
    integration: true,
    name: 'Recharge',
    children: [
        {
            name: 'Hash of customer',
            value: '{{ticket.customer.integrations.recharge.customer.hash}}',
        },
        {
            name: 'Quantity of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].quantity}}',
        },
        {
            name: 'Product title of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].product_title}}',
        },
        {
            name: 'Order interval frequency of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].order_interval_frequency}}',
        },
        {
            name: 'Order interval unit of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].order_interval_unit}}',
        },
        {
            name: 'Price of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].price}}',
        },
        {
            name: 'Scheduled date of next charge of last subscription',
            value: `{{ticket.customer.integrations.recharge.subscriptions[0].next_charge_scheduled_at|datetime_format("${momentToLDMLFormat(
                DateTimeFormatMapper[
                    DateTimeFormatType.COMPACT_DATE_EN_US
                ].toString()
            )}")}}`,
            tooltip: DATE_VARIABLE_TOOLTIP_TEXT,
            replace: getLastSubscriptionFormattedDatetime,
        },
    ],
}

export const MACRO_PREVIOUS_VARIABLES = {
    type: IntegrationType.Recharge,
    name: 'Recharge',
    integration: true,
    children: [
        {
            name: 'Hash of customer',
            value: '{{ticket.customer.integrations.recharge.customer.hash}}',
        },
        {
            name: 'Scheduled date of next charge of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].next_charge_scheduled_at|datetime_format("L")}}',
        },
        {
            name: 'Scheduled date of next charge of last subscription',
            value: '{{ticket.customer.integrations.recharge.subscriptions[0].next_charge_scheduled_at|datetime_format("MM/d/YYYY")}}',
        },
    ],
}
