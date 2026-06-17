import ReactPlayer from 'react-player'

import type { DisplayedTicketThreadMessageItem } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import { useExpandedMessages } from '#ticket-messages/context/ExpandedMessages'
import type {
    TicketThreadAiAgentHandoverMessageItem,
    TicketThreadAiAgentMessageItem,
    TicketThreadInternalNoteItem,
    TicketThreadRegularMessageItem,
    TicketThreadSocialMediaFacebookMessageItem,
    TicketThreadSocialMediaInstagramDirectMessageItem,
    TicketThreadSocialMediaWhatsAppMessageItem,
} from '#ticket-messages/types'
import { getMessageVideoUrls } from './utils/getMessageVideoUrls'

import css from './MessageVideos.less'

type MessageVideosBaseItem =
    | TicketThreadRegularMessageItem
    | TicketThreadInternalNoteItem
    | TicketThreadAiAgentMessageItem
    | TicketThreadAiAgentHandoverMessageItem
    | TicketThreadSocialMediaFacebookMessageItem
    | TicketThreadSocialMediaInstagramDirectMessageItem
    | TicketThreadSocialMediaWhatsAppMessageItem

export type MessageVideosItem =
    | MessageVideosBaseItem
    | DisplayedTicketThreadMessageItem<MessageVideosBaseItem>

type MessageVideosProps = {
    item: MessageVideosItem
}

export function MessageVideos({ item }: MessageVideosProps) {
    const { isMessageExpanded } = useExpandedMessages()
    const isExpanded = isMessageExpanded(item.data.id)
    const videoUrls = getMessageVideoUrls(item, isExpanded)

    if (!videoUrls?.length) {
        return null
    }

    return videoUrls.map((url, index) => (
        <div key={`${url}-${index}`} className={css.video}>
            <ReactPlayer
                url={url}
                controls={true}
                light={true}
                width="100%"
                height="100%"
            />
        </div>
    ))
}
