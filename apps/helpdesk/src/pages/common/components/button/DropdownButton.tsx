import type { ComponentProps, ForwardedRef, Ref } from 'react'
import React, { forwardRef } from 'react'

import classnames from 'classnames'

import { LegacyButton as Button, MultiButton } from '@gorgias/axiom'

import IconButton from './IconButton'

import css from './DropdownButton.less'

type Props = {
    toggleId?: string
    toggleRef?: Ref<HTMLButtonElement> | null | undefined
    onToggleClick: () => void
    toggleCanduId?: string
    customIcon?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<MultiButton />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const DropdownButton = (
    {
        children,
        className,
        fillStyle,
        size,
        onToggleClick,
        toggleId,
        toggleRef,
        toggleCanduId,
        customIcon,
        ...others
    }: Props & ComponentProps<typeof Button>,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    return (
        <div className={classnames(className, css.wrapper)} ref={ref}>
            <MultiButton>
                <Button
                    className={classnames(css.mainAction, css[size || ''])}
                    fillStyle={fillStyle}
                    size={size}
                    {...others}
                >
                    {children}
                </Button>
                <IconButton
                    className={classnames(css.toggle, css[size || ''])}
                    fillStyle={fillStyle}
                    id={toggleId}
                    intent={others.intent}
                    onClick={onToggleClick}
                    ref={toggleRef}
                    size={size}
                    isDisabled={others.isDisabled}
                    data-candu-id={toggleCanduId}
                >
                    {customIcon || 'arrow_drop_down'}
                </IconButton>
            </MultiButton>
        </div>
    )
}

export default forwardRef<
    HTMLDivElement,
    Props & ComponentProps<typeof Button>
>(DropdownButton)
