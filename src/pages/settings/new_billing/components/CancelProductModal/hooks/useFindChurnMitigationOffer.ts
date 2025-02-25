import { useMemo } from 'react'

import { Reason, ReasonsToCanduContent } from '../types'

const useFindChurnMitigationOfferId = (
    primaryReason: Reason | null,
    secondaryReason: Reason | null,
    reasonsToCanduContents: ReasonsToCanduContent[],
) => {
    return useMemo(
        () =>
            reasonsToCanduContents.find(
                (reasonToCanduContent) =>
                    reasonToCanduContent.primaryReasonLabel ===
                        primaryReason?.label &&
                    reasonToCanduContent.secondaryReasonLabel ===
                        secondaryReason?.label,
            )?.canduContentID || null,
        [primaryReason, secondaryReason, reasonsToCanduContents],
    )
}

export default useFindChurnMitigationOfferId
