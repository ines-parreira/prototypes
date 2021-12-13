import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import expandDown from 'assets/img/infobar/expand-down.svg'

import css from './ShowMore.less'

type Props = {
    children: ReactNode
    className?: string
    onClick: () => void
}

export function ShowMore({children, className, onClick}: Props) {
    return (
        <Button
            type="button"
            color="link"
            className={classnames(css.container, className)}
            onClick={onClick}
        >
            <img src={expandDown} alt="Expand" className="mr-3" />
            {children}
        </Button>
    )
}
