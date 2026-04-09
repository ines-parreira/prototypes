import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import classNames from 'classnames'

import {
    Avatar,
    Box,
    OverflowList,
    OverflowListItem,
    Text,
    useOverflowList,
} from '@gorgias/axiom'

import type { ActivityParticipant } from '../helpers/activityParticipants'
import { getActivityParticipantTextParts } from '../helpers/activityParticipants'

import css from './ActivityOverflowList.less'

type ActivityOverflowListProps = {
    className?: string
    participants: ActivityParticipant[]
    renderTrailingContent: (params?: {
        allItemsFit?: boolean
        hiddenCount?: number
        visibleParticipantsCount?: number
    }) => ReactNode
    textClassName?: string
}

const INLINE_TRAILING_CONTENT_WIDTH = 160

export function ActivityOverflowList({
    className,
    participants,
    renderTrailingContent,
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
                textClassName={textClassName}
            />
        </OverflowList>
    )
}

function ActivityOverflowListContent({
    participants,
    renderTrailingContent,
    textClassName,
}: Omit<ActivityOverflowListProps, 'className'>) {
    const { allItemsFit, hiddenCount, registerShowMoreButton } =
        useOverflowList()
    const trailingContentRef = useRef<HTMLDivElement | null>(null)
    const visibleParticipantsCount = allItemsFit
        ? participants.length
        : Math.max(participants.length - hiddenCount, 0)

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
            <Box
                alignItems="center"
                className={css.trailingContent}
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
        </>
    )
}
