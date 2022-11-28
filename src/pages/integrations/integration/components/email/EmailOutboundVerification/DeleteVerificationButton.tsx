import React from 'react'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

type Props = {
    onConfirm: () => void
    isLoading: boolean
    className?: string
}

export default function DeleteVerificationButton({
    onConfirm,
    isLoading,
    className,
}: Props) {
    return (
        <ConfirmButton
            confirmationContent="If you delete verification, you will not be able to send outbound messages with this email."
            onConfirm={onConfirm}
            isLoading={isLoading}
            intent="destructive"
            className={className}
            confirmationTitle={'Delete Verification?'}
            confirmationButtonIntent="destructive"
        >
            <ButtonIconLabel icon="delete">Delete verification</ButtonIconLabel>
        </ConfirmButton>
    )
}
