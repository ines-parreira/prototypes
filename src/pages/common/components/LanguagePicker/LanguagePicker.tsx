import React, {useEffect} from 'react'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {BadgeItem} from 'pages/settings/helpCenter/components/HelpCenterPreferencesView/components/BadgeList'
import DropdownButtonWithSearch from '../DropdownButtonWithSearch/DropdownButtonWithSearch'
import css from './LanguagePicker.less'

type Language = {
    value: string
    label: string
    isDefault?: boolean
}

export interface LanguagePicker {
    languages: Language[]
    availableLanguages: Language[]

    onSelectLanguageChange: (languages: Language[]) => void
}

const LanguagePicker: React.FC<LanguagePicker> = ({...props}) => {
    const [defaultLanguage, setDefaultLanguage] = React.useState(
        props.languages.find((language) => language.isDefault) as Language
    )
    const [selectedLanguages, setSelectedLanguages] = React.useState(
        props.languages.filter((language) => !language.isDefault)
    )

    useEffect(() => {
        const languages = [defaultLanguage, ...selectedLanguages]
        props.onSelectLanguageChange(languages)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguages])

    const isNotDefaultLanguage = (language: Language) =>
        language.value !== defaultLanguage.value

    const isNotSelectedLanguage = (language: Language) =>
        !selectedLanguages.some(
            (selectedLang) => selectedLang.value === language.value
        )

    const filteredList = props.availableLanguages.filter(
        (language) =>
            isNotDefaultLanguage(language) && isNotSelectedLanguage(language)
    )

    const onDefaultLanguageChange = (value: Value) => {
        const lang = props.availableLanguages.find(
            (lang: Language) => lang.value === value
        ) as Language
        setDefaultLanguage({...lang, isDefault: true})
        onRemoveLanguage(null, lang)
    }

    const onSelectLanguage = (
        ev: React.MouseEvent | null,
        language: Language
    ) => {
        setSelectedLanguages([...selectedLanguages, language])
    }

    const onRemoveLanguage = (
        ev: React.MouseEvent | null,
        language: Language
    ) => {
        const newSelectedLanguages = selectedLanguages.filter(
            (lang) => lang.value !== language.value
        )
        setSelectedLanguages(newSelectedLanguages)
    }

    return (
        <div className={css.languagePickerWrapper}>
            <div className={css.languagePickerContainer}>
                <SelectField
                    value={defaultLanguage.value}
                    onChange={onDefaultLanguageChange}
                    options={props.availableLanguages}
                    className={css.languageSelect}
                    dropdownMenuClassName={css.languageSelectDropdownMenu}
                />

                {props.availableLanguages.length > 1 && (
                    <DropdownButtonWithSearch
                        label="Add More Languages"
                        materialIconLabel="add"
                        options={filteredList}
                        variant="none"
                        persist
                        placeholder="Search"
                        textNotFound="No languages found"
                        onSelectOptionChange={(language) =>
                            onSelectLanguage(null, language)
                        }
                    />
                )}
            </div>

            <div className={css.languageList}>
                {selectedLanguages.map((language) => (
                    <BadgeItem
                        key={language.value}
                        id={language.value as any}
                        isClosable
                        label={language.label}
                        onClose={(ev: React.MouseEvent) =>
                            onRemoveLanguage(ev, language)
                        }
                    />
                ))}
            </div>
        </div>
    )
}

export default LanguagePicker
