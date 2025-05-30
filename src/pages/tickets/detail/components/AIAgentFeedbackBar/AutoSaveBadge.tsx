import { useEffect, useRef, useState } from 'react'

import cn from 'classnames'

import { Badge, LoadingSpinner, Tooltip } from '@gorgias/merchant-ui-kit'

import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import { useTimeout } from 'hooks/useTimeout'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { formatDatetime } from 'utils'

const STALE_TIMEOUT = 3000

type AutoSaveBadgeProps = {
    state: AutoSaveState
    updatedAt?: string
}

const AutoSaveBadge = ({ state, updatedAt }: AutoSaveBadgeProps) => {
    const badgeRef = useRef<HTMLDivElement>(null)
    const [isStaleSaved, setIsStaleSaved] = useState(false)
    const [setTimeout, clearTimeout] = useTimeout()

    useEffect(() => {
        if (state === AutoSaveState.SAVED) {
            setIsStaleSaved(false)
            setTimeout(() => setIsStaleSaved(true), STALE_TIMEOUT)
            return () => clearTimeout()
        }

        setIsStaleSaved(false)
    }, [state, setTimeout, clearTimeout])

    if (state === AutoSaveState.INITIAL) {
        return null
    }

    const showSaving = state === AutoSaveState.SAVING
    const showSaved = state === AutoSaveState.SAVED
    const showSavedText = showSaved && !isStaleSaved
    const isTooltipEnabled = updatedAt && showSaved && isStaleSaved

    return (
        <>
            <Badge
                ref={badgeRef}
                className={css.autoSaveBadge}
                upperCase={false}
            >
                {showSaving && <LoadingSpinner size="small" />}

                {showSaved && <i className={cn('material-icons')}>check</i>}

                <div
                    className={cn(css.text, {
                        [css.hidden]: !showSaving && !showSavedText,
                    })}
                >
                    {showSaving ? 'Saving' : showSavedText ? 'Saved' : null}
                </div>
            </Badge>
            {isTooltipEnabled && (
                <Tooltip target={badgeRef}>
                    {`Last updated: ${formatDatetime(
                        updatedAt,
                        DateTimeFormatMapper[
                            DateTimeFormatType
                                .RELATIVE_DATE_AND_TIME_EN_US_AM_PM
                        ],
                    )}`}
                </Tooltip>
            )}
        </>
    )
}

export default AutoSaveBadge
