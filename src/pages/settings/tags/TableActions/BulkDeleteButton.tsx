import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

export type Props = {
    disabled: boolean
    onBulkDelete: () => void
}

const BulkDeleteButton = ({onBulkDelete, disabled}: Props) => {
    return (
        <ConfirmationPopover
            buttonProps={{
                intent: 'destructive',
            }}
            content={
                <>
                    Are you sure you want to delete these tags?{' '}
                    <b>They will be removed from all tickets</b>.
                </>
            }
            id="bulk-remove-button"
            onConfirm={onBulkDelete}
        >
            {({uid, onDisplayConfirmation}) => (
                <Button
                    isDisabled={disabled}
                    id={uid}
                    intent="secondary"
                    className="mr-2 skip-default"
                    onClick={onDisplayConfirmation}
                >
                    <ButtonIconLabel icon="delete">Delete</ButtonIconLabel>
                </Button>
            )}
        </ConfirmationPopover>
    )
}

export default BulkDeleteButton
