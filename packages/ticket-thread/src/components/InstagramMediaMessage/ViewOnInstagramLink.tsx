import { Box, Icon, Text } from '@gorgias/axiom'

import css from './InstagramMediaMessage.less'

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
        <Box alignItems="center" gap="xxs" className={css.viewOnLink}>
            <Icon name="external-link" size="sm" />
            <Text size="sm">view on </Text>
            <a href={href} target="_blank" rel="noopener noreferrer">
                <Text size="sm">Instagram</Text>
            </a>
        </Box>
    )
}
