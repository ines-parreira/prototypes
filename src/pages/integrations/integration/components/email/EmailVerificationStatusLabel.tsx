import React from 'react'

import classNames from 'classnames'

import css from './EmailVerificationStatusLabel.less'

export enum EmailVerificationStatus {
    Unverified = 'Unverified',
    Pending = 'Pending',
    Failed = 'Failed',
    Success = 'Success',
}

const statusIcon = {
    [EmailVerificationStatus.Unverified]: 'close',
    [EmailVerificationStatus.Pending]: 'autorenew',
    [EmailVerificationStatus.Failed]: 'error',
    [EmailVerificationStatus.Success]: 'check_circle',
}

const statusLabel = {
    [EmailVerificationStatus.Unverified]: 'Not verified',
    [EmailVerificationStatus.Pending]: 'In progress',
    [EmailVerificationStatus.Failed]: 'Failed',
    [EmailVerificationStatus.Success]: 'Verified',
}

type Props = {
    status: EmailVerificationStatus
    size?: 'normal' | 'small'
}

export default function EmailVerificationStatusLabel({
    status,
    size = 'normal',
}: Props) {
    return (
        <div
            className={classNames(css.container, css[size])}
            data-testid="email-verification-status"
        >
            <i
                className={classNames(
                    'material-icons',
                    css.icon,
                    css[status.toLocaleLowerCase()],
                )}
            >
                {statusIcon[status]}
            </i>
            <div data-testid="verification-status-label">
                {statusLabel[status]}
            </div>
        </div>
    )
}
