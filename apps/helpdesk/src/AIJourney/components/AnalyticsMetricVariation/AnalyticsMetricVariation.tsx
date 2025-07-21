import { useCallback } from 'react'

import classNames from 'classnames'

import css from './AnalyticsMetricVariation.less'

type AnalyticsMetricVariationProps = {
    metricVariation: string
}

export const AnalyticsMetricVariation = ({
    metricVariation,
}: AnalyticsMetricVariationProps) => {
    const isNegative = useCallback((value: string): boolean => {
        return value.startsWith('-')
    }, [])

    const isZero = useCallback((value: string): boolean => {
        const numeric = parseFloat(value.replace(/^[+-]/, '').replace('%', ''))
        return numeric === 0
    }, [])
    return (
        <div
            className={classNames(css.metricVariation, {
                [css['metricVariation--negative']]: isNegative(metricVariation),
                [css['metricVariation--neutral']]: isZero(metricVariation),
            })}
        >
            <b>{metricVariation}</b>
            {!isZero(metricVariation) && (
                <i className="material-icons-outlined">
                    {isNegative(metricVariation)
                        ? 'arrow_downward'
                        : 'arrow_upward'}
                </i>
            )}
        </div>
    )
}
