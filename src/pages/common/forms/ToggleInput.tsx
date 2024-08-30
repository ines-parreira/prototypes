import React, {
    AriaAttributes,
    InputHTMLAttributes,
    MouseEvent,
    ReactNode,
    useCallback,
} from 'react'
import classnames from 'classnames'
import {Label} from '@gorgias/ui-kit'

import useId from 'hooks/useId'
import Spinner from 'pages/common/components/Spinner'

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
    testId?: string
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'disabled' | 'name' | 'type' | 'onClick'
> &
    Pick<AriaAttributes, 'aria-label'>

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
    testId,
    ...props
}: Props) => {
    const randomId = useId()
    const id = name || 'toggle-button-' + randomId

    const handleClick = useCallback(
        (event: MouseEvent<HTMLLabelElement>) => {
            !isDisabled && !isLoading && onClick?.(!isToggled, event)
        },
        [isDisabled, isLoading, isToggled, onClick]
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
                    data-testid={testId}
                    {...(dataCanduId ? {'data-candu-id': dataCanduId} : {})}
                    {...props}
                />
                <div className={css.slider} />
                {isLoading && (
                    <Spinner
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
