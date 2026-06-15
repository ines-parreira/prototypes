import type { TicketThreadSocialMediaInstagramStoryMentionItem } from '../../types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { ViewOnInstagramLink } from '../InstagramMediaMessage/ViewOnInstagramLink'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

type InstagramStoryMentionMessageProps = {
    item: TicketThreadSocialMediaInstagramStoryMentionItem
}

export function InstagramStoryMentionMessage({
    item,
}: InstagramStoryMentionMessageProps) {
    const storyLink =
        item.data.message_id && item.data.integration_id
            ? `/integrations/facebook/redirect/instagramstory?message_id=${item.data.message_id}&integration_id=${item.data.integration_id}`
            : null

    return (
        <SocialMessageBubble
            item={item}
            channelIcon={getSocialChannelIcon(item._tag) ?? 'comm-instagram'}
        >
            <ViewOnInstagramLink
                mentionType="story"
                href={storyLink ?? undefined}
            />
        </SocialMessageBubble>
    )
}
