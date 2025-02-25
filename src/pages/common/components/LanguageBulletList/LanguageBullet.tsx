import React from 'react'

import { getEmojiFlag } from '../../utils/locale'

import css from './LanguageBullet.less'

type Props = {
    id?: string
    code?: string
    count?: number
}

export const LanguageBullet = ({ id, code, count = 0 }: Props) => {
    if (!code && !count) {
        return null
    }

    return (
        <div
            aria-label={`Item for locale ${code || 'overflow'}`}
            id={id}
            className={css['language-bullet-item']}
        >
            {code ? (
                <img
                    alt={code}
                    aria-label={`Picture for language ${code}`}
                    className={css['flag-emoji']}
                    src={getEmojiFlag(code)}
                />
            ) : (
                `+${count}`
            )}
        </div>
    )
}
