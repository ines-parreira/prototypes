import { useCallback } from 'react'

import classNames from 'classnames'
import { motion } from 'framer-motion'

import { PerformanceBadge } from '../PerformanceBadge/PerformanceBadge'

import css from './DigestCard.less'

type DigestCardProps = {
    content: React.ReactNode
    metrics?: any[]
}

export const DigestCard = ({ content, metrics }: DigestCardProps) => {
    const isNegative = useCallback((value: string): boolean => {
        return value.startsWith('-')
    }, [])

    const isZero = useCallback((value: string): boolean => {
        const numeric = parseFloat(value.replace(/^[+-]/, '').replace('%', ''))
        return numeric === 0
    }, [])

    return (
        <motion.div
            className={css.digestCard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
        >
            <div className={css.digestHeader}>
                <PerformanceBadge />
                <div className={css.digestContent}>{content}</div>
            </div>
            <div className={css.digestMetrics}>
                {metrics?.map((metric, index) => (
                    <div key={index} className={css.metric}>
                        <span>{metric.label}</span>
                        <div className={css.metricInformation}>
                            <div className={css.metricValue}>
                                <b>{metric.value}</b>
                            </div>
                            <div
                                className={classNames(css.metricVariation, {
                                    [css['metricVariation--negative']]:
                                        isNegative(metric.variation),
                                    [css['metricVariation--neutral']]: isZero(
                                        metric.variation,
                                    ),
                                })}
                            >
                                <b>{metric.variation}</b>
                                {!isZero(metric.variation) && (
                                    <i className="material-icons-outlined">
                                        {isNegative(metric.variation)
                                            ? 'arrow_downward'
                                            : 'arrow_upward'}
                                    </i>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
