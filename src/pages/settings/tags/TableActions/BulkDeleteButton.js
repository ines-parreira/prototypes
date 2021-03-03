import React, {useCallback, useState} from 'react'
import {Button, Popover, PopoverBody, PopoverHeader} from 'reactstrap'

export type Props = {
    disabled: boolean,
    onBulkDelete: () => any,
}

const BulkDeleteButton = ({onBulkDelete, disabled}: Props) => {
    const [askRemoveConfirmation, setAskRemoveConfirmation] = useState(false)

    const toggleRemoveConfirmation = useCallback(() => {
        setAskRemoveConfirmation(!askRemoveConfirmation)
    }, [askRemoveConfirmation])

    const handleDeleteClick = useCallback(() => {
        setAskRemoveConfirmation(false)
        onBulkDelete()
    }, [onBulkDelete])

    return (
        <>
            <Button
                disabled={disabled}
                id="bulk-remove-button"
                size="sm"
                color="secondary"
                type="button"
                className="mr-2"
                onClick={toggleRemoveConfirmation}
            >
                <i className="material-icons mr-2">delete</i>
                Delete
            </Button>
            <Popover
                placement="bottom"
                isOpen={askRemoveConfirmation}
                target="bulk-remove-button"
                toggle={toggleRemoveConfirmation}
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>
                        Are you sure you want to delete these tags?{' '}
                        <b>They will be removed from all tickets</b>.
                    </p>
                    <Button
                        type="submit"
                        color="success"
                        onClick={handleDeleteClick}
                    >
                        Confirm
                    </Button>
                </PopoverBody>
            </Popover>
        </>
    )
}

export default BulkDeleteButton
