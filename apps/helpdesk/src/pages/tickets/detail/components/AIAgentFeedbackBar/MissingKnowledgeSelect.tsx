import type { RefObject } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useFeedbackTracking } from '@repo/ai-agent'
import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import cn from 'classnames'

import {
    LegacyBadge as Badge,
    LegacyBadgeIcon as BadgeIcon,
    LegacyLabel as Label,
    Skeleton,
} from '@gorgias/axiom'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import useAppSelector from 'hooks/useAppSelector'
import { useIsFeedbackMutating } from 'models/knowledgeService/queries'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import {
    SIMPLIFIED_RESOURCE_LABELS,
    SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import KnowledgeSourcePopover from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover'
import type {
    KnowledgeResource,
    SuggestedResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getTicketState } from 'state/ticket/selectors'

import { useKnowledgeSourceSideBar } from './hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import type { useGetAllRelatedResourceData } from './useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'
import { getResourceMetadata } from './useEnrichKnowledgeFeedbackData/utils'
import { knowledgeResourceShouldBeLink } from './utils'

type MissingKnowledgeSelectProps = {
    helpCenterId?: number | null
    guidanceHelpCenterId?: number
    snippetHelpCenterId?: number
    resourcesData: ReturnType<typeof useGetAllRelatedResourceData> | null
    initialValues: SuggestedResource[]
    accountId: number
    loadingMutations?: Array<string>
    onSubmit: (choices: Array<ChoiceOption>) => void
    onRemove: (choice: Array<ChoiceOption>) => void
    disabled?: boolean
    knowledgeResources?: KnowledgeResource[]
    shopName: string
    shopType: string
}

export type ChoiceOption = {
    meta: {
        url?: string
        title?: string
        content?: string
        helpCenterId?: string
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
    loadingMutations,
    onSubmit,
    onRemove,
    initialValues,
    knowledgeResources,
    accountId,
    resourcesData,
    disabled,
    shopName,
    shopType,
}: MissingKnowledgeSelectProps) => {
    const [values, setValues] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined)

    const ticket = useAppSelector(getTicketState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const ticketId: number = ticket.get('id')
    const userId: number = currentUser.get('id')

    const isMutating = useIsFeedbackMutating({
        objectType: 'TICKET',
        objectId: ticketId.toString(),
    })

    const { onFeedbackGiven } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

    const choices = useMemo(() => {
        if (!resourcesData) return []

        return [
            // Order is important here, as it determines the order of the options in the select dropdown
            // GUIDANCES
            ...(resourcesData?.guidanceArticles || [])
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
            ...(resourcesData?.actions || [])
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
            ...(resourcesData?.articles || [])
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
            ...(resourcesData?.storeWebsiteQuestions || [])
                .filter((question) => {
                    return !knowledgeResources?.find(
                        (resource) =>
                            resource.resource.resourceId ===
                                question.article_id.toString() &&
                            resource.resource.resourceType.toLowerCase() ===
                                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET.toLowerCase(),
                    )
                })
                .map((question) => ({
                    meta: getResourceMetadata(
                        {
                            id: question.article_id.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                        },
                        shopName,
                        resourcesData,
                    ),
                    resource: question,
                    label: `${SIMPLIFIED_RESOURCE_LABELS.store_website}${question.title}`,
                    value: question.id.toString(),
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                    hide: question.helpCenterId !== snippetHelpCenterId,
                })),
            // EXTERNAL WEBSITE LINKS
            ...(resourcesData?.sourceItems || [])
                .filter((snippet) => {
                    return !knowledgeResources?.find(
                        (resource) =>
                            snippet?.id ===
                                parseInt(resource.resource.resourceId) &&
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    )
                })
                .map((snippet) => {
                    const meta = getResourceMetadata(
                        {
                            id: snippet.id?.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                            title: snippet.title,
                        },
                        shopName,
                        resourcesData,
                    )

                    return {
                        meta,
                        label: `${SIMPLIFIED_RESOURCE_LABELS.external_snippet}${meta?.title}`,
                        value: snippet.id?.toString(),
                        type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                        hide:
                            snippet.helpCenterId !== snippetHelpCenterId ||
                            snippet.ingestionStatus !== 'SUCCESSFUL',
                    }
                }),
            //EXTERNAL FILES
            ...(resourcesData?.ingestedFiles || [])
                .filter((file) => {
                    return !knowledgeResources?.find(
                        (resource) =>
                            file.id ===
                                parseInt(resource.resource.resourceId) &&
                            resource.resource.resourceType ===
                                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                    )
                })
                .map((snippet) => {
                    const meta = getResourceMetadata(
                        {
                            id: snippet.id?.toString(),
                            type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                            title: snippet.title,
                        },
                        shopName,
                        resourcesData,
                    )

                    return {
                        meta,
                        label: `${SIMPLIFIED_RESOURCE_LABELS.file_external_snippet}${meta?.title}`,
                        value: snippet.id?.toString(),
                        type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                        hide:
                            snippet.helpCenterId !== snippetHelpCenterId ||
                            snippet.ingestionStatus !== 'SUCCESSFUL',
                    }
                }),
        ] as ChoiceOption[]
    }, [
        resourcesData,
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
        if (loadingMutations?.length) {
            return
        }

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
    }, [initialValues, loadingMutations, choices, makeLabelsUnique])

    const onToggle = useCallback(() => {
        if (isLoading === undefined) {
            setIsLoading(true)
        }
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackOtherReasonSelectClicked,
            {
                accountId,
            },
        )
    }, [accountId, isLoading])

    const handleChange = useCallback(
        // TODO(React18): Remove any type
        (value: any) => {
            const newValues = Array.isArray(value) ? value : [...values, value]

            setValues(newValues)

            onFeedbackGiven('missing_knowledge_options')

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
        [
            choices,
            initialValues,
            values,
            onSubmit,
            findChoiceFromDisplayLabel,
            onFeedbackGiven,
        ],
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

    useEffect(() => {
        if (resourcesData?.isLoading === false && isLoading === true) {
            setIsLoading(false)
        }
    }, [resourcesData?.isLoading, isLoading])

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
                isLoading={isLoading}
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
            {initialValues.length > 0 && (
                <div className={css.tags}>
                    {initialValues.map((value) => {
                        let choice = findChoiceFromDisplayLabel(
                            value.metadata.title,
                        )
                        if (!choice) {
                            choice = {
                                meta: value.metadata,
                                label: value.metadata.title,
                                value: value.parsedResource.resourceId,
                                type: value.parsedResource.resourceType,
                            }
                        }

                        const choiceWithDisplayLabel = {
                            ...choice,
                            displayLabel: value.metadata.title,
                        }
                        return (
                            <KnowledgeTag
                                key={`${value.parsedResource.resourceType}-${value.parsedResource.resourceId}-${value.parsedResource.resourceSetId}`}
                                choice={choiceWithDisplayLabel}
                                handleRemove={handleRemove}
                                shopName={shopName}
                                shopType={shopType}
                                isMutating={isMutating}
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
    shopName: string
    shopType: string
    isMutating?: boolean
}

export const KnowledgeTag = ({
    choice,
    handleRemove,
    shopName,
    shopType,
    isMutating = false,
}: KnowledgeTagProps) => {
    const { openPreview } = useKnowledgeSourceSideBar()

    if (!choice) {
        return null
    }

    const { meta, type } = choice
    const isDeleteDisabled = isMutating

    const popoverProps = {
        id: choice.value,
        url: meta?.url || '',
        title: meta?.title || '',
        content: meta?.content || '',
        knowledgeResourceType: type,
        helpCenterId: meta?.helpCenterId || '',
        shopName,
        shopType,
    }

    const label = choice.displayLabel.split('::').pop()
    const isLink = knowledgeResourceShouldBeLink(type)

    const onClick = () => {
        if (!label) return

        if (!isLink) {
            openPreview(popoverProps)
        }
    }

    return (
        <KnowledgeSourcePopover {...popoverProps} onClick={onClick}>
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
                        href={!isLink || !meta.url ? undefined : meta.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn(css.tagLink, {
                            [css.hasLink]: !!meta.url,
                        })}
                        onClick={onClick}
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
                        {!!label ? (
                            <span className={css.tagText}>{label}</span>
                        ) : (
                            <Skeleton height={16} width={100} />
                        )}
                    </a>
                    <BadgeIcon
                        className={cn(css.tagIcon, {
                            [css.tagIconDisabled]: isDeleteDisabled,
                        })}
                        icon={
                            choice.value ? (
                                <i className="material-icons">close</i>
                            ) : null
                        }
                        onClick={() => {
                            if (choice.value && label && !isDeleteDisabled) {
                                handleRemove(choice.value)
                            }
                        }}
                    />
                </Badge>
            )}
        </KnowledgeSourcePopover>
    )
}
