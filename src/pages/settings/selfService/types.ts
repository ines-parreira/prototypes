import {SelfServiceOrderStatusEnum} from '../../../models/selfServiceConfiguration/types'

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
