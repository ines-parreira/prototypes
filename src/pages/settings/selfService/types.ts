import {SelfServiceOrderStatusEnum} from '../../../state/self_service/types'

export const CancellationsDropdownOptionsList = [
    {
        value: SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        label: 'Processing Fulfillment',
    },
    {
        value: SelfServiceOrderStatusEnum.UNFULFILLED,
        label: 'Unfulfilled',
    },
    {
        value: SelfServiceOrderStatusEnum.PENDING_DELIVERY,
        label: 'Pending Delivery',
    },
]

export const CancellationsOptionToEligibilityStatuses: {
    [key: string]: SelfServiceOrderStatusEnum[]
} = {
    [SelfServiceOrderStatusEnum.UNFULFILLED]: [
        SelfServiceOrderStatusEnum.UNFULFILLED,
    ],
    [SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT]: [
        SelfServiceOrderStatusEnum.UNFULFILLED,
        SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
    ],
    [SelfServiceOrderStatusEnum.PENDING_DELIVERY]: [
        SelfServiceOrderStatusEnum.UNFULFILLED,
        SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        SelfServiceOrderStatusEnum.PENDING_DELIVERY,
    ],
}
