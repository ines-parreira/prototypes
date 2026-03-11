import type { ComponentProps, ReactNode } from 'react'
import React from 'react'

import type { Popover } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import type {
    LegacyButtonComponentProps as ButtonComponentProps,
    LegacyButtonProps as ButtonProps,
} from '@gorgias/axiom'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Button />` + `<Modal />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
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
