import React, {FunctionComponent} from 'react'

import {getEmojiFlag} from './utils'

import css from './FlagLanguageItem.less'

type FlagLanguageItemProps = {
    code: string
    name: string
}

export const FlagLanguageItem: FunctionComponent<FlagLanguageItemProps> = ({
    code,
    name,
}: FlagLanguageItemProps) => {
    return (
        <span>
            <img
                alt={code}
                src={getEmojiFlag(code)}
                className={css['flag-emoji']}
            />
            <span>{name}</span>
        </span>
    )
}
