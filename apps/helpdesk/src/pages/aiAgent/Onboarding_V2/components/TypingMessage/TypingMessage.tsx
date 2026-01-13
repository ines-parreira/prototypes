import css from './TypingMessage.less'

export type TypingMessageProps = {
    color: string
    indicatorColor?: string
    customStyle?: React.CSSProperties
}

const TypingMessage = ({
    color,
    indicatorColor = '#fff',
    customStyle,
}: TypingMessageProps) => {
    return (
        <div className="d-flex flex-column">
            <div
                className={css.bubble}
                data-testid="typing-message-bubble"
                style={{
                    backgroundColor: color,
                    ...customStyle,
                }}
            >
                <div className={css.typingIndicator}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <span
                            key={`indicator-${index}`}
                            style={{ backgroundColor: indicatorColor }}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TypingMessage
