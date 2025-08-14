import { useCallback, useEffect, useRef, useState } from 'react'

import { useDebouncedCallback } from '@repo/hooks'

import { Label, Tooltip } from '@gorgias/axiom'
import { FeedbackExecutionsItem } from '@gorgias/knowledge-service-types'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import { CustomInputProps } from 'custom-fields/components/MultiLevelSelect/types'
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
    badInteractionReasons?: FeedbackExecutionsItem['feedback']
    loadingMutations?: string[]
}
export const AIAgentFeedbackReasonSection = ({
    handleFeedbackChange,
    badInteractionReasons,
    loadingMutations,
}: AIAgentFeedbackReasonSectionProps) => {
    const [values, setValuesDefault] = useState<string[]>([])
    const pendingChoicesRef = useRef<any[] | null>(null)

    const setValues = useCallback(
        (values: string[]) => {
            setValuesDefault(sortValuesByBadInteractionOrder(values))
        },
        [setValuesDefault],
    )

    const debouncedHandleFeedbackChange = useDebouncedCallback(
        (finalChoices: any[]) => {
            handleFeedbackChange(finalChoices)
            pendingChoicesRef.current = null
        },
        700,
    )

    const handleBadInteractionReasonChange = useCallback(
        (value: any) => {
            const newValues: string[] = Array.isArray(value)
                ? value
                : [...values, value]

            setValues(newValues)

            const choicesToSubmit = newValues
                .filter(
                    (v) =>
                        !badInteractionReasons
                            ?.map(
                                (r) =>
                                    badInteractionOptions[
                                        r?.feedbackValue as AiAgentBadInteractionReason
                                    ],
                            )
                            .includes(v),
                )
                .filter(Boolean)

            const choicesToRemove = badInteractionReasons
                ?.map(
                    (r) =>
                        badInteractionOptions[
                            r?.feedbackValue as AiAgentBadInteractionReason
                        ],
                )
                .filter((initialValue) => {
                    return !newValues.includes(initialValue)
                })
                .filter(Boolean)

            const finalChoices = [
                ...choicesToSubmit.map((choice) => ({
                    resourceType: 'TICKET_BAD_INTERACTION_REASON' as const,
                    feedbackValue: badInteractionReverseOptions[choice],
                })),
                ...(choicesToRemove?.map((choice) => ({
                    resourceType: 'TICKET_BAD_INTERACTION_REASON' as const,
                    feedbackValue: null,
                    id: badInteractionReasons?.find(
                        (reason) =>
                            badInteractionOptions[
                                reason?.feedbackValue as AiAgentBadInteractionReason
                            ] === choice,
                    )?.id,
                })) ?? []),
            ]

            if ((loadingMutations?.length ?? 0) > 0) {
                pendingChoicesRef.current = finalChoices
            } else {
                debouncedHandleFeedbackChange(finalChoices)
            }
        },
        [
            values,
            badInteractionReasons,
            setValues,
            debouncedHandleFeedbackChange,
            loadingMutations,
        ],
    )

    const CustomInput = useCallback(
        ({ onFocus }: CustomInputProps) => (
            <div className={css.selectContainer}>
                <SelectInputBox
                    id="ai-agent-bad-interaction-reason-select"
                    className={css.selectInputBox}
                    inputClassName={
                        values.length > 0
                            ? css.selectInputBoxWithValues
                            : undefined
                    }
                    placeholder={
                        values.length
                            ? values.join(', ')
                            : 'Select all that apply'
                    }
                    onClick={onFocus}
                    onAffixClick={onFocus}
                />
                {values.length > 0 && (
                    <Tooltip
                        target="ai-agent-bad-interaction-reason-select"
                        placement="top"
                    >
                        {values.join(', ')}
                    </Tooltip>
                )}
            </div>
        ),
        [values],
    )

    useEffect(() => {
        if ((loadingMutations?.length ?? 0) > 0) return

        if (pendingChoicesRef.current !== null) {
            return
        }

        const mappedValues =
            badInteractionReasons?.map(
                (reason) =>
                    badInteractionOptions[
                        reason?.feedbackValue as AiAgentBadInteractionReason
                    ],
            ) ?? []
        setValues(mappedValues)
    }, [badInteractionReasons, setValues, loadingMutations])

    useEffect(() => {
        if (
            (loadingMutations?.length ?? 0) === 0 &&
            pendingChoicesRef.current !== null
        ) {
            debouncedHandleFeedbackChange(pendingChoicesRef.current)
            pendingChoicesRef.current = null
        }
    }, [loadingMutations, debouncedHandleFeedbackChange])

    return (
        <div className={css.selectContainer}>
            <Label className={css.header}>
                <span>What went wrong?</span>
            </Label>
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
                CustomInput={CustomInput}
                wrapperClassName={css.multiLevelSelectWrapper}
                bodyClassName={css.multiLevelSelectBodyWrapper}
                itemClassName={css.multiLevelSelectItem}
                showCheckboxes={true}
            />
        </div>
    )
}
