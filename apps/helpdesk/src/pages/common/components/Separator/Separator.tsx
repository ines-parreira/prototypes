import classNames from 'classnames'

import styles from './Separator.less'

interface SeparatorProps {
    direction?: 'horizontal' | 'vertical'
    variant?: 'solid' | 'dashed'
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Separator />` from @gorgias/axiom instead.
 * @date 2025-08-06
 * @type ui-kit-migration
 */
export function Separator({
    direction = 'horizontal',
    variant = 'solid',
    className,
}: SeparatorProps) {
    return (
        <div
            className={classNames(
                styles.component,
                styles[direction],
                variant === 'dashed' && styles.dashed,
                className,
            )}
        />
    )
}
