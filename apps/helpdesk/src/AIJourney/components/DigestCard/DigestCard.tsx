import { motion } from 'framer-motion'

import { PerformanceBadge } from '../PerformanceBadge/PerformanceBadge'
import { EmptyContent } from './components/EmptyContent/EmptyContent'
import { Metrics, MetricsProps } from './components/Metrics/Metrics'

import css from './DigestCard.less'

type DigestCardProps = {
    content: React.ReactNode
    metrics?: MetricsProps[]
}

export const DigestCard = ({ content, metrics }: DigestCardProps) => {
    // const isEmpty = !content || !metrics?.length
    const isEmpty = true

    return (
        <motion.div
            className={css.digestCard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
        >
            <div className={css.digestHeader}>
                <PerformanceBadge />
                {!isEmpty && <div className={css.digestContent}>{content}</div>}
            </div>
            <div className={css.digestMetrics}>
                {isEmpty ? (
                    <EmptyContent />
                ) : (
                    metrics?.map((metric, index) => (
                        <Metrics key={index} {...metric} />
                    ))
                )}
            </div>
        </motion.div>
    )
}
