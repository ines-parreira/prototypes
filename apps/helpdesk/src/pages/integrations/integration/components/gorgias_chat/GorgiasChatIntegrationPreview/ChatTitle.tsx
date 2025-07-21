import classnames from 'classnames'

import css from './ChatTitle.less'

type Props = {
    isBot?: boolean
    title: Maybe<string>
}

const ChatTitle = ({ isBot = false, title }: Props) => (
    <div
        className={classnames(css.title, {
            [css.empty]: !title,
        })}
    >
        {title ? (isBot ? `${title} Bot` : title) : 'Chat title'}
    </div>
)

export default ChatTitle
