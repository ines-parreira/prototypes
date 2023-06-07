import React, {useCallback, useState} from 'react'
import _debounce from 'lodash/debounce'

import TextInput from 'pages/common/forms/input/TextInput'
import IconInput from 'pages/common/forms/input/IconInput'

import {SEARCH_INPUT_DEBOUNCE_TIME} from '../constants'
import css from './search.less'

export function SearchInput({
    search = '',
    setSearch,
    dropdownName,
}: {
    search?: string
    setSearch: (value: string) => void
    dropdownName?: string
}) {
    const [inputValue, setInputValue] = useState(search)
    const [previousSearch, setPreviousSearch] = useState(search)

    if (search !== previousSearch) {
        setPreviousSearch(search)
        if (inputValue !== search) setInputValue(search)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const deboucedSetSearch = useCallback(
        _debounce(setSearch, SEARCH_INPUT_DEBOUNCE_TIME),
        [SEARCH_INPUT_DEBOUNCE_TIME]
    )

    const id = `custom-field-dropdown-search${
        dropdownName ? '-' + dropdownName : ''
    }`

    return (
        <TextInput
            id={id}
            name={id}
            placeholder="Search"
            prefix={<IconInput icon="search" />}
            value={inputValue}
            onChange={(value) => {
                setInputValue(value)
                if (!value) {
                    setSearch('')
                    deboucedSetSearch.cancel()
                } else deboucedSetSearch(value)
            }}
            className={css.searchInput}
            suffix={
                search ? (
                    <IconInput
                        icon="close"
                        onClick={() => {
                            setSearch('')
                            setInputValue('')
                        }}
                        onKeyPress={(evt) => {
                            if (evt.key === 'Enter') {
                                setSearch('')
                                setInputValue('')
                            }
                        }}
                        tabIndex={0}
                        className={css.searchClearIcon}
                    />
                ) : undefined
            }
        />
    )
}
