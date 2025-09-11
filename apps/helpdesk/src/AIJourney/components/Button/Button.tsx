import classNames from 'classnames'
import { Link } from 'react-router-dom'

import css from './Button.less'

export type ButtonVariant = 'primary' | 'secondary' | 'link'

type ButtonProps = {
    label: string
    isDisabled?: boolean
    iconLeft?: string
    onClick?: () => void
    redirectLink?: string
    variant?: ButtonVariant
}

export const Button = ({
    label,
    isDisabled = false,
    iconLeft,
    onClick,
    redirectLink = '',
    variant = 'primary',
}: ButtonProps) => {
    const fakeBorderClass = classNames(css.fakeBorder, {
        [css['fakeBorder--disabled']]: isDisabled,
    })

    if (variant === 'link') {
        return (
            <Link className={css.linkButton} to={redirectLink}>
                {iconLeft && (
                    <i className="material-icons-outlined">{iconLeft}</i>
                )}
                {label}
            </Link>
        )
    }

    if (variant === 'secondary') {
        return (
            <button
                onClick={onClick}
                disabled={isDisabled}
                className={css.secondaryButton}
            >
                <span className={css.secondaryButtonContent}>{label}</span>
            </button>
        )
    }

    return (
        <div className={fakeBorderClass}>
            <button
                onClick={onClick}
                disabled={isDisabled}
                className={css.primaryButton}
                data-testid="ai-journey-button"
            />
            <span className={css.primaryButtonContent}>{label}</span>
        </div>
    )
}
