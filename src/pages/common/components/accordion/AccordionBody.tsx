import React, {ReactNode} from 'react'

import Collapse from 'pages/common/components/Collapse/Collapse'

import css from './AccordionBody.less'
import {useAccordionItemContext} from './AccordionItemContext'

type Props = {
    children?: ReactNode
}

const AccordionBody = ({children}: Props) => {
    const {isExpanded} = useAccordionItemContext()

    return (
        <Collapse isOpen={isExpanded}>
            <div className={css.contentContainer}>{children}</div>
        </Collapse>
    )
}

export default AccordionBody
