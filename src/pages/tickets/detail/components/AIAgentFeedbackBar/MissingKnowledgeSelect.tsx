import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge, BadgeIcon, Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import {
    SIMPLIFIED_RESOURCE_LABELS,
    SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
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
    knowledgeResources?: KnowledgeResource[]
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
    knowledgeResources,
    accountId,
    enrichedData,
    disabled,
}: MissingKnowledgeSelectProps) => {
    const [values, setValues] = useState<string[]>([])

    const choices = useMemo(
        () =>
            [
                // Order is important here, as it determines the order of the options in the select dropdown
                // GUIDANCES
                ...enrichedData.guidanceArticles
                    .filter((guidance) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    guidance.id.toString() &&
                                resource.resource.resourceType === 'GUIDANCE',
                        )
                    })
                    .map((guidance) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.guidance}${guidance.title}`,
                        value: guidance.id.toString(),
                        type: 'GUIDANCE',
                        hide:
                            guidance.helpCenterId !== guidanceHelpCenterId ||
                            guidance.visibility === 'UNLISTED',
                    })),
                // ACTIONS
                ...enrichedData.actions
                    .filter((action) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    action.id.toString() &&
                                resource.resource.resourceType === 'ACTION',
                        )
                    })
                    .map((action) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.action}${action.name}`,
                        value: action.id.toString(),
                        type: 'ACTION',
                        hide: action?.entrypoints?.[0]?.deactivated_datetime,
                    })),
                // HELP CENTER ARTICLES
                ...enrichedData.articles
                    .filter((article) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    article.id.toString() &&
                                resource.resource.resourceType === 'ARTICLE',
                        )
                    })
                    .map((article) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.article}${article.translation.title}`,
                        value: article.id.toString(),
                        type: 'ARTICLE',
                        hide:
                            article.helpCenterId !== helpCenterId ||
                            !article.translation.is_current,
                    })),
                //MACROS
                ...enrichedData.macros
                    .filter((macro) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    macro.id?.toString() &&
                                resource.resource.resourceType === 'MACRO',
                        )
                    })
                    .map((macro) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.macro}${macro.name}`,
                        value: macro.id?.toString(),
                        type: 'MACRO',
                    })),
                // EXTERNAL WEBSITE LINKS
                ...enrichedData.sourceItems
                    .filter((snippet) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    snippet.id.toString() &&
                                resource.resource.resourceType ===
                                    'EXTERNAL_SNIPPET',
                        )
                    })
                    .map((snippet) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.external_snippet}${snippet.url}`,
                        value: snippet.id.toString(),
                        type: 'EXTERNAL_SNIPPET',
                        hide:
                            snippet.helpCenterId !== snippetHelpCenterId ||
                            snippet.status !== 'done',
                    })),
                //EXTERNAL FILES
                ...enrichedData.ingestedFiles
                    .filter((file) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    file.id.toString() &&
                                resource.resource.resourceType ===
                                    'FILE_EXTERNAL_SNIPPET',
                        )
                    })
                    .map((snippet) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.file_external_snippet}${snippet.filename}`,
                        value: snippet.id.toString(),
                        type: 'FILE_EXTERNAL_SNIPPET',
                        hide:
                            snippet.helpCenterId !== snippetHelpCenterId ||
                            snippet.status !== 'SUCCESSFUL',
                    })),
                ...enrichedData.storeWebsiteQuestions
                    .filter((question) => {
                        return !knowledgeResources?.find(
                            (resource) =>
                                resource.resource.resourceId ===
                                    question.id.toString() &&
                                resource.resource.resourceType ===
                                    'EXTERNAL_SNIPPET',
                        )
                    })
                    .map((question) => ({
                        label: `${SIMPLIFIED_RESOURCE_LABELS.store_website}${question.title}`,
                        value: question.id.toString(),
                        type: 'EXTERNAL_SNIPPET',
                        hide: question.helpCenterId !== snippetHelpCenterId,
                    })),
            ] as ChoiceOption[],
        [
            enrichedData,
            helpCenterId,
            guidanceHelpCenterId,
            snippetHelpCenterId,
            knowledgeResources,
        ],
    )

    const makeLabelsUnique = useCallback((choices: ChoiceOption[]) => {
        const labelCounts = new Map<string, number>()
        const seenLabels = new Set<string>()

        choices.forEach((choice) => {
            const count = labelCounts.get(choice.label) || 0
            labelCounts.set(choice.label, count + 1)
        })

        return choices.map((choice) => {
            if (labelCounts.get(choice.label)! > 1) {
                const baseLabel = choice.label
                const uniqueLabel = `${baseLabel} (id:${choice.value})`

                let finalLabel = uniqueLabel
                let counter = 1
                while (seenLabels.has(finalLabel)) {
                    finalLabel = `${uniqueLabel}_${counter}`
                    counter++
                }
                seenLabels.add(finalLabel)
                return finalLabel
            }
            seenLabels.add(choice.label)
            return choice.label
        })
    }, [])

    const findChoiceFromDisplayLabel = useCallback(
        (displayLabel: string) => {
            const visibleChoices = choices.filter((c) => !c.hide)
            const uniqueLabels = makeLabelsUnique(visibleChoices)
            const index = uniqueLabels.indexOf(displayLabel)
            return index >= 0 ? visibleChoices[index] : null
        },
        [choices, makeLabelsUnique],
    )

    useEffect(() => {
        const matchingChoices = choices.filter((choice) => {
            return initialValues.find(
                (initialValue) =>
                    initialValue.parsedResource.resourceId === choice.value &&
                    initialValue.parsedResource.resourceType === choice.type,
            )
        })

        const visibleChoices = choices.filter((c) => !c.hide)
        const uniqueLabels = makeLabelsUnique(visibleChoices)

        const displayLabels = matchingChoices
            .map((choice) => {
                const index = visibleChoices.indexOf(choice)
                return index >= 0 ? uniqueLabels[index] : null
            })
            .filter((label): label is string => label !== null)

        setValues(displayLabels)
    }, [enrichedData, initialValues, choices, makeLabelsUnique])

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

            const choicesToSubmit = newValues
                .filter((v) => !values.includes(v))
                .map((displayLabel) => findChoiceFromDisplayLabel(displayLabel))
                .filter((choice): choice is ChoiceOption => choice !== null)
                .filter((choice) => {
                    return !initialValues.find((initialValue) => {
                        return (
                            initialValue.parsedResource.resourceId ===
                                choice.value &&
                            initialValue.parsedResource.resourceType ===
                                choice.type
                        )
                    })
                })

            const choicesToRemove = initialValues
                .filter((initialValue) => {
                    const stillSelected = newValues.find((displayLabel) => {
                        const choice = findChoiceFromDisplayLabel(displayLabel)
                        if (!choice) return false
                        return (
                            initialValue.parsedResource.resourceId ===
                                choice.value &&
                            initialValue.parsedResource.resourceType ===
                                choice.type
                        )
                    })
                    return !stillSelected
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
        [choices, initialValues, values, onSubmit, findChoiceFromDisplayLabel],
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
        const visibleChoices = choices.filter((c) => !c.hide)
        return makeLabelsUnique(visibleChoices)
    }, [choices, makeLabelsUnique])

    return (
        <div className={css.missingKnowledgeSelect}>
            <MultiLevelSelect
                inputId="missing-knowledge-select"
                onChange={handleChange}
                choices={choicesToShow}
                value={values}
                allowMultiValues
                placement="bottom"
                dropdownAutoWidth={true}
                dropdownMatchTriggerWidth={true}
                hideClearButton
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
                            onAffixClick={onFocus}
                        />
                    </div>
                )}
            />
            {values.length > 0 && (
                <div className={css.tags}>
                    {values.map((option) => {
                        const choice = findChoiceFromDisplayLabel(option)
                        if (!choice) return null

                        const choiceWithDisplayLabel = {
                            ...choice,
                            displayLabel: option,
                        }
                        return (
                            <KnowledgeTag
                                key={option}
                                choice={choiceWithDisplayLabel}
                                handleRemove={handleRemove}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MissingKnowledgeSelect

type KnowledgeTagProps = {
    choice?: ChoiceOption & { displayLabel: string }
    handleRemove: (option: string) => void
}

export const KnowledgeTag = ({ choice, handleRemove }: KnowledgeTagProps) => {
    const tagRef = React.useRef<HTMLSpanElement>(null)

    const isOverflowing = tagRef.current
        ? tagRef.current.scrollWidth > tagRef.current.offsetWidth
        : false

    if (!choice) {
        return null
    }

    const label = choice.displayLabel.split('::').pop()

    return (
        <>
            <Badge
                type={'light-dark'}
                className={css.tag}
                upperCase={false}
                corner="square"
            >
                {!!SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP[
                    choice.type
                ] && (
                    <KnowledgeSourceIcon
                        type={
                            SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP[
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
