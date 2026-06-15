import { Box, Text } from '@gorgias/axiom'

import type { TicketThreadSocialMediaInstagramStoryReplyItem } from '../../types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'

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
