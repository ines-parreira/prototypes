import css from './TypingMessage.less'

export type TypingMessageProps = {
    color: string
}

const TypingMessage = ({ color }: TypingMessageProps) => {
    return (
        <div className="d-flex flex-column">
            <div
                className={css.bubble}
                data-testid="typing-message-bubble"
                style={{
                    backgroundColor: color,
                }}
            >
                <div className={css.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    )
}

export default TypingMessage
