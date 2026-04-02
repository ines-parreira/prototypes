import ReactPlayer from 'react-player'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import type {
    TicketThreadInternalNoteItem,
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { getMessageVideoUrls } from './utils/getMessageVideoUrls'

import css from './MessageVideos.less'

type MessageVideosProps = {
    item: TicketThreadRegularMessageItem | TicketThreadInternalNoteItem
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
