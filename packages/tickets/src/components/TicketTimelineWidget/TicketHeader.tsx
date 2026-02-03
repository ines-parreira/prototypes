import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import css from './TicketHeader.less'

type TicketHeaderProps = Pick<Ticket, 'subject'> & {
    time: string
    iconName?: IconName
}

export function TicketHeader({ subject, time, iconName }: TicketHeaderProps) {
    return (
        <Box gap="xxxs" alignItems="center">
            {iconName && (
                <span className={css.iconWrapper}>
                    <Icon name={iconName} size="md" />
                </span>
            )}
            <Box
                justifyContent="space-between"
                alignItems="center"
                flex="1"
                minWidth={0}
                gap="xxxs"
            >
                <Text size="sm" variant="bold" overflow="ellipsis">
                    {subject}
                </Text>

                <Text size="sm" variant="regular">
                    {time}
                </Text>
            </Box>
        </Box>
    )
}
