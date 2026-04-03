import { Box, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './SocialMessageBubble.less'

type RepliedViaLabelProps = {
    channel: string
    ticketId: number
}

export function RepliedViaLabel({ channel, ticketId }: RepliedViaLabelProps) {
    return (
        <Box alignItems="center" gap="xxs" className={css.repliedViaLabel}>
            <Icon name={'arrow-undo-down-right' as IconName} size="sm" />
            <Text size="sm">replied via {channel}</Text>
            <a
                href={`${ticketId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={css.repliedViaLabelLink}
            >
                <Text size="sm">View ticket</Text>
                <Icon name="external-link" size="sm" />
            </a>
        </Box>
    )
}
