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
    ComponentProps,
    PropsWithChildren,
    ReactNode,
    RefObject,
    useContext,
    useLayoutEffect,
    useRef,
} from 'react'

import Button from 'pages/common/components/button/Button'
import {ThemeContext} from 'theme'

import css from './Popover.less'

type Props = {
    buttonProps?: React.PropsWithChildren<
        Omit<ComponentProps<typeof Button>, 'children'>
    >
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
    const themeContext = useContext(ThemeContext)

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
                className={cn(
                    css.popover,
                    themeContext?.theme && css[themeContext.theme]
                )}
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
            >
                <FloatingArrow
                    className={css.arrow}
                    fill={themeContext?.colorTokens.Neutral.Grey_0.value}
                    {...(themeContext?.theme === 'dark' && {
                        stroke: themeContext?.colorTokens.Neutral.Grey_2.value,
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
