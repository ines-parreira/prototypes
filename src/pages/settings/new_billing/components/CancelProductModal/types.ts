import {ProductType} from 'models/billing/types'
import {ProductFeature} from './ProductFeaturesFOMO/types'

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
}

export enum CancellationReasonsActionType {
    PrimaryReasonSelected,
    SecondaryReasonSelected,
    OtherReasonUpdated,
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
          type: CancellationReasonsActionType.OtherReasonUpdated
          otherReason: Reason
      }
    | {
          type: CancellationReasonsActionType.Reset
      }

export type CancellationReasonsState = {
    primaryReason: Reason | null
    secondaryReason: Reason | null
    otherReason: Reason | null
}
