import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import css from './ShortcutIcon.less'

type ShortcutIconType = 'classic' | 'dark'

type Props = {
    children: ReactNode
    className?: string
    type?: ShortcutIconType
    fillStyle?: 'fill' | 'ghost'
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<ShortcutKey />` from @gorgias/axiom instead.
 * @date 2025-04-02
 * @type ui-kit-migration
 */
const ShortcutIcon = ({
    children,
    className,
    fillStyle = 'fill',
    type = 'classic',
}: Props) => (
    <div
        className={classnames(
            css.wrapper,
            { [css[type]]: fillStyle === 'fill' },
            className,
        )}
    >
        {children}
    </div>
)

export default ShortcutIcon
