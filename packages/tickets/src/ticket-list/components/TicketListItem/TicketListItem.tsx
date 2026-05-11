import { memo, useCallback, useRef } from 'react'
import type { FocusEvent } from 'react'

import { Link } from 'react-router-dom'

import {
    Box,
    CheckBoxField,
    Dot,
    Icon,
    Tag,
    Text,
    Tile,
    TileContent,
    TileHeader,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type {
    Language,
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { TicketMessageSourceIcon } from '../../../components/TicketMessageSourceIcon/TicketMessageSourceIcon'
import type { TicketMessageSource } from '../../../components/TicketMessageSourceIcon/utils'
import { useCurrentUserLanguagePreferences } from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import { getTicketTranslationHelper } from '../../../translations/hooks/useTicketTranslationHelper'
import { useTicketDisplayData } from '../../hooks/useTicketDisplayData'
import type { OnSelectTicketParams } from '../../hooks/useTicketSelection'
import { TicketListItemAgentsViewing } from './components/TicketListItemAgentsViewing'
import { TicketListItemTrailingSlot } from './components/TicketListItemTrailingSlot'

import styles from './TicketListItem.module.less'

type Props = {
    ticket: TicketCompact
    viewId: number
    isActive: boolean
    currentUserId?: number
    showTranslatedContent?: boolean
    isSelected?: boolean
    onSelect?: (params: OnSelectTicketParams) => void
    translation?: TicketTranslationCompact
}

export const TicketListItem = memo(function TicketListItem({
    ticket,
    viewId,
    isActive,
    currentUserId,
    showTranslatedContent,
    isSelected = false,
    onSelect,
    translation,
}: Props) {
    const { otherAgentsViewing, customerName, displaySubject, displayExcerpt } =
        useTicketDisplayData({
            ticket,
            currentUserId,
            showTranslatedContent,
            translation,
        })
    const hasTranslatedContent =
        !!showTranslatedContent &&
        (!!translation?.subject?.trim() || !!translation?.excerpt?.trim())
    const { primary } = useCurrentUserLanguagePreferences()
    const translationHelper = getTicketTranslationHelper({
        language: ticket.language as Language | null,
        primary: (primary as Language | null) ?? null,
        isTranslated: hasTranslatedContent,
    })

    const shiftKeyRef = useRef(false)

    const handleCheckboxChange = useCallback(
        (value: boolean) => {
            if (onSelect) {
                onSelect({
                    id: ticket.id,
                    selected: value,
                    shiftKey: shiftKeyRef.current,
                })
            }
        },
        [onSelect, ticket.id],
    )

    const translationIcon = hasTranslatedContent ? (
        <Box mr="xxxs">
            <Tooltip
                placement="left"
                trigger={
                    <span aria-label={translationHelper}>
                        <Icon
                            aria-hidden="true"
                            name="translate"
                            size="sm"
                            color="content-neutral-secondary"
                        />
                    </span>
                }
            >
                <TooltipContent title={translationHelper} />
            </Tooltip>
        </Box>
    ) : null

    return (
        <Tile
            as={Link}
            to={`/app/views/${viewId}/${ticket.id}`}
            type={isActive ? 'full-border' : 'no-border'}
            data-selected={isSelected}
            data-active={isActive}
            className={styles.ticketListItem}
            onFocusCapture={(event: FocusEvent<HTMLElement>) => {
                event.currentTarget.scrollIntoView?.({
                    block: 'nearest',
                    inline: 'nearest',
                })
            }}
        >
            <TileHeader
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                trailingSlot={
                    <TicketListItemTrailingSlot
                        status={
                            ticket.snooze_datetime
                                ? 'snoozed'
                                : (ticket.status ?? undefined)
                        }
                        priority={ticket.priority ?? undefined}
                        datetime={
                            ticket.last_message_datetime ||
                            ticket.updated_datetime
                        }
                    />
                }
                subtitle={
                    ticket.is_unread ? (
                        <Box flexDirection="row" alignItems="center">
                            <Box mr="xxs">
                                <Dot color="red" />
                            </Box>
                            {translationIcon}
                            <Text
                                overflow="ellipsis"
                                variant="bold"
                                size="sm"
                                color="content-neutral-default"
                            >
                                {displaySubject}
                            </Text>
                        </Box>
                    ) : (
                        <Box flexDirection="row" alignItems="center">
                            {translationIcon}
                            <Text
                                overflow="ellipsis"
                                variant="bold"
                                size="sm"
                                color="content-neutral-secondary"
                            >
                                {displaySubject}
                            </Text>
                        </Box>
                    )
                }
            >
                <div
                    role="presentation"
                    className={styles.headerCheckbox}
                    onClickCapture={(e) => {
                        shiftKeyRef.current = e.shiftKey
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                    }}
                >
                    <Box data-checkbox-slot data-selected={isSelected}>
                        <Box data-element="checkbox">
                            <CheckBoxField
                                value={isSelected}
                                onChange={handleCheckboxChange}
                                aria-label={`Select ticket ${ticket.id}`}
                            />
                        </Box>
                        <Box data-element="icon" aria-hidden="true">
                            <TicketMessageSourceIcon
                                source={ticket.channel as TicketMessageSource}
                                size="sm"
                                color="content-neutral-secondary"
                            />
                        </Box>
                    </Box>
                </div>
                {customerName && (
                    <Text
                        variant="bold"
                        size="md"
                        overflow="ellipsis"
                        color={
                            ticket.is_unread
                                ? 'content-neutral-default'
                                : 'content-neutral-secondary'
                        }
                        className={styles.headerCustomerName}
                    >
                        {customerName}
                    </Text>
                )}
            </TileHeader>

            <TileContent>
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xxxs"
                >
                    <Box flex={1} minWidth={0}>
                        {ticket.last_sent_message_not_delivered ? (
                            <Tag
                                color="red"
                                leadingSlot={
                                    <Icon name="warning-triangle" size="sm" />
                                }
                                className={styles.failedMessageTag}
                            >
                                Last message not delivered
                            </Tag>
                        ) : (
                            displayExcerpt && (
                                <Text
                                    size="sm"
                                    color="content-neutral-secondary"
                                    overflow="ellipsis"
                                >
                                    {displayExcerpt}
                                </Text>
                            )
                        )}
                    </Box>
                    <div className={styles.trailingAvatars}>
                        <TicketListItemAgentsViewing
                            agents={otherAgentsViewing}
                        />
                    </div>
                </Box>
            </TileContent>
        </Tile>
    )
})
