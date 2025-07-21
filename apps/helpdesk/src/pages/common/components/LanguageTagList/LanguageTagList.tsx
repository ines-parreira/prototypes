import React, { useMemo } from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import BadgeItem from 'pages/common/components/BadgetItem'

import { Locale } from '../../../../models/helpCenter/types'
import { moveLocaleToBack } from '../../utils/locale'

import css from './LanguageTagList.less'

type Props = {
    id: number | string
    defaultLanguage: Locale
    languageList: Locale[]
    displayLimit?: number
}

const TooltipContent = ({
    languageList,
}: {
    languageList: Locale[]
    defaultLanguage: Locale
}) => (
    <div
        className={css['language-tag-tooltip']}
        data-testid="language-tag-tooltip"
    >
        {languageList.map((lang) => (
            <span key={lang.code}>{lang.name}</span>
        ))}
    </div>
)

/**
 * Renders a list of language tags with an overlap effect.
 *
 * @description
 * The component displays language tags in reverse order to create a visual
 * overlap effect. The displayed tags are moved to the back of the list,
 * and the default language is highlighted with "(Default)" suffix.
 * The default language is always the rightmost tag in the UI.
 *
 * When there are more languages than the display limit allows:
 * - Extra languages are collapsed into a "+X more" tag
 * - Hovering over the "+X more" shows a tooltip with all hidden languages
 *
 * @example
 * Given input: languages =  ['de,' 'fr,' 'en'] and considering the default language is 'en' and displayLimit is 1
 * Visual output: [en (Default)] [+2]
 *
 * @param props.id - Unique identifier for the language tag list
 * @param props.defaultLanguage - The primary language locale
 * @param props.languageList - Array of all available language locales
 * @param props.displayLimit - Maximum number of tags to show (defaults to 1)
 */
export const LanguageTagList: React.FC<Props> = ({
    id,
    defaultLanguage,
    languageList,
    displayLimit = 1,
}: Props) => {
    const { displayedLocales, hiddenLocales } = useMemo(() => {
        if (languageList.length === 0 || !defaultLanguage) {
            return {
                displayedLocales: [],
                hiddenLocales: [],
            }
        }

        const isExceedLimit = displayLimit < languageList.length

        const locales = moveLocaleToBack(languageList, defaultLanguage)

        //   Slice the num of locales that can fit in the list
        // starting from the back of the list
        let displayedLocales: Locale[] = locales
        let hiddenLocales: Locale[] = []

        if (isExceedLimit) {
            displayedLocales = locales.slice(-1 * displayLimit) // Removed the -1 to show correct number of tags
            hiddenLocales = locales.slice(
                0,
                languageList.length - displayedLocales.length,
            )
        }

        return {
            displayedLocales,
            hiddenLocales,
        }
    }, [languageList, defaultLanguage, displayLimit])

    const displayedTags = useMemo(() => {
        if (displayedLocales.length === 0) {
            return null
        }

        const formatLanguageName = (lang: Locale) =>
            lang.code === defaultLanguage.code
                ? `${lang.name} (Default)`
                : lang.name

        return displayedLocales.map((language) => {
            const languageText = formatLanguageName(language)

            return (
                <BadgeItem
                    data-testid={`displayed-tag-${id}-${language.code}`}
                    key={language.code}
                    id={language.code}
                    label={languageText}
                    isClosable={false}
                    customClass={css['language-tag']}
                />
            )
        })
    }, [displayedLocales, defaultLanguage, id])

    if (!defaultLanguage || languageList.length === 0) {
        return null
    }

    return (
        <div className={css['language-tag-list']}>
            {hiddenLocales.length > 0 && (
                <>
                    <BadgeItem
                        id={`more-tags-${id}`}
                        key="language-more"
                        label={`+${hiddenLocales.length} more`}
                        isClosable={false}
                        customClass={css['language-tag']}
                    />
                    <Tooltip target={`badge-more-tags-${id}`} placement="top">
                        <TooltipContent
                            languageList={hiddenLocales}
                            defaultLanguage={defaultLanguage}
                        />
                    </Tooltip>
                </>
            )}
            {displayedTags}
        </div>
    )
}
