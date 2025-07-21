import { motion } from 'framer-motion'

import css from './Tooltip.less'

type ToolTipProps = {
    date: string
    info: string
}

export const Tooltip = ({ date, info }: ToolTipProps) => {
    return (
        <motion.div
            className={css.tooltip}
            initial={{ height: 0, opacity: 0, transformOrigin: 'top' }}
            animate={{ height: 'max-content', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
        >
            <div className={css.date}>
                <span>{date}</span>
            </div>
            <div className={css.info}>
                <span>{info}</span>
            </div>
        </motion.div>
    )
}
