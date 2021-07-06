import React from 'react'

import {HelpCenterLocale} from '../../../../models/helpCenter/types'

import Tooltip from '../Tooltip'

import {FlagLanguageItem} from './FlagLanguageItem'
import {LanguageBullet} from './LanguageBullet'

import {moveLocaleToBack, moveLocaleToFront} from './utils'

import css from './LanguageList.less'

type Props = {
    defaultLanguage: HelpCenterLocale
    helpcenterId: number | string
    languageList: HelpCenterLocale[]
    bulletLimit?: number
}

//   This component renders the locales in the reverse order
// to create the overlap effect. This means we need to pay attention
// to the order of the elements when we render the bullets.
//
//    E.g.
//      - input list: ['en', 'fr', 'de']
//      - UI renders: (de)(fr)(en)
//
//   The tooltip will be rendered in the expected order, but it will
// move the defaultLanguage to the top of the list.
export const LanguageList = ({
    defaultLanguage,
    helpcenterId,
    languageList,
    bulletLimit = 2,
}: Props) => {
    const middleContent: JSX.Element[] = []
    const itemsExceedLimit = bulletLimit < languageList.length

    if (!defaultLanguage || languageList.length === 0) {
        return null
    }

    //   Default language will be displayed first and that means
    // we need to move it at the back of the list
    let restOfLocales = moveLocaleToBack(languageList, defaultLanguage)

    //   Slice the num of locales that can fit in the list
    // starting from the back of the list
    if (itemsExceedLimit) {
        restOfLocales = restOfLocales.slice(-1 * (bulletLimit - 1))
    }

    // Add the bullets that should be shown
    restOfLocales.forEach((language) => {
        middleContent.push(
            <LanguageBullet key={language.code} code={language.code} />
        )
    })

    return (
        <div className={css['language-bullet-list']}>
            {itemsExceedLimit && (
                <>
                    <LanguageBullet
                        id={`more-items-${helpcenterId}`}
                        key="more"
                        count={languageList.length - middleContent.length}
                    />
                    <Tooltip
                        target={`more-items-${helpcenterId}`}
                        placement="top-start"
                    >
                        <div className={css['language-tooltip']}>
                            {moveLocaleToFront(
                                languageList,
                                defaultLanguage
                            ).map((lang) => (
                                <FlagLanguageItem
                                    key={lang.code}
                                    code={lang.code}
                                    name={lang.name}
                                />
                            ))}
                        </div>
                    </Tooltip>
                </>
            )}
            {middleContent}
        </div>
    )
}
