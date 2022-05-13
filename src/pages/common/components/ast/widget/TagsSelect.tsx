import React, {useMemo, useState} from 'react'
import _isString from 'lodash/isString'

import {useDebounce} from 'react-use'
import {CancelToken} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {TagDraft} from 'state/tags/types'
import useAppSelector from 'hooks/useAppSelector'
import {createTag, fetchTags} from 'models/tag/resources'
import {tagsFetched, tagCreated} from 'state/entities/tags/actions'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import useCancellableRequest from 'hooks/useCancellableRequest'
import SelectField from '../../../forms/SelectField/SelectField'
import TagDropdownMenu from '../../TagDropdownMenu/TagDropdownMenu'
type Props = {
    value?: string[] | string | Option[]
    onChange: (value: string[] | string) => any
    multiple?: boolean
    className?: string
    caseInsensitive: boolean
}

export const TagsSelectContainer = ({
    onChange,
    caseInsensitive,
    className,
    value = '',
    multiple = false,
}: Props) => {
    const tags = useAppSelector((state) =>
        Object.values(state.entities.tags).filter(
            (tag) => !tag.deleted_datetime
        )
    )
    const dispatch = useAppDispatch()
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const style = {
        display: 'inline-block',
    }
    const options = useMemo(
        () =>
            tags
                .map((tag) => {
                    return {
                        label: tag.name,
                        value: tag.name,
                    }
                })
                .filter((tag) =>
                    searchTerm !== '' ? tag.value.includes(searchTerm) : true
                )
                .slice(0, 30),
        [tags, searchTerm]
    )

    const handleCreateTag = async (tag: TagDraft) => {
        try {
            const newTag = await createTag(tag)
            void dispatch(tagCreated(newTag))
        } catch (err) {
            void dispatch(
                notify({
                    message: 'Could not create tag',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const [handleSearchTags] = useCancellableRequest(
        (cancelToken: CancelToken) => async (val: string) => {
            setIsLoading(true)
            try {
                const searchResults = await fetchTags(
                    {search: val},
                    cancelToken
                )
                if (searchResults.data.length)
                    dispatch(tagsFetched(searchResults.data))
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Could not create tag',
                        status: NotificationStatus.Error,
                    })
                )
            } finally {
                setIsLoading(false)
            }
        }
    )

    const existingTagNames = useMemo(() => tags.map((tag) => tag.name), [tags])

    const onMultiChange = (tags: Option[] | string[]) => {
        const formattedTags = tags.map((tag) =>
            typeof tag === 'string' ? tag : tag.label
        )
        formattedTags.forEach((newTag) => {
            if (!existingTagNames.includes(newTag)) {
                void handleCreateTag({name: newTag})
            }
        })

        setSearchTerm('')
        onChange(_isString(value) ? formattedTags.join(',') : formattedTags)
    }
    const _onChange = (newTag: string) => {
        if (!existingTagNames.includes(newTag)) {
            void handleCreateTag({name: newTag})
        }

        setSearchTerm('')
        onChange(newTag)
    }

    useDebounce(
        () => {
            if (!searchTerm) return
            const matchingTags = existingTagNames.filter(
                (tag) => tag === searchTerm
            )
            if (matchingTags.length === 0) {
                void handleSearchTags(searchTerm)
            }
        },
        200,
        [searchTerm]
    )

    const values = useMemo(() => {
        if (!multiple) return value as string
        if (_isString(value)) {
            return value
                .split(',')
                .filter((val) => val !== '')
                .map(
                    (value) =>
                        ({
                            label: value,
                            value,
                        } as Option)
                )
        }
        return value.map((val) => ({label: val, value: val}))
    }, [multiple, value])

    return multiple ? (
        <MultiSelectOptionsField
            allowCustomOptions
            onChange={onMultiChange}
            options={options}
            singular="tag"
            plural="tags"
            style={style}
            selectedOptions={values as Option[]}
            className={className}
            dropdownMenu={TagDropdownMenu}
            onInputChange={setSearchTerm}
            caseInsensitive={caseInsensitive}
            loading={isLoading}
        />
    ) : (
        <SelectField
            allowCustomValue
            options={options}
            onChange={(value) => _onChange(value.toString())}
            placeholder="Add a tag"
            singular="tag"
            style={style}
            value={values as string}
            className={className}
            onSearchChange={setSearchTerm}
        />
    )
}

export default TagsSelectContainer
