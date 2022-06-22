import React, {Children, ReactNode} from 'react'
import classnames from 'classnames'
import _isString from 'lodash/isString'

import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './ModalActionsFooter.less'

type Props = {
    children: ReactNode
    extra?: ReactNode
    className?: string
}

const ModalActionsFooter = ({children, className, extra}: Props) => {
    return (
        <ModalFooter
            className={classnames(
                css.wrapper,
                {[css.hasExtraInfo]: !!extra},
                className
            )}
        >
            {!!extra && (
                <div className={classnames({[css.extra]: _isString(extra)})}>
                    {extra}
                </div>
            )}
            <div className={css.actions}>
                {Children.toArray(children).map((child, index) => (
                    <div key={index} className={css.childWrapper}>
                        {child}
                    </div>
                ))}
            </div>
        </ModalFooter>
    )
}

export default ModalActionsFooter
