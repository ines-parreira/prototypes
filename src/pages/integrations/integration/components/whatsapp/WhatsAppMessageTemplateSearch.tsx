import React, {useState} from 'react'
import classNames from 'classnames'
import {useDebounce} from 'react-use'
import TextInput from 'pages/common/forms/input/TextInput'
import IconInput from 'pages/common/forms/input/IconInput'
import TemplateTypeFilterDropdown, {
    TemplateTypeFilterOption,
} from 'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown'
import TemplateLanguageFilterDropdown from 'pages/tickets/detail/components/ReplyArea/TemplateLanguageFilterDropdown'
import {useWhatsAppEditor} from './WhatsAppEditorContext'

import css from './WhatsAppMessageTemplateSearch.less'

const SEARCH_DEBOUNCE_DELAY = 350

export type WhatsAppMessageTemplateSearchFilters = {
    language: string[]
    name: string
}

export default function WhatsAppMessageTemplateSearch() {
    const [isFocused, setIsFocused] = useState(false)
    const [filters, setFilters] =
        useState<WhatsAppMessageTemplateSearchFilters>({
            language: [],
            name: '',
        })

    const {
        isTemplateListVisible,
        setIsTemplateListVisible,
        setSearchFilter,
        selectedTemplate,
        isWhatsAppWindowOpen,
    } = useWhatsAppEditor()

    useDebounce(
        () => {
            setSearchFilter(filters)
        },
        SEARCH_DEBOUNCE_DELAY,
        [filters]
    )

    const handleInputFocus = () => {
        setIsFocused(true)
        setIsTemplateListVisible(true)
    }

    const isCollapsible = !!selectedTemplate

    return (
        <div className={css.container}>
            <TextInput
                tabIndex={3}
                placeholder={'Search WhatsApp templates by name'}
                onChange={(newName) => setFilters({...filters, name: newName})}
                onFocus={handleInputFocus}
                className={css.input}
                prefix={<IconInput className={css.searchIcon} icon="search" />}
                value={filters.name}
            />
            {(isFocused || isTemplateListVisible) && (
                <div className={css.filters} data-testid="dropdown-filters">
                    {isWhatsAppWindowOpen && (
                        <TemplateTypeFilterDropdown
                            value={TemplateTypeFilterOption.Templates}
                        />
                    )}
                    <TemplateLanguageFilterDropdown
                        value={filters.language}
                        onChange={(newLanguage) =>
                            setFilters({...filters, language: newLanguage})
                        }
                    />
                </div>
            )}
            {isCollapsible && (
                <i
                    className={classNames('material-icons', css.closeButton)}
                    onClick={() =>
                        setIsTemplateListVisible(!isTemplateListVisible)
                    }
                    data-testid="arrow-button"
                >
                    {isTemplateListVisible
                        ? 'keyboard_arrow_up'
                        : 'keyboard_arrow_down'}
                </i>
            )}
        </div>
    )
}
