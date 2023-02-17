import {FilterKeyEnum, SelfServiceOrderStatusEnum} from './types'

export const ReturnsDropdownOptionsList = [
    {
        value: FilterKeyEnum.ORDER_CREATED_AT,
        label: 'Order created',
    },
    {
        value: FilterKeyEnum.ORDER_DELIVERED_AT,
        label: 'Order delivered',
    },
]

export const CancellationsDropdownOptionsList = [
    {
        value: SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        label: 'Processing Fulfillment',
        statuses: [
            SelfServiceOrderStatusEnum.UNFULFILLED,
            SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        ],
    },
    {
        value: SelfServiceOrderStatusEnum.UNFULFILLED,
        label: 'Unfulfilled',
        statuses: [SelfServiceOrderStatusEnum.UNFULFILLED],
    },
    {
        value: SelfServiceOrderStatusEnum.PENDING_DELIVERY,
        label: 'Pending Delivery',
        statuses: [
            SelfServiceOrderStatusEnum.UNFULFILLED,
            SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
            SelfServiceOrderStatusEnum.PENDING_DELIVERY,
        ],
    },
]
