import React, {useState} from 'react'
import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'
import {Value} from 'pages/common/forms/SelectField/types'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocaleSelectOptions} from 'pages/settings/helpCenter/utils/localeSelectOptions'
import {LocaleCode} from 'models/helpCenter/types'

type Props = {
    supportedLocales: LocaleCode[]
    selectedLocaleCodes: string[]
    onFilterChange: (locales: string[]) => void
}

const DEPRECATED_HelpCenterStatsLanguageFilter = ({
    supportedLocales,
    onFilterChange,
    selectedLocaleCodes,
}: Props) => {
    const locales = useSupportedLocales()
    const helpCenterLocales = getLocaleSelectOptions(locales, supportedLocales)
    // We duplicate state because `selectedLocaleCodes` updates when the Selector closed
    const [selectedItems, setSelectedItems] = useState(selectedLocaleCodes)

    const handleFilterChange = (values: Value[]) => {
        const formattedValues = values.map((value) => value.toString())
        setSelectedItems(formattedValues)
        onFilterChange(formattedValues)
    }

    return (
        <SelectStatsFilter
            isRequired
            plural="languages"
            singular="language"
            onChange={handleFilterChange}
            value={selectedItems}
            isMultiple
        >
            {helpCenterLocales.map((locale) => (
                <SelectStatsFilter.Item
                    key={locale.id}
                    label={locale.text}
                    value={locale.value}
                />
            ))}
        </SelectStatsFilter>
    )
}

export default DEPRECATED_HelpCenterStatsLanguageFilter
