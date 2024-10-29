import React, {ComponentProps} from 'react'

import Button from 'pages/common/components/button/Button'
import Status, {StatusType} from 'pages/common/components/Status/Status'

type Props = {
    active: boolean
    isVerified: boolean
    isRowSubmitting: boolean
    redirectURI?: string
    isDomainVerificationWarningVisible: boolean
    isForwardEmail: boolean
}

export default function EmailIntegrationListVerificationStatus({
    active,
    isVerified,
    isRowSubmitting,
    redirectURI,
    isDomainVerificationWarningVisible,
    isForwardEmail,
}: Props) {
    const commonButtonProps: Partial<ComponentProps<typeof Button>> = {
        isLoading: isRowSubmitting,
        fillStyle: 'ghost',
        intent: 'secondary',
    }

    if (isForwardEmail && !isVerified) {
        return (
            <Button {...commonButtonProps}>
                <Status type={StatusType.Error}>
                    Action Required: Verify Email
                </Status>
            </Button>
        )
    }

    if (!active && !isForwardEmail) {
        return (
            <Button
                {...commonButtonProps}
                onClick={(e) => {
                    e.preventDefault()
                    window.open(redirectURI)
                }}
            >
                <Status type={StatusType.Error}>
                    Action Required: Reconnect Email
                </Status>
            </Button>
        )
    }

    if (isDomainVerificationWarningVisible) {
        return (
            <Button {...commonButtonProps}>
                <Status type={StatusType.Error}>
                    Action Required: Verify Domain
                </Status>
            </Button>
        )
    }

    return (
        <Button {...commonButtonProps}>
            <Status type={StatusType.Success}>Verified</Status>
        </Button>
    )
}
