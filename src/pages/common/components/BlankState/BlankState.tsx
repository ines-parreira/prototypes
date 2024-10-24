import _sample from 'lodash/sample'
import React, {ReactNode, useState} from 'react'

import useEffectOnce from 'hooks/useEffectOnce'

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
