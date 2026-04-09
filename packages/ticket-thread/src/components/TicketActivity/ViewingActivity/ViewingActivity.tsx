import { useRef } from 'react'

import classNames from 'classnames'

import { Box, Text } from '@gorgias/axiom'

import { ActivityOverflowList } from '../components/ActivityOverflowList'
import type { ActivityParticipant } from '../helpers/activityParticipants'
import { useAnimatedCollection } from '../hooks/useAnimatedCollection'
import { useRenderingBehaviour } from './useRenderingBehaviour'

import css from './ViewingActivity.less'

type ViewingActivityProps = {
    agents: ActivityParticipant[]
}

const VIEWING_BANNER_HEIGHT = 42

export function ViewingActivity({ agents }: ViewingActivityProps) {
    const rootRef = useRef<HTMLDivElement | null>(null)
    const {
        displayedItems: displayedAgents,
        hasItems: hasAgents,
        isVisible,
    } = useAnimatedCollection(agents)
    const { shouldReserveSpace } = useRenderingBehaviour({
        hasAgents,
        height: VIEWING_BANNER_HEIGHT,
        rootRef,
    })

    if (displayedAgents.length === 0) {
        return null
    }

    const renderTrailingViewingContent = (
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

        if (!allItemsFit && hiddenCount) {
            return (
                <>
                    {visibleParticipantsCount !== undefined &&
                    visibleParticipantsCount > 0 ? (
                        <Text size="sm">{' and '}</Text>
                    ) : null}
                    <Text size="sm" variant="bold">
                        {`${hiddenCount} others`}
                    </Text>
                    <Text size="sm">{' are also viewing this ticket'}</Text>
                </>
            )
        }

        return (
            <Text size="sm">
                {displayedAgents.length === 1
                    ? ' is also viewing this ticket'
                    : ' are also viewing this ticket'}
            </Text>
        )
    }

    return (
        <Box className={css.root} ref={rootRef}>
            <Box
                className={classNames(css.slot, {
                    [css.hiddenSlot]: !isVisible || !shouldReserveSpace,
                })}
            />
            <Box
                className={classNames(css.banner, {
                    [css.hiddenBanner]: !isVisible,
                })}
                flex={1}
            >
                <ActivityOverflowList
                    className={css.list}
                    participants={displayedAgents}
                    renderTrailingContent={renderTrailingViewingContent}
                />
            </Box>
        </Box>
    )
}
