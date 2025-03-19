import css from './TypingActivity.less'

export type TypingActivityProps = {
    isTyping: boolean
    name: string
}

const TypingActivity = ({ name, isTyping }: TypingActivityProps) => {
    return (
        <div
            className={css.component}
            style={isTyping ? {} : { display: 'none' }}
        >
            <span className={css.name}>{name}</span>
            <div className={css.wrapper}>
                <span>{` is typing`}</span>
                <span className={css.dot1}>.</span>
                <span className={css.dot2}>.</span>
                <span className={css.dot3}>.</span>
            </div>
        </div>
    )
}

export default TypingActivity
