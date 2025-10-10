import React, { ComponentProps, ReactNode } from 'react'

import { Popover } from 'reactstrap'

import {
    LegacyButton as Button,
    type LegacyButtonComponentProps as ButtonComponentProps,
    type ButtonProps,
} from '@gorgias/axiom'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

type Props = {
    confirmationButtonIntent?: ButtonProps['intent']
    confirmationContent?: ReactNode
    confirmationTitle?: ReactNode
    onConfirm?: () => void
    placement?: ComponentProps<typeof Popover>['placement']
    confirmLabel?: ComponentProps<typeof ConfirmationPopover>['confirmLabel']
    cancelLabel?: ComponentProps<typeof ConfirmationPopover>['cancelLabel']
    showCancelButton?: ComponentProps<
        typeof ConfirmationPopover
    >['showCancelButton']
    containerElement?: ComponentProps<
        typeof ConfirmationPopover
    >['containerElement']
} & ButtonComponentProps

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
    cancelLabel,
    showCancelButton,
    containerElement = null,
    ...other
}: Props) {
    return (
        <ConfirmationPopover
            buttonProps={{
                intent: confirmationButtonIntent,
                type,
            }}
            cancelButtonProps={{
                intent: 'secondary',
            }}
            content={confirmationContent}
            id={id}
            onConfirm={onConfirm}
            placement={placement}
            title={confirmationTitle}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            showCancelButton={showCancelButton}
            containerElement={containerElement}
        >
            {({ uid, onDisplayConfirmation, elementRef }) => (
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
