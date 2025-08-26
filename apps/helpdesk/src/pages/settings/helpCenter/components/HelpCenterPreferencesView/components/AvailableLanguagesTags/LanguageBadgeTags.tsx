import React, { useCallback, useMemo, useState } from 'react'

import { produce } from 'immer'
import _keyBy from 'lodash/keyBy'

import { Button } from '@gorgias/axiom'

import { Locale, LocaleCode } from 'models/helpCenter/types'
import { BadgeItemProps } from 'pages/common/components/BadgetItem'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { FlagLanguageItem } from '../../../../../../common/components/LanguageBulletList'
import { localeToSelectOption } from '../../../../utils/localeSelectOptions'
import { DynamicBadgeList } from '../BadgeList'
import { transformToSelectedLocale } from './utils'

function ensureDefaultLanguageIsFirst(
    locales: LocaleCode[],
    defaultLocale: LocaleCode | null,
): LocaleCode[] {
    if (!defaultLocale) return locales

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

    availableLanguages: LocaleCode[]
    defaultLanguage: LocaleCode | null

    updateAvailableLanguages: (locales: LocaleCode[]) => void

    showModalQuestion?: boolean
}

export const LanguageBadgeTags = ({
    availableLocales,
    showModalQuestion,
    availableLanguages,
    defaultLanguage,
    updateAvailableLanguages,
}: Props) => {
    const [pendingLocale, setPendingLocale] = useState<BadgeItemProps | null>()

    const localesByCode = useMemo(
        () => _keyBy(availableLocales, 'code'),
        [availableLocales],
    )

    const localeOptions = useMemo(
        () => availableLocales.map(localeToSelectOption),
        [availableLocales],
    )

    const selectedLocales = ensureDefaultLanguageIsFirst(
        availableLanguages,
        defaultLanguage,
    )
        .filter((localeCode) => localesByCode[localeCode])
        .map((localeCode, _index, allLocales) => {
            const locale = localesByCode[localeCode]

            const defaultLanguageLabel =
                locale.code === defaultLanguage
                    ? 'Change your default language to select a different language here.'
                    : null

            const singleLanguageLabel =
                allLocales.length <= 1
                    ? 'You must have at least one language available.'
                    : null

            return transformToSelectedLocale(
                locale,
                defaultLanguageLabel ?? singleLanguageLabel,
            )
        })

    const handleOnAddLocale = (_: React.MouseEvent, locale: BadgeItemProps) => {
        updateAvailableLanguages([
            ...availableLanguages,
            locale.id as LocaleCode,
        ])
    }

    const forceRemoveLocal = useCallback(
        (locale: BadgeItemProps) => {
            // TODO: replace with simple function
            const newAvailabelLanguages = produce(
                availableLanguages,
                (draftLocales) => {
                    const index = draftLocales.findIndex(
                        (localeId) => localeId === locale.id,
                    )

                    if (index >= 0) {
                        draftLocales.splice(index, 1)
                    }
                },
            )

            updateAvailableLanguages(newAvailabelLanguages)
        },
        [availableLanguages, updateAvailableLanguages],
    )

    const handleOnClickDeleteLocale = () => {
        if (!pendingLocale) return

        forceRemoveLocal(pendingLocale)

        setPendingLocale(null)
    }

    const handleOnCancelDeleteLocale = () => {
        setPendingLocale(null)
    }

    const handleOnAttemptRemoveLocale = (
        _: React.MouseEvent,
        item: BadgeItemProps,
    ) => {
        if (showModalQuestion) {
            setPendingLocale(item)
        } else {
            forceRemoveLocal(item)
        }
    }

    return (
        <>
            <DynamicBadgeList
                availableList={localeOptions}
                selectedList={selectedLocales}
                searchPlaceholder="Search Languages"
                onSelectItem={handleOnAddLocale}
                onRemoveItem={handleOnAttemptRemoveLocale}
            />
            <Modal
                isOpen={!!pendingLocale}
                onClose={handleOnCancelDeleteLocale}
            >
                <ModalHeader title="Delete language?" />
                <ModalBody>
                    {pendingLocale && (
                        <p>
                            <FlagLanguageItem
                                code={localesByCode[pendingLocale.id].code}
                                name={localesByCode[pendingLocale.id].name}
                            />{' '}
                            content will no longer be available unless you add
                            the language back.
                        </p>
                    )}
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="secondary"
                        onClick={handleOnCancelDeleteLocale}
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="destructive"
                        onClick={handleOnClickDeleteLocale}
                    >
                        <i className="material-icons">delete</i>
                        Delete Language
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
