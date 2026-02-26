import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { Button, ListItem, Select, SelectField, Tag } from '@gorgias/axiom'

import { Language as LanguageEnum } from 'constants/languages'

import css from './LanguagePicker.less'

export type Language = {
    id?: string
    value: string
    label: string
    isDefault?: boolean
}

type LanguagePickerProps = {
    languages: Language[]
    availableLanguages: Language[]
    onSelectLanguageChange: (languages: Language[]) => void
    isMultiLanguageEnabled?: boolean
    label?: string
    size?: 'sm' | 'md' | 'full'
}

const mapLanguage = (language: Language): Language => {
    return {
        ...language,
        id: language.value,
    }
}

const mapDefaultLanguage = (languages: Language[]): Language => {
    const englishUs = languages.find((l) => l.value === LanguageEnum.EnglishUs)

    return englishUs
        ? { ...englishUs, isDefault: true }
        : { ...languages[0], isDefault: true }
}

export function LanguagePicker({
    languages,
    availableLanguages,
    onSelectLanguageChange,
    isMultiLanguageEnabled = true,
    label = 'Default language',
    size = 'md',
}: LanguagePickerProps) {
    const mappedLanguages = useMemo(() => {
        return availableLanguages.map(mapLanguage)
    }, [availableLanguages])

    const [defaultLanguage, setDefaultLanguage] = useState<Language>(() => {
        const existingDefault = languages.find((l) => l.isDefault)
        if (existingDefault) {
            return mapLanguage(existingDefault)
        }

        return mapDefaultLanguage(mappedLanguages)
    })

    const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(() =>
        languages.filter((l) => !l.isDefault).map(mapLanguage),
    )

    useEffect(() => {
        const existingDefault = languages.find((l) => l.isDefault)
        if (existingDefault) {
            setDefaultLanguage(mapLanguage(existingDefault))
        } else if (mappedLanguages.length > 0) {
            setDefaultLanguage(mapDefaultLanguage(mappedLanguages))
        }
        setSelectedLanguages(
            languages.filter((l) => !l.isDefault).map(mapLanguage),
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [languages])

    const isNotDefaultLanguage = (language: Language) =>
        language.value !== defaultLanguage.value

    const isNotSelectedLanguage = (language: Language) =>
        !selectedLanguages.some(
            (selectedLang) => selectedLang.value === language.value,
        )

    const filteredList = mappedLanguages.filter(
        (language) =>
            isNotDefaultLanguage(language) && isNotSelectedLanguage(language),
    )

    const onDefaultLanguageChange = (language: Language) => {
        const newDefault = { ...language, isDefault: true }
        const newSelected = selectedLanguages.filter(
            (lang) => lang.value !== language.value,
        )
        setDefaultLanguage(newDefault)
        setSelectedLanguages(newSelected)
        onSelectLanguageChange([newDefault, ...newSelected])
    }

    const onSelectLanguage = (language: Language) => {
        const newSelected = [...selectedLanguages, language]
        setSelectedLanguages(newSelected)
        onSelectLanguageChange([defaultLanguage, ...newSelected])
    }

    const onRemoveLanguage = useCallback(
        (language: Language) => {
            const newSelected = selectedLanguages.filter(
                (lang) => lang.value !== language.value,
            )
            setSelectedLanguages(newSelected)
            onSelectLanguageChange([defaultLanguage, ...newSelected])
        },
        [defaultLanguage, selectedLanguages, onSelectLanguageChange],
    )

    const selectedLanguageTags = useMemo(
        () =>
            selectedLanguages.map((language) => (
                <Tag
                    key={language.value}
                    id={language.value}
                    onClose={() => onRemoveLanguage(language)}
                >
                    {language.label}
                </Tag>
            )),
        [selectedLanguages, onRemoveLanguage],
    )

    return (
        <div className={css.wrapper}>
            <div
                className={classNames(css.languagePickerWrapper, css[size])}
                role="group"
                aria-label="Language selection"
            >
                <SelectField
                    items={mappedLanguages}
                    value={defaultLanguage}
                    onChange={onDefaultLanguageChange}
                    label={label}
                    maxHeight={300}
                    isRequired
                    isSearchable
                    aria-label="Select default language"
                >
                    {(language: Language) => (
                        <ListItem id={language.id} label={language.label} />
                    )}
                </SelectField>
            </div>
            <span className={css.helperText}>
                Select the main language for your chat. Add more languages as
                needed.
            </span>
            <div
                className={classNames(css.languagePickerWrapper, css[size])}
                role="group"
                aria-label="Language selection"
            >
                {isMultiLanguageEnabled && filteredList.length > 0 && (
                    <Select
                        items={filteredList}
                        onSelect={onSelectLanguage}
                        isSearchable
                        aria-label="Add more languages"
                        placeholder="Search languages"
                        trigger={() => (
                            <Button
                                variant="tertiary"
                                leadingSlot="add"
                                size="sm"
                            >
                                Add language
                            </Button>
                        )}
                    >
                        {(language) => (
                            <ListItem id={language.id} label={language.label} />
                        )}
                    </Select>
                )}

                {isMultiLanguageEnabled && selectedLanguages.length > 0 && (
                    <div
                        className={css.languageList}
                        role="list"
                        aria-label="Selected additional languages"
                    >
                        {selectedLanguageTags}
                    </div>
                )}
            </div>
        </div>
    )
}
