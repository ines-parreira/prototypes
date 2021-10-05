import React from 'react'
import produce from 'immer'
import _keyBy from 'lodash/keyBy'
import {Button} from 'reactstrap'

import {HelpCenterLocale} from '../../../../../../../models/helpCenter/types'

import Modal from '../../../../../../common/components/Modal'

import {useLanguagePreferencesSettings} from '../../../../providers/LanguagePreferencesSettings'

import {DynamicBadgeList, BadgeItemProps} from '../BadgeList'
import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'

import {transformToSelectOption, transformToSelectedLocale} from './utils'
import css from './AvailableLanguagesTags.less'

function ensureDefaultLanguageIsFirst(locale: string[], defaultLocale: string) {
    const index = locale.findIndex((code) => code === defaultLocale)
    const localeCopy = [...locale]

    if (index > 0) {
        localeCopy.splice(index, 1)
        return [defaultLocale, ...localeCopy]
    }

    return locale
}

type Props = {
    availableLocales: HelpCenterLocale[]
}

export const AvailableLanguagesTags = ({availableLocales}: Props) => {
    const {preferences, updatePreference} = useLanguagePreferencesSettings()
    const [
        pendingLocale,
        setPendingLocale,
    ] = React.useState<BadgeItemProps | null>()
    const supportedLocales = React.useMemo(
        () => _keyBy(availableLocales, 'code'),
        [availableLocales]
    )

    const availableList = Object.values(supportedLocales).map(
        transformToSelectOption
    )

    const selectedLocales = ensureDefaultLanguageIsFirst(
        preferences.availableLanguages,
        preferences.defaultLanguage
    )
        .filter((locale) => supportedLocales[locale])
        .map((locale) =>
            transformToSelectedLocale(
                supportedLocales[locale],
                preferences.defaultLanguage
            )
        )

    const handleOnAddLocale = (_: React.MouseEvent, locale: BadgeItemProps) => {
        updatePreference({
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

        updatePreference({
            availableLanguages: produce(
                preferences.availableLanguages,
                (draftLocales) => {
                    const index = draftLocales.findIndex((locale) => {
                        return locale === pendingLocale.id
                    })
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
        <section>
            <h5>Available languages</h5>
            <p>
                You will be able to edit and customize your help center in
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
        </section>
    )
}
