import { useLayoutEffect, useRef } from 'react'
import type { PropsWithChildren, ReactNode, RefObject } from 'react'

import type { OffsetOptions, Placement, ShiftOptions } from '@floating-ui/react'
import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingFocusManager,
    FloatingPortal,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'
import cn from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonComponentProps as ButtonComponentProps } from '@gorgias/axiom'

import { THEME_NAME, useTheme } from 'core/theme'

import css from './Popover.less'

type Props = {
    buttonProps?: PropsWithChildren<Omit<ButtonComponentProps, 'children'>>
    footer?: ReactNode
    isOpen: boolean
    offsetValue?: OffsetOptions
    shiftOptions?: ShiftOptions
    showArrow?: boolean
    placement?: Placement
    setIsOpen: (value: boolean) => void
    target: RefObject<HTMLElement | null>
    className?: string
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
    shiftOptions,
    showArrow = true,
    placement = 'bottom',
    setIsOpen,
    target,
    className,
}: PropsWithChildren<Props>) {
    const theme = useTheme()

    const arrowRef = useRef(null)

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement,
        middleware: [
            offset(offsetValue),
            flip({ fallbackAxisSideDirection: 'end' }),
            shift(shiftOptions),
            ...(showArrow ? [arrow({ element: arrowRef })] : []),
        ],
        whileElementsMounted: autoUpdate,
    })

    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const { getFloatingProps } = useInteractions([click, dismiss, role])

    useLayoutEffect(() => {
        refs.setReference(target.current)
    }, [target, refs])

    return isOpen ? (
        <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
                <div
                    className={cn(
                        css.popover,
                        css[theme.resolvedName],
                        className,
                    )}
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                >
                    {showArrow && (
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
                    )}
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
        </FloatingPortal>
    ) : null
}
