import type { ProductType } from 'models/billing/types'

import type { ProductFeature } from './ProductFeaturesFOMO/types'

export type Reason = {
    label: string
}
export type CancellationReason = {
    primaryReason: Reason
    secondaryReasons: Reason[]
}

export type CancellationScenario = {
    reasons: CancellationReason[]
    productsToCancel: ProductType[]
    features: ProductFeature[]
    reasonsToCanduContents: ReasonsToCanduContent[]
    productDisplayName: string
}

export enum CancellationReasonsActionType {
    PrimaryReasonSelected,
    SecondaryReasonSelected,
    AdditionalDetailsUpdated,
    Reset,
}
export type CANCELLATION_REASONS_ACTION_TYPE =
    | {
          type: CancellationReasonsActionType.PrimaryReasonSelected
          primaryReason: Reason
      }
    | {
          type: CancellationReasonsActionType.SecondaryReasonSelected
          secondaryReason: Reason
      }
    | {
          type: CancellationReasonsActionType.AdditionalDetailsUpdated
          additionalDetails: Reason
      }
    | {
          type: CancellationReasonsActionType.Reset
      }

export type CancellationReasonsState = {
    primaryReason: Reason | null
    secondaryReason: Reason | null
    additionalDetails: Reason | null
    completed: boolean
}

export type ReasonsToCanduContent = {
    primaryReasonLabel: string
    secondaryReasonLabel: string | null
    canduContentID: string
}
