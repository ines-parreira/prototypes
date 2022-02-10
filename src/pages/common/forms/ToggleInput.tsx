import React, {
    AriaAttributes,
    InputHTMLAttributes,
    MouseEvent,
    ReactNode,
    useCallback,
    useMemo,
} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'

import css from './ToggleInput.less'

type Props = {
    caption?: ReactNode
    children?: ReactNode
    className?: string
    isToggled: boolean
    isDisabled?: boolean
    isLoading?: boolean
    name?: string
    onClick: (nextValue: boolean, event: MouseEvent<HTMLLabelElement>) => void
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
    ...props
}: Props) => {
    const id = useMemo(() => name || _uniqueId('toggle-button-'), [name])

    const handleClick = useCallback(
        (event: MouseEvent<HTMLLabelElement>) => {
            !isLoading && onClick(!isToggled, event)
        },
        [isLoading, isToggled, onClick]
    )

    return (
        <div className={className}>
            <label
                className={classnames(css.container, {
                    [css.loading]: isLoading,
                    [css.disabled]: isDisabled,
                })}
                htmlFor={id}
                onClick={handleClick}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
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
                    {...props}
                />
                <div className={css.slider} />
                {isLoading && (
                    <svg
                        className={classnames(css.spinner, {
                            [css.left]: isToggled,
                        })}
                        viewBox="0 0 20 20"
                    >
                        <circle
                            className={css.dot}
                            cx="10"
                            cy="10"
                            r="6"
                            fill="none"
                            strokeWidth="2"
                        />
                        <circle
                            className={css.circle}
                            cx="10"
                            cy="10"
                            r="6"
                            fill="none"
                            strokeWidth="2"
                        />
                    </svg>
                )}
                {!!children && <div className={css.label}>{children}</div>}
            </label>
            {!!caption && <div className={css.caption}>{caption}</div>}
        </div>
    )
}

export default ToggleInput
