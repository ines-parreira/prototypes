import type { ReactNode } from 'react'

import { Box, Card, Icon, Tag, Text } from '@gorgias/axiom'
import type { IconName, TagColor } from '@gorgias/axiom'

import css from './ReferenceCardShell.less'

export type ReferenceCardStatus = {
    label: string
    color: TagColor
}

type ReferenceCardShellProps = {
    icon: IconName
    typeLabel: string
    title: ReactNode
    eyebrow?: ReactNode
    statusTag?: ReferenceCardStatus
    body?: ReactNode
    rows?: ReactNode
}

export function ReferenceCardShell({
    icon,
    typeLabel,
    title,
    eyebrow,
    statusTag,
    body,
    rows,
}: ReferenceCardShellProps) {
    return (
        <Card
            flexDirection="column"
            gap="xxs"
            elevation="mid"
            p="md"
            width="100%"
        >
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xxs"
            >
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Icon
                        name={icon}
                        size="xs"
                        color="content-neutral-secondary"
                    />
                    <Text
                        size="xs"
                        variant="medium"
                        color="content-neutral-secondary"
                        className={css.typeLabel}
                    >
                        {typeLabel}
                    </Text>
                </Box>
                {eyebrow ? (
                    <Text size="xs" color="content-neutral-secondary">
                        {eyebrow}
                    </Text>
                ) : null}
            </Box>

            <Box
                flexDirection="row"
                alignItems="flex-start"
                gap="xxs"
                className={css.titleRow}
            >
                <Text
                    size="sm"
                    variant="bold"
                    color="content-neutral-default"
                    className={css.title}
                >
                    {title}
                </Text>
                {statusTag ? (
                    <Tag color={statusTag.color} size="sm">
                        {statusTag.label}
                    </Tag>
                ) : null}
            </Box>

            {body ? <div className={css.body}>{body}</div> : null}

            {rows ? (
                <Box flexDirection="column" gap="xxs" className={css.rows}>
                    {rows}
                </Box>
            ) : null}
        </Card>
    )
}

type ReferenceCardRowProps = {
    icon: IconName
    children: ReactNode
}

export function ReferenceCardRow({ icon, children }: ReferenceCardRowProps) {
    return (
        <Box flexDirection="row" alignItems="center" gap="xxs">
            <Icon name={icon} size="xs" color="content-neutral-secondary" />
            <Text size="xs" color="content-neutral-default">
                {children}
            </Text>
        </Box>
    )
}
