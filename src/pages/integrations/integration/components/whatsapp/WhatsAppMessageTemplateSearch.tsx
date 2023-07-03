import React, {useState} from 'react'
import classNames from 'classnames'
import TextInput from 'pages/common/forms/input/TextInput'
import IconInput from 'pages/common/forms/input/IconInput'
import TemplateTypeFilterDropdown, {
    TemplateTypeFilterOption,
} from 'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown'

import css from './WhatsAppMessageTemplateSearch.less'

export type WhatsAppMessageTemplateSearchFilters = {
    language: string[]
    name: string
}

type Props = {
    placeholder: string
    isCollapsible?: boolean
    isCollapsed: boolean
    setIsCollapsed: (visible: boolean) => void
    languages: string[]
    onChange: (filters: WhatsAppMessageTemplateSearchFilters) => void
    value: WhatsAppMessageTemplateSearchFilters
    displayTemplateTypeFilter?: boolean
}

export default function WhatsAppMessageTemplateSearch({
    placeholder,
    isCollapsible,
    isCollapsed,
    setIsCollapsed,
    onChange,
    value,
    displayTemplateTypeFilter = true,
}: Props) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div className={css.container}>
            <TextInput
                tabIndex={3}
                placeholder={placeholder}
                onChange={(newName) => onChange({...value, name: newName})}
                // onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsFocused(true)}
                className={css.input}
                prefix={<IconInput className={css.searchIcon} icon="search" />}
                value={value.name}
            />
            {(isFocused || !isCollapsed) && (
                <div className={css.filters}>
                    {displayTemplateTypeFilter && (
                        <TemplateTypeFilterDropdown
                            value={TemplateTypeFilterOption.Templates}
                        />
                    )}
                </div>
            )}
            {isCollapsible && (
                <i
                    className={classNames('material-icons', css.closeButton)}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                </i>
            )}
        </div>
    )
}
