import type {
    AriaAttributes,
    InputHTMLAttributes,
    MouseEvent,
    ReactNode,
} from 'react'
import React, { useCallback } from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'

import { LegacyLabel as Label, LoadingSpinner } from '@gorgias/axiom'

import Caption from './Caption/Caption'

import css from './ToggleInput.less'

type Props = {
    caption?: ReactNode
    children?: ReactNode
    className?: string
    isToggled: boolean
    isDisabled?: boolean
    isLoading?: boolean
    name?: string
    onClick?: (nextValue: boolean, event: MouseEvent<HTMLLabelElement>) => void
    dataCanduId?: string
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'disabled' | 'name' | 'type' | 'onClick'
> &
    Pick<AriaAttributes, 'aria-label'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<ToggleField />` from @gorgias/axiom instead.
 * @date 2025-03-25
 * @type ui-kit-migration
 */
const ToggleInput = ({
    caption,
    children,
    className,
    isToggled,
    isDisabled = false,
    isLoading = false,
    name,
    onClick,
    dataCanduId,
    ...props
}: Props) => {
    const randomId = useId()
    const id = name || 'toggle-button-' + randomId

    const handleClick = useCallback(
        (event: MouseEvent<HTMLLabelElement>) => {
            !isDisabled && !isLoading && onClick?.(!isToggled, event)
        },
        [isDisabled, isLoading, isToggled, onClick],
    )

    return (
        <div className={className}>
            <Label
                className={classnames(css.label, {
                    [css.loadingLabel]: isLoading,
                    [css.disabledLabel]: isDisabled,
                })}
                htmlFor={id}
                isDisabled={isDisabled}
                onClick={handleClick}
                role="switch"
                aria-label={props['aria-label']}
                aria-checked={isToggled}
            >
                <input
                    type="checkbox"
                    id={id}
                    name={id}
                    className={css.input}
                    checked={isToggled}
                    disabled
                    {...(dataCanduId ? { 'data-candu-id': dataCanduId } : {})}
                    {...props}
                />
                <div className={css.slider} />
                {isLoading && (
                    <LoadingSpinner
                        color="light"
                        size="small"
                        className={classnames(css.spinner, {
                            [css.spinnerLeft]: isToggled,
                        })}
                    />
                )}
                {children}
            </Label>
            {!!caption && <Caption className={css.caption}>{caption}</Caption>}
        </div>
    )
}

export default ToggleInput
