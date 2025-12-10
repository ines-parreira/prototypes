import type { Reducer } from 'react'

import type {
    CANCELLATION_REASONS_ACTION_TYPE,
    CancellationReasonsState,
    Reason,
} from './types'
import { CancellationReasonsActionType } from './types'

export const DEFAULT_STATE: CancellationReasonsState = {
    primaryReason: null,
    secondaryReason: null,
    additionalDetails: null,
    completed: false,
}

const isReasonsSelectionCompleted = (
    primaryReason: Reason | null,
    secondaryReason: Reason | null,
): boolean => {
    return !!primaryReason && !!secondaryReason
}
export const cancellationReasonsReducer: Reducer<
    CancellationReasonsState,
    CANCELLATION_REASONS_ACTION_TYPE
> = (state, action) => {
    switch (action.type) {
        case CancellationReasonsActionType.PrimaryReasonSelected:
            return {
                ...state,
                primaryReason: action.primaryReason,
                secondaryReason: null,
                completed: isReasonsSelectionCompleted(
                    action.primaryReason,
                    null,
                ),
            }
        case CancellationReasonsActionType.SecondaryReasonSelected:
            return {
                ...state,
                secondaryReason: action.secondaryReason,
                completed: isReasonsSelectionCompleted(
                    state.primaryReason,
                    action.secondaryReason,
                ),
            }
        case CancellationReasonsActionType.AdditionalDetailsUpdated:
            return {
                ...state,
                additionalDetails: action.additionalDetails,
                completed: isReasonsSelectionCompleted(
                    state.primaryReason,
                    state.secondaryReason,
                ),
            }
        case CancellationReasonsActionType.Reset:
            return DEFAULT_STATE
    }
}
