import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingFocusManager,
    OffsetOptions,
    offset,
    Placement,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'
import cn from 'classnames'
import React, {
    PropsWithChildren,
    ReactNode,
    RefObject,
    useLayoutEffect,
    useRef,
} from 'react'

import {THEME_NAME, useTheme} from 'core/theme'
import Button, {type ButtonProps} from 'pages/common/components/button/Button'

import css from './Popover.less'

type Props = {
    buttonProps?: React.PropsWithChildren<Omit<ButtonProps, 'children'>>
    footer?: ReactNode
    isOpen: boolean
    offsetValue?: OffsetOptions
    placement?: Placement
    setIsOpen: (value: boolean) => void
    target: RefObject<HTMLElement | null>
}

export default function Popover({
    buttonProps: {
        className: buttonClassName,
        children: buttonText = 'Confirm',
        onClick: onButtonClick,
        ...buttonProps
    } = {
        children: 'Confirm',
    },
    children,
    footer,
    isOpen,
    offsetValue = 14,
    placement = 'bottom',
    setIsOpen,
    target,
}: PropsWithChildren<Props>) {
    const theme = useTheme()

    const arrowRef = useRef(null)

    const {refs, floatingStyles, context} = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement,
        middleware: [
            offset(offsetValue),
            flip({fallbackAxisSideDirection: 'end'}),
            shift(),
            arrow({element: arrowRef}),
        ],
        whileElementsMounted: autoUpdate,
    })

    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const {getFloatingProps} = useInteractions([click, dismiss, role])

    useLayoutEffect(() => {
        refs.setReference(target.current)
    }, [target, refs])

    return isOpen ? (
        <FloatingFocusManager context={context} modal={false}>
            <div
                className={cn(css.popover, css[theme.resolvedName])}
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
            >
                <FloatingArrow
                    className={css.arrow}
                    fill={theme.tokens.Neutral.Grey_0.value}
                    {...(theme.resolvedName === THEME_NAME.Dark && {
                        stroke: theme.tokens.Neutral.Grey_2.value,
                        strokeWidth: 1,
                    })}
                    ref={arrowRef}
                    context={context}
                />
                <div className={css.content}>{children}</div>
                {footer ?? (
                    <Button
                        intent="secondary"
                        size="small"
                        className={cn(css.button, buttonClassName)}
                        {...buttonProps}
                        onClick={(event) => {
                            setIsOpen(false)
                            onButtonClick?.(event)
                        }}
                    >
                        {buttonText}
                    </Button>
                )}
            </div>
        </FloatingFocusManager>
    ) : null
}
