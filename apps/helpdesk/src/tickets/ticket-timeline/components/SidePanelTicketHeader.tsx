import type { ReactNode } from 'react'

import { TicketFieldsOverflowList } from '@repo/tickets'
import type { TicketCustomField } from '@repo/tickets'

import type { ColorValue, IconName } from '@gorgias/axiom'
import {
    Avatar,
    Box,
    Button,
    Dot,
    Heading,
    Icon,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Tag,
    Text,
} from '@gorgias/axiom'
import type { Ticket, TicketCompact } from '@gorgias/helpdesk-types'

import { StatusTag } from './StatusTag'

import css from './SidePanelTicketHeader.less'

type SidePanelTicketHeaderProps = {
    ticket: Ticket | TicketCompact
    customFields: TicketCustomField[]
    conditionsLoading: boolean
    iconName: IconName
    additionalActions?: ReactNode
    onExpand?: () => void
}

export function SidePanelTicketHeader({
    ticket,
    customFields,
    conditionsLoading,
    iconName,
    additionalActions,
    onExpand,
}: SidePanelTicketHeaderProps) {
    const isSnoozed = !!ticket.snooze_datetime

    return (
        <Box
            flexDirection="column"
            gap="xxs"
            paddingTop={'md'}
            paddingLeft={'lg'}
            paddingRight={'lg'}
        >
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxxs"
                marginBottom={'xxs'}
            >
                <Box flexShrink={0}>
                    <span className={css.iconWrapper}>
                        <Icon name={iconName} size="md" intent="regular" />
                    </span>
                </Box>

                <Box flex={1} minWidth={0}>
                    <Heading
                        size="sm"
                        overflow="ellipsis"
                        className={css.title}
                    >
                        {ticket.subject}
                    </Heading>
                </Box>

                <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="xxxs"
                    flexShrink={0}
                >
                    <StatusTag status={ticket.status} isSnoozed={isSnoozed} />
                    {onExpand && (
                        <Button
                            as="button"
                            icon="arrow-expand"
                            intent="regular"
                            size="sm"
                            variant="tertiary"
                            onClick={onExpand}
                            aria-label="Expand ticket"
                        />
                    )}
                    {additionalActions}
                </Box>
            </Box>

            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                flexWrap="wrap"
            >
                {ticket.tags && ticket.tags.length > 0 && (
                    <Box flex={1} minWidth={0}>
                        <OverflowList gap="xxxs" nonExpandedLineCount={1}>
                            {ticket.tags.map((tag) => (
                                <OverflowListItem key={tag.id}>
                                    <Tag
                                        {...(tag.decoration?.color && {
                                            leadingSlot: (
                                                <Dot
                                                    color={
                                                        tag.decoration
                                                            .color as ColorValue
                                                    }
                                                />
                                            ),
                                        })}
                                    >
                                        {tag.name}
                                    </Tag>
                                </OverflowListItem>
                            ))}

                            <OverflowListShowMore
                                className={css.overflowListShowMore}
                            >
                                {({ hiddenCount }) => (
                                    <Box
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="xxxs"
                                    >
                                        <Text
                                            className={css.secondaryText}
                                            size="sm"
                                        >
                                            +{hiddenCount} more
                                        </Text>
                                    </Box>
                                )}
                            </OverflowListShowMore>
                            <OverflowListShowLess
                                className={css.overflowListShowMore}
                                leadingSlot="arrow-chevron-up"
                            >
                                <Text className={css.secondaryText} size="sm">
                                    Show less
                                </Text>
                            </OverflowListShowLess>
                        </OverflowList>
                    </Box>
                )}

                {ticket.assignee_user && (
                    <Box flexShrink={0}>
                        <Tag
                            leadingSlot={
                                <Avatar
                                    name={ticket.assignee_user.name}
                                    size="sm"
                                />
                            }
                        >
                            {ticket.assignee_user.name}
                        </Tag>
                    </Box>
                )}
            </Box>

            <TicketFieldsOverflowList
                customFields={customFields}
                isLoading={conditionsLoading}
                nonExpandedLineCount={1}
            />
        </Box>
    )
}
