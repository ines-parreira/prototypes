import classnames from 'classnames'

import React, {PropsWithChildren} from 'react'
import css from 'pages/stats/PerformanceTip.less'

type SuccessLevel = 'neutral' | 'light-error' | 'light-success' | 'success'

type Props = {
    avgMerchant: number | null
    topTen: number | null
    className?: string
    type?: SuccessLevel
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
    type = 'neutral',
    avgMerchant,
    topTen,
}: PropsWithChildren<Props>) {
    const hasData = !(avgMerchant == null || topTen == null)
    return (
        <div className={classnames(css.wrapper, className, css[type])}>
            <div className={css.sentiment}>
                <div>
                    <span className={css.label}>Avg. merchant:</span>
                    <span className={css.value}>{avgMerchant ?? '-'}</span>
                </div>
                <div>
                    <span className={css.label}>Top 10%:</span>
                    <span className={css.value}>{topTen ?? '-'}</span>
                </div>
            </div>
            <div className={css.separator}></div>
            <div className={css.iconWrapper}>
                {hasData ? (
                    <>
                        <i
                            className={classnames(
                                'material-icons-outlined',
                                css.icon,
                                css[type]
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
            {!hasData || !children
                ? 'No data available for the selected filters.'
                : children}
        </div>
    )
}
