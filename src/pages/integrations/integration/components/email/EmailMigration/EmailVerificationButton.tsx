import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

type Props = {
    isLoading: boolean
    status: EmailVerificationStatus
    linkButtonText?: string
    // TODO mark as required when ready
    onLinkButtonClick?: () => void
    onRetryClick?: () => void
}

export default function EmailVerificationButton({
    isLoading,
    status,
    onLinkButtonClick,
    onRetryClick,
    linkButtonText,
}: Props) {
    if (isLoading || status === EmailVerificationStatus.Pending) {
        return (
            <Button fillStyle="ghost" isLoading={true}>
                Verifying
            </Button>
        )
    }

    if (status === EmailVerificationStatus.Unverified) {
        return (
            <Button fillStyle="ghost" onClick={onLinkButtonClick}>
                {linkButtonText ?? 'Verify forwarding'}
            </Button>
        )
    }

    return (
        <Button fillStyle="ghost" intent="secondary" onClick={onRetryClick}>
            <ButtonIconLabel icon="refresh">Retry verification</ButtonIconLabel>
        </Button>
    )
}
