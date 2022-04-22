import React, {ReactNode, useContext} from 'react'
import classnames from 'classnames'

import {ModalContext} from './Modal'

import css from './ModalBody.less'

type Props = {
    children: ReactNode
    className?: string
}

const ModalBody = ({children, className}: Props) => {
    const {isScrollable, bodyId} = useContext(ModalContext)

    return (
        <div
            className={classnames(
                css.wrapper,
                {[css.scrollable]: isScrollable},
                className
            )}
            id={bodyId}
        >
            {children}
        </div>
    )
}

export default ModalBody
