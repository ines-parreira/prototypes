import classNames from 'classnames'
import React, {
    ButtonHTMLAttributes,
    ComponentProps,
    ForwardedRef,
    forwardRef,
    useContext,
} from 'react'

import {GroupContext} from 'pages/common/components/layout/Group'

import BaseButton from './BaseButton'
import css from './Button.less'
import ButtonSpinner from './ButtonSpinner'

export type {ButtonIntent, ButtonSize} from './BaseButton'

// Button is disabled through `aria-disabled` attribute, to test it
// use patch matcher .toBeAriaEnabled() and .toBeAriaDisabled()
export type Props = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'disabled' | 'children'
> &
    Omit<ComponentProps<typeof BaseButton>, 'children'> & {
        leadingIcon?: Icon
        trailingIcon?: Icon
        children: React.ReactNode
    }

const Button = (
    {
        children,
        className,
        fillStyle,
        intent,
        isDisabled,
        isLoading,
        size,
        type = 'button',
        leadingIcon,
        trailingIcon,
        ...other
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>
) => {
    const context = useContext(GroupContext)
    const safeIsDisabled = context?.isDisabled || isDisabled || isLoading

    return (
        <BaseButton
            className={className}
            fillStyle={fillStyle}
            intent={intent}
            isDisabled={safeIsDisabled}
            isLoading={isLoading}
            size={size}
        >
            {(elementAttributes) => (
                <button
                    {...other}
                    {...elementAttributes}
                    className={elementAttributes.className}
                    aria-disabled={safeIsDisabled || isLoading || false}
                    ref={ref}
                    type={type}
                    {...(safeIsDisabled
                        ? {
                              onClick: (event) => event.preventDefault(),
                              onSubmit: (event) => event.preventDefault(),
                          }
                        : {})}
                >
                    {isLoading ? (
                        <ButtonSpinner />
                    ) : (
                        <Icon name={leadingIcon} size={size} />
                    )}
                    <span className={css.content}>{children}</span>
                    <Icon name={trailingIcon} size={size} />
                </button>
            )}
        </BaseButton>
    )
}

export default forwardRef<HTMLButtonElement, Props>(Button)

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
    | 'stop'
    | 'sync'
    | 'unfold_less'
    | 'unfold_more'
    | 'update'
    | 'visibility'
    | 'visibility_off'
