import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './AccordionHeader.less'
import {useAccordionItemContext} from './AccordionItemContext'

export type AccordionHeaderProps = {
    action?: ReactNode
    children?: ReactNode
}

const AccordionHeader = ({action, children}: AccordionHeaderProps) => {
    const {isExpanded, isDisabled, toggleItem} = useAccordionItemContext()

    return (
        <div
            className={css.container}
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
            <div
                className={classnames(css.toggleContainer, {
                    [css.isDisabled]: isDisabled,
                })}
                onClick={toggleItem}
            >
                <i className="material-icons md-3">
                    {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            </div>
        </div>
    )
}

export default AccordionHeader
