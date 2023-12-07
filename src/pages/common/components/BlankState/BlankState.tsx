import React, {ReactNode, useState} from 'react'
import _sample from 'lodash/sample'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useEffectOnce} from 'react-use'

import css from './BlankState.less'

type Header = {
    title: string
    emojis: string[]
}

type Props = {
    message?: ReactNode
}

const headers: Header[] = [
    {title: 'Great job!', emojis: ['✨', '🌈']},
    {title: 'Great job, you crushed it!', emojis: ['🔥']},
    {title: "Great job, let's celebrate!", emojis: ['🎉', '🎊', '🏆']},
]

const BlankState = ({message}: Props) => {
    const [header, setHeader] = useState<Header>()
    const [emoji, setEmoji] = useState<string>()

    useEffectOnce(() => {
        const header = _sample(headers)
        setHeader(header)
        setEmoji(_sample(header?.emojis))
    })

    return (
        <div className={css['blank-state']}>
            {message ? (
                message
            ) : (
                <div className={css['blank-state-message']}>
                    <div className={css['blank-state-message-icon']}>
                        {emoji}
                    </div>
                    <div className={css['blank-state-message-title']}>
                        {header?.title}
                    </div>
                    <div className={css['blank-state-message-text']}>
                        You’ve just helped all your customers. Enjoy your day
                        now!
                    </div>
                </div>
            )}
        </div>
    )
}

export default BlankState
