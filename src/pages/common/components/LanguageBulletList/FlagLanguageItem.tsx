import React from 'react'

import {getEmojiFlag} from './utils'

import css from './FlagLanguageItem.less'

type Props = {
    code: string
    name: string
}

export const FlagLanguageItem = ({code, name}: Props) => {
    return (
        <span>
            <span className={css['flag-emoji']}>{getEmojiFlag(code)}</span>
            <span>{name}</span>
        </span>
    )
}
