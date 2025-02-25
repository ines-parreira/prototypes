import React, {
    type AnchorHTMLAttributes,
    ForwardedRef,
    forwardRef,
    type MouseEventHandler,
    type RefAttributes,
    useContext,
} from 'react'

import classNames from 'classnames'

import { BaseButtonContext } from 'pages/common/components/button/BaseButton'
import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import { InputGroupContext } from 'pages/common/forms/input/InputGroup'

import ButtonSpinner from './ButtonSpinner'

import css from './Button.less'

export type { ButtonIntent, ButtonSize } from './BaseButton'

type CommonProps = {
    children: React.ReactNode
    fillStyle?: 'fill' | 'ghost'
    intent?: 'primary' | 'secondary' | 'destructive'
    isDisabled?: boolean
    isLoading?: boolean
    leadingIcon?: Icon
    trailingIcon?: Icon
    size?: 'medium' | 'small'
}

type ButtonElProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'disabled' | 'children'
>

type AnchorElProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>

/**
 * A utility type that takes all keys from T that are not in U, and marks them as `never`.
 * This is used to ensure that when we pick an `as` mode (button or anchor),
 * the properties exclusive to the other mode become invalid.
 */
type DiffProps<T, U> = {
    [K in Exclude<keyof T, keyof U>]?: never
}

export type ButtonProps = CommonProps &
    ButtonElProps &
    DiffProps<AnchorElProps, ButtonElProps> & {
        as?: 'button'
    }

type AnchorProps = CommonProps &
    AnchorElProps &
    DiffProps<ButtonElProps, AnchorElProps> & {
        as: 'a'
    }

export type Props = ButtonProps | AnchorProps

const Button = (
    {
        children,
        className,
        fillStyle = 'fill',
        intent = 'primary',
        isDisabled = false,
        isLoading = false,
        size = 'medium',
        leadingIcon,
        trailingIcon,
        ...props
    }: Props,
    ref: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
) => {
    const context = useContext(GroupContext)
    const appendPosition = useContext(GroupPositionContext) || ''
    const isInsideInputGroup = !!useContext(InputGroupContext)

    const safeIsDisabled = !!context?.isDisabled || isDisabled || isLoading

    const classnames = classNames(
        css.wrapper,
        className,
        css[fillStyle],
        css[intent],
        css[size],
        css[appendPosition],
        {
            [css.isDisabled]: safeIsDisabled,
            [css.isAuxiliaryButton]: isInsideInputGroup,
        },
    )

    const content = (
        <>
            {isLoading ? (
                <ButtonSpinner />
            ) : (
                <Icon name={leadingIcon} size={size} />
            )}
            <span className={css.content}>{children}</span>
            <Icon name={trailingIcon} size={size} />
        </>
    )

    const commonProps = {
        className: classnames,
        'aria-disabled': safeIsDisabled,
        ...(safeIsDisabled ? NO_OP_MOUSE_EVENT_HANDLERS : {}),
    }

    if (props.as === 'a') {
        const { rel = 'noopener noreferrer', target = '_blank' } = props

        return (
            <BaseButtonContext.Provider value={{ size }}>
                <a
                    {...props}
                    ref={ref as ForwardedRef<HTMLAnchorElement>}
                    rel={rel}
                    target={target}
                    {...commonProps}
                >
                    {content}
                </a>
            </BaseButtonContext.Provider>
        )
    }

    const { type = 'button' } = props

    return (
        <BaseButtonContext.Provider value={{ size }}>
            <button
                {...props}
                ref={ref as ForwardedRef<HTMLButtonElement>}
                type={safeIsDisabled && type === 'submit' ? 'button' : type}
                {...commonProps}
            >
                {content}
            </button>
        </BaseButtonContext.Provider>
    )
}

/**
 * A versatile and accessible Button component that can render either as a native `<button>` element
 * or as an `<a>` element, depending on the props provided.
 *
 * ### Usage
 *
 * To render a standard button:
 * ```jsx
 * <Button onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 *
 * To render as a link (anchor):
 * ```jsx
 * <Button as="a" href="https://example.com">
 *   Go to Example
 * </Button>
 * ```
 *
 * To show a loading state:
 * ```jsx
 * <Button isLoading>
 *   Loading...
 * </Button>
 * ```
 *
 * ### Props
 *
 * The `Button` component accepts either `ButtonProps` or `AnchorProps`, determined by the `as` prop.
 *
 * **Common Props:**
 * - `children`: The button's content (text or elements).
 * - `fillStyle`: Controls the background style (`'fill'` for solid, `'ghost'` for outline).
 * - `intent`: Visual intent (`'primary'`, `'secondary'`, or `'destructive'`).
 * - `isDisabled`: If `true`, the button is disabled (non-interactive and `aria-disabled` is applied).
 * - `isLoading`: If `true`, replaces the leading icon with a spinner to indicate loading.
 * - `leadingIcon`: An optional icon displayed before the `children`.
 * - `trailingIcon`: An optional icon displayed after the `children`.
 * - `size`: The size of the button (`'medium'` or `'small'`).
 *
 * **Button Mode (`as="button"`) Props (`ButtonProps`):**
 * - Inherits standard `<button>` attributes except `disabled` and `children` (already managed by this component).
 * - Set `type` to control the button type (e.g. `'submit'`, `'reset'`, `'button'`).
 *
 * **Anchor Mode (`as="a"`) Props (`AnchorProps`):**
 * - Inherits standard `<a>` attributes except `children` (already managed by this component).
 * - Use `href`, `target`, and `rel` as you would with a normal link.
 *
 * ### Disabled State
 * `aria-disabled` is applied to indicate disabled state instead of using the `disabled` attribute.
 * Interaction is prevented through event handlers.
 *
 * ### Accessibility
 *
 * - The component uses `aria-disabled` to communicate disabled state.
 * - When `isLoading` is `true`, a spinner is shown, signaling that the button's action is in progress.
 *
 * ### Integration with Groups
 *
 * When placed inside certain contexts (like `GroupContext` or `InputGroupContext`), the button adopts
 * styles and behavior to match its surroundings, ensuring a seamless and consistent look.
 */
export default forwardRef(Button) as (
    props:
        | (ButtonProps & RefAttributes<HTMLButtonElement>)
        | (AnchorProps & RefAttributes<HTMLAnchorElement>),
) => JSX.Element

const Icon = ({
    name,
    size = 'medium',
}: {
    name: Icon | undefined
    size: 'small' | 'medium' | undefined
}) => {
    return name ? (
        <i
            className={classNames('material-icons', css.icon, css[size])}
            aria-hidden="true"
        >
            {name}
        </i>
    ) : null
}

export type Icon =
    | 'account_balance'
    | 'add'
    | 'add_box'
    | 'arrow_back'
    | 'arrow_drop_down'
    | 'arrow_drop_up'
    | 'arrow_forward'
    | 'attach_money'
    | 'autorenew'
    | 'backup'
    | 'block'
    | 'bolt'
    | 'calculate'
    | 'calendar_today'
    | 'call_merge'
    | 'check'
    | 'check_circle'
    | 'clear'
    | 'close'
    | 'cloud_upload'
    | 'content_copy'
    | 'delete'
    | 'download'
    | 'edit'
    | 'expand_less'
    | 'expand_more'
    | 'file_copy'
    | 'file_download'
    | 'format_list_bulleted'
    | 'info_outline'
    | 'launch'
    | 'mail'
    | 'markunread'
    | 'mode_edit'
    | 'more_vert'
    | 'open_in_new'
    | 'pause'
    | 'pause_circle_filled'
    | 'play_arrow'
    | 'person_add'
    | 'phone'
    | 'play_circle'
    | 'play_circle_filled'
    | 'print'
    | 'refresh'
    | 'settings'
    | 'stop'
    | 'sync'
    | 'tune'
    | 'unfold_less'
    | 'unfold_more'
    | 'update'
    | 'visibility'
    | 'visibility_off'

const noOpMouseEventHandler = (event: React.MouseEvent<HTMLElement>) => {
    event?.preventDefault()
}

const NO_OP_MOUSE_EVENT_HANDLERS: Record<
    string,
    MouseEventHandler<HTMLElement>
> = {
    onClick: noOpMouseEventHandler,
    onClickCapture: noOpMouseEventHandler,
    onMouseDown: noOpMouseEventHandler,
    onMouseUp: noOpMouseEventHandler,
}
