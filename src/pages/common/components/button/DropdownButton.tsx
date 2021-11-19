import React, {ComponentProps, forwardRef, Ref} from 'react'
import classnames from 'classnames'

import Button, {ButtonSize} from './Button'
import css from './DropdownButton.less'
import IconButton from './IconButton'

type Props = {
    toggleId?: string
    toggleRef?: Ref<HTMLButtonElement> | null | undefined
    onToggleClick: () => void
}

const DropdownButton = forwardRef(
    (
        {
            children,
            className,
            size = ButtonSize.Medium,
            onToggleClick,
            toggleId,
            toggleRef,
            ...others
        }: Props & ComponentProps<typeof Button>,
        ref: Ref<HTMLDivElement> | null | undefined
    ) => {
        return (
            <div className={classnames(className, css.wrapper)} ref={ref}>
                <Button
                    className={classnames(css.mainAction, css[size])}
                    size={size}
                    {...others}
                >
                    {children}
                </Button>
                <IconButton
                    className={classnames(css.toggle, css[size])}
                    id={toggleId}
                    intent={others.intent}
                    onClick={onToggleClick}
                    ref={toggleRef}
                    size={size}
                >
                    arrow_drop_down
                </IconButton>
            </div>
        )
    }
)

export default DropdownButton
