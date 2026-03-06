import type { IconName } from '@gorgias/axiom'
import { Box, CardHeader, Icon, Text } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import css from './TicketTimelineWidget.less'

type TicketHeaderProps = Pick<Ticket, 'subject'> & {
    time: string
    iconName?: IconName
}

export function TicketHeader({ subject, time, iconName }: TicketHeaderProps) {
    return (
        <CardHeader
            leadingSlot={
                iconName ? (
                    <span className={css.iconWrapper}>
                        <Icon name={iconName} size="md" />
                    </span>
                ) : undefined
            }
            title={
                <div className={css.titleContainer}>
                    <Box
                        justifyContent="space-between"
                        alignItems="center"
                        flex="1"
                        minWidth={0}
                        gap="xxxs"
                    >
                        <Box minWidth={0}>
                            <Text size="sm" variant="bold" overflow="ellipsis">
                                {subject}
                            </Text>
                        </Box>
                        <Box flexShrink="0" className={css.noWrap}>
                            <Text
                                size="sm"
                                variant="regular"
                                className={css.dateText}
                            >
                                {time}
                            </Text>
                        </Box>
                    </Box>
                </div>
            }
        />
    )
}
