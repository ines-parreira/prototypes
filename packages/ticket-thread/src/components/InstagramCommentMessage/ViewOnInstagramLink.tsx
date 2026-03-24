import { Box, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './InstagramCommentMessage.less'

type ViewOnInstagramLinkProps = {
    href: string
}

export function ViewOnInstagramLink({ href }: ViewOnInstagramLinkProps) {
    return (
        <Box alignItems="center" gap="xxs" className={css.viewOnLink}>
            <Icon name={'external-link' as IconName} size="sm" />
            <Text size="sm">view on </Text>
            <a href={href} target="_blank" rel="noopener noreferrer">
                <Text size="sm">Instagram</Text>
            </a>
        </Box>
    )
}
