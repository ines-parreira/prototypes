import {getCancellationOptionFromEligibilityStatuses} from '../getCancellationOptionFromEligibilityStatuses'
import {SelfServiceOrderStatusEnum} from '../../../../../models/selfServiceConfiguration/types'

describe('getCancellationOptionFromEligibilityStatuses()', () => {
    const eligibilityStatusesWithCorrespondingOption = [
        {
            eligibilityStatuses: [SelfServiceOrderStatusEnum.UNFULFILLED],
            expectedCancellationOption: SelfServiceOrderStatusEnum.UNFULFILLED,
        },
        {
            eligibilityStatuses: [
                SelfServiceOrderStatusEnum.UNFULFILLED,
                SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
            ],
            expectedCancellationOption:
                SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        },
        {
            eligibilityStatuses: [
                SelfServiceOrderStatusEnum.UNFULFILLED,
                SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
                SelfServiceOrderStatusEnum.PENDING_DELIVERY,
            ],
            expectedCancellationOption:
                SelfServiceOrderStatusEnum.PENDING_DELIVERY,
        },
    ]

    it.each(eligibilityStatusesWithCorrespondingOption)(
        'should return the expected cancellation option based on given eligibility statuses',
        (testData) => {
            expect(
                getCancellationOptionFromEligibilityStatuses(
                    testData.eligibilityStatuses
                )
            ).toBe(testData.expectedCancellationOption)
        }
    )
})
