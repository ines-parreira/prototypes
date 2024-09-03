import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

export type Props = {
    onBulkDelete: () => void
    selectedTagsCount: number
    selectedTagsText: string
}

const BulkDeleteButton = ({
    onBulkDelete,
    selectedTagsCount,
    selectedTagsText,
}: Props) => {
    return (
        <ConfirmationPopover
            buttonProps={{
                intent: 'destructive',
            }}
            content={
                <>
                    You are about to delete {selectedTagsCount} tag
                    {selectedTagsCount > 1 && 's'}: {selectedTagsText}.<br />
                    <b>
                        {selectedTagsCount < 2 ? 'It' : 'They'} will be removed
                        from all tickets.
                    </b>
                </>
            }
            onConfirm={onBulkDelete}
        >
            {({uid, onDisplayConfirmation}) => (
                <Button
                    isDisabled={!selectedTagsCount}
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
