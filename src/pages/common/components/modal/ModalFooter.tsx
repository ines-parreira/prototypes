import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './ModalFooter.less'

type Props = {
    children: ReactNode
    className?: string
}

const ModalFooter = ({children, className}: Props) => (
    <div className={classnames(css.wrapper, className)}>{children}</div>
)

export default ModalFooter
