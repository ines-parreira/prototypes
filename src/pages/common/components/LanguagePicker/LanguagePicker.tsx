import React, {useEffect} from 'react'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {BadgeItem} from 'pages/settings/helpCenter/components/HelpCenterPreferencesView/components/BadgeList'
import InputField from 'pages/common/forms/input/InputField'
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
    const [isOpen, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
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

    const handleOnSearchItem = (value: string) => {
        setSearch(value)
    }

    const isNotDefaultLanguage = (language: Language) =>
        language.value !== defaultLanguage.value

    const isNotSelectedLanguage = (language: Language) =>
        !selectedLanguages.some(
            (selectedLang) => selectedLang.value === language.value
        )
    const matchesSearchQuery = (language: Language) =>
        language.label.toLowerCase().includes(search.toLowerCase())

    const filteredList = props.availableLanguages.filter(
        (language) =>
            isNotDefaultLanguage(language) &&
            isNotSelectedLanguage(language) &&
            matchesSearchQuery(language)
    )

    const handleOnToggle = () => {
        if (isOpen) {
            setSearch('')
        }
        setOpen(!isOpen)
    }

    const onDefaultLanguageChange = (value: Value) => {
        const lang = props.availableLanguages.find(
            (lang: Language) => lang.value === value
        ) as Language
        setDefaultLanguage({...lang, isDefault: true})
        onRemoveLanguage(null, lang)
    }

    const onSelectLanguage = (ev: React.MouseEvent, language: Language) => {
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
                    <Dropdown
                        isOpen={isOpen}
                        toggle={handleOnToggle}
                        setActiveFromChild
                        className={css.languagePickerDropdown}
                    >
                        <DropdownToggle
                            className={css.languagePickerToggle}
                            type="button"
                            color="none"
                            disabled={!filteredList.length}
                        >
                            <i
                                className="material-icons"
                                style={{fontSize: 20}}
                            >
                                add
                            </i>{' '}
                            Add more languages
                        </DropdownToggle>
                        <DropdownMenu
                            modifiers={{
                                setMaxHeight: {
                                    enabled: true,
                                    order: 890,
                                    fn: (data) => {
                                        return {
                                            ...data,
                                            styles: {
                                                ...data.styles,
                                                overflow: 'auto',
                                                maxHeight: `300px`,
                                            },
                                        }
                                    },
                                },
                            }}
                        >
                            <div className={css['dropdown-header']}>
                                <InputField
                                    value={search}
                                    autoFocus
                                    placeholder="Search"
                                    onChange={handleOnSearchItem}
                                    prefix={
                                        <i
                                            className="material-icons"
                                            style={{
                                                fontSize: 20,
                                                color: '#AFAFAF',
                                            }}
                                        >
                                            search
                                        </i>
                                    }
                                />
                            </div>
                            {filteredList.map((language) => (
                                <DropdownItem
                                    key={language.value}
                                    onClick={(ev) =>
                                        onSelectLanguage(ev, language)
                                    }
                                    toggle={false}
                                    className={css.languageDropdownItem}
                                >
                                    {language.label}
                                </DropdownItem>
                            ))}
                            {!filteredList.length && (
                                <DropdownItem>No language found</DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
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
