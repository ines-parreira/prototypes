import React, {
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import cn from 'classnames'

import { Badge, BadgeIcon, Label } from '@gorgias/merchant-ui-kit'

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
import KnowledgeSourcePopover from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
    SuggestedResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {
    getResourceMetadata,
    useEnrichFeedbackData,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'

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
    shopName: string
}

export type ChoiceOption = {
    meta: {
        url?: string
        title?: string
        content?: string
    }
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
    shopName,
}: MissingKnowledgeSelectProps) => {
    const [values, setValues] = useState<string[]>([])

    const choices = useMemo(() => {
        const resourcesData = {
            articles: enrichedData.articles,
            guidanceArticles: enrichedData.guidanceArticles,
            sourceItems: enrichedData.sourceItems,
            ingestedFiles: enrichedData.ingestedFiles,
            macros: enrichedData.macros,
            actions: enrichedData.actions,
            helpCenters: enrichedData.helpCenters,
            storeWebsiteQuestions: enrichedData.storeWebsiteQuestions,
        }
        return [
            // Order is important here, as it determines the order of the options in the select dropdown
            // GUIDANCES
            ...enrichedData.guidanceArticles
                .filter((guidance) => {
                    return !knowledgeResources?.find(
                        (resource) =>
                            resource.resource.resourceId ===
                                guidance.id.toString() &&
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                    )
                })
                .map((guidance) => ({
                    meta: getResourceMetadata(
                        {
                            id: guidance.id.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                        },
                        shopName,
                        resourcesData,
                    ),
                    label: `${SIMPLIFIED_RESOURCE_LABELS.guidance}${guidance.title}`,
                    value: guidance.id.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
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
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.ACTION,
                    )
                })
                .map((action) => ({
                    meta: getResourceMetadata(
                        {
                            id: action.id,
                            type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                        },
                        shopName,
                        resourcesData,
                    ),
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
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    )
                })
                .map((article) => ({
                    meta: getResourceMetadata(
                        {
                            id: article.id.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                        },
                        shopName,
                        resourcesData,
                    ),
                    label: `${SIMPLIFIED_RESOURCE_LABELS.article}${article.translation.title}`,
                    value: article.id.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
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
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.MACRO,
                    )
                })
                .map((macro) => ({
                    meta:
                        macro.id &&
                        getResourceMetadata(
                            {
                                id: macro.id.toString(),
                                type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                            shopName,
                            resourcesData,
                        ),
                    label: `${SIMPLIFIED_RESOURCE_LABELS.macro}${macro.name}`,
                    value: macro.id?.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                })),
            // EXTERNAL WEBSITE LINKS
            ...enrichedData.sourceItems
                .filter((snippet) => {
                    return !knowledgeResources?.find(
                        (resource) =>
                            resource.resource.resourceId ===
                                snippet.id.toString() &&
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    )
                })
                .map((snippet) => ({
                    meta: getResourceMetadata(
                        {
                            id: snippet.id.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                        },
                        shopName,
                        resourcesData,
                    ),
                    label: `${SIMPLIFIED_RESOURCE_LABELS.external_snippet}${snippet.url}`,
                    value: snippet.id.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
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
                                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                    )
                })
                .map((snippet) => ({
                    meta: getResourceMetadata(
                        {
                            id: snippet.id.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                        },
                        shopName,
                        resourcesData,
                    ),
                    label: `${SIMPLIFIED_RESOURCE_LABELS.file_external_snippet}${snippet.filename}`,
                    value: snippet.id.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
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
                                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    )
                })
                .map((question) => ({
                    resource: question,
                    label: `${SIMPLIFIED_RESOURCE_LABELS.store_website}${question.title}`,
                    value: question.id.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    hide: question.helpCenterId !== snippetHelpCenterId,
                })),
        ] as ChoiceOption[]
    }, [
        enrichedData,
        helpCenterId,
        guidanceHelpCenterId,
        snippetHelpCenterId,
        knowledgeResources,
        shopName,
    ])

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
    if (!choice) {
        return null
    }

    const { meta, type } = choice

    const popoverProps = {
        url: meta?.url || '',
        title: meta?.title || '',
        content: meta?.content || '',
        type,
    }
    const label = choice.displayLabel.split('::').pop()

    return (
        <KnowledgeSourcePopover {...popoverProps}>
            {(ref, eventHandlers) => (
                <Badge
                    type={'light-dark'}
                    upperCase={false}
                    corner="square"
                    className={css.tag}
                    {...eventHandlers}
                    ref={ref as RefObject<HTMLDivElement>}
                >
                    <a
                        href={!meta.url ? undefined : meta.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn(css.tagLink, {
                            [css.hasLink]: !!meta.url,
                        })}
                    >
                        {!!SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP[
                            choice.type
                        ] && (
                            <KnowledgeSourceIcon
                                badgeIconClassname={css.badge}
                                type={
                                    SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP[
                                        choice.type
                                    ]
                                }
                            />
                        )}
                        <span className={css.tagText}>{label}</span>
                    </a>
                    <BadgeIcon
                        className={css.tagIcon}
                        icon={<i className="material-icons">close</i>}
                        onClick={() => handleRemove(choice.value)}
                    />
                </Badge>
            )}
        </KnowledgeSourcePopover>
    )
}
