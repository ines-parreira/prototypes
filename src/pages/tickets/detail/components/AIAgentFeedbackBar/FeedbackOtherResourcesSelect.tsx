import React, {Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import {Label, Tooltip} from '@gorgias/ui-kit'

import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import {useAIAgentGetOtherResources} from 'pages/tickets/detail/hooks/useAIAgentGetOtherResources'
import Tag from 'pages/common/components/Tag/Tag'
import {
    FeedbackOnMessage,
    ResourceFeedbackOnMessage,
} from 'models/aiAgentFeedback/types'

import {addTags, removeTag} from 'state/ticket/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import MultiLevelSelect from '../TicketFields/components/fields/DropdownField/MultiLevelSelect'
import css from './FeedbackOtherResourcesSelect.less'
import {RESOURCE_ICONS, RESOURCE_LABELS} from './constants'

const closeIcon = (
    <i data-testid="other-resource-tag-close-icon" className="material-icons">
        close
    </i>
)

export const NO_RELEVANT_RESOURCES_LABEL = 'No relevant resources'
export const AI_NO_RESOURCES_TAG = 'ai_no_resources'

type Props = {
    helpCenterId: number
    guidanceHelpCenterId: number
    snippetHelpCenterId: number
    shopName: string
    shopType: string
    initialValues: FeedbackOnMessage[]
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
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const {
        articlesOptions,
        guidanceOptions,
        snippetsOptions,
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
    const [tooltipIds, setTooltipIds] = useState<string[]>([])

    const initialFormattedValues = useMemo(() => {
        return initialValues.map((v) => {
            if (v.type === 'resource') {
                switch (v.resourceType) {
                    case 'soft_action': {
                        return `${RESOURCE_LABELS.soft_action}${
                            actionsOptions.find(
                                (option) => option.value === v.resourceId
                            )?.label
                        }`
                    }
                    case 'hard_action': {
                        return `${RESOURCE_LABELS.hard_action}${
                            actionsOptions.find(
                                (option) => option.value === v.resourceId
                            )?.label
                        }`
                    }
                    case 'guidance': {
                        return `${RESOURCE_LABELS.guidance}${
                            guidanceOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId
                            )?.label
                        }`
                    }
                    case 'article': {
                        return `${RESOURCE_LABELS.article}${
                            articlesOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId
                            )?.label
                        }`
                    }
                    case 'macro': {
                        return `${RESOURCE_LABELS.macro}${
                            macrosOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId
                            )?.label
                        }`
                    }
                    case 'external_snippet': {
                        return `${RESOURCE_LABELS.external_snippet}${
                            snippetsOptions.find(
                                (option) =>
                                    option.value.toString() === v.resourceId
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
    }, [])

    const handleChange = useCallback(
        (value) => {
            const newValues = values.includes(value)
                ? values.filter((v) => v !== value)
                : [...values, value]
            setValues(newValues)
        },
        [values]
    )

    const handleSubmitNoRelevantResources = useCallback(
        async (newValues: string[]) => {
            if (newValues.includes(NO_RELEVANT_RESOURCES_LABEL)) {
                await dispatch(addTags(AI_NO_RESOURCES_TAG))
            }
        },
        [dispatch]
    )

    const handleRemoveNoRelevantResources = useCallback(
        async (valuesToRemove: string[]) => {
            if (valuesToRemove.includes(NO_RELEVANT_RESOURCES_LABEL)) {
                await dispatch(removeTag(AI_NO_RESOURCES_TAG))
            }
        },
        [dispatch]
    )

    const handleApply = useCallback(async () => {
        setIsOpen(false)

        // Submit the new values
        const newValuesToSubmit = values.filter(
            (value) => !initialFormattedValues.find((val) => val === value)
        )

        await handleSubmitNoRelevantResources(newValuesToSubmit)
        const resources = getResourcesFromLabels(newValuesToSubmit)
        onSubmit(resources)

        // Check if there are any values to remove
        const valuesToRemove = initialFormattedValues.filter(
            (value) => !values.find((val) => val === value)
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
        ]
    )

    const handleEllipsisChange = (isVisible: boolean, id: string) => {
        const i = tooltipIds.findIndex((x) => x === id)

        if (isVisible && i === -1) setTooltipIds((old) => [...old, id])

        if (!isVisible && i !== -1)
            setTooltipIds((old) => [...old.slice(0, i), ...old.slice(i + 1)])
    }

    return (
        <div className={css.container}>
            <MultiLevelSelect
                id={12}
                dropdownClassName={css.dropdown}
                inputId="test-input-id"
                onChange={handleChange}
                hasMultipleValues
                choices={[
                    ...actionsOptions.map(
                        (action) => `${RESOURCE_LABELS.action}${action.label}`
                    ),
                    ...guidanceOptions.map(
                        (guidance) =>
                            `${RESOURCE_LABELS.guidance}${guidance.label}`
                    ),
                    ...articlesOptions.map(
                        (article) =>
                            `${RESOURCE_LABELS.article}${article.label}`
                    ),
                    ...snippetsOptions.map(
                        (snippet) =>
                            `${RESOURCE_LABELS.external_snippet}${snippet.label}`
                    ),
                    ...macrosOptions.map(
                        (macro) => `${RESOURCE_LABELS.macro}${macro.label}`
                    ),
                    NO_RELEVANT_RESOURCES_LABEL,
                ]}
                values={values}
                label="dropdown"
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                onApplyClick={handleApply}
            >
                <Label className={css.label}>
                    Should AI Agent have used something else?
                </Label>
                <SelectInputBox
                    placeholder="Select resource"
                    onToggle={onToggle}
                />
            </MultiLevelSelect>
            <div className={css.tags}>
                {values.map((option, index) => {
                    const textArray = option.split('::')
                    const text = textArray[textArray.length - 1]
                    const type = textArray[textArray.length - 2]
                    return (
                        <Fragment key={option}>
                            <Tag
                                id={`option-${index}`}
                                text={text}
                                trailIcon={closeIcon}
                                leadIcon={RESOURCE_ICONS[type]}
                                onTrailIconClick={() => handleRemove(option)}
                                data-testid="tag"
                                className={css.tag}
                                textClassName={css.tagText}
                                onEllipsisChange={(val) =>
                                    handleEllipsisChange(val, `option-${index}`)
                                }
                            />
                            {tooltipIds.includes(`option-${index}`) && (
                                <Tooltip
                                    placement="bottom"
                                    target={`option-${index}`}
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
