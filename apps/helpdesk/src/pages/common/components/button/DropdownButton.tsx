import React, { ComponentProps, ForwardedRef, forwardRef, Ref } from 'react'

import classnames from 'classnames'

import { Button, ButtonGroup } from '@gorgias/axiom'

import IconButton from './IconButton'

import css from './DropdownButton.less'

type Props = {
    toggleId?: string
    toggleRef?: Ref<HTMLButtonElement> | null | undefined
    onToggleClick: () => void
    toggleCanduId?: string
}

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
        ...others
    }: Props & ComponentProps<typeof Button>,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    return (
        <div className={classnames(className, css.wrapper)} ref={ref}>
            <ButtonGroup>
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
                    arrow_drop_down
                </IconButton>
            </ButtonGroup>
        </div>
    )
}

export default forwardRef<
    HTMLDivElement,
    Props & ComponentProps<typeof Button>
>(DropdownButton)
