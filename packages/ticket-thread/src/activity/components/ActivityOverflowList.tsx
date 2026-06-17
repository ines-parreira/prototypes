import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import classNames from 'classnames'

import {
    Avatar,
    Box,
    OverflowList,
    OverflowListItem,
    Text,
    Tooltip,
    TooltipContent,
    useOverflowList,
} from '@gorgias/axiom'

import type { ActivityParticipant } from '#activity/helpers/activityParticipants'
import { getActivityParticipantTextParts } from '#activity/helpers/activityParticipants'

import css from './ActivityOverflowList.less'

type ActivityOverflowListProps = {
    className?: string
    participants: ActivityParticipant[]
    renderTrailingContent: (params?: {
        allItemsFit?: boolean
        hiddenCount?: number
        visibleParticipantsCount?: number
    }) => ReactNode
    trailingContentClassName?: string
    textClassName?: string
}

const INLINE_TRAILING_CONTENT_WIDTH = 160

export function ActivityOverflowList({
    className,
    participants,
    renderTrailingContent,
    trailingContentClassName,
    textClassName,
}: ActivityOverflowListProps) {
    return (
        <OverflowList
            className={className}
            minWidth={0}
            nonExpandedLineCount={1}
            flex={1}
            width="100%"
        >
            <ActivityOverflowListContent
                participants={participants}
                renderTrailingContent={renderTrailingContent}
                trailingContentClassName={trailingContentClassName}
                textClassName={textClassName}
            />
        </OverflowList>
    )
}

function ActivityOverflowListContent({
    participants,
    renderTrailingContent,
    trailingContentClassName,
    textClassName,
}: Omit<ActivityOverflowListProps, 'className'>) {
    const { allItemsFit, hiddenCount, registerShowMoreButton } =
        useOverflowList()
    const trailingContentRef = useRef<HTMLDivElement | null>(null)
    const visibleParticipantsCount = allItemsFit
        ? participants.length
        : Math.max(participants.length - hiddenCount, 0)
    const hiddenParticipants = participants.slice(visibleParticipantsCount)

    useLayoutEffect(() => {
        if (trailingContentRef.current) {
            registerShowMoreButton(trailingContentRef.current)
        }
        return () => {
            registerShowMoreButton(null)
        }
    }, [registerShowMoreButton])

    return (
        <>
            {participants.map((participant, index) => {
                const { shouldPrefixWithAnd, suffix } =
                    getActivityParticipantTextParts({
                        index,
                        hiddenCount,
                        visibleParticipantsCount,
                    })
                const participantName = participant.name || 'Unknown'
                const isLastParticipant = index === participants.length - 1

                return (
                    <OverflowListItem key={`${participant.id}-${index}`}>
                        <Box
                            alignItems="center"
                            className={css.participant}
                            display="inline-flex"
                            flexShrink={0}
                        >
                            {shouldPrefixWithAnd ? (
                                <Text className={textClassName} size="sm">
                                    {' and '}
                                </Text>
                            ) : null}
                            <Avatar
                                name={participantName}
                                size="sm"
                                url={
                                    participant.meta?.profile_picture_url ?? ''
                                }
                            />
                            <Text
                                className={classNames(
                                    css.participantName,
                                    textClassName,
                                )}
                                size="sm"
                                variant="bold"
                            >
                                {`${participantName}${suffix}`}
                            </Text>
                            {isLastParticipant && (
                                <Box w={INLINE_TRAILING_CONTENT_WIDTH}>
                                    {renderTrailingContent({})}
                                </Box>
                            )}
                        </Box>
                    </OverflowListItem>
                )
            })}
            <Tooltip
                placement="top left"
                trigger={
                    <Box
                        alignItems="center"
                        className={classNames(
                            css.trailingContent,
                            trailingContentClassName,
                        )}
                        style={{
                            display: allItemsFit ? 'none' : 'flex',
                        }}
                        ref={trailingContentRef}
                    >
                        {renderTrailingContent({
                            allItemsFit,
                            hiddenCount,
                            visibleParticipantsCount,
                        })}
                    </Box>
                }
            >
                <TooltipContent>
                    <Box flexDirection="column" gap="xxxxs">
                        {hiddenParticipants.map((participant, index) => {
                            const participantName =
                                participant.name || 'Unknown'

                            return (
                                <Box
                                    key={`${participant.id}-${index}`}
                                    alignItems="center"
                                    display="inline-flex"
                                    gap="xxs"
                                >
                                    <Avatar
                                        name={participantName}
                                        size="sm"
                                        url={
                                            participant.meta
                                                ?.profile_picture_url ?? ''
                                        }
                                    />
                                    <Text size="sm" variant="bold">
                                        {participantName}
                                    </Text>
                                </Box>
                            )
                        })}
                    </Box>
                </TooltipContent>
            </Tooltip>
        </>
    )
}
