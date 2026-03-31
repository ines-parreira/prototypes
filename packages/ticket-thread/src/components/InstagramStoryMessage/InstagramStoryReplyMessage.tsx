import { Box, Text } from '@gorgias/axiom'

import type { TicketThreadSocialMediaInstagramStoryReplyItem } from '../../hooks/messages/types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

type InstagramStoryReplyMessageProps = {
    item: TicketThreadSocialMediaInstagramStoryReplyItem
}

export function InstagramStoryReplyMessage({
    item,
}: InstagramStoryReplyMessageProps) {
    const isExpired =
        new Date(item.data.created_datetime).getTime() <
        Date.now() - 24 * 60 * 60 * 1000
    const storyLink =
        !isExpired && item.data.message_id && item.data.integration_id
            ? `/integrations/facebook/redirect/instagramstory?message_id=${item.data.message_id}&integration_id=${item.data.integration_id}`
            : null

    return (
        <SocialMessageBubble
            item={item}
            channelIcon={getSocialChannelIcon(item._tag) ?? 'comm-instagram'}
            goToLink={
                storyLink
                    ? { label: 'go to', type: 'story', link: storyLink }
                    : null
            }
        >
            <Box>
                <Text>Story reply</Text>
            </Box>
            <MessageBody item={item} />
        </SocialMessageBubble>
    )
}
