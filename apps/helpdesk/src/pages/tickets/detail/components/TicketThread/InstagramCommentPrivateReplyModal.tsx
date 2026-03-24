import type { InstagramCommentPrivateReplyData } from '@repo/ticket-thread/legacy-bridge'

import type { Actor, Source } from 'models/ticket/types'
import PrivateReplyModal from 'pages/common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal'

type InstagramCommentPrivateReplyModalProps = {
    data: InstagramCommentPrivateReplyData
    onToggle: () => void
}

export function InstagramCommentPrivateReplyModal({
    data,
    onToggle,
}: InstagramCommentPrivateReplyModalProps) {
    return (
        <PrivateReplyModal
            integrationId={data.integrationId ?? 0}
            messageId={data.messageId ?? ''}
            ticketMessageId={data.ticketMessageId}
            senderId={data.senderId}
            isOpen={true}
            toggle={onToggle}
            ticketId={data.ticketId}
            commentMessage={data.commentMessage}
            source={data.source as Source}
            sender={data.sender as Actor}
            meta={data.meta as any}
            messageCreatedDatetime={data.messageCreatedDatetime}
            isFacebookComment={false}
        />
    )
}
