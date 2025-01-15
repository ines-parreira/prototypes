import React, {useState} from 'react'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import css from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal.less'

type Props = {
    handleClearSearch: () => void
    handleSearchValue: (value: string) => void
    placeholder?: string
}

export const SearchBar = ({
    handleClearSearch,
    handleSearchValue,
    placeholder,
}: Props) => {
    const [value, setValue] = useState<string>('')

    const onSearchValue = (value: string) => {
        setValue(value)

        handleSearchValue(value)
    }

    const onClearSearch = () => {
        setValue('')

        handleClearSearch()
    }

    return (
        <TextInput
            placeholder={placeholder}
            className={css.searchBar}
            onChange={onSearchValue}
            aria-label="Search charts"
            prefix={<IconInput icon="search" className={css.searchBarPrefix} />}
            suffix={
                <IconInput
                    icon="close"
                    className={css.searchBarSuffix}
                    onClick={onClearSearch}
                />
            }
            value={value}
        />
    )
}
