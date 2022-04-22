import React, {ComponentProps, ReactNode} from 'react'
import {Popover} from 'reactstrap'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import Button from './Button'

type Props = {
    confirmationButtonIntent?: ComponentProps<typeof Button>['intent']
    confirmationContent?: ReactNode
    confirmationTitle?: string
    onConfirm?: () => void
    placement?: ComponentProps<typeof Popover>['placement']
    confirmLabel?: ComponentProps<typeof Popover>['confirmLabel']
} & ComponentProps<typeof Button>

export default function ConfirmButton({
    children,
    confirmationContent,
    confirmationTitle = 'Are you sure?',
    confirmationButtonIntent,
    id,
    onConfirm,
    placement = 'bottom',
    type = 'button',
    confirmLabel = 'Confirm',
    ...other
}: Props) {
    return (
        <ConfirmationPopover
            buttonProps={{
                intent: confirmationButtonIntent,
                type,
            }}
            content={confirmationContent}
            id={id}
            onConfirm={onConfirm}
            placement={placement}
            title={confirmationTitle}
            confirmLabel={confirmLabel}
        >
            {({uid, onDisplayConfirmation, elementRef}) => (
                <Button
                    {...other}
                    id={uid}
                    onClick={onDisplayConfirmation}
                    ref={elementRef}
                >
                    {children}
                </Button>
            )}
        </ConfirmationPopover>
    )
}

ConfirmButton.displayName = 'ConfirmButton'
