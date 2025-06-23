import classNames from 'classnames'

import css from './Button.less'

export const Button = ({
    label,
    onClick,
    isDisabled = false,
}: {
    label: string
    onClick: () => void
    isDisabled?: boolean
}) => {
    const fakeBorderClass = classNames(css.fakeBorder, {
        [css['fakeBorder--disabled']]: isDisabled,
    })

    return (
        <div className={fakeBorderClass}>
            <button
                onClick={onClick}
                disabled={isDisabled}
                className={css.button}
                data-testid="ai-journey-button"
            />
            <span className={css.buttonContent}>{label}</span>
        </div>
    )
}
