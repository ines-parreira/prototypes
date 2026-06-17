import { Box, Text } from '@gorgias/axiom'

import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { SocialMessageBubble } from '#ticket-messages/components/SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import type { TicketThreadSocialMediaInstagramStoryReplyItem } from '#ticket-messages/types'
import { getSocialChannelIcon } from '#ticket-messages/utils/getSocialChannelIcon'

type InstagramStoryReplyMessageProps = {
    item: TicketThreadSocialMediaInstagramStoryReplyItem
}

export function InstagramStoryReplyMessage({
    item,
}: InstagramStoryReplyMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const isExpired =
        new Date(displayedItem.data.created_datetime).getTime() <
        Date.now() - 24 * 60 * 60 * 1000
    const storyLink =
        !isExpired &&
        displayedItem.data.message_id &&
        displayedItem.data.integration_id
            ? `/integrations/facebook/redirect/instagramstory?message_id=${displayedItem.data.message_id}&integration_id=${displayedItem.data.integration_id}`
            : null

    return (
        <SocialMessageBubble
            item={displayedItem}
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
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
        </SocialMessageBubble>
    )
}
