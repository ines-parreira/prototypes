import { Reducer } from 'react'

import { CommonReasonLabel } from './constants'
import {
    CANCELLATION_REASONS_ACTION_TYPE,
    CancellationReasonsActionType,
    CancellationReasonsState,
    Reason,
} from './types'

export const DEFAULT_STATE: CancellationReasonsState = {
    primaryReason: null,
    secondaryReason: null,
    otherReason: null,
    completed: false,
}

const isReasonsSelectionCompleted = (
    primaryReason: Reason | null,
    secondaryReason: Reason | null,
    otherReason: Reason | null,
): boolean => {
    if (primaryReason?.label === CommonReasonLabel.IPreferNotToSay) {
        return true
    }

    if (
        primaryReason?.label === CommonReasonLabel.Other ||
        secondaryReason?.label === CommonReasonLabel.Other
    ) {
        return !!otherReason?.label
    }

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
                otherReason: null,
                completed: isReasonsSelectionCompleted(
                    action.primaryReason,
                    null,
                    null,
                ),
            }
        case CancellationReasonsActionType.SecondaryReasonSelected:
            return {
                ...state,
                secondaryReason: action.secondaryReason,
                otherReason: null,
                completed: isReasonsSelectionCompleted(
                    state.primaryReason,
                    action.secondaryReason,
                    null,
                ),
            }
        case CancellationReasonsActionType.OtherReasonUpdated:
            return {
                ...state,
                otherReason: action.otherReason,
                completed: isReasonsSelectionCompleted(
                    state.primaryReason,
                    state.secondaryReason,
                    action.otherReason,
                ),
            }
        case CancellationReasonsActionType.Reset:
            return DEFAULT_STATE
    }
}
