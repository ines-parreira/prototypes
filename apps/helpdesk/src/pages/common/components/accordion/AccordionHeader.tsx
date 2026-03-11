import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import { useAccordionItemContext } from './AccordionItemContext'

import css from './AccordionHeader.less'

export type AccordionHeaderProps = {
    action?: ReactNode
    children?: ReactNode
    className?: string
    isExpandable?: boolean
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const AccordionHeader = ({
    action,
    children,
    className,
    isExpandable = true,
}: AccordionHeaderProps) => {
    const { isExpanded, isDisabled, toggleItem } = useAccordionItemContext()

    return (
        <div
            className={classnames(css.container, className)}
            onClick={!isExpanded ? toggleItem : undefined}
        >
            {action}
            <div
                className={classnames(css.contentContainer, {
                    [css.withoutAction]: !action,
                    [css.isDisabled]: isDisabled,
                })}
            >
                {children}
            </div>
            {isExpandable && (
                <div
                    className={classnames(css.toggleContainer, {
                        [css.isDisabled]: isDisabled,
                    })}
                    onClick={toggleItem}
                >
                    <i className="material-icons md-3">
                        {isExpanded
                            ? 'keyboard_arrow_up'
                            : 'keyboard_arrow_down'}
                    </i>
                </div>
            )}
        </div>
    )
}

export default AccordionHeader
