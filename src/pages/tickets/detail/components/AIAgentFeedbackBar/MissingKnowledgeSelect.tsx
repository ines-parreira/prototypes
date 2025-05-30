import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge, BadgeIcon, Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import {
    LEGACY_TO_SIMPLIFIED_KNOWLEDGE_SOURCE_ICON_MAP,
    SIMPLIFIED_RESOURCE_LABELS,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import {
    AiAgentKnowledgeResourceTypeEnum,
    SuggestedResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useEnrichFeedbackData } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'

type MissingKnowledgeSelectProps = {
    helpCenterId?: number | null
    guidanceHelpCenterId?: number
    snippetHelpCenterId?: number
    enrichedData: ReturnType<typeof useEnrichFeedbackData>
    initialValues: SuggestedResource[]
    accountId: number
    onSubmit: (choices: Array<ChoiceOption>) => void
    onRemove: (choice: Array<ChoiceOption>) => void
    disabled?: boolean
}

export type ChoiceOption = {
    label: string
    value: string
    type: AiAgentKnowledgeResourceTypeEnum
    isDeleted?: boolean
    hide?: boolean
}

const MissingKnowledgeSelect = ({
    helpCenterId,
    guidanceHelpCenterId,
    snippetHelpCenterId,
    onSubmit,
    onRemove,
    initialValues,
    accountId,
    enrichedData,
    disabled,
}: MissingKnowledgeSelectProps) => {
    const [values, setValues] = useState<string[]>([])

    const choices = useMemo(
        () =>
            [
                ...enrichedData.actions.map((action) => ({
                    label: `${SIMPLIFIED_RESOURCE_LABELS.action}${action.name}`,
                    value: action.id,
                    type: 'ACTION',
                })),
                ...enrichedData.guidanceArticles.map((guidance) => ({
                    label: `${SIMPLIFIED_RESOURCE_LABELS.guidance}${guidance.title}`,
                    value: guidance.id.toString(),
                    type: 'GUIDANCE',
                    hide: guidance.helpCenterId !== guidanceHelpCenterId,
                })),
                ...enrichedData.articles.map((article) => ({
                    label: `${SIMPLIFIED_RESOURCE_LABELS.article}${article.translation.title}`,
                    value: article.id.toString(),
                    type: 'ARTICLE',
                    hide: article.helpCenterId !== helpCenterId,
                })),
                ...enrichedData.sourceItems.map((snippet) => ({
                    label: `${SIMPLIFIED_RESOURCE_LABELS.external_snippet}${snippet.url ?? ''}`,
                    value: snippet.id.toString(),
                    type: 'EXTERNAL_SNIPPET',
                    hide: snippet.helpCenterId !== snippetHelpCenterId,
                })),
                ...enrichedData.ingestedFiles.map((snippet) => ({
                    label: `${SIMPLIFIED_RESOURCE_LABELS.file_external_snippet}${snippet.filename}`,
                    value: snippet.id.toString(),
                    type: 'FILE_EXTERNAL_SNIPPET',
                    hide: snippet.helpCenterId !== snippetHelpCenterId,
                })),
                ...enrichedData.macros.map((macro) => ({
                    label: `${SIMPLIFIED_RESOURCE_LABELS.macro}${macro.name ?? ''}`,
                    value: macro.id?.toString() ?? '',
                    type: 'MACRO',
                })),
            ] as ChoiceOption[],
        [enrichedData, helpCenterId, guidanceHelpCenterId, snippetHelpCenterId],
    )

    useEffect(() => {
        const values = choices
            .filter((choice) => {
                return initialValues.find(
                    (initialValue) =>
                        initialValue.parsedResource.resourceId ===
                            choice.value &&
                        initialValue.parsedResource.resourceType ===
                            choice.type,
                )
            })
            .map((v) => v.label)

        setValues(values)
    }, [enrichedData, initialValues, choices])

    const onToggle = useCallback(() => {
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackOtherReasonSelectClicked,
            {
                accountId,
            },
        )
    }, [accountId])

    const handleChange = useCallback(
        (value) => {
            const newValues = Array.isArray(value) ? value : [...values, value]
            setValues(newValues)

            const choicesToSubmit = choices.filter((v) =>
                newValues.includes(v.label),
            )

            const choicesToRemove = initialValues
                .filter((initialValue) => {
                    const deletedRecord = newValues.find((value) => {
                        const choice = choices.find((c) => c.label === value)
                        if (!choice) return false
                        return (
                            initialValue.parsedResource.resourceId ===
                                choice.value &&
                            initialValue.parsedResource.resourceType ===
                                choice.type
                        )
                    })
                    return !deletedRecord
                })
                .map((initialValue) => {
                    const choice = choices.find(
                        (c) =>
                            initialValue.parsedResource.resourceId ===
                                c.value &&
                            initialValue.parsedResource.resourceType === c.type,
                    )
                    if (!choice) return
                    return {
                        ...choice,
                        isDeleted: true,
                    }
                })
                .filter((value) => !!value) as ChoiceOption[]

            onSubmit([...choicesToSubmit, ...choicesToRemove])
        },
        [choices, initialValues, values, onSubmit],
    )

    const handleRemove = useCallback(
        async (valueToRemove: string) => {
            const resource = choices.find((c) => c.value === valueToRemove)

            const newValues = values.filter((v) => v !== valueToRemove)
            setValues(newValues)

            if (resource) {
                onRemove([{ ...resource, isDeleted: true }])
            }
        },
        [onRemove, values, choices],
    )

    const choicesToShow = useMemo(() => {
        return choices.filter((c) => !c.hide).map((c) => c.label)
    }, [choices])

    return (
        <div className={css.missingKnowledgeSelect}>
            <MultiLevelSelect
                inputId="test-input-id"
                onChange={handleChange}
                choices={choicesToShow}
                value={values}
                allowMultiValues
                placement="bottom"
                dropdownAutoWidth={false}
                autoWidth={false}
                onFocus={onToggle}
                isDisabled={disabled}
                CustomInput={({ onFocus }) => (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        }}
                    >
                        <Label className={css.label}>
                            <span>Was relevant knowledge missing?</span>
                        </Label>
                        <SelectInputBox
                            placeholder="Select knowledge"
                            onClick={onFocus}
                        />
                    </div>
                )}
            />
            {values.length > 0 && (
                <div className={css.tags}>
                    {values.map((option) => (
                        <KnowledgeTag
                            key={option}
                            choice={choices.find(
                                (choice) => choice.label === option,
                            )}
                            handleRemove={handleRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default MissingKnowledgeSelect

type KnowledgeTagProps = {
    choice?: ChoiceOption
    handleRemove: (option: string) => void
}

const KnowledgeTag = ({ choice, handleRemove }: KnowledgeTagProps) => {
    const tagRef = React.useRef<HTMLSpanElement>(null)

    const isOverflowing = tagRef.current
        ? tagRef.current.scrollWidth > tagRef.current.offsetWidth
        : false

    if (!choice) {
        return null
    }

    const label = choice.label.split('::').pop()

    return (
        <>
            <Badge
                type={'light-dark'}
                className={css.tag}
                upperCase={false}
                corner="square"
            >
                {!!LEGACY_TO_SIMPLIFIED_KNOWLEDGE_SOURCE_ICON_MAP[
                    choice.type
                ] && (
                    <KnowledgeSourceIcon
                        type={
                            LEGACY_TO_SIMPLIFIED_KNOWLEDGE_SOURCE_ICON_MAP[
                                choice.type
                            ]
                        }
                    />
                )}
                <span ref={tagRef} className={css.tagText}>
                    {label}
                </span>
                <BadgeIcon
                    className={css.tagIcon}
                    icon={<i className="material-icons">close</i>}
                    onClick={() => handleRemove(choice.value)}
                />
            </Badge>
            {isOverflowing && tagRef.current && (
                <Tooltip placement="bottom" target={tagRef.current}>
                    {label}
                </Tooltip>
            )}
        </>
    )
}
