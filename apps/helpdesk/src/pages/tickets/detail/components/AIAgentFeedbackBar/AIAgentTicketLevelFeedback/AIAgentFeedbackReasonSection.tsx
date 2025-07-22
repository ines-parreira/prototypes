import { useCallback, useEffect, useState } from 'react'

import { FeedbackExecutionsItemFeedbackItem } from '@gorgias/knowledge-service-types'
import { Label } from '@gorgias/merchant-ui-kit'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'

import { AiAgentBadInteractionReason } from '../types'
import {
    badInteractionOptions,
    badInteractionReasonsChoices,
    badInteractionReverseOptions,
    sortValuesByBadInteractionOrder,
} from './utils'

import css from './AIAgentTicketLevelFeedback.less'

export type AIAgentFeedbackReasonSectionProps = {
    handleFeedbackChange: (
        data: {
            resourceType: 'TICKET_BAD_INTERACTION_REASON'
            id?: number
            feedbackValue: string | null
        }[],
    ) => void
    badInteractionReasons?: FeedbackExecutionsItemFeedbackItem[]
}
export const AIAgentFeedbackReasonSection = ({
    handleFeedbackChange,
    badInteractionReasons,
}: AIAgentFeedbackReasonSectionProps) => {
    const [values, setValuesDefault] = useState<string[]>([])

    const setValues = useCallback(
        (values: string[]) => {
            setValuesDefault(sortValuesByBadInteractionOrder(values))
        },
        [setValuesDefault],
    )

    useEffect(() => {
        const mappedValues =
            badInteractionReasons?.map(
                (reason) =>
                    badInteractionOptions[
                        reason?.feedbackValue as AiAgentBadInteractionReason
                    ],
            ) ?? []
        setValues(mappedValues)
    }, [badInteractionReasons, setValues])

    const handleBadInteractionReasonChange = useCallback(
        (value: any) => {
            const newValues: string[] = Array.isArray(value)
                ? value
                : [...values, value]

            const choicesToSubmit = newValues
                .filter((v) => !values.includes(v))
                .filter(Boolean)

            const choicesToRemove = values
                .filter((initialValue) => {
                    return !newValues.includes(initialValue)
                })
                .filter(Boolean)

            const finalChoices = [
                ...choicesToSubmit.map((choice) => ({
                    resourceType: 'TICKET_BAD_INTERACTION_REASON' as const,
                    feedbackValue: badInteractionReverseOptions[choice],
                })),
                ...choicesToRemove.map((choice) => ({
                    resourceType: 'TICKET_BAD_INTERACTION_REASON' as const,
                    feedbackValue: null,
                    id: badInteractionReasons?.find(
                        (reason) =>
                            badInteractionOptions[
                                reason?.feedbackValue as AiAgentBadInteractionReason
                            ] === choice,
                    )?.id,
                })),
            ]

            setValues(newValues)

            handleFeedbackChange(finalChoices)
        },
        [handleFeedbackChange, values, badInteractionReasons, setValues],
    )

    return (
        <div className={css.selectContainer}>
            <MultiLevelSelect
                inputId="ai-agent-bad-interaction-reason-select"
                onChange={handleBadInteractionReasonChange}
                choices={badInteractionReasonsChoices}
                value={values}
                allowMultiValues
                placement="bottom"
                dropdownAutoWidth={true}
                dropdownMatchTriggerWidth={true}
                hideClearButton
                autoWidth={false}
                CustomInput={({ onFocus }) => (
                    <div className={css.selectContainer}>
                        <Label className={css.header}>
                            <span>What went wrong?</span>
                        </Label>
                        <SelectInputBox
                            className={css.selectInputBox}
                            placeholder={
                                values?.length
                                    ? values.join(', ')
                                    : 'Select all that apply'
                            }
                            onClick={onFocus}
                            onAffixClick={onFocus}
                        />
                    </div>
                )}
            />
        </div>
    )
}
