import type { FC } from 'react'
import React from 'react'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import css from 'pages/settings/helpCenter/components/SearchBar/SearchBar.less'
import { useSearchContext } from 'pages/settings/helpCenter/providers/SearchContext'

export const SearchBar: FC = () => {
    const { searchInput, setSearchInput, searchReady } = useSearchContext()

    return (
        <TextInput
            type="text"
            className={css.input}
            isDisabled={!searchReady}
            value={searchInput ?? ''}
            onChange={setSearchInput}
            prefix={<IconInput icon="search" />}
            suffix={
                searchInput.trim().length > 0 && (
                    <IconInput
                        icon="close"
                        className={css.clearButton}
                        onClick={() => setSearchInput('')}
                    />
                )
            }
            placeholder="Search by content, articles and categories"
        />
    )
}
