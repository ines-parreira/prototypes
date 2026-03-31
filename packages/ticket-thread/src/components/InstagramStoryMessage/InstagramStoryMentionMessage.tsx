import { Box, Text } from '@gorgias/axiom'

import type { TicketThreadSocialMediaInstagramStoryMentionItem } from '../../hooks/messages/types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

type InstagramStoryMentionMessageProps = {
    item: TicketThreadSocialMediaInstagramStoryMentionItem
}

export function InstagramStoryMentionMessage({
    item,
}: InstagramStoryMentionMessageProps) {
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
                <Text>Story mention</Text>
            </Box>
        </SocialMessageBubble>
    )
}
