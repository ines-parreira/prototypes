import React, {FC} from 'react'

import TextInput from 'pages/common/forms/input/TextInput'
import IconInput from 'pages/common/forms/input/IconInput'

import {useSearchContext} from '../../providers/SearchContext'

import css from './SearchBar.less'

export const SearchBar: FC = () => {
    const {searchInput, setSearchInput, searchReady} = useSearchContext()

    if (!searchReady) {
        return null
    }

    return (
        <div className={css.wrapper}>
            <div className={css.searchBar}>
                <TextInput
                    type="text"
                    className={css.input}
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
            </div>
        </div>
    )
}
