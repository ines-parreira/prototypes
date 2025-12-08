import type { Dispatch } from 'react'

import { CommonReasonLabel } from '../constants'
import type {
    CANCELLATION_REASONS_ACTION_TYPE,
    CancellationReason,
    CancellationReasonsState,
} from '../types'
import { CancellationReasonsActionType } from '../types'
import Instruction from '../UI/Instruction'
import OtherReason from '../UI/OtherReason'
import PrimaryReasons from '../UI/PrimaryReasons'
import SecondaryReasons from '../UI/SecondaryReasons'
import { findSecondaryReasonsByPrimaryReason } from './helpers'

import css from './CancellationReasons.less'

export type Props = {
    reasons: CancellationReason[]
    dispatchCancellationReasonsAction: Dispatch<CANCELLATION_REASONS_ACTION_TYPE>
    reasonsState: CancellationReasonsState
}
const CancellationReasons = (props: Props) => {
    const { reasons, dispatchCancellationReasonsAction, reasonsState } = props
    const selectPrimaryReason = (primaryReason: string) => {
        dispatchCancellationReasonsAction({
            type: CancellationReasonsActionType.PrimaryReasonSelected,
            primaryReason: { label: primaryReason },
        })
    }
    const updateOtherReason = (nextValue: string) => {
        dispatchCancellationReasonsAction({
            type: CancellationReasonsActionType.OtherReasonUpdated,
            otherReason: { label: nextValue },
        })
    }
    const selectSecondaryReason = (secondaryReason: string) => {
        dispatchCancellationReasonsAction({
            type: CancellationReasonsActionType.SecondaryReasonSelected,
            secondaryReason: { label: secondaryReason },
        })
    }
    const renderOtherReason = () => {
        const primaryReasonIsOther =
            reasonsState.primaryReason?.label === CommonReasonLabel.Other
        const secondaryReasonIsOther =
            reasonsState.secondaryReason?.label === CommonReasonLabel.Other

        if (!primaryReasonIsOther && !secondaryReasonIsOther) {
            return null
        }

        return (
            <OtherReason
                isRequired={primaryReasonIsOther || secondaryReasonIsOther}
                handleOtherReasonChange={updateOtherReason}
                currentReason={reasonsState.otherReason?.label || null}
            />
        )
    }
    return (
        <div className={css.cancellationReasonsContainer}>
            <div>
                Your opinion means a lot to us. Please tell us why you are
                cancelling your plan.
            </div>
            <div className={css.primaryReasonsContainer}>
                <Instruction isRequired>Cancellation reason</Instruction>
                <PrimaryReasons
                    reasons={reasons.map(
                        (reason) => reason.primaryReason.label,
                    )}
                    currentReason={reasonsState.primaryReason?.label || null}
                    handlePrimaryReasonSelection={selectPrimaryReason}
                />
            </div>
            {reasonsState.primaryReason &&
                CommonReasonLabel.Other.toString() !==
                    reasonsState.primaryReason.label && (
                    <SecondaryReasons
                        secondaryReasons={findSecondaryReasonsByPrimaryReason(
                            reasonsState.primaryReason,
                            reasons,
                        ).map((reason) => reason.label)}
                        currentReason={
                            reasonsState.secondaryReason?.label || null
                        }
                        handleSecondaryReasonSelection={selectSecondaryReason}
                    />
                )}

            {renderOtherReason()}
        </div>
    )
}

export default CancellationReasons
