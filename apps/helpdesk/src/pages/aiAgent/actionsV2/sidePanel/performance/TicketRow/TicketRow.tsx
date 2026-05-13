import { Box, Card, Icon, Tag, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import type { TicketStatus } from '../../types'

import css from './TicketRow.less'

type Props = {
    iconName: IconName
    title: string
    date: string
    status: TicketStatus
    messageCount: number
    onClick?: () => void
}

const STATUS_TAG: Record<
    TicketStatus,
    { label: string; color: 'green' | 'orange' }
> = {
    automated: { label: 'Automated', color: 'green' },
    handover: { label: 'Handover', color: 'orange' },
}

const TicketRowBody = ({
    iconName,
    title,
    date,
    status,
    messageCount,
}: Omit<Props, 'onClick'>) => {
    const tag = STATUS_TAG[status]
    return (
        <Card p="sm" gap="xxs">
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxxs"
                width="100%"
            >
                <Icon name={iconName} size="sm" />
                <Box flexGrow={1} minWidth={0}>
                    <Text size="sm" variant="bold" overflow="ellipsis">
                        {title}
                    </Text>
                </Box>
                <Text size="sm" color="content-neutral-secondary">
                    {date}
                </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Tag color={tag.color} size="sm">
                    {tag.label}
                </Tag>
                <Text size="sm" color="content-neutral-secondary">
                    {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                </Text>
            </Box>
        </Card>
    )
}

export const TicketRow = ({ onClick, ...rest }: Props) => {
    if (!onClick) return <TicketRowBody {...rest} />
    return (
        <button
            type="button"
            onClick={onClick}
            className={css.interactive}
            aria-label={`Open ticket: ${rest.title}`}
        >
            <TicketRowBody {...rest} />
        </button>
    )
}
