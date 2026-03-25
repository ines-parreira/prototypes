import type { ReactNode } from 'react'

import cn from 'classnames'
import { motion } from 'framer-motion'

import { Icon } from '@gorgias/axiom'

import css from './CollapsibleSection.less'

type CollapsibleSectionProps = {
    title: string
    caption?: string
    isExpanded: boolean
    onToggle: () => void
    children: ReactNode
    className?: string
}

const CollapsibleSection = ({
    title,
    caption,
    isExpanded,
    onToggle,
    children,
    className,
}: CollapsibleSectionProps) => {
    return (
        <div className={cn(css.container, className)}>
            <motion.button
                type="button"
                className={cn(css.header, {
                    [css.headerExpanded]: isExpanded,
                })}
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
                animate={{
                    marginBottom: isExpanded ? 'var(--spacing-lg)' : '0px',
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
            >
                <div>
                    <span className={css.title}>{title}</span>
                    <span
                        className={cn(css.chevron, {
                            [css.chevronExpanded]: isExpanded,
                        })}
                        aria-hidden="true"
                    >
                        <Icon name="arrow-chevron-down" />
                    </span>
                </div>
                {caption && <div className={css.caption}>{caption}</div>}
            </motion.button>
            <motion.div
                className={cn(css.content, {
                    [css.contentExpanded]: isExpanded,
                })}
                initial={false}
                animate={{
                    height: isExpanded ? 'auto' : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
            >
                {children}
            </motion.div>
        </div>
    )
}

export default CollapsibleSection
