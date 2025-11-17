import type { PropsWithChildren, ReactNode } from 'react'
import React from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

export const ConfirmationButton = ({
    confirmationButtonLabel,
    confirmationTitle,
    confirmationText,
    isDisabled,
    onClick,
    children,
}: PropsWithChildren<{
    confirmationButtonLabel?: string
    confirmationTitle?: ReactNode
    confirmationText?: ReactNode
    isDisabled: boolean
    onClick?: () => void
}>) => {
    if (isDisabled)
        return (
            <Button intent="secondary" isDisabled={true}>
                {children}
            </Button>
        )
    return (
        <ConfirmationPopover
            buttonProps={{
                intent: 'destructive',
            }}
            cancelButtonProps={{ intent: 'secondary' }}
            onConfirm={onClick}
            showCancelButton={true}
            confirmLabel={confirmationButtonLabel}
            title={confirmationTitle}
            content={confirmationText}
        >
            {({ uid, onDisplayConfirmation }) => (
                <Button
                    id={uid}
                    intent="secondary"
                    onClick={onDisplayConfirmation}
                >
                    {children}
                </Button>
            )}
        </ConfirmationPopover>
    )
}
