import type { Dispatch } from 'react'

import { ListItem, SelectField } from '@gorgias/axiom'

import { findSecondaryReasonsByPrimaryReason } from '../CancellationReasons/helpers'
import type {
    CANCELLATION_REASONS_ACTION_TYPE,
    CancellationReason,
    CancellationReasonsState,
} from '../types'
import { CancellationReasonsActionType } from '../types'
import { AdditionalDetails } from './AdditionalDetails'
import { SecondaryReasons } from './SecondaryReasons'

type PrimaryReasonItem = {
    id: string
    label: string
}

type CancellationReasonsFieldsProps = {
    reasons: CancellationReason[]
    reasonsState: CancellationReasonsState
    dispatchCancellationReasonsAction: Dispatch<CANCELLATION_REASONS_ACTION_TYPE>
}

export const CancellationReasonsFields = ({
    reasons,
    reasonsState,
    dispatchCancellationReasonsAction,
}: CancellationReasonsFieldsProps) => {
    const primaryReasonItems: PrimaryReasonItem[] = reasons.map((reason) => ({
        id: reason.primaryReason.label,
        label: reason.primaryReason.label,
    }))

    return (
        <>
            <SelectField
                label="Cancellation reason"
                isRequired
                items={primaryReasonItems}
                value={primaryReasonItems.find(
                    (item) => item.id === reasonsState.primaryReason?.label,
                )}
                onChange={(item) =>
                    dispatchCancellationReasonsAction({
                        type: CancellationReasonsActionType.PrimaryReasonSelected,
                        primaryReason: { label: item.id },
                    })
                }
                placeholder="Select reason..."
            >
                {(item) => <ListItem id={item.id} label={item.label} />}
            </SelectField>
            {reasonsState.primaryReason && (
                <>
                    <SecondaryReasons
                        secondaryReasons={findSecondaryReasonsByPrimaryReason(
                            reasonsState.primaryReason,
                            reasons,
                        ).map((reason) => reason.label)}
                        currentReason={
                            reasonsState.secondaryReason?.label ?? null
                        }
                        handleSecondaryReasonSelection={(label) =>
                            dispatchCancellationReasonsAction({
                                type: CancellationReasonsActionType.SecondaryReasonSelected,
                                secondaryReason: { label },
                            })
                        }
                    />
                    <AdditionalDetails
                        currentDetails={
                            reasonsState.additionalDetails?.label ?? null
                        }
                        handleAdditionalDetailsChange={(label) =>
                            dispatchCancellationReasonsAction({
                                type: CancellationReasonsActionType.AdditionalDetailsUpdated,
                                additionalDetails: { label },
                            })
                        }
                    />
                </>
            )}
        </>
    )
}
