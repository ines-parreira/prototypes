import React, { forwardRef, useCallback, useMemo } from 'react'

import cn from 'classnames'

import { TicketSummaryProperty } from '@gorgias/helpdesk-types'
import { Badge, Button, IconButton } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import css from 'pages/tickets/detail/components/TicketSummary.less'
import useTicketSummary from 'pages/tickets/detail/hooks/useTicketSummary'
import { formatDatetime } from 'utils'

type TicketSummaryProps = {
    summary?: TicketSummaryProperty
    ticketId: number
    isPopup?: boolean
}

const TicketSummarySection = ({
    summary,
    ticketId,
    isPopup = false,
}: TicketSummaryProps) => {
    const {
        summary: localSummary,
        isLoading,
        errorMessage,
        requestSummary,
        hasRequested,
    } = useTicketSummary({
        ticketId,
        initialSummary: summary,
        generateOnMountIfMissing: isPopup,
    })

    const latestUpdateDatetime = useMemo(() => {
        if (!localSummary) {
            return null
        }
        return localSummary.updated_datetime || localSummary.created_datetime
    }, [localSummary])

    const hasContent = useMemo(
        () => !!localSummary?.content,
        [localSummary?.content],
    )

    const summaryInfo = useMemo(() => {
        if (isLoading) {
            return 'Summarizing...'
        }
        if (errorMessage && hasContent) {
            return errorMessage
        }
        if (hasContent && latestUpdateDatetime) {
            const formattedDate = formatDatetime(
                latestUpdateDatetime,
                DateTimeFormatMapper[DateTimeFormatType.COMPACT_DATE_EN_US],
            )
            return `Updated ${formattedDate}`
        }
        return null
    }, [isLoading, errorMessage, hasContent, latestUpdateDatetime])

    const manuallyRequestInitialSummary = useCallback(() => {
        logEvent(SegmentEvent.AiTicketSummaryInitManuallyRequested, {
            ticketId,
            page: 'customer-timeline',
        })
        requestSummary()
    }, [requestSummary, ticketId])

    return (
        <div
            className={cn(
                css.container,
                isPopup ? css.popup : css.hasBackground,
                { [css.notRequested]: !hasRequested },
            )}
        >
            <div className={css.title}>
                <AISummaryIcon />
                <span className={css.text}>Ticket Summary</span>
                <Badge className={css.badge} corner="square">
                    AI
                </Badge>
                {!isPopup && !hasRequested && (
                    <TicketSummaryButton
                        onClick={manuallyRequestInitialSummary}
                        className={css.initButton}
                    >
                        Summarize
                    </TicketSummaryButton>
                )}
            </div>
            {hasRequested && (
                <>
                    {isLoading ? (
                        <SummaryBodySkeleton
                            rows={isPopup ? [70, 90, 65] : [100, 80]}
                        />
                    ) : (
                        <SummaryBody>
                            {localSummary?.content || (
                                <span className={css.bodyError}>
                                    {errorMessage}
                                </span>
                            )}
                        </SummaryBody>
                    )}
                    <div className={css.footer}>
                        <SummaryInfo>{summaryInfo}</SummaryInfo>

                        {!isLoading && hasContent && !errorMessage && (
                            <IconButton
                                className={css.updateButton}
                                size="small"
                                icon="loop"
                                intent="secondary"
                                fillStyle="ghost"
                                onClick={requestSummary}
                            />
                        )}

                        {!isLoading && !hasContent && errorMessage && (
                            <Button
                                size="small"
                                intent="primary"
                                fillStyle="ghost"
                                leadingIcon="loop"
                                onClick={requestSummary}
                                className={css.retryButton}
                            >
                                Try Again
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default TicketSummarySection

type TicketSummaryButtonProps = {
    onClick: () => void
    className?: string
    children?: React.ReactNode
    leadingIcon?: React.ReactNode
}

export const TicketSummaryButton = forwardRef<
    HTMLButtonElement,
    TicketSummaryButtonProps
>(({ onClick, className, children, leadingIcon = <AISummaryIcon /> }, ref) => {
    return (
        <Button
            size="small"
            intent="secondary"
            fillStyle="fill"
            leadingIcon={leadingIcon}
            onClick={onClick}
            ref={ref}
            className={className}
        >
            {children}
        </Button>
    )
})

export const AISummaryIcon = React.memo(() => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g id="AI Ticket Summary">
            <path
                id="Union"
                d="M19.001 19.0001C19.5533 19.0001 20.001 19.4478 20.001 20.0001C20.0009 20.5523 19.5532 21.0001 19.001 21.0001H3.00098C2.44875 21.0001 2.00106 20.5523 2.00098 20.0001C2.00098 19.4478 2.44869 19.0001 3.00098 19.0001H19.001ZM21.001 14.0001C21.5533 14.0001 22.001 14.4478 22.001 15.0001C22.0009 15.5523 21.5532 16.0001 21.001 16.0001H3.00098C2.44875 16.0001 2.00106 15.5523 2.00098 15.0001C2.00098 14.4478 2.44869 14.0001 3.00098 14.0001H21.001ZM17.3174 2.44444C17.5907 1.85218 18.4259 1.85218 18.6992 2.44444L19.8994 5.11729L22.5566 6.31651C23.1489 6.58985 23.1489 7.42499 22.5566 7.69834L19.8994 8.89854L18.6992 11.5558C18.4258 12.1479 17.5761 12.1479 17.3027 11.5558L16.1025 8.88291L13.4453 7.68369C12.8531 7.41035 12.8531 6.57523 13.4453 6.30186L16.1182 5.10166L17.3174 2.44444ZM11.001 9.0001C11.5533 9.0001 12.001 9.44781 12.001 10.0001C12.0009 10.5523 11.5532 11.0001 11.001 11.0001H3.00098C2.44875 11.0001 2.00106 10.5523 2.00098 10.0001C2.00098 9.44781 2.44869 9.0001 3.00098 9.0001H11.001ZM10.001 4.0001C10.5533 4.0001 11.001 4.44781 11.001 5.0001C11.0009 5.55231 10.5532 6.0001 10.001 6.0001H3.00098C2.44875 6.0001 2.00106 5.55231 2.00098 5.0001C2.00098 4.44781 2.44869 4.0001 3.00098 4.0001H10.001Z"
                fill="currentColor"
            />
        </g>
    </svg>
))

type SummarySkeletonProps = { width?: number }

export const SummarySkeleton = ({ width = 100 }: SummarySkeletonProps) => (
    <div
        className={css.skeletonLineContainer}
        style={{ width: `${width}%` }}
        data-testid="summary-skeleton"
    >
        <div className={css.skeletonLine}></div>
    </div>
)

type SummaryBodySkeletonProps = {
    rows: number[]
}

export const SummaryBodySkeleton = ({ rows }: SummaryBodySkeletonProps) => {
    return (
        <div className={css.summaryBodySkeleton}>
            {rows.map((width, index) => (
                <SummarySkeleton key={index} width={width} />
            ))}
        </div>
    )
}

export const SummaryInfo: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return <div className={css.info}>{children}</div>
}

export const SummaryBody: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return <div className={css.body}>{children}</div>
}
