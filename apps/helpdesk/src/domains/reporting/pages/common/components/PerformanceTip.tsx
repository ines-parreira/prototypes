import React, { PropsWithChildren } from 'react'

import classnames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import css from 'domains/reporting/pages/common/components/PerformanceTip.less'
import { sanitizeHtmlDefault } from 'utils/html'

type SuccessLevel = 'neutral' | 'light-error' | 'light-success' | 'success'

type Props = {
    avgMerchant?: string | number | null
    topTen?: string | number | null
    className?: string
    canduId?: string
    type?: SuccessLevel
    showBenchmark?: boolean
    avgTooltip?: string
}

const SentimentIconLabel: {
    [K in SuccessLevel]: {
        icon: string
        label: string
    }
} = {
    neutral: {
        icon: 'lightbulb',
        label: 'Tip',
    },
    'light-error': {
        icon: 'sentiment_neutral',
        label: 'Room for improvement',
    },
    'light-success': {
        icon: 'sentiment_satisfied',
        label: 'You’re doing good',
    },
    success: {
        icon: 'sentiment_very_satisfied',
        label: 'You’re doing great',
    },
}

export default function PerformanceTip({
    children,
    className,
    canduId,
    type = 'neutral',
    avgMerchant,
    topTen,
    showBenchmark = true,
    avgTooltip,
}: PropsWithChildren<Props>) {
    const hasData = !(avgMerchant == null || topTen == null)
    const tooltipId = `tip-tooltip-${type}`

    return (
        <div className={classnames(css.wrapper, className, css[type])}>
            {showBenchmark && (
                <>
                    <div className={css.sentiment}>
                        <div>
                            <span className={css.label}>Avg. merchant:</span>
                            <span className={css.value} id={tooltipId}>
                                {avgMerchant ?? '-'}
                            </span>
                            {avgTooltip && (
                                <Tooltip
                                    target={tooltipId}
                                    placement="top-start"
                                    autohide={false}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtmlDefault(
                                                avgTooltip,
                                            ),
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </div>
                        <div>
                            <span className={css.label}>Top 5%:</span>
                            <span className={css.value}>{topTen ?? '-'}</span>
                        </div>
                    </div>
                    <div className={css.separator}></div>
                </>
            )}

            <div className={css.iconWrapper}>
                {hasData || !showBenchmark ? (
                    <>
                        <i
                            className={classnames(
                                'material-icons-outlined',
                                css.icon,
                                css[type],
                            )}
                        >
                            {SentimentIconLabel[type].icon}
                        </i>
                        <span>{SentimentIconLabel[type].label}</span>
                    </>
                ) : (
                    'No data'
                )}
            </div>
            <div
                data-candu-id={`performance-tip-data${
                    canduId ? `-${canduId}` : ''
                }`}
            >
                {children || 'No data available for the selected filters.'}
            </div>
        </div>
    )
}
