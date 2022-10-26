import React from 'react'
import css from './TypingActivity.less'

export type TypingActivityProps = {
    isTyping: boolean
    name: string
}

const TypingActivity = ({name, isTyping}: TypingActivityProps) => {
    return (
        <div
            className={css.body}
            style={!isTyping ? {visibility: 'hidden'} : {}}
        >
            <span className={css.name}>{name}</span>
            <span>{` is typing`}</span>
            <span className={css.dot1}>.</span>
            <span className={css.dot2}>.</span>
            <span className={css.dot3}>.</span>
        </div>
    )
}

export default TypingActivity
