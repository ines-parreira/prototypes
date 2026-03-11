import type { ReactNode } from 'react'
import { Children } from 'react'

import classnames from 'classnames'
import _isString from 'lodash/isString'

import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './ModalActionsFooter.less'

type Props = {
    children: ReactNode
    extra?: ReactNode
    className?: string
    innerClassName?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Modal />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const ModalActionsFooter = ({
    children,
    className,
    extra,
    innerClassName,
}: Props) => {
    return (
        <ModalFooter
            className={classnames(
                css.wrapper,
                { [css.hasExtraInfo]: !!extra },
                className,
            )}
        >
            {!!extra && (
                <div className={classnames({ [css.extra]: _isString(extra) })}>
                    {extra}
                </div>
            )}
            <div className={classnames(css.actions, innerClassName)}>
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
