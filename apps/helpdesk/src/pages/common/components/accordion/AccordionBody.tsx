import type { ReactNode } from 'react'
import React from 'react'

import Collapse from 'pages/common/components/Collapse/Collapse'

import { useAccordionItemContext } from './AccordionItemContext'

import css from './AccordionBody.less'

type Props = {
    children?: ReactNode
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const AccordionBody = ({ children }: Props) => {
    const { isExpanded } = useAccordionItemContext()

    return (
        <Collapse isOpen={isExpanded}>
            <div className={css.contentContainer}>{children}</div>
        </Collapse>
    )
}

export default AccordionBody
