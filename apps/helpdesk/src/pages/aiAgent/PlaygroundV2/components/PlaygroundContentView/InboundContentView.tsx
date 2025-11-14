import { PlaygroundInitialContent } from '../PlaygroundInitialContent/PlaygroundInitialContent'
import { PlaygroundMessageList } from '../PlaygroundMessageList/PlaygroundMessageList'
import { BaseContentViewProps } from './ContentView'

// TODO: extract the style into a dedicated file
import css from './InboundContentView.less'

type InboundContentViewProps = BaseContentViewProps

export const InboundContentView = ({
    accountId,
    userId,
    onGuidanceClick,
    shouldDisplayReasoning,
    messages,
}: InboundContentViewProps) => {
    return (
        <>
            {messages.length > 0 && (
                <div className={css.messageListContainer}>
                    <PlaygroundMessageList
                        accountId={accountId}
                        userId={userId}
                        onGuidanceClick={onGuidanceClick}
                        shouldDisplayReasoning={shouldDisplayReasoning}
                        messages={messages}
                    />
                </div>
            )}
            {messages.length === 0 && (
                <div className={css.initialContentContainer}>
                    <PlaygroundInitialContent />
                </div>
            )}
        </>
    )
}
