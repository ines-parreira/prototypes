import type { ReactNode } from 'react'
import React from 'react'

import Collapse from 'pages/common/components/Collapse/Collapse'

import { useAccordionItemContext } from './AccordionItemContext'

import css from './AccordionBody.less'

type Props = {
    children?: ReactNode
}

const AccordionBody = ({ children }: Props) => {
    const { isExpanded } = useAccordionItemContext()

    return (
        <Collapse isOpen={isExpanded}>
            <div className={css.contentContainer}>{children}</div>
        </Collapse>
    )
}

export default AccordionBody
