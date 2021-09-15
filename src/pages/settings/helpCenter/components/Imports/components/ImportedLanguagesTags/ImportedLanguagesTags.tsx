import React from 'react'

import {
    HelpCenterLocale,
    LocaleCode,
} from '../../../../../../../models/helpCenter/types'

import {
    DynamicBadgeList,
    BadgeItemProps,
} from '../../../HelpCenterPreferencesView/components/BadgeList'

import {localeToLanguageSelectOption, localeToSelectedLanguage} from './utils'

type Props = {
    availableLocales: HelpCenterLocale[]
    selectedLocales: LocaleCode[]
    onSelectedLocalesChange: (selectedLocales: LocaleCode[]) => void
}

export const ImportedLanguagesTags = ({
    availableLocales,
    selectedLocales,
    onSelectedLocalesChange,
}: Props): JSX.Element => {
    const selectedLocalesEntities: HelpCenterLocale[] = React.useMemo(
        () =>
            availableLocales.filter(({code}) => selectedLocales.includes(code)),
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
                availableList={availableLocales.map(
                    localeToLanguageSelectOption
                )}
                searchPlaceholder="Search Languages"
                selectedList={selectedLocalesEntities.map((locale) =>
                    localeToSelectedLanguage(locale, selectedLocales.length > 1)
                )}
                onSelectItem={handleOnAddLocale}
                onRemoveItem={handleOnRemoveLocale}
            />
        </section>
    )
}
