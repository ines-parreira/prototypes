import classNames from 'classnames'
import { Link } from 'react-router-dom'

import css from './Button.less'

export type ButtonVariant = 'primary' | 'secondary' | 'link'

export const Button = ({
    variant = 'primary',
    redirectLink = '',
    label,
    onClick,
    isDisabled = false,
}: {
    variant?: ButtonVariant
    redirectLink?: string
    label: string
    onClick?: () => void
    isDisabled?: boolean
}) => {
    const fakeBorderClass = classNames(css.fakeBorder, {
        [css['fakeBorder--disabled']]: isDisabled,
    })

    if (variant === 'link') {
        return (
            <Link className={css.linkButton} to={redirectLink}>
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
