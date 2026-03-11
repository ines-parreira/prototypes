import type React from 'react'

import classNames from 'classnames'

import css from './CheckboxCard.less'

interface CheckboxCardProps {
    icon: React.ReactNode
    title: string
    description: string
    checked?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClick?: () => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<RadioCard />` or `<CheckBoxField />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const CheckboxCard: React.FC<CheckboxCardProps> = ({
    icon,
    title,
    description,
    checked,
    onChange,
    onClick,
    onKeyDown,
    className,
}) => {
    return (
        <label
            className={classNames(
                css.checkbox,
                {
                    [css.checked]: checked,
                },
                className,
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                onClick={onClick}
                onKeyDown={onKeyDown}
                className={css.checkboxInput}
                aria-label={`${title}: ${description}`}
            />
            <div className={css.content}>
                <i className="material-icons-round">{icon}</i>
                <div className={css.textContent}>
                    <p className={css.title}>{title}</p>
                    <p className={css.description}>{description}</p>
                </div>
                {checked && (
                    <i
                        className={classNames(
                            css.checkIcon,
                            'material-icons-round',
                        )}
                    >
                        check_circle
                    </i>
                )}
            </div>
        </label>
    )
}

export default CheckboxCard
