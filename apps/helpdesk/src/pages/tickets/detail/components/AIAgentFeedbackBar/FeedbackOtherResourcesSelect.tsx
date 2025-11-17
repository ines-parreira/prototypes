import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { logEventWithSampling, SegmentEvent } from '@repo/logging'

import {
    Badge,
    BadgeIcon,
    Label,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { Tag } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    FeedbackOnMessage,
    ResourceFeedbackOnMessage,
} from 'models/aiAgentFeedback/types'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import { useAIAgentGetOtherResources } from 'pages/tickets/detail/hooks/useAIAgentGetOtherResources'
import { addTag, removeTag } from 'state/ticket/actions'

import InfoIconWithTooltip from '../../../common/components/InfoIconWithTooltip'
import { RESOURCE_ICONS, RESOURCE_LABELS } from './constants'
import Deprecated_MultiLevelSelect from './Deprecated_MultiLevelSelect/Deprecated_MultiLevelSelect'

import css from './FeedbackOtherResourcesSelect.less'

export const NO_RELEVANT_RESOURCES_LABEL = 'No relevant resources'
export const AI_NO_RESOURCES_TAG = 'ai_no_resources'

type Props = {
    helpCenterId: number
    guidanceHelpCenterId: number
    snippetHelpCenterId: number
    shopName: string
    shopType: string
    initialValues: FeedbackOnMessage[]
    accountId: number
    onSubmit: (resources: ResourceFeedbackOnMessage[]) => void
    onRemove: (resources: ResourceFeedbackOnMessage[]) => void
}

const FeedbackOtherResourcesSelect = ({
    helpCenterId,
    guidanceHelpCenterId,
    snippetHelpCenterId,
    shopName,
    shopType,
    onSubmit,
    onRemove,
    initialValues,
    accountId,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [badgeElements, setBadgeElements] = useState<Array<HTMLSpanElement>>(
        [],
    )
    const [isTagOverflowing, setIsTagOverflowing] = useState<Array<boolean>>([])
    const {
        articlesOptions,
        guidanceOptions,
        snippetsOptions,
        fileSnippetsOptions,
        macrosOptions,
        actionsOptions,
        isOtherResourceListLoading,
        getResourcesFromLabels,
    } = useAIAgentGetOtherResources({
        articleHelpCenterId: helpCenterId,
        guidanceHelpCenterId,
        snippetHelpCenterId,
        shopName,
        shopType,
    })

    const dispatch = useAppDispatch()
    const [values, setValues] = useState<string[]>([])

    useEffect(() => {
        setBadgeElements(Array(values.length).fill(undefined))
    }, [values])

    useEffect(() => {
        setIsTagOverflowing(
            badgeElements.map(
                (_item, i) =>
                    badgeElements[i]?.offsetWidth <
                    badgeElements[i]?.scrollWidth,
            ),
        )
    }, [badgeElements])

    const initialFormattedValues = useMemo(() => {
        return initialValues.map((v) => {
            if (v.type === 'resource') {
                switch (v.resourceType) {
                    case 'soft_action': {
                        return `${RESOURCE_LABELS.soft_action}${
                            actionsOptions.find(
                                (option) => option.value === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'hard_action': {
                        return `${RESOURCE_LABELS.hard_action}${
                            actionsOptions.find(
                                (option) => option.value === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'guidance': {
                        return `${RESOURCE_LABELS.guidance}${
                            guidanceOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'article': {
                        return `${RESOURCE_LABELS.article}${
                            articlesOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'macro': {
                        return `${RESOURCE_LABELS.macro}${
                            macrosOptions.find(
                                (option) =>
                                    option.value?.toString() === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'external_snippet': {
                        return `${RESOURCE_LABELS.external_snippet}${
                            snippetsOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'file_external_snippet': {
                        return `${RESOURCE_LABELS.file_external_snippet}${
                            fileSnippetsOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId,
                            )?.label
                        }`
                    }
                    case 'other': {
                        return NO_RELEVANT_RESOURCES_LABEL
                    }
                }
            }
            return ''
        })
    }, [
        actionsOptions,
        articlesOptions,
        fileSnippetsOptions,
        guidanceOptions,
        initialValues,
        macrosOptions,
        snippetsOptions,
    ])

    useEffect(() => {
        if (isOtherResourceListLoading) {
            return
        }

        setValues(initialFormattedValues)
    }, [isOtherResourceListLoading, initialFormattedValues])

    const onToggle = useCallback(() => {
        setIsOpen(true)
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackOtherReasonSelectClicked,
            {
                accountId,
            },
        )
    }, [accountId])

    const handleChange = useCallback(
        (value: string) => {
            const newValues = values.includes(value)
                ? values.filter((v) => v !== value)
                : [...values, value]
            setValues(newValues)
        },
        [values],
    )

    const handleSubmitNoRelevantResources = useCallback(
        async (newValues: string[]) => {
            if (newValues.includes(NO_RELEVANT_RESOURCES_LABEL)) {
                await dispatch(addTag({ name: AI_NO_RESOURCES_TAG } as Tag))
            }
        },
        [dispatch],
    )

    const handleRemoveNoRelevantResources = useCallback(
        async (valuesToRemove: string[]) => {
            if (valuesToRemove.includes(NO_RELEVANT_RESOURCES_LABEL)) {
                await dispatch(removeTag(AI_NO_RESOURCES_TAG))
            }
        },
        [dispatch],
    )

    const handleApply = useCallback(async () => {
        setIsOpen(false)

        // Submit the new values
        const newValuesToSubmit = values.filter(
            (value) => !initialFormattedValues.find((val) => val === value),
        )

        await handleSubmitNoRelevantResources(newValuesToSubmit)
        const resources = getResourcesFromLabels(newValuesToSubmit)
        onSubmit(resources)

        // Check if there are any values to remove
        const valuesToRemove = initialFormattedValues.filter(
            (value) => !values.find((val) => val === value),
        )

        await handleRemoveNoRelevantResources(valuesToRemove)
        const resourcesToRemove = getResourcesFromLabels(valuesToRemove)
        onRemove(resourcesToRemove)
    }, [
        getResourcesFromLabels,
        initialFormattedValues,
        onSubmit,
        onRemove,
        values,
        handleSubmitNoRelevantResources,
        handleRemoveNoRelevantResources,
    ])

    const handleRemove = useCallback(
        async (valueToRemove: string) => {
            const newValues = values.filter((v) => v !== valueToRemove)
            setValues(newValues)

            await handleRemoveNoRelevantResources([valueToRemove])
            const resource = getResourcesFromLabels([valueToRemove])

            if (resource) {
                onRemove(resource)
            }
        },
        [
            getResourcesFromLabels,
            onRemove,
            values,
            handleRemoveNoRelevantResources,
        ],
    )

    return (
        <div className={css.container}>
            <Deprecated_MultiLevelSelect
                id={12}
                dropdownClassName={css.dropdown}
                inputId="test-input-id"
                onChange={handleChange}
                choices={[
                    ...actionsOptions.map(
                        (action) => `${RESOURCE_LABELS.action}${action.label}`,
                    ),
                    ...guidanceOptions.map(
                        (guidance) =>
                            `${RESOURCE_LABELS.guidance}${guidance.label}`,
                    ),
                    ...articlesOptions.map(
                        (article) =>
                            `${RESOURCE_LABELS.article}${article.label}`,
                    ),
                    ...snippetsOptions.map(
                        (snippet) =>
                            `${RESOURCE_LABELS.external_snippet}${snippet.label}`,
                    ),
                    ...fileSnippetsOptions.map(
                        (snippet) =>
                            `${RESOURCE_LABELS.file_external_snippet}${snippet.label}`,
                    ),
                    ...macrosOptions.map(
                        (macro) => `${RESOURCE_LABELS.macro}${macro.label}`,
                    ),
                    NO_RELEVANT_RESOURCES_LABEL,
                ]}
                values={values}
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                onApplyClick={handleApply}
            >
                <Label className={css.label}>
                    <span>
                        Select resources AI Agent should have used
                        <InfoIconWithTooltip
                            id="tooltip-select-ai-agent-rsources"
                            tooltipProps={{
                                autohide: true,
                                placement: 'bottom',
                            }}
                        >
                            <>
                                Select any existing resources that could have
                                improved the response or create new resources to
                                handle more use cases with AI Agent
                            </>
                        </InfoIconWithTooltip>
                    </span>
                </Label>
                <SelectInputBox
                    placeholder="Select resource"
                    onToggle={onToggle}
                />
            </Deprecated_MultiLevelSelect>
            <div className={css.tags}>
                {values.map((option, index) => {
                    const textArray = option.split('::')
                    const text = textArray[textArray.length - 1]
                    const type = textArray[textArray.length - 2]
                    return (
                        <Fragment key={option}>
                            <Badge
                                type={'light-dark'}
                                className={css.tag}
                                upperCase={false}
                                corner="square"
                            >
                                {!!RESOURCE_ICONS[type] && (
                                    <BadgeIcon icon={RESOURCE_ICONS[type]} />
                                )}
                                <span
                                    ref={(el: HTMLSpanElement) => {
                                        badgeElements[index] = el
                                    }}
                                    className={css.tagText}
                                >
                                    {text}
                                </span>
                                <BadgeIcon
                                    icon={
                                        <i className="material-icons">close</i>
                                    }
                                    onClick={() => handleRemove(option)}
                                />
                            </Badge>
                            {badgeElements[index] &&
                                isTagOverflowing[index] && (
                                    <Tooltip
                                        placement="bottom"
                                        target={badgeElements[index]}
                                    >
                                        {text}
                                    </Tooltip>
                                )}
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default FeedbackOtherResourcesSelect
