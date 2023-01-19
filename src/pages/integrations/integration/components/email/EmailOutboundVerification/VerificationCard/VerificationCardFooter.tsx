import classNames from 'classnames'
import React from 'react'

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
                <div className={css.verifiedStatus}>
                    {isVerified ? (
                        <>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.icon,
                                    css.statusIcon,
                                    css.success
                                )}
                            >
                                check_circle
                            </i>
                            <div data-testid="verification-status-value">
                                Verified
                            </div>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.arrowIcon
                                )}
                            >
                                chevron_right
                            </i>
                        </>
                    ) : (
                        <>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.icon,
                                    css.statusIcon,
                                    css.error
                                )}
                            >
                                close
                            </i>
                            <div data-testid="verification-status-value">
                                Not verified
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
