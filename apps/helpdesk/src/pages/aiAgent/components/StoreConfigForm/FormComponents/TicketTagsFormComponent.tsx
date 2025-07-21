import { useCallback, useEffect, useMemo } from 'react'

import { filter } from 'lodash'
import { Link } from 'react-router-dom'

import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import useAppSelector from 'hooks/useAppSelector'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import { Value } from 'pages/common/forms/SelectField/types'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import { notUndefined } from 'utils/types'

import { StoreTagList } from './StoreTagList'
import { useTicketTagsState } from './useTicketTagsState'

import css from './TicketTagsFormComponent.less'

export type Props = Pick<FormValues, 'tags'> & {
    updateValue: UpdateValue<FormValues>
}

export const TicketTagsFormComponent = ({ tags, updateValue }: Props) => {
    const accountTicketTags = filter(
        useAppSelector(getEntitiesTags),
        notUndefined,
    )

    const {
        state,
        clearSelectedTags,
        removeTag,
        setSelectedTags,
        setSelectDisabled,
    } = useTicketTagsState()

    // Compute available options based on the fetched fields and existing selection
    const availableSelectTicketTagsOptions = useMemo(
        () =>
            accountTicketTags.filter(
                (tag) => !tags?.find((storeTag) => storeTag.name === tag.name),
            ),
        [accountTicketTags, tags],
    )

    // Update selected ticket tags via custom hook
    const handleTicketTagsSelectionUpdate = useCallback(
        (newValues: Value[]) => {
            setSelectedTags(newValues)
        },
        [setSelectedTags],
    )

    // When closing the SelectFilter, update the parent state and clear the local selection
    const handleTicketTagsSelectFilterClose = useCallback(() => {
        // Start with the existing tags (or an empty array if none)
        const existingTags = tags ?? []

        // Find all account tags whose names are currently selected
        const selectedTagNames = state.selectedTicketTags
        const matchingAccountTags = accountTicketTags.filter((tag) =>
            selectedTagNames.includes(tag.name),
        )

        // Map those matching tags into the shape we store in “tags”
        const newMappedTags = matchingAccountTags.map((tag) => ({
            name: tag.name,
            description: tag.description ?? '',
        }))

        // Combine existing tags with the newly mapped ones
        const newTags = [...existingTags, ...newMappedTags]

        updateValue('tags', newTags)
        clearSelectedTags()
    }, [
        tags,
        state.selectedTicketTags,
        updateValue,
        clearSelectedTags,
        accountTicketTags,
    ])

    const handleTagDeletion = useCallback(
        (name: string) => {
            updateValue('tags', [
                ...(tags?.filter((tag) => tag.name !== name) ?? []),
            ])
            // Used to handle the select filter state
            removeTag(name)
        },
        [tags, updateValue, removeTag],
    )

    const handleDescriptionUpdate = useCallback(
        (name: string, newValue: string) => {
            updateValue('tags', [
                ...(tags?.map((tag) => {
                    if (tag.name === name) {
                        tag.description = newValue
                    }
                    return tag
                }) ?? []),
            ])
        },
        [tags, updateValue],
    )

    // Enable or disable the SelectFilter based on available options
    useEffect(() => {
        const shouldDisable = availableSelectTicketTagsOptions.length === 0
        if (shouldDisable !== state.isSelectDisabled) {
            setSelectDisabled(shouldDisable)
        }
    }, [
        availableSelectTicketTagsOptions.length,
        state.isSelectDisabled,
        setSelectDisabled,
    ])

    return (
        <>
            <div className={css.formGroup}>
                <div className={css.formGroupDescription}>
                    Choose which tags AI Agent should apply to tickets.{' '}
                    <Link to={'/app/settings/manage-tags'}>Manage tags</Link>.
                </div>
            </div>
            <div className={css.formGroup}>
                {tags && (
                    <StoreTagList
                        tags={tags}
                        onDelete={handleTagDeletion}
                        onDescriptionUpdate={handleDescriptionUpdate}
                    />
                )}
                <SelectFilter
                    isDisabled={state.isSelectDisabled}
                    disabledTooltipText="All ticket tags added."
                    onChange={handleTicketTagsSelectionUpdate}
                    onClose={handleTicketTagsSelectFilterClose}
                    value={state.selectedTicketTags}
                    label="Add Ticket Tag"
                    searchPlaceholder="Ticket Tags"
                >
                    {availableSelectTicketTagsOptions &&
                        availableSelectTicketTagsOptions.map((tag) => (
                            <SelectFilter.Item
                                key={tag.id}
                                label={tag.name}
                                value={tag.name}
                            />
                        ))}
                </SelectFilter>
            </div>
        </>
    )
}
