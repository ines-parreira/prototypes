import {SelfServiceOrderStatusEnum} from '../../../../state/self_service/types'

export const getCancellationOptionFromEligibilityStatuses = (
    eligibilityStatuses: SelfServiceOrderStatusEnum[]
): string => {
    const includesUnfulfilled = eligibilityStatuses.includes(
        SelfServiceOrderStatusEnum.UNFULFILLED
    )
    const includesProcessingFulfillment = eligibilityStatuses.includes(
        SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT
    )
    const includesPendingDelivery = eligibilityStatuses.includes(
        SelfServiceOrderStatusEnum.PENDING_DELIVERY
    )

    if (
        includesUnfulfilled &&
        !includesProcessingFulfillment &&
        !includesPendingDelivery
    ) {
        return SelfServiceOrderStatusEnum.UNFULFILLED
    }

    if (
        includesUnfulfilled &&
        includesProcessingFulfillment &&
        !includesPendingDelivery
    ) {
        return SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT
    }

    if (
        includesUnfulfilled &&
        includesProcessingFulfillment &&
        includesPendingDelivery
    ) {
        return SelfServiceOrderStatusEnum.PENDING_DELIVERY
    }

    return ''
}
