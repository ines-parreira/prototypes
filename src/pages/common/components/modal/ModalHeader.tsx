import React, {useContext} from 'react'
import classnames from 'classnames'

import {ModalContext} from './Modal'

import css from './ModalHeader.less'

type Props = {
    className?: string
    subtitle?: string
    title: string
}

const ModalHeader = ({className, subtitle, title}: Props) => {
    const {labelId, onClose} = useContext(ModalContext)

    return (
        <div className={classnames(css.wrapper, className)}>
            <div>
                <div className={css.title} id={labelId}>
                    {title}
                </div>
                <div className={css.subtitle}>{subtitle}</div>
            </div>
            <i
                className={classnames('material-icons', css.icon)}
                onClick={onClose}
            >
                close
            </i>
        </div>
    )
}

export default ModalHeader
