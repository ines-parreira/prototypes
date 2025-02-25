import React from 'react'

import { CustomFieldValue } from 'custom-fields/types'

import CheckIcon from '../CheckIcon'

import dropdownCss from '../MultiLevelSelect.less'
import searchCss from './search.less'

export function SearchResult({
    currentSearch = '',
    label,
    path,
    value,
    currentValue,
}: {
    label: string
    path: string
    value: CustomFieldValue
    currentValue?: CustomFieldValue | CustomFieldValue[]
    currentSearch?: string
}) {
    return (
        <>
            <span className={searchCss.searchResultWrapper}>
                <span className={dropdownCss.ellipsis}>
                    {highlightMatchedText(label, currentSearch)}
                </span>
                {path && (
                    <small
                        className={`${searchCss.searchResultPath} ${dropdownCss.ellipsis}`}
                    >
                        {highlightMatchedText(path, currentSearch)}
                    </small>
                )}
            </span>
            {(Array.isArray(currentValue)
                ? currentValue.includes(value)
                : value === currentValue) && <CheckIcon />}
        </>
    )
}

function highlightMatchedText(label: string, search: string) {
    if (!search || !label) return label

    const searchIndex = label.toLowerCase().indexOf(search.toLowerCase())

    if (searchIndex === -1) return label

    const beforeMatch = label.slice(0, searchIndex)
    const match = label.slice(searchIndex, searchIndex + search.length)
    const afterMatch = label.slice(searchIndex + search.length)

    return (
        <>
            {beforeMatch}
            <strong>{match}</strong>
            {afterMatch}
        </>
    )
}
