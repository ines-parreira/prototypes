import React, {useMemo, useState} from 'react'
import produce from 'immer'
import _keyBy from 'lodash/keyBy'
import {Button} from 'reactstrap'

import {Locale} from '../../../../../../../models/helpCenter/types'
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
    const supportedLocales = useMemo(() => _keyBy(availableLocales, 'code'), [
        availableLocales,
    ])

    const availableList = Object.values(supportedLocales).map(
        localeToSelectOption
    )

    const selectedLocales = ensureDefaultLanguageIsFirst(
        preferences.availableLanguages,
        preferences.defaultLanguage
    )
        .filter((localeCode) => supportedLocales[localeCode])
        .map((localeCode) => {
            const locale = supportedLocales[localeCode]

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
                You will be able to edit and customize your Help Center in
                regards to the languages added here.
            </p>
            <DynamicBadgeList
                availableList={availableList}
                searchPlaceholder="Search Languages"
                selectedList={selectedLocales}
                onSelectItem={handleOnAddLocale}
                onRemoveItem={handleOnAttemptRemoveLocale}
            />
            <Modal
                isOpen={!!pendingLocale}
                header="Are you sure you want to delete this language?"
                className={css['modal-centered']}
                footer={
                    <div className={css['footer-actions']}>
                        <Button onClick={handleOnCancelDeleteLocale}>
                            Cancel
                        </Button>
                        <Button
                            className={css['delete-btn']}
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
                            code={supportedLocales[pendingLocale.id].code}
                            name={supportedLocales[pendingLocale.id].name}
                        />{' '}
                        content will not be available anymore until you add this
                        language back again.
                    </p>
                )}
            </Modal>
        </div>
    )
}
