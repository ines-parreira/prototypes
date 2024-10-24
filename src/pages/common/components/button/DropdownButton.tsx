import classnames from 'classnames'
import React, {ComponentProps, ForwardedRef, forwardRef, Ref} from 'react'

import Button from './Button'
import css from './DropdownButton.less'
import IconButton from './IconButton'

type Props = {
    toggleId?: string
    toggleRef?: Ref<HTMLButtonElement> | null | undefined
    onToggleClick: () => void
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
        ...others
    }: Props & ComponentProps<typeof Button>,
    ref: ForwardedRef<HTMLDivElement>
) => {
    return (
        <div className={classnames(className, css.wrapper)} ref={ref}>
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
            >
                arrow_drop_down
            </IconButton>
        </div>
    )
}

export default forwardRef<
    HTMLDivElement,
    Props & ComponentProps<typeof Button>
>(DropdownButton)
