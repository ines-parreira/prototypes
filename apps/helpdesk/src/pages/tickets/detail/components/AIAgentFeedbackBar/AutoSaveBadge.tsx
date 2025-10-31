import { ComponentProps, useEffect, useRef, useState } from 'react'

import { useTimeout } from '@repo/hooks'
import cn from 'classnames'

import { Badge, LoadingSpinner, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { formatDatetime } from 'utils'

const STALE_TIMEOUT = 3000

type AutoSaveBadgeProps = {
    state: AutoSaveState
    updatedAt?: Date
    savedIcon?: React.ReactNode
    tooltipPlacement?: ComponentProps<typeof Tooltip>['placement']
}

const AutoSaveBadge = ({
    state,
    updatedAt,
    savedIcon,
    tooltipPlacement,
}: AutoSaveBadgeProps) => {
    const badgeRef = useRef<HTMLDivElement>(null)
    const [isStaleSaved, setIsStaleSaved] = useState(false)
    const [setTimeout, clearTimeout] = useTimeout()

    const stringUpdatedAt = updatedAt?.toISOString()

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDateWithTime,
    )

    useEffect(() => {
        if (state === AutoSaveState.INITIAL && stringUpdatedAt) {
            setIsStaleSaved(true)
            return
        }
        if (state === AutoSaveState.SAVED) {
            setIsStaleSaved(false)
            setTimeout(() => setIsStaleSaved(true), STALE_TIMEOUT)
            return () => clearTimeout()
        }

        setIsStaleSaved(false)
    }, [state, setTimeout, clearTimeout, stringUpdatedAt])

    if (state === AutoSaveState.INITIAL && !updatedAt) {
        return null
    }

    const showSaving = state === AutoSaveState.SAVING
    const showSaved =
        state === AutoSaveState.SAVED ||
        (updatedAt && state === AutoSaveState.INITIAL)
    const showSavedText = showSaved && !isStaleSaved
    const isTooltipEnabled = updatedAt && showSaved && isStaleSaved

    const defaultSavedIcon = <i className={cn('material-icons')}>check</i>

    return (
        <>
            <Badge
                ref={badgeRef}
                className={css.autoSaveBadge}
                upperCase={false}
            >
                {showSaving && <LoadingSpinner size="small" />}

                {showSaved && (savedIcon ?? defaultSavedIcon)}

                <div
                    className={cn(css.text, {
                        [css.hidden]: !showSaving && !showSavedText,
                    })}
                >
                    {showSaving ? 'Saving' : showSavedText ? 'Saved' : null}
                </div>
            </Badge>
            {isTooltipEnabled && (
                <Tooltip target={badgeRef} placement={tooltipPlacement}>
                    <span>
                        {`Last updated: ${formatDatetime(
                            updatedAt.toISOString(),
                            datetimeFormat,
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                        )}`}
                    </span>
                </Tooltip>
            )}
        </>
    )
}

export default AutoSaveBadge
