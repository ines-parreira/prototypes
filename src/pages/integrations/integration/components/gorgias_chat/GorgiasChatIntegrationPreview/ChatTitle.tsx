import React from 'react'
import classnames from 'classnames'

import css from './ChatTitle.less'

type Props = {
    title: Maybe<string>
}

const ChatTitle: React.FC<Props> = ({title}) => (
    <div
        className={classnames(css.title, {
            [css.empty]: !title,
        })}
    >
        {title || 'Chat title'}
    </div>
)

export default ChatTitle
