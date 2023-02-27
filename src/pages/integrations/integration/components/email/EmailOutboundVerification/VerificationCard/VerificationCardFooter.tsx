import classNames from 'classnames'
import React from 'react'
import EmailVerificationStatusLabel, {
    EmailVerificationStatus,
} from '../../EmailVerificationStatusLabel'

import css from './VerificationCardFooter.less'

type Props = {
    icon: string
    label: string
    isVerified: boolean
    onClick: () => void
    showStatus?: boolean
    isDisabled?: boolean
}

export default function VerificationCardFooter({
    icon,
    label,
    isVerified,
    onClick,
    showStatus = true,
    isDisabled,
}: Props) {
    const isClickable = !isDisabled && isVerified

    return (
        <div
            tabIndex={0}
            className={classNames(css.container, 'px-3 py-2', {
                [css.interactive]: isClickable,
            })}
            onClick={isClickable ? onClick : undefined}
            data-testid="verification-status-footer"
        >
            <div className={css.labelContainer}>
                <i className={classNames('material-icons', css.icon)}>{icon}</i>
                <div>{label}</div>
            </div>
            {showStatus && (
                <EmailVerificationStatusLabel
                    status={
                        isVerified
                            ? EmailVerificationStatus.Success
                            : EmailVerificationStatus.Unverified
                    }
                    size="small"
                />
            )}
        </div>
    )
}
