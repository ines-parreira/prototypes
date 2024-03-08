import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'

import TextInput from 'pages/common/forms/input/TextInput'
import IconInput from 'pages/common/forms/input/IconInput'

import css from './CampaignsSearch.less'

type Props = {
    value?: string
    onChange?: (value: string) => void
    onClear?: () => void
}

export const CampaignsSearch = ({value, onChange, onClear}: Props) => {
    const [inputValue, setInputValue] = useState(value || '')

    useEffect(() => {
        setInputValue(value || '')
    }, [value])

    const handleChange = useCallback(
        (value) => {
            setInputValue(value)
            onChange && onChange(value)
        },
        [onChange]
    )

    const handleClear = useCallback(() => {
        setInputValue('')
        onClear && onClear()
    }, [onClear])

    return (
        <TextInput
            className={css.search}
            value={inputValue}
            placeholder="Search by campaign name"
            onChange={handleChange}
            prefix={<IconInput icon="search" />}
            suffix={
                <IconInput
                    icon="cancel"
                    className={classnames(
                        'material-icons-outlined',
                        css.clear,
                        {
                            [css.hidden]: !inputValue,
                        }
                    )}
                    onClick={handleClear}
                />
            }
        />
    )
}
