import { Box, Text } from '@gorgias/axiom'

import type { GoToLink } from '../../utils/buildGoToLink'

import css from './SocialMessageBubble.less'

type GoToLinkFooterProps = {
    goToLink: GoToLink
}

export function GoToLinkFooter({ goToLink }: GoToLinkFooterProps) {
    return (
        <Box alignItems="center" gap="xxs" className={css.goToLink}>
            <Text size="sm">{goToLink.label}</Text>
            {goToLink.replyingToLink && goToLink.replyingToUsername && (
                <>
                    <a
                        href={goToLink.replyingToLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Text size="sm">@{goToLink.replyingToUsername}</Text>
                    </a>
                    <Text size="sm"> - go to </Text>
                </>
            )}
            <a href={goToLink.link} target="_blank" rel="noopener noreferrer">
                <Text size="sm">{goToLink.type}</Text>
            </a>
        </Box>
    )
}
