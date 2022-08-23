import {
    Option,
    SelectableOption,
} from '../../../../common/forms/SelectField/types'
import {Option as MultiSelectOptionsFieldOption} from '../../../../common/forms/MultiSelectOptionsField/types'
import {
    ShipmentStatuses,
    FulfillmentStatuses,
    FinancialStatuses,
    OrderStatuses,
} from '../../../../../models/selfServiceConfiguration/types'

export const REASONS_DROPDOWN_OPTIONS: Option[] = [
    {
        label: 'FEEDBACK',
        isHeader: true,
    },
    {
        label: "I'm very happy with the product I received 👍",
        value: 'reasonVeryHappy',
    },
    {
        label: "I'm not happy with the product I received 👎",
        value: 'reasonNotHappy',
    },
    {
        isDivider: true,
    },
    {
        label: 'RETURN',
        isHeader: true,
    },
    {
        label: "I'd like to return a product",
        value: 'reasonReturnProduct',
    },
    {isDivider: true},
    {
        label: 'REFUND',
        isHeader: true,
    },
    {
        label: "I'd like to get a refund for this order",
        value: 'reasonRequestRefund',
    },
    {
        label: "I didn't get my refund",
        value: 'reasonDidNotReceiveRefund',
    },
    {isDivider: true},
    {label: 'CHANGE ORDER', isHeader: true},
    {label: "I'd like to cancel my order", value: 'reasonCancelOrder'},
    {label: "I'd like to edit my order", value: 'reasonEditOrder'},
    {label: "I'd like to reorder some items", value: 'reasonReorderItems'},
    {isDivider: true},
    {label: 'DAMAGED ORDER', isHeader: true},
    {label: 'My order was damaged in delivery', value: 'reasonOrderDamaged'},
    {
        label: 'The items in my order are defective',
        value: 'reasonOrderDefective',
    },
    {isDivider: true},
    {label: 'WRONG ORDER', isHeader: true},
    {
        label: 'The items are different from what I ordered',
        value: 'reasonIncorrectItems',
    },
    {
        label: 'Some items are missing from my order',
        value: 'reasonItemsMissing',
    },
    {isDivider: true},
    {label: 'DISCOUNT', isHeader: true},
    {
        label: 'My discount code is not working',
        value: 'reasonDiscountNotWorking',
    },
    {label: "I'd like a discount code", value: 'reasonRequestDiscount'},
    {
        label: 'I forgot to apply my discount code',
        value: 'reasonForgotToUseDiscount',
    },
    {isDivider: true},
    {label: 'EXCHANGE', isHeader: true},
    {
        label: "I'd like to exchange items in my order",
        value: 'reasonExchangeRequest',
    },
    {
        label: "I'd like to replace items in my order",
        value: 'reasonReplaceItemsRequest',
    },
    {isDivider: true},
    {label: 'SHIPPING', isHeader: true},
    {
        label: 'My order should have shipped by now',
        value: 'reasonOrderStillNotShipped',
    },
    {label: 'Where is my order?', value: 'reasonWhereIsMyOrder'},
    {
        label: "I'd like to change my shipping address",
        value: 'reasonChangeShippingAddress',
    },
    {
        label: "I'd like to change the delivery date",
        value: 'reasonChangeDeliveryDate',
    },
    {
        label: 'My order has been stuck in transit',
        value: 'reasonOrderStuckInTransit',
    },
    {
        label: "I'm past my expected delivery date",
        value: 'reasonPastExpectedDeliveryDate',
    },
    {isDivider: true},
    {label: 'SUBSCRIPTION', isHeader: true},
    {
        label: "I'd like to cancel my subscription",
        value: 'reasonCancelSubscription',
    },
    {
        label: "I'd like to edit my subscription",
        value: 'reasonEditSubscription',
    },
    {isDivider: true},
    {label: 'OTHER', isHeader: true},
    {label: 'Other', value: 'reasonOther'},
]

export const FINANCIAL_STATUSES_OPTIONS: MultiSelectOptionsFieldOption[] = [
    {value: FinancialStatuses.PENDING, label: 'Pending'},
    {value: FinancialStatuses.AUTHORIZED, label: 'Authorized'},
    {value: FinancialStatuses.PARTIALLY_PAID, label: 'Partially paid'},
    {value: FinancialStatuses.PAID, label: 'Paid'},
    {value: FinancialStatuses.PARTIALLY_REFUNDED, label: 'Partially refunded'},
    {value: FinancialStatuses.REFUNDED, label: 'Refunded'},
    {value: FinancialStatuses.VOIDED, label: 'Voided'},
]

export const FULFILLMENT_STATUSES_OPTIONS: MultiSelectOptionsFieldOption[] = [
    {value: FulfillmentStatuses.PENDING, label: 'Pending'},
    {value: FulfillmentStatuses.OPEN, label: 'Open'},
    {value: FulfillmentStatuses.SUCCESS, label: 'Success'},
    {value: FulfillmentStatuses.CANCELLED, label: 'Cancelled'},
    {value: FulfillmentStatuses.ERROR, label: 'Error'},
    {value: FulfillmentStatuses.FAILURE, label: 'Failure'},
]

export const SHIPMENT_STATUSES_OPTIONS: MultiSelectOptionsFieldOption[] = [
    {value: ShipmentStatuses.LABEL_PRINTED, label: 'Label printed'},
    {value: ShipmentStatuses.LABEL_PURCHASED, label: 'Label purchased'},
    {value: ShipmentStatuses.ATTEMPTED_DELIVERY, label: 'Attempted delivery'},
    {value: ShipmentStatuses.READY_FOR_PICKUP, label: 'Ready for pickup'},
    {value: ShipmentStatuses.CONFIRMED, label: 'Confirmed'},
    {value: ShipmentStatuses.IN_TRANSIT, label: 'In transit'},
    {value: ShipmentStatuses.OUT_FOR_DELIVERY, label: 'Out for delivery'},
    {value: ShipmentStatuses.DELIVERED, label: 'Delivered'},
    {value: ShipmentStatuses.FAILURE, label: 'Failure'},
]

export const ORDER_STATUSES_OPTIONS: MultiSelectOptionsFieldOption[] = [
    {value: OrderStatuses.OPEN, label: 'Open'},
    {value: OrderStatuses.ARCHIVED, label: 'Archived'},
    {value: OrderStatuses.CANCELLED, label: 'Cancelled'},
]
export const SELECTABLE_REASONS_DROPDOWN_OPTIONS =
    REASONS_DROPDOWN_OPTIONS.filter(
        (option) => 'value' in option
    ) as SelectableOption[]
