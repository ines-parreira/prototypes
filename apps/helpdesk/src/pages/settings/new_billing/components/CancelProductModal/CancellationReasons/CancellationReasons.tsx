import type { Dispatch } from 'react'

import type {
    CANCELLATION_REASONS_ACTION_TYPE,
    CancellationReason,
    CancellationReasonsState,
} from '../types'
import { CancellationReasonsFields } from '../UI/CancellationReasonsFields'

import css from './CancellationReasons.less'

export type Props = {
    reasons: CancellationReason[]
    dispatchCancellationReasonsAction: Dispatch<CANCELLATION_REASONS_ACTION_TYPE>
    reasonsState: CancellationReasonsState
}
const CancellationReasons = (props: Props) => {
    const { reasons, dispatchCancellationReasonsAction, reasonsState } = props
    return (
        <div className={css.cancellationReasonsContainer}>
            <div>
                Your opinion means a lot to us. Please tell us why you are
                cancelling your plan.
            </div>
            <CancellationReasonsFields
                reasons={reasons}
                reasonsState={reasonsState}
                dispatchCancellationReasonsAction={
                    dispatchCancellationReasonsAction
                }
            />
        </div>
    )
}

export { CancellationReasons }
