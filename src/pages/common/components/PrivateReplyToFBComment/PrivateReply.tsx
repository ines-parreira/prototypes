import React, {useState, useCallback, ComponentProps} from 'react'
import Button from 'pages/common/components/button/Button'
import PrivateReplyButton from './PrivateReplyButton'
import PrivateReplyModal from './PrivateReplyModal/PrivateReplyModal'

type Props = Omit<
    ComponentProps<typeof PrivateReplyButton>,
    'onClick' | 'buttonComponent'
> &
    Omit<ComponentProps<typeof PrivateReplyModal>, 'isOpen' | 'toggle'>

export default function PrivateReply({
    integrationId,
    messageId,
    ticketMessageId,
    senderId,
    ticketId,
    commentMessage,
    source,
    sender,
    meta,
    messageCreatedDatetime,
    isFacebookComment,
    className,
}: Props) {
    const [isOpen, setOpen] = useState(false)
    const toggle = useCallback(() => setOpen(!isOpen), [isOpen])

    return (
        <>
            <PrivateReplyButton
                buttonComponent={ReplyButton}
                ticketMessageId={ticketMessageId}
                meta={meta}
                messageCreatedDatetime={messageCreatedDatetime}
                isFacebookComment={isFacebookComment}
                className={className}
                onClick={toggle}
            />
            {isOpen && (
                <PrivateReplyModal
                    integrationId={integrationId}
                    messageId={messageId}
                    ticketMessageId={ticketMessageId}
                    senderId={senderId}
                    isOpen={isOpen}
                    toggle={toggle}
                    ticketId={ticketId}
                    commentMessage={commentMessage}
                    source={source}
                    sender={sender}
                    meta={meta}
                    messageCreatedDatetime={messageCreatedDatetime}
                    isFacebookComment={isFacebookComment}
                />
            )}
        </>
    )
}

const ReplyButton = (props: ComponentProps<typeof Button>) => (
    <Button {...props} intent="secondary" />
)
