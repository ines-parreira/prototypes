import type { ReactNode } from 'react'
import React, { useContext } from 'react'

import classnames from 'classnames'

import { LegacyIconButton as IconButton } from '@gorgias/axiom'

import { ModalContext } from './Modal'

import css from './ModalHeader.less'

type Props = {
    className?: string
    subtitle?: ReactNode | string
    title: ReactNode
    forceCloseButton?: boolean
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Modal />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const ModalHeader = ({
    className,
    subtitle,
    title,
    forceCloseButton,
}: Props) => {
    const { labelId, onClose, isClosable } = useContext(ModalContext)

    return (
        <div className={classnames(css.wrapper, className)}>
            <div>
                <div className={css.title} id={labelId}>
                    {title}
                </div>
                <div className={css.subtitle}>{subtitle}</div>
            </div>
            {(isClosable || forceCloseButton) && (
                <IconButton
                    icon="close"
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={onClose}
                    className={classnames('material-icons', css.icon)}
                />
            )}
        </div>
    )
}

export default ModalHeader
