import React from 'react'
import classNames from 'classnames'
import css from './ProgressBar.less'

type BarType =
    | 'primary'
    | 'secondary'
    | 'threshold'
    | 'error'
    | 'warning'
    | 'success'

type Thresholds = Partial<
    Record<
        BarType,
        {
            low: number // inclusive
            high: number // inclusive
        }
    >
>

type Props = {
    // You can change the color property of the container if you need a custom color
    className?: string
    value: number
    maxValue: number
    labelType?: 'percentage' | 'fraction' | 'none'
    barType?: BarType
    thresholds?: Thresholds
}

const defaultThresholds: Thresholds = {
    success: {
        low: 61,
        high: 100,
    },
    warning: {
        low: 31,
        high: 60,
    },
    error: {
        low: 0,
        high: 30,
    },
} as const

const checkBarType = (
    percent: number,
    barType: BarType,
    checkedBarType: BarType,
    thresholds: Thresholds
) => {
    return (
        barType === checkedBarType ||
        (barType === 'threshold' &&
            thresholds[checkedBarType] &&
            percent >= thresholds[checkedBarType]!.low &&
            percent <= thresholds[checkedBarType]!.high)
    )
}

const ProgressBar = ({
    barType = 'primary',
    labelType = 'percentage',
    value,
    maxValue,
    thresholds = defaultThresholds,
    className,
}: Props) => {
    const percent = Math.floor((value / maxValue) * 100)

    const isSuccess = checkBarType(percent, barType, 'success', thresholds)
    const isError = checkBarType(percent, barType, 'error', thresholds)
    const isWarning = checkBarType(percent, barType, 'warning', thresholds)
    const isSecondary = checkBarType(percent, barType, 'secondary', thresholds)

    return (
        <div
            className={classNames(css.container, className, {
                [css.secondary]: isSecondary,
                [css.error]: isError,
                [css.warning]: isWarning,
                [css.success]: isSuccess,
            })}
        >
            {labelType !== 'none' && (
                <div className={css.label}>
                    {labelType === 'percentage' && `${percent}%`}
                    {labelType === 'fraction' && `${value}/${maxValue}`}
                </div>
            )}
            <div className={css.barContainer}>
                <div
                    style={{
                        transform: `translateX(${
                            percent > 100 ? 100 : percent
                        }%)`,
                    }}
                    className={css.bar}
                />
            </div>
        </div>
    )
}

export default ProgressBar
