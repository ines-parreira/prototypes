import { useMemo } from 'react'

import classNames from 'classnames'

import { Box, Text } from '@gorgias/axiom'

import { ActivityOverflowList } from '../components/ActivityOverflowList'
import type { ActivityParticipant } from '../helpers/activityParticipants'
import { formatHiddenParticipantsLabel } from '../helpers/activityParticipants'
import { useAnimatedCollection } from '../hooks/useAnimatedCollection'

import css from './TypingActivity.less'

type TypingActivityProps = {
    agents?: ActivityParticipant[]
    customers?: ActivityParticipant[]
}

export function TypingActivity({
    agents = [],
    customers = [],
}: TypingActivityProps) {
    const typingParticipants = useMemo(
        () => [...customers, ...agents],
        [agents, customers],
    )
    const { displayedItems: displayedParticipants, isVisible } =
        useAnimatedCollection(typingParticipants)

    if (displayedParticipants.length === 0) {
        return null
    }

    const renderTypingStatus = (typingCopy: string) => (
        <Box className={css.typingStatus} display="inline-flex">
            <Text className={classNames(css.text, css.typingCopy)} size="sm">
                {typingCopy}
            </Text>
            <Box
                alignItems="baseline"
                className={css.dots}
                display="inline-flex"
            >
                <span className={css.dot} />
                <span className={css.dot} />
                <span className={css.dot} />
            </Box>
        </Box>
    )

    const renderTrailingTypingContent = (
        params:
            | {
                  allItemsFit?: boolean
                  hiddenCount?: number
                  visibleParticipantsCount?: number
              }
            | undefined,
    ) => {
        const { allItemsFit, hiddenCount, visibleParticipantsCount } =
            params ?? {}

        const typingCopy =
            allItemsFit === false
                ? 'are typing'
                : displayedParticipants.length === 1
                  ? 'is typing'
                  : 'are typing'

        if (!allItemsFit && hiddenCount) {
            return (
                <>
                    {visibleParticipantsCount ? (
                        <Text className={css.text} size="sm">
                            {' and '}
                        </Text>
                    ) : null}
                    <Text
                        className={classNames(css.text)}
                        size="sm"
                        variant="bold"
                    >
                        {formatHiddenParticipantsLabel(hiddenCount)}
                    </Text>
                    {renderTypingStatus(typingCopy)}
                </>
            )
        }

        return renderTypingStatus(typingCopy)
    }

    return (
        <Box
            className={classNames(css.root, {
                [css.hidden]: !isVisible,
            })}
            mb="xs"
            flex={1}
        >
            <ActivityOverflowList
                className={css.list}
                participants={displayedParticipants}
                renderTrailingContent={renderTrailingTypingContent}
                textClassName={css.text}
            />
        </Box>
    )
}
