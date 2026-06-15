import { Box, Icon, Text } from '@gorgias/axiom'

import css from './SocialMessageBubble.less'

type ViewOnSocialLinkProps = {
    href: string
    label: string
    platform: string
}

export function ViewOnSocialLink({
    href,
    label,
    platform,
}: ViewOnSocialLinkProps) {
    return (
        <Box alignItems="center" gap="xxs" className={css.viewOnLink}>
            <Icon name="external-link" size="sm" />
            <Text size="sm">{label} </Text>
            <a href={href} target="_blank" rel="noopener noreferrer">
                <Text size="sm">{platform}</Text>
            </a>
        </Box>
    )
}
