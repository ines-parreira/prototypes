import React, {useMemo} from 'react'

import {Locale, LocaleCode} from '../../../../../../../models/helpCenter/types'
import {localeToSelectOption} from '../../../../utils/localeSelectOptions'

import {
    DynamicBadgeList,
    BadgeItemProps,
} from '../../../HelpCenterPreferencesView/components/BadgeList'

import {localeToSelectedLanguage} from './utils'

type Props = {
    availableLocales: Locale[]
    selectedLocales: LocaleCode[]
    onSelectedLocalesChange: (selectedLocales: LocaleCode[]) => void
}

export const ImportedLanguagesTags: React.FC<Props> = ({
    availableLocales,
    selectedLocales,
    onSelectedLocalesChange,
}: Props) => {
    const selectedList = useMemo(
        () =>
            availableLocales
                .filter(({code}) => selectedLocales.includes(code))
                .map((l) =>
                    localeToSelectedLanguage(l, selectedLocales.length > 1)
                ),
        [availableLocales, selectedLocales]
    )

    const handleOnAddLocale = (_: React.MouseEvent, {id}: BadgeItemProps) => {
        const addedLocale = availableLocales.find(({code}) => code === id)

        if (addedLocale) {
            onSelectedLocalesChange([...selectedLocales, addedLocale.code])
        }
    }

    const handleOnRemoveLocale = (
        _: React.MouseEvent,
        {id}: BadgeItemProps
    ) => {
        onSelectedLocalesChange(
            selectedLocales.filter((localeCode) => localeCode !== id)
        )
    }

    return (
        <section>
            <DynamicBadgeList
                availableList={availableLocales.map(localeToSelectOption)}
                searchPlaceholder="Search Languages"
                selectedList={selectedList}
                onSelectItem={handleOnAddLocale}
                onRemoveItem={handleOnRemoveLocale}
            />
        </section>
    )
}
