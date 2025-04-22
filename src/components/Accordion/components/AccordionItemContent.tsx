import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'

import { useAccordion } from '../hooks/useAccordion'
import { useAccordionItem } from '../hooks/useAccordionItem'
import { AccordionIds } from '../utils/accessibility-ids'
import { AccordionState } from '../utils/accordion-state'

import css from './AccordionItemContent.less'

const variants = {
    open: { height: 'auto', opacity: 1 },
    closed: { height: 0, opacity: 0 },
} as const

export type AccordionItemContentProps = Omit<
    ComponentPropsWithoutRef<'div'>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
>

export const AccordionItemContent = forwardRef<
    HTMLDivElement,
    AccordionItemContentProps
>(function AccordionItemContent({ children, className, ...props }, ref) {
    const { id } = useAccordion()
    const { isOpen, value } = useAccordionItem()

    return (
        <AnimatePresence initial={!isOpen}>
            {isOpen && (
                <motion.div
                    ref={ref}
                    {...props}
                    id={AccordionIds.content(id, value)}
                    aria-labelledby={AccordionIds.trigger(id, value)}
                    aria-hidden={!isOpen}
                    role="region"
                    data-state={
                        isOpen ? AccordionState.Open : AccordionState.Closed
                    }
                    className={classNames(css.content, className)}
                    variants={variants}
                    initial={AccordionState.Closed}
                    animate={
                        isOpen ? AccordionState.Open : AccordionState.Closed
                    }
                    exit={AccordionState.Closed}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
})
