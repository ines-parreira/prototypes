import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import css from './ModalFooter.less'

type Props = {
    children: ReactNode
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Modal />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const ModalFooter = ({ children, className }: Props) => (
    <div className={classnames(css.wrapper, className)}>{children}</div>
)

export default ModalFooter
