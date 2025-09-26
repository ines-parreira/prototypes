import TypingMessage from 'pages/aiAgent/Onboarding/components/TypingMessage/TypingMessage'

import css from './GeneratingMessage.less'

export const GeneratingMessage = () => {
    return (
        <div className={css.container}>
            <div className={css.messageBubble}>
                <TypingMessage
                    color="transparent"
                    indicatorColor="#B3B8C1" // var(--static-secondary)
                    customStyle={{ margin: 0, padding: 0 }}
                />
            </div>
            <div className={css.bottomMessage}>
                <i className="material-icons-outlined">auto_awesome</i>
                Generating messages
            </div>
        </div>
    )
}
