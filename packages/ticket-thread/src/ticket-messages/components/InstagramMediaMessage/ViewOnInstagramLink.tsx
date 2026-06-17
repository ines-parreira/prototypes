import { Box, Icon, Text } from '@gorgias/axiom'

import { ViewOnSocialLink } from '#ticket-messages/components/SocialMessageBubble/ViewOnSocialLink'

import css from '../SocialMessageBubble/SocialMessageBubble.less'

export type InstagramMentionType = 'story' | 'post' | 'comment'

type ViewOnInstagramLinkProps = {
    href?: string
    mentionType?: InstagramMentionType
}

export function ViewOnInstagramLink({
    href,
    mentionType,
}: ViewOnInstagramLinkProps) {
    if (mentionType) {
        return (
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxxs"
                className={css.viewOnLink}
            >
                <Icon name="mention" size="sm" />
                <Text size="sm">Mentioned you in a {mentionType}</Text>
                {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        <Text size="sm">View {mentionType}</Text>
                    </a>
                )}
            </Box>
        )
    }

    return (
        <ViewOnSocialLink href={href!} label="view on" platform="Instagram" />
    )
}
