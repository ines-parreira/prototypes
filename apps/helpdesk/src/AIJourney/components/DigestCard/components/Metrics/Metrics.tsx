import classNames from 'classnames'

import { isNegative, isZero } from 'AIJourney/utils'

import css from './Metrics.less'

export type MetricsProps = {
    label: string
    value: string
    variation: string
}

const metricsVariationClass = (metricVariation: string) =>
    classNames(css.metricVariation, {
        [css['metricVariation--negative']]: isNegative(metricVariation),
        [css['metricVariation--neutral']]: isZero(metricVariation),
    })

export const Metrics = ({ label, value, variation }: MetricsProps) => {
    return (
        <div className={css.metric}>
            <span>{label}</span>
            <div className={css.metricInformation}>
                <div className={css.metricValue}>
                    <b>{value}</b>
                </div>
                <div className={metricsVariationClass(variation)}>
                    <b>{variation}</b>
                    {!isZero(variation) && (
                        <i className="material-icons-outlined">
                            {isNegative(variation)
                                ? 'arrow_downward'
                                : 'arrow_upward'}
                        </i>
                    )}
                </div>
            </div>
        </div>
    )
}
