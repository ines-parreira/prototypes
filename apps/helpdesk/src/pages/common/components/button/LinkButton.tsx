import type { AnchorHTMLAttributes, ComponentProps } from 'react'
import React, { forwardRef } from 'react'

import BaseButton from './BaseButton'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
    Omit<ComponentProps<typeof BaseButton>, 'children' | 'isLoading'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Button />` or `<Link />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const LinkButton = forwardRef<HTMLAnchorElement, Props>(function (
    {
        className,
        children,
        fillStyle,
        intent,
        isDisabled,
        rel = 'noopener noreferrer',
        size,
        target = '_blank',

        ...other
    },
    ref,
) {
    return (
        <BaseButton
            className={className}
            fillStyle={fillStyle}
            isDisabled={isDisabled}
            intent={intent}
            size={size}
        >
            {(elementAttributes) => (
                <a
                    {...other}
                    {...elementAttributes}
                    ref={ref}
                    rel={rel}
                    target={target}
                >
                    {children}
                </a>
            )}
        </BaseButton>
    )
})

export default LinkButton
