import React, {useMemo, useState} from 'react'
import produce from 'immer'
import _keyBy from 'lodash/keyBy'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import {Locale} from 'models/helpCenter/types'
import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'
import Modal from '../../../../../../common/components/Modal'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'
import {localeToSelectOption} from '../../../../utils/localeSelectOptions'
import {BadgeItemProps, DynamicBadgeList} from '../BadgeList'

import {transformToSelectedLocale} from './utils'
import css from './AvailableLanguagesTags.less'

function ensureDefaultLanguageIsFirst(
    locales: string[],
    defaultLocale: string
) {
    const index = locales.findIndex((code) => code === defaultLocale)
    const localesCopy = [...locales]

    if (index > 0) {
        localesCopy.splice(index, 1)
        return [defaultLocale, ...localesCopy]
    }

    return locales
}

type Props = {
    availableLocales: Locale[]
}

export const AvailableLanguagesTags: React.FC<Props> = ({
    availableLocales,
}: Props) => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()
    const [pendingLocale, setPendingLocale] = useState<BadgeItemProps | null>()

    const localesByCode = useMemo(
        () => _keyBy(availableLocales, 'code'),
        [availableLocales]
    )

    const localeOptions = useMemo(
        () => availableLocales.map(localeToSelectOption),
        [availableLocales]
    )

    const selectedLocales = ensureDefaultLanguageIsFirst(
        preferences.availableLanguages,
        preferences.defaultLanguage
    )
        .filter((localeCode) => localesByCode[localeCode])
        .map((localeCode) => {
            const locale = localesByCode[localeCode]

            return transformToSelectedLocale(
                locale,
                locale.code !== preferences.defaultLanguage
            )
        })

    const handleOnAddLocale = (_: React.MouseEvent, locale: BadgeItemProps) => {
        updatePreferences({
            availableLanguages: [...preferences.availableLanguages, locale.id],
        })
    }

    const handleOnAttemptRemoveLocale = (
        _: React.MouseEvent,
        item: BadgeItemProps
    ) => {
        setPendingLocale(item)
    }

    const handleOnClickDeleteLocale = () => {
        if (!pendingLocale) return

        updatePreferences({
            availableLanguages: produce(
                preferences.availableLanguages,
                (draftLocales) => {
                    const index = draftLocales.findIndex(
                        (locale) => locale === pendingLocale.id
                    )

                    if (index >= 0) {
                        draftLocales.splice(index, 1)
                    }
                }
            ),
        })

        setPendingLocale(null)
    }

    const handleOnCancelDeleteLocale = () => {
        setPendingLocale(null)
    }

    return (
        <div>
            <h4>Available languages</h4>
            <p>
                Select the languages in which you will be able to edit and
                customize your Help Center.
            </p>
            <DynamicBadgeList
                availableList={localeOptions}
                selectedList={selectedLocales}
                searchPlaceholder="Search Languages"
                onSelectItem={handleOnAddLocale}
                onRemoveItem={handleOnAttemptRemoveLocale}
            />
            <Modal
                isOpen={!!pendingLocale}
                header="Are you sure you want to delete this language?"
                className={css['modal-centered']}
                footer={
                    <div className={css['footer-actions']}>
                        <Button
                            intent={ButtonIntent.Secondary}
                            type="button"
                            onClick={handleOnCancelDeleteLocale}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={css['delete-btn']}
                            intent={ButtonIntent.Secondary}
                            type="button"
                            onClick={handleOnClickDeleteLocale}
                        >
                            <i className="material-icons">delete</i>
                            Delete Language
                        </Button>
                    </div>
                }
                style={{width: 380}}
                onClose={handleOnCancelDeleteLocale}
            >
                {pendingLocale && (
                    <p>
                        <FlagLanguageItem
                            code={localesByCode[pendingLocale.id].code}
                            name={localesByCode[pendingLocale.id].name}
                        />{' '}
                        content will not be available anymore until you add this
                        language back again.
                    </p>
                )}
            </Modal>
        </div>
    )
}
